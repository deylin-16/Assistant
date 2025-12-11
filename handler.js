import { format } from 'util';
import { fileURLToPath } from 'url';
import path, { join } from 'path';
import { unwatchFile, watchFile } from 'fs';
import chalk from 'chalk';
import ws from 'ws';
import { randomBytes, createHash } from 'crypto';
import fetch from 'node-fetch';
import PhoneNumber from 'awesome-phonenumber';
import urlRegex from 'url-regex-safe';

// --- Funciones de soporte ---

const isNumber = x => typeof x === 'number' && !isNaN(x);

// Serialización mínima de mensajes (smsg integrado para evitar dependencias)
function minimalSmsg(conn, m) {
    if (!m || !m.key || !m.key.remoteJid) return null;

    const botJid = conn.user?.jid || global.conn?.user?.jid || '';
    if (!botJid) return null;

    try {
        m.chat = conn.normalizeJid(m.key.remoteJid);
        m.sender = conn.normalizeJid(m.key.fromMe ? botJid : m.key.participant || m.key.remoteJid);
        m.fromMe = m.key.fromMe;
        m.isGroup = m.chat.endsWith('@g.us');
        
        // Extraer texto de forma segura
        m.text = m.message?.extendedTextMessage?.text || m.message?.conversation || m.message?.imageMessage?.caption || m.message?.videoMessage?.caption || '';
        m.text = m.text ? m.text.replace(/[\u200e\u200f]/g, '').trim() : '';

        // Definir si es comando (muy básico, depende del prefijo global)
        m.isCommand = global.prefix instanceof RegExp ? global.prefix.test(m.text.trim()[0]) : m.text.startsWith(global.prefix);

        // Devolvemos el mensaje enriquecido
        return m;
    } catch (e) {
        console.error(chalk.red("Error en serialización mínima (minimalSmsg)"), e);
        return null;
    }
}

// Inicialización segura de datos de chat (necesaria para el resto del handler)
function getSafeChatData(jid) {
    // Implementación segura (reducida)
    if (!global.db || !global.db.data || !global.db.data.chats) return null;
    global.db.data.chats[jid] ||= { isBanned: false, modoadmin: false, antiLink: true, welcome: true };
    return global.db.data.chats[jid];
}

// --- FUNCIÓN HANDLER PRINCIPAL ---

export async function handler(chatUpdate) {
    const conn = this;

    if (!chatUpdate || !chatUpdate.messages || chatUpdate.messages.length === 0) return;

    let m = chatUpdate.messages[chatUpdate.messages.length - 1];

    if (!m || !m.key || !m.message || !m.key.remoteJid) return;
    
    // CORRECCIÓN: Evitar que el handler se ejecute si el bot aún no está listo
    if (!conn.user?.jid) return; 

    if (m.message) {
        m.message = (Object.keys(m.message)[0] === 'ephemeralMessage') ? m.message.ephemeralMessage.message : m.message;
    }

    // 1. SERIALIZACIÓN MÍNIMA
    m = minimalSmsg(conn, m); 
    if (!m || !m.chat || !m.sender) {
        // console.log(chalk.red('Mensaje descartado después de serialización.'));
        return; 
    } 

    // Carga segura de la base de datos (necesaria para checks)
    if (global.db.data == null) {
        try {
            await global.loadDatabase();
        } catch (e) {
            console.error('Error al cargar la DB en Handler:', e);
            return;
        }
    }
    if (global.db.data == null) return;
    
    // Inicialización mínima de DB (para evitar errores "is not defined")
    global.db.data.users = global.db.data.users || {};
    global.db.data.chats = global.db.data.chats || {};
    global.db.data.settings = global.db.data.settings || {};
    global.db.data.stats = global.db.data.stats || {};
    global.db.data.users[m.sender] ||= {};
    global.db.data.settings[conn.user.jid] ||= { self: false, restrict: true };
    
    // 2. IMPRESIÓN DE MENSAJES EN CONSOLA (PRIORIDAD)
    try {
        const groupMetadata = m.isGroup ? (conn.chats[m.chat] || {}).metadata || await conn.groupMetadata(m.chat).catch(_ => null) || {} : {};
        const senderName = m.isGroup ? m.sender.split('@')[0] : await conn.getName(m.sender).catch(() => 'Usuario');
        const chatName = m.isGroup ? groupMetadata.subject : await conn.getName(m.chat).catch(() => 'Privado');

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

        console.log(logLine);
        if (m.isMedia) {
            console.log(chalk.cyanBright(`\t\t\t [Tipo: ${Object.keys(m.message)[0]}]`));
        }

    } catch (printError) {
        console.error(chalk.red('Error al imprimir mensaje en consola (secundario):'), printError);
    }
    
    // 3. LÓGICA DE EJECUCIÓN DE PLUGINS (simplificada)

    const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins');
    const user = global.db.data.users[m.sender];
    const chat = getSafeChatData(m.chat);
    
    let usedPrefix = '';
    let match = null;
    let command = '';
    let args = [];
    let text = m.text;

    for (const name in global.plugins) {
        const plugin = global.plugins[name];
        if (!plugin || plugin.disabled) continue;

        const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
        let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix;
        
        const prefixes = Array.isArray(_prefix) ? _prefix : [_prefix];
        
        for (const p of prefixes) {
            const re = p instanceof RegExp ? p : new RegExp(str2Regex(p));
            const execResult = re.exec(m.text);
            if (execResult) {
                match = [execResult, re];
                break;
            }
        }

        if (match) {
            usedPrefix = match[0][0];
            const noPrefix = m.text.replace(usedPrefix, '');
            [command, ...args] = noPrefix.trim().split(/\s+/).filter(v => v);
            text = args.join(' ');
            command = (command || '').toLowerCase();
        } else {
            continue;
        }

        const fail = plugin.fail || global.dfail;
        const isAccept = plugin.command instanceof RegExp ?
            plugin.command.test(command) :
            Array.isArray(plugin.command) ?
                plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
                typeof plugin.command === 'string' ?
                    plugin.command === command : false;

        if (!isAccept) continue;
        
        m.plugin = name;

        // Aquí irían todos los checks de permisos (Owner, Admin, Group, Ban, etc.)
        // Los omitimos por ahora para centrarnos en la ejecución básica

        m.isCommand = true;
        
        const extra = { match, usedPrefix, noPrefix: text, args, command, text, conn, chat, user };
        
        try {
            // Ejecución del plugin
            await plugin.call(conn, m, extra);
        } catch (e) {
            m.error = e;
            console.error(chalk.red(`Error en plugin ${name}:`), e);
        }
    }
}

global.dfail = (type, m, conn) => {
    // Si tu bot tiene la función dfail, úsala
    const messages = {
        group: `Solo en grupos.`,
        admin: `Solo administradores.`,
        botAdmin: `Debo ser admin.`
    };
    if (messages[type]) {
        conn.reply(m.chat, messages[type], m);
    }
};

let file = global.__filename(import.meta.url, true);
watchFile(file, async () => {
    unwatchFile(file);
    console.log(chalk.magenta("Se actualizo 'handler.js'"));
    if (global.reloadHandler) console.log(await global.reloadHandler());
});
