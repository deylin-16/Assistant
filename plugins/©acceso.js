const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, generateWAMessageFromContent, proto } = (await import("@whiskeysockets/baileys"));
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util' 
import * as ws from 'ws'
const { spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'
let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""

        
          
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const JBOptions = {}
if (global.conns instanceof Array) console.log()
else global.conns = []
let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
if (!globalThis.db.data.settings[conn.user.jid].accessassistant) return m.reply(`Comando desactivado temporalmente.`)
let who
if (!args[0]) return m.reply(`*Ingrese el número de WhatsApp para vincular el Assistant.*\n\nEjemplo: ${usedPrefix + command} 521XXXXXXXXXX`)
if (isNaN(args[0])) return m.reply(`El número ingresado no es válido.`)
let number = args[0].replace(/[^0-9]/g, '')
if (number.length < 8) return m.reply(`El número es demasiado corto.`)
who = number + '@s.whatsapp.net'
let time = global.db.data.users[m.sender].Subs + 120000
const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
const subBotsCount = subBots.length
if (subBotsCount === 21) {
return conn.reply(m.chat, `No se han encontrado espacios para assistants disponibles. Espera a que un assistant se desconecte e intenta más tarde.`, m, racnal)
}
let id = `${number}`
let pathJadiBot = path.join(`./assistant/`, id)
if (!fs.existsSync(pathJadiBot)){
fs.mkdirSync(pathJadiBot, { recursive: true })
}
JBOptions.pathJadiBot = pathJadiBot
JBOptions.m = m
JBOptions.conn = conn
JBOptions.args = args
JBOptions.usedPrefix = usedPrefix
JBOptions.command = command
JBOptions.fromCommand = true
JBOptions.targetJid = who 
JadiBot(JBOptions)
global.db.data.users[m.sender].Subs = new Date * 1
} 
handler.help = ['conectar']
handler.tags = ['assistant']
handler.command = ['conectar']
export default handler 
export async function JadiBot(options) {
let { pathJadiBot, m, conn, args, usedPrefix, command, targetJid } = options
let txtCode, codeBot
const pathCreds = path.join(pathJadiBot, "creds.json")
if (!fs.existsSync(pathJadiBot)){
fs.mkdirSync(pathJadiBot, { recursive: true })}
try {
args[1] && args[1] != undefined ? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[1], "base64").toString("utf-8")), null, '\t')) : ""
} catch {
conn.reply(m.chat, `Use correctamente el comando » ${usedPrefix + command} (número) (código base64 opcional)`, m)
return
}
const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
exec(comb.toString("utf-8"), async (err, stdout, stderr) => {
const drmer = Buffer.from(drm1 + drm2, `base64`)
let { version, isLatest } = await fetchLatestBaileysVersion()
const msgRetry = (MessageRetryMap) => { }
const msgRetryCache = new NodeCache()
const { state, saveState, saveCreds } = await useMultiFileAuthState(pathJadiBot)
const connectionOptions = {
logger: pino({ level: "fatal" }),
printQRInTerminal: false,
auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) },
msgRetry,
msgRetryCache,
browser: ['Bot(Access-Assistant)', 'Chrome','2.0.0'],
version: version,
generateHighQualityLinkPreview: true
};
let sock = makeWASocket(connectionOptions)
sock.isInit = false
let isInit = true
async function connectionUpdate(update) {
const { connection, lastDisconnect, isNewLogin, qr } = update
if (isNewLogin) sock.isInit = false
if (qr) return 
if (connection === 'connecting') {
if (!sock.authState.creds.me) {
let secret = await sock.requestPairingCode(targetJid.split`@`[0])
secret = secret.match(/.{1,4}/g)?.join("-")
const msg = generateWAMessageFromContent(m.chat, proto.Message.fromObject({
  interactiveMessage: {
    body: { text: `Tu código para vincular es:\n→ ${secret}` }, 
    footer: { text: `${dev}` },
    nativeFlowMessage: {
      buttons: [
        {
          name: 'cta_copy',
          buttonParamsJson: JSON.stringify({
            display_text: `xx`,
            copy_code: secret
          })
        }
      ]
    }
  }
}), { quoted: m })
codeBot = await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
console.log(chalk.rgb(255, 165, 0)(`\nCódigo de emparejamiento generado para: +${targetJid.split('@')[0]} -> ${secret}\n`))
if (txtCode && txtCode.key) {
setTimeout(() => { conn.sendMessage(m.sender, { delete: txtCode.key })}, 30000)
}
if (codeBot && codeBot.key) {
setTimeout(() => { conn.sendMessage(m.sender, { delete: codeBot.key })}, 30000)
}
}
}
const endSesion = async (loaded) => {
if (!loaded) {
try {
sock.ws.close()
} catch {
}
sock.ev.removeAllListeners()
let i = global.conns.indexOf(sock)                
if (i < 0) return 
delete global.conns[i]
global.conns.splice(i, 1)
}}
const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
if (connection === 'close') {
if (reason === 428) {
console.log(chalk.rgb(255, 165, 0)(`\nLa conexión (+${path.basename(pathJadiBot)}) fue cerrada inesperadamente. Intentando reconectar...`))
await creloadHandler(true).catch(console.error)
}
if (reason === 408) {
console.log(chalk.rgb(255, 165, 0)(`\nLa conexión (+${path.basename(pathJadiBot)}) se perdió o expiró. Razón: ${reason}. Intentando reconectar...`))
await creloadHandler(true).catch(console.error)
}
if (reason === 440) {
console.log(chalk.rgb(255, 165, 0)(`\nLa conexión (+${path.basename(pathJadiBot)}) fue reemplazada por otra sesión activa.`))
try {
if (options.fromCommand) m?.chat ? await conn.sendMessage(`${path.basename(pathJadiBot)}@s.whatsapp.net`, {text : 'HEMOS DETECTADO UNA NUEVA SESIÓN, BORRE LA NUEVA SESIÓN PARA CONTINUAR\n\n> SI HAY ALGÚN PROBLEMA VUELVA A CONECTARSE' }, { quoted: m || null }) : ""
} catch (error) {
console.error(chalk.rgb(255, 165, 0)(`Error 440 no se pudo enviar mensaje a: +${path.basename(pathJadiBot)}`))
}}
if (reason == 405 || reason == 401) {
console.log(chalk.rgb(255, 165, 0)(`\nLa sesión (+${path.basename(pathJadiBot)}) fue cerrada. Credenciales no válidas o dispositivo desconectado manualmente.`))
try {
if (options.fromCommand) m?.chat ? await conn.sendMessage(`${path.basename(pathJadiBot)}@s.whatsapp.net`, {text : 'SESIÓN PENDIENTE\n\n> INTENTÉ NUEVAMENTE VOLVER A SER ASSISTANT' }, { quoted: m || null }) : ""
} catch (error) {
console.error(chalk.rgb(255, 165, 0)(`Error 405 no se pudo enviar mensaje a: +${path.basename(pathJadiBot)}`))
}
fs.rmdirSync(pathJadiBot, { recursive: true })
}
if (reason === 500) {
console.log(chalk.rgb(255, 165, 0)(`\nConexión perdida en la sesión (+${path.basename(pathJadiBot)}). Borrando datos...`))
if (options.fromCommand) m?.chat ? await conn.sendMessage(`${path.basename(pathJadiBot)}@s.whatsapp.net`, {text : 'CONEXIÓN PÉRDIDA\n\n> INTENTÉ MANUALMENTE VOLVER A SER ASSISTANT' }, { quoted: m || null }) : ""
return creloadHandler(true).catch(console.error)
}
if (reason === 515) {
console.log(chalk.rgb(255, 165, 0)(`\nRinicio automático para la sesión (+${path.basename(pathJadiBot)}).`))
await creloadHandler(true).catch(console.error)
}
if (reason === 403) {
console.log(chalk.rgb(255, 165, 0)(`\nSesión cerrada o cuenta en soporte para la sesión (+${path.basename(pathJadiBot)}).`))
fs.rmdirSync(pathJadiBot, { recursive: true })
}}
if (global.db.data == null) loadDatabase()
if (connection == `open`) {
if (!global.db.data?.users) loadDatabase()
let userName, userJid 
userName = sock.authState.creds.me.name || 'Anónimo'
userJid = sock.authState.creds.me.jid || `${path.basename(pathJadiBot)}@s.whatsapp.net`
console.log(chalk.rgb(255, 165, 0)(`\nASSISTANT\n\n${userName} (+${path.basename(pathJadiBot)}) conectado exitosamente.\n\nCONECTADO`))
sock.isInit = true
global.conns.push(sock)
await joinChannels(sock)
m?.chat ? await conn.sendMessage(m.chat, {text: args[1] ? `@${m.sender.split('@')[0]}, ya estás conectado, leyendo mensajes entrantes...` : ` 
Bienvenido @${m.sender.split('@')[0]}, a la familia de 
 ${botname} disfruta del bot.
 
 ${dev}
`, mentions: [m.sender]}, { quoted: fkontak1 }) : ''
}}
setInterval(async () => {
if (!sock.user) {
try { sock.ws.close() } catch (e) {      
}
sock.ev.removeAllListeners()
let i = global.conns.indexOf(sock)                
if (i < 0) return
delete global.conns[i]
global.conns.splice(i, 1)
}}, 60000)
let handler = await import('../handler.js')
let creloadHandler = async function (restatConn) {
try {
const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
if (Object.keys(Handler || {}).length) handler = Handler
} catch (e) {
console.error(`Error: `, e)
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
sock.handler = handler.handler.bind(sock)
sock.connectionUpdate = connectionUpdate.bind(sock)
sock.credsUpdate = saveCreds.bind(sock, true)
sock.ev.on("messages.upsert", sock.handler)
sock.ev.on("connection.update", sock.connectionUpdate)
sock.ev.on("creds.update", sock.credsUpdate)
isInit = false
return true
}
creloadHandler(false)
})
}
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms));}
function msToTime(duration) {
var milliseconds = parseInt((duration % 1000) / 100),
seconds = Math.floor((duration / 1000) % 60),
minutes = Math.floor((duration / (1000 * 60)) % 60),
hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
hours = (hours < 10) ? '0' + hours : hours
minutes = (minutes < 10) ? '0' + minutes : minutes
seconds = (seconds < 10) ? '0' + seconds : seconds
return minutes + ' m y ' + seconds + ' s '
}
async function joinChannels(conn) {
for (const channelId of Object.values(global.ch)) {
await conn.newsletterFollow(channelId).catch(() => {})
}}
