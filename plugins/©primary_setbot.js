import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!m.isGroup) return

    if (text === 'off' || text === 'reset' || text === 'liberar') {
        global.db.data.chats[m.chat].primaryBot = ''
        return m.reply(`✅ Grupo liberado. Todos los asistentes pueden responder.`)
    }

    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null

    if (!who) return m.reply(`Menciona al bot que quieres dejar como único asistente.`)

    // Detectamos si el usuario mencionado tiene configuración de bot en la DB
    let isBotInDb = global.db.data.settings[who]
    
    // También verificamos físicamente en la carpeta por seguridad
    const botNumber = who.split('@')[0].replace(/[^0-9]/g, '')
    const pathSubBots = path.join(process.cwd(), 'sessions_sub_assistant')
    const hasSessionFile = fs.existsSync(path.join(pathSubBots, botNumber))

    // Si no está en settings y no tiene carpeta, no es un bot
    if (!isBotInDb && !hasSessionFile && who !== conn.user.jid) {
        return m.reply(`❌ @${botNumber} no es un asistente activo.`, null, { mentions: [who] })
    }

    global.db.data.chats[m.chat].primaryBot = who

    await conn.sendMessage(m.chat, {
        text: `✅ *Prioridad Establecida*\nSolo @${botNumber} responderá aquí.`,
        mentions: [who]
    }, { quoted: m })
}

handler.command = /^(prioridad|primary|setbot)$/i
handler.rowner = true

export default handler
