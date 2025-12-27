import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

const respuestasPath = path.join(process.cwd(), './db/artificial_intelligence_simulation_responses.json');
let respuestasPredefinidas = {};

if (fs.existsSync(respuestasPath)) {
    respuestasPredefinidas = JSON.parse(fs.readFileSync(respuestasPath, 'utf-8'));
}

const DEYLIN_API_URL = `${url_api}/api/ai/text/ai`;

let handler = m => m

handler.all = async function (m) {
    const conn = this; 
    if (!m.text) return

    let chat = global.db.data?.chats?.[m.chat]
    
    if (!chat || chat.isBanned || !chat.autoresponder) return
    if (m.fromMe) return

    const botJid = conn.user.jid
    const isOrBot = /(bot)/i.test(m.text)
    const isReply = m.quoted && m.quoted.sender === botJid
    const isMention = m.mentionedJid && m.mentionedJid.includes(botJid) 

    if (!(isOrBot || isReply || isMention)) return

    let queryLower = m.text.toLowerCase().trim()
    let cleanQuery = queryLower.replace(/^(jiji|gato|asistente)\s+/, '').trim()

    if (respuestasPredefinidas[cleanQuery] || respuestasPredefinidas[queryLower]) {
        let txt = respuestasPredefinidas[cleanQuery] || respuestasPredefinidas[queryLower]
        await conn.sendPresenceUpdate('composing', m.chat)
        await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
        return true 
    }

    let { key } = await conn.sendMessage(m.chat, { text: 'Pensando...' }, { quoted: m })
    await conn.sendPresenceUpdate('composing', m.chat)

    let assistantName = (global.name(conn) || 'Asistente');
    let username = m.pushName || 'Usuario'
    let jijiPrompt = `Eres ${assistantName}. 

Tu personalidad es seria, directa y con autoridad, con un tono de humano formal. No eres juguetón ni adorable. 

FORMATO: No uses doble asterisco (**). Para resaltar palabras o conceptos importantes, utiliza únicamente un asterisco al principio y al final de la palabra (ejemplo: *texto*).

REGLA DE CONFLICTO: 
Si ${username} te insulta o te falta al respeto, responde con la misma agresividad y nivel de lenguaje. Si el usuario es grosero, tú también lo serás.

Responde a ${username}: ${m.text}`;

    try {
        const url = `${DEYLIN_API_URL}?prompt=${encodeURIComponent(jijiPrompt)}&id=uwuw`;
        const res = await fetch(url)
        const json = await res.json()
        let result = json.response 

        if (result && result.trim().length > 0) {
            let fullText = result.trim()
            let words = fullText.split(' ')
            let step = fullText.length > 500 ? 25 : (fullText.length > 200 ? 12 : 6);
            let speed = 800; 

            let currentText = ''
            for (let i = 0; i < words.length; i += step) {
                await conn.sendPresenceUpdate('composing', m.chat)
                currentText = words.slice(0, i + step).join(' ')
                await conn.sendMessage(m.chat, { text: currentText.trim(), edit: key })
                await new Promise(resolve => setTimeout(resolve, speed))
            }

            await conn.sendMessage(m.chat, { text: fullText, edit: key })
        }
    } catch (e) {
        await conn.sendMessage(m.chat, { text: '💢 Error.', edit: key })
    }
    return true
}

export default handler
