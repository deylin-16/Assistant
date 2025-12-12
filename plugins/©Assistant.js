import fetch from 'node-fetch';
import { sticker } from '../lib/sticker.js';

const POLLINATIONS_BASE_URL = 'https://text.pollinations.ai';

export async function before(m, { conn }) {
    if (!conn.user) return true;
    
    let user = global.db.data.users[m.sender];
    let chat = global.db.data.chats[m.chat];
    
    let mentionedJidSafe = Array.isArray(m.mentionedJid) ? m.mentionedJid : [];
    
    let botJid = conn.user.jid;
    let botNumber = botJid.split('@')[0];
    let text = m.text || '';
    
    // ----------------------------------------------------------------
    // VERIFICACIÓN CRÍTICA: DETECCIÓN AGRESIVA
    // ----------------------------------------------------------------
    // 1. Verificar si el JID del bot está en la lista de menciones.
    // 2. Si no lo está, verificar si el mensaje comienza con '@' seguido de cualquier número (JID falsa).
    
    let isBotExplicitlyMentioned = mentionedJidSafe.includes(botJid) || text.trim().startsWith('@');

    if (!isBotExplicitlyMentioned) {
        return true;
    }
    
    // Si la mención es la JID del bot, la quitamos.
    let query = text.replace(new RegExp(`@${botNumber}`, 'g'), '').trim();
    
    // Si es una mención genérica (@algúnotroJID o @nombre) la limpiamos del inicio del texto.
    if (query.startsWith('@')) {
        // Expresión regular para eliminar el primer "@" seguido de cualquier cosa hasta el primer espacio
        query = query.replace(/^@\S+\s?/, '').trim();
    }
    
    let username = m.pushName || 'Usuario';

    if (query.length === 0) return false;

    let jijiPrompt = `Eres Jiji, un gato negro sarcástico y leal, como el de Kiki: Entregas a Domicilio. Responde a ${username}: ${query}`;

    // EJECUCIÓN DE LA API
    try {
        conn.sendPresenceUpdate('composing', m.chat);
        
        const url = `${POLLINATIONS_BASE_URL}/${encodeURIComponent(jijiPrompt)}`;

        const res = await fetch(url);
        
        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }

        const result = await res.text();

        if (result && result.trim().length > 0) {
            await conn.reply(m.chat, result.trim(), m);
            await conn.readMessages([m.key]);
        } else {
            await conn.reply(m.chat, `🐱 Hmph. La IA no tiene nada ingenioso que decir sobre *eso*.`, m);
        }
    } catch (e) {
        await conn.reply(m.chat, '⚠️ ¡Rayos! No puedo contactar con la nube de la IA. Parece que mis antenas felinas están fallando temporalmente.', m);
    }

    return false;
}
