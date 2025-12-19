import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

const respuestasPath = path.join(process.cwd(), './db/artificial_intelligence_simulation_responses.json');
let respuestasPredefinidas = {};

if (fs.existsSync(respuestasPath)) {
    respuestasPredefinidas = JSON.parse(fs.readFileSync(respuestasPath, 'utf-8'));
}

const POLLINATIONS_BASE_URL = 'https://text.pollinations.ai';
const ACTION_KEYWORDS = ['cierra', 'cerrar', 'bloquea', 'ciérralo', 'silencia', 'modo-admin', 'abre', 'abrir', 'desbloquea', 'ábrelo', 'quita modo-admin', 'cambia el nombre', 'renombrar', 'ponle nombre', 'nuevo nombre', 'actualiza nombre', 'cambia la descripción', 'pon descripción', 'nueva descripción', 'descr', 'cambia la foto', 'pon foto', 'cambiar imagen', 'elimina', 'sacar', 'kickea', 'expulsa', 'saca', 'fuera', 'menciona todos', 'tagall', 'menciónalos', 'aviso a todos'];
const DIRECT_COMMAND_REGEX = new RegExp(`^(jiji|gato|asistente)\\s+(${ACTION_KEYWORDS.join('|')})`, 'i');

let handler = m => m

handler.all = async function (m, chatUpdate) {
    const conn = this;
    let chat = global.db.data?.chats?.[m.chat]
    if (!chat || chat.isBanned || !chat.autoresponder) return

    if (m.isBot || m.fromMe || !m.text) return 

    let rawText = m.text
    let queryLower = rawText.toLowerCase().trim()
    
    let isOrBot = /(jiji|gato|asistente)/i.test(rawText)
    let isReply = m.quoted && m.quoted.sender === conn.user.jid
    let isMention = m.mentionedJid && m.mentionedJid.includes(conn.user.jid) 

    if (!(isOrBot || isReply || isMention)) return

    let { key } = await conn.sendMessage(m.chat, { text: '✍️...' }, { quoted: m })
    await conn.sendPresenceUpdate('composing', m.chat)

    let cleanQuery = queryLower.replace(/^(jiji|gato|asistente)\s+/, '').trim()

    if (respuestasPredefinidas[cleanQuery] || respuestasPredefinidas[queryLower]) {
        let txt = respuestasPredefinidas[cleanQuery] || respuestasPredefinidas[queryLower]
        await new Promise(resolve => setTimeout(resolve, 1000))
        await conn.sendMessage(m.chat, { text: txt, edit: key })
        return true 
    }

    let prefixRegex = new RegExp('^[' + (opts?.prefix || '‎z/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.,\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')
    if (prefixRegex.test(rawText)) {
        await conn.sendMessage(m.chat, { text: '⚙️', edit: key }) 
        return true
    }

    if (DIRECT_COMMAND_REGEX.test(queryLower)) {
        if (!/(como|cómo|que|qué|donde|dónde|porque|por qué|porqué|quisiera)/i.test(queryLower)) return true
    }

    let assistantName = m.isGroup && typeof global.getGroupAssistantConfig === 'function' 
        ? global.getGroupAssistantConfig(m.chat).assistantName 
        : (global.bot || 'Asistente');

    let username = m.pushName || 'Usuario'
    let jijiPrompt = `Eres ${assistantName}. Tu personalidad: Sarcástico, enojón, directo, divertido pero furioso, demuestras poder y adorable. Responde a ${username}: ${rawText}. Usa * para resaltar.`;

    try {
        const url = `${POLLINATIONS_BASE_URL}/${encodeURIComponent(jijiPrompt)}?model=openai&cache=true`;
        const res = await fetch(url)
        if (!res.ok) throw new Error('API Error');

        let result = await res.text()
        if (result && result.trim().length > 0) {
            let fullText = result.trim()
            let words = fullText.split(' ')
            
            let step = 5; 
            let speed = 300; 

            if (fullText.length > 500) {
                step = 15; 
                speed = 450;
            } else if (fullText.length > 200) {
                step = 10;
                speed = 350;
            }

            let currentText = ''
            for (let i = 0; i < words.length; i += step) {
                currentText = words.slice(0, i + step).join(' ')
                await conn.sendMessage(m.chat, { text: currentText.trim(), edit: key })
                await new Promise(resolve => setTimeout(resolve, speed))
            }
            
            if (currentText.trim() !== fullText) {
                await conn.sendMessage(m.chat, { text: fullText, edit: key })
            }
        }
    } catch (e) {
        console.error(e)
        await conn.sendMessage(m.chat, { text: '💢 Error de conexión.', edit: key })
    }
    return true
}

export default handler
