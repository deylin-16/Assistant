import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import * as ws from 'ws'
import util from 'util' 
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'
import * as baileys from "@whiskeysockets/baileys" 

// Ajusta la ruta si tu handler de sub-bots tiene un nombre diferente
let subBotHandlerModule = await import('../sub-handler.js').catch(e => console.error('Error al cargar sub-handler inicial:', e))
let subBotHandlerFunction = subBotHandlerModule?.subBotHandler || (() => {})

const { 
    useMultiFileAuthState, 
    DisconnectReason, 
    makeCacheableSignalKeyStore, 
    fetchLatestBaileysVersion
} = baileys; 

const logger = pino({ level: "fatal" }) 
const { CONNECTING } = ws
const SESSIONS_FOLDER = 'assistant_access' // Tu identificador

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (global.subConns instanceof Array) console.log()
else global.subConns = []
const msgRetryCache = new NodeCache()

const fkontak = {
    key: {
        participants: "0@s.whatsapp.net",
        remoteJid: "status@broadcast",
        fromMe: false,
        id: "Halo"
    },
    message: {
        locationMessage: {
            name: `SUB-SESIÓN CÓDIGO ✦ 8`,
            jpegThumbnail: global.thumb // Asume que tienes un thumbnail global
        }
    },
    participant: "0@s.whatsapp.net"
};

let handler = async (m, { conn, args, usedPrefix, command, isROwner }) => {
if (!isROwner) return m.reply(`❌ Solo el creador puede iniciar nuevas sesiones.`);

// Usamos el número del creador como ID de sesión temporalmente si no se proporciona otro ID
let sessionId = args[0] ? args[0].replace(/[^0-9]/g, '') : m.sender.split('@')[0]
if (sessionId.length < 8) return conn.reply(m.chat, `⚠️ Proporcione un identificador válido para la sesión.`, m)

const subConnsCount = global.subConns.length
const MAX_SUB_SESSIONS = 30 
if (subConnsCount >= MAX_SUB_SESSIONS) {
return conn.reply(m.chat, `❌ Máximo de ${MAX_SUB_SESSIONS} sub-sesiones alcanzado.`, m)
}

let pathSubSession = path.join(`./${SESSIONS_FOLDER}/`, sessionId)

if (fs.existsSync(pathSubSession) && fs.existsSync(path.join(pathSubSession, "creds.json"))) {
    return conn.reply(m.chat, `⚠️ Ya existe una sesión activa o previa con el ID *${sessionId}*. Si desea eliminarla use *${usedPrefix}eliminar_conexion ${sessionId}*`, m)
}

if (!fs.existsSync(pathSubSession)){
    fs.mkdirSync(pathSubSession, { recursive: true })
}

// Llama a la función principal que maneja la conexión
SubSessionConnect({ pathSubSession, m, conn, usedPrefix, command })
} 
handler.help = ['conectar [id]']
handler.tags = ['subsession']
handler.command = ['conectar']
handler.owner = true
export default handler 

export async function SubSessionConnect(options) {
    let { pathSubSession, m, conn, usedPrefix, command } = options
    let sessionId = path.basename(pathSubSession)
    
    // 1. Opciones de conexión
    let { version } = await fetchLatestBaileysVersion()
    const msgRetry = (MessageRetryMap) => { }
    const { state, saveState, saveCreds } = await useMultiFileAuthState(pathSubSession)

    const connectionOptions = {
        logger: logger,
        printQRInTerminal: false,
        auth: { 
            creds: state.creds, 
            keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) 
        },
        msgRetry,
        msgRetryCache,
        browser: [`Sub-Sesión ${sessionId}`, 'Chrome','2.0.0'],
        version: version,
        generateHighQualityLinkPreview: true,
        defaultQueryTimeoutMs: undefined,
    };

    let sock = makeWASocket(connectionOptions)
    sock.isInit = false
    let isInit = true
    let codeSent = false 

    // 2. Función de Actualización de Conexión
    async function connectionUpdate(update) {
        const { connection, lastDisconnect, isNewLogin, qr } = update

        if (isNewLogin) sock.isInit = false

        if (qr && !codeSent) { 
            // ⚠️ La sesión se inició en modo QR. Esto no debería ocurrir si forzamos el modo código.
            // Si ves este QR, significa que el modo pairing code falló o no se implementó correctamente en la primera conexión.
            const qrBuffer = await qrcode.toBuffer(qr, { scale: 8 });
            await conn.sendMessage(m.chat, {
                image: qrBuffer,
                caption: `⚠️ Sesión ${sessionId}: Falló el modo código. Escanea este QR para vincular.`,
                ...fkontak,
            }, { quoted: m });
            codeSent = true 
            return
        } 

        if (sock.authState.creds.me == null && connection === 'open' && !codeSent) {
            // Este bloque solo se ejecuta después de la primera conexión "open" pero antes de que se registren las credenciales.
            
            let secret = await sock.requestPairingCode(sessionId) // Usamos el ID de sesión como número si no se especificó un número real
            secret = secret.match(/.{1,4}/g)?.join("-")

            const rtx2 = `
*CÓDIGO WHATSAPP PARA VINCULAR*

💻 〢 Sesión ID: *${sessionId}*
⏳ 〢 El código expira en 60s.

> 🔑 CÓDIGO: *${secret}*
`;
           
            await conn.reply(m.chat, rtx2.trim(), m, { contextInfo: { mentionedJid: [m.sender] } });
            codeSent = true 
        }

        if (connection === 'close') {
            codeSent = false;
            const reason = lastDisconnect?.error?.output?.statusCode; 

            const shouldReconnect = [
                DisconnectReason.timedOut,    
                DisconnectReason.badSession,  
                DisconnectReason.connectionLost, 
                DisconnectReason.restartRequired, 
            ].includes(reason);

            if (shouldReconnect) {
                console.log(chalk.bold.magentaBright(`\n[ASSISTANT_ACCESS] Sesión (+${sessionId}) se cerró. Razón: ${reason}. RECONECTANDO...`))
                await delay(5000) 
                return creloadHandler(true).catch(console.error)
            } 

            if (reason === DisconnectReason.loggedOut || reason === 401 || reason === 405) {
                console.log(chalk.bold.magentaBright(`\n[ASSISTANT_ACCESS] SESIÓN CERRADA (+${sessionId}). Borrando datos.`))
                
                try {
                    await conn.sendMessage(`${sessionId}@s.whatsapp.net`, {text : '*SESIÓN CERRADA O INVÁLIDA*' }) 
                } catch (error) {
                    console.error(chalk.bold.yellow(`Error al notificar cierre a: +${sessionId}`))
                }
                fs.rmdirSync(pathSubSession, { recursive: true })
            }
        }

        if (global.db.data == null) loadDatabase()
        if (connection == `open`) {
            let userName = sock.authState.creds.me.name || 'Anónimo'
            
            console.log(chalk.bold.cyanBright(`\n❒⸺⸺⸺⸺【• SUB-SESIÓN •】⸺⸺⸺⸺❒\n│ 🟢 ${userName} (+${sessionId}) CONECTADO exitosamente.\n❒⸺⸺⸺【• CONECTADO •】⸺⸺⸺❒`))

            sock.isInit = true
            if (!global.subConns.some(c => c.user?.jid === sock.user?.jid)) {
                global.subConns.push(sock)
            }
        }
    }

    // 3. Lógica del Handler y Reload
    let creloadHandler = async function (restatConn) {
        let NewSubHandler = subBotHandlerFunction 
        // Lógica de recarga de sub-handler omitida por brevedad
        if (typeof NewSubHandler !== 'function') {
             NewSubHandler = () => {}
        }

        if (restatConn) {
            const oldChats = sock.chats
            try { sock.ws.close() } catch { }
            sock.ev.removeAllListeners()
            sock = makeWASocket(connectionOptions, { chats: oldChats }) 
            isInit = true
        }
        if (!isInit) {
            sock.ev.off("messages.upsert", sock.handler)
            sock.ev.off("connection.update", sock.connectionUpdate)
            sock.ev.off('creds.update', sock.credsUpdate)
        }

        sock.handler = NewSubHandler.bind(sock)
        sock.connectionUpdate = connectionUpdate.bind(sock)
        sock.credsUpdate = saveCreds.bind(sock, true)
        sock.ev.on("messages.upsert", sock.handler)
        sock.ev.on("connection.update", sock.connectionUpdate)
        sock.ev.on("creds.update", sock.credsUpdate)
        isInit = false
        return true
    }
    creloadHandler(false)
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// 4. Handler para eliminar sesiones
handler.command.push('eliminar_conexion')

handler.eliminar_conexion = async (m, { conn, args, usedPrefix, isROwner }) => {
    if (!isROwner) return m.reply(`❌ Solo el creador puede eliminar sesiones.`);
    
    let sessionId = args[0] ? args[0].replace(/[^0-9]/g, '') : ''

    if (!sessionId) return m.reply(`⚠️ Uso: *${usedPrefix}eliminar_conexion [ID de Sesión]*`);

    const pathSubSession = path.join(`./${SESSIONS_FOLDER}/`, sessionId)
    
    if (fs.existsSync(pathSubSession)) {
         try {
            // Eliminar la conexión activa si existe
            const activeConnIndex = global.subConns.findIndex(c => path.basename(c.authState.path) === sessionId);
            if (activeConnIndex !== -1) {
                const connToDelete = global.subConns[activeConnIndex];
                await connToDelete.ws.close();
                global.subConns.splice(activeConnIndex, 1);
                m.reply(`🗑️ Sesión activa ${sessionId} cerrada.`);
            }

            fs.rmdirSync(pathSubSession, { recursive: true });
            m.reply(`🗑️ Carpeta de sesión ${sessionId} eliminada por completo.`);
         } catch (e) {
            console.error(e);
            m.reply(`⚠️ Error al borrar la carpeta física de la sesión ${sessionId}.`);
         }
    } else {
        m.reply(`❌ No se encontró ninguna sesión con el ID ${sessionId}.`);
    }
}
