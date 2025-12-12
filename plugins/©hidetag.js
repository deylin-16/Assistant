import { generateWAMessageFromContent } from '@whiskeysockets/baileys'
import * as fs from 'fs'
import fetch from 'node-fetch'

var handler = async (m, { conn, text, participants, isOwner, isAdmin }) => {
    
    let users = participants.map(u => conn.decodeJid(u.id))

    let tagText = text || (m.quoted && m.quoted.text ? m.quoted.text : "*Hola!!*")
    
    let finalCaption = `${tagText}`

    let quoted = m.quoted ? m.quoted : m
    let mime = (quoted.msg || quoted).mimetype || ''
    let isMedia = /image|video|sticker|audio/.test(mime)
    
    if (isMedia) {
        try {
            let media = await quoted.download?.()
            let messageContent = {}

            if (quoted.mtype === 'imageMessage') {
                messageContent = { image: media, caption: finalCaption, mentions: users }
            } else if (quoted.mtype === 'videoMessage') {
                messageContent = { video: media, caption: finalCaption, mentions: users, mimetype: 'video/mp4' }
            } else if (quoted.mtype === 'audioMessage') {
                messageContent = { audio: media, fileName: 'Hidetag.mp3', mimetype: 'audio/mp4', mentions: users }
            } else if (quoted.mtype === 'stickerMessage') {
                messageContent = { sticker: media, mentions: users }
            }
            
            await conn.sendMessage(m.chat, messageContent, { quoted: m })

        } catch (e) {
            
            await conn.sendMessage(
                m.chat,
                { extendedTextMessage: { text: finalCaption, contextInfo: { mentionedJid: users } } },
                { quoted: m }
            )
        }

    } else {
        let msg = generateWAMessageFromContent(
            m.chat,
            { extendedTextMessage: { text: finalCaption, contextInfo: { mentionedJid: users } } },
            { quoted: m, userJid: conn.user.id }
        )
        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    }
}

handler.help = ['hidetag']
handler.tags = ['grupo']
handler.command = ['tag', 'n']
handler.group = true
handler.admin = true

export default handler
