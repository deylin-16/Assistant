import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let handler = async (m, { conn, usedPrefix, command }) => {
    let { assistantName, assistantImage, assistantCommand } = global.getGroupAssistantConfig(m.chat)
    
    let isSub = conn.user.jid !== global.conn?.user?.jid
    let ownerBot = global.owner.map(([jid, name]) => ({ jid, name }))

    let _package = JSON.parse(await fs.promises.readFile(path.join(__dirname, '../package.json')).catch(_ => '{}')) || {}

    let customCommands = `
*• GROUPS*
◦ \`jiji cierra\` (Cierra el grupo)
◦ \`jiji abre\` (Abre el grupo)
◦ \`jiji renombrar a\` (Cambia nombre)

*• UTILITIES*
◦ \`jiji elimina\` (@tag)
◦ \`jiji menciona a todos\`

*• CONTENT EXTRACTION*
◦ \`play/🎧\` (Nombre del vídeo de YouTube)
◦ \`Descarga\` (Link Facebook/Tiktok/instagram)

*• FUNCTION*
`;

    let caption = `*HELLO I AM ${assistantName.toUpperCase()}* 

*— Version:* ${_package.version}
*— Creator:* ${ownerBot[0].name}
*— Runtime:* ${msToDate(process.uptime() * 1000)}

*NOTE:* _assistant without prefix._

*— COMMANDS —*
${customCommands}`
    
    let pp = assistantImage

    try {
        if (assistantImage.startsWith('http')) {
            await conn.sendMessage(m.chat, { 
                image: { url: assistantImage }, 
                caption: caption.trim()
            }, { quoted: m })
        } else {
            let imgBuffer = Buffer.from(assistantImage, 'base64')
            await conn.sendMessage(m.chat, { 
                image: imgBuffer, 
                caption: caption.trim()
            }, { quoted: m })
        }
    } catch (e) {
        await conn.reply(m.chat, caption.trim(), m)
    }
}


handler.command = ['menu', 'comandos', 'funcioned', 'ayuda']

export default handler

function msToDate(ms) {
    let d = isNaN(ms) ? 0 : ms
    let s = d / 1000
    let m = s / 60
    let h = m / 60
    let dd = Math.floor(h / 24)
    let hh = Math.floor(h % 24)
    let mm = Math.floor(m % 60)
    let ss = Math.floor(s % 60)
    return `${dd}d ${hh}h ${mm}m ${ss}s`
}
