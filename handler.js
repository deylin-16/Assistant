import { fileURLToPath } from 'url';
import path, { join } from 'path';
import { unwatchFile, watchFile } from 'fs';
import chalk from 'chalk';
import urlRegex from 'url-regex-safe';

function minimalSmsg(conn, m) {
    if (!m || !m.key || !m.key.remoteJid) return null;
    const botJid = conn.user?.jid || global.conn?.user?.jid || '';
    if (!botJid) return null;
    try {
        m.chat = conn.normalizeJid(m.key.remoteJid);
        m.sender = conn.normalizeJid(m.key.fromMe ? botJid : m.key.participant || m.key.remoteJid);
        m.fromMe = m.key.fromMe;
        m.isGroup = m.chat.endsWith('@g.us');
        m.text = m.message?.extendedTextMessage?.text || m.message?.conversation || m.message?.imageMessage?.caption || m.message?.videoMessage?.caption || '';
        m.text = m.text ? m.text.replace(/[\u200e\u200f]/g, '').trim() : '';
        m.isCommand = (global.prefix instanceof RegExp ? global.prefix.test(m.text.trim()[0]) : m.text.startsWith(global.prefix || '!') );
        m.isMedia = !!(m.message?.imageMessage || m.message?.videoMessage || m.message?.audioMessage || m.message?.stickerMessage || m.message?.documentMessage);
        return m;
    } catch (e) {
        console.error(chalk.red("Error en serialización mínima:"), e);
        return null;
    }
}

export async function handler(chatUpdate) {
    const conn = this;
    
    // 1. CHEQUEO BÁSICO Y TRY/CATCH GLOBAL
    try {
        if (!chatUpdate || !chatUpdate.messages || chatUpdate.messages.length === 0) return;
        let m = chatUpdate.messages[chatUpdate.messages.length - 1];
        if (!m || !m.key || !m.message || !m.key.remoteJid) return;
        if (!conn.user?.jid) return; 

        if (m.message) {
            m.message = (Object.keys(m.message)[0] === 'ephemeralMessage') ? m.message.ephemeralMessage.message : m.message;
        }

        // 2. SERIALIZACIÓN
        m = minimalSmsg(conn, m); 
        if (!m || !m.chat || !m.sender) {
            console.log(chalk.red('Bloqueo detectado: Fallo de serialización.'));
            return; 
        } 
        
        // 3. IMPRESIÓN DE MENSAJES EN CONSOLA (DEBE FUNCIONAR)
        try {
            const groupMetadata = m.isGroup ? (conn.chats[m.chat] || {}).metadata || await conn.groupMetadata(m.chat).catch(_ => null) || {} : {};
            const senderName = m.isGroup ? m.sender.split('@')[0] : 'N/A'; // Nombre simplificado
            const chatName = m.isGroup ? (groupMetadata.subject || 'Grupo') : 'Privado';

            const now = new Date();
            const formattedTime = now.toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const chatLabel = m.isGroup ? `[G]` : `[P]`;
            let logText = m.text.replace(/\u200e+/g, '');
            logText = logText.replace(urlRegex({ strict: false }), (url) => chalk.blueBright(url));

            const logLine = chalk.bold.hex('#00FFFF')(`[${formattedTime}] `) +
                            chalk.hex('#7FFF00').bold(chatLabel) + ' ' +
                            chalk.hex('#FF4500')(`${chatName ? chatName.substring(0, 15) : 'N/A'}: `) +
                            chalk.hex('#FFFF00')(`${senderName}: `) +
                            (m.isCommand ? chalk.yellow(logText) : logText.substring(0, 60));

            console.log(chalk.bold.green('✅ EVENTO RECIBIDO Y MOSTRADO EN CONSOLA'));
            console.log(logLine);
            if (m.isMedia) {
                console.log(chalk.cyanBright(`\t\t\t [Tipo: ${Object.keys(m.message)[0]}]`));
            }
            
            // 4. RETORNO INMEDIATO (EVITAMOS TODA LÓGICA DE PLUGINS Y DB)
            return conn.reply(m.chat, '✅ Mensaje recibido con éxito (Handler Aislado).', m);


        } catch (printError) {
            console.error(chalk.red('Error al imprimir mensaje en consola (secundario):'), printError);
        }
        
    } catch (e) {
        console.error(chalk.bold.bgRed('❌ ERROR CRÍTICO EN HANDLER (CAPTURA GLOBAL) ❌'));
        console.error(e);
    }
}

// Lógica de watchFile y recarga se mantiene.
let file = global.__filename(import.meta.url, true);
watchFile(file, async () => {
    unwatchFile(file);
    console.log(chalk.magenta("Se actualizo 'handler.js'"));
    if (global.reloadHandler) console.log(await global.reloadHandler());
});
