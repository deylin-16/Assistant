import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let handler = async (m, { conn, usedPrefix, command }) => {
    let { assistantName, assistantImage } = global.getAssistantConfig(conn.user.jid)

    let isSub = conn.user.jid !== global.conn?.user?.jid
    let ownerBot = global.owner.map(([jid, name]) => ({ jid, name }))

    let _package = JSON.parse(await fs.promises.readFile(path.join(__dirname, '../package.json')).catch(_ => '{}')) || {}

            let customCommands = `
*• GRUPOS*
◦ \`cierra\` / \`abre\` (Controlar el grupo)
◦ \`renombrar\` (Cambiar nombre del grupo)
◦ \`setdesc\` (Cambiar descripción)
◦ \`setpp\` (Cambiar foto del grupo)

*• UTILIDADES*
◦ \`kick\` / \`elimina\` (@tag o responder)
◦ \`todos\` / \`tagall\` (Mencionar a todos)

*• EXTRACCIÓN DE CONTENIDO*
◦ \`descarga\` (FB, TikTok, Instagram)

*• BÚSQUEDA DE CONTENIDO*
◦ \`pin\` (Buscá imágenes en Pinterest)
◦ \`ttss\` (Buscá un vídeo en tiktok)
◦ \`play\` / \`🎧\` (Busca música de YouTube)

*• FUNCIONES*
◦ \`robar perfil\` (@usuario o número)
◦ \`tomar perfil\` (@usuario o número)
◦ \`s/sticker\` (Crea un sticker con un vídeo o imagen)

*• FUNCIÓN ESPÍA*
◦ \`👁️‍🗨️\` / \`👁️\` / \`:) \` (Ver archivos de una sola vista)
`;

    let caption = `*HOLA, SOY ${assistantName.toUpperCase()}* 

*— Versión:* ${_package.version}
*— Creador:* ${ownerBot[0].name}
*— Tiempo activo:* ${msToDate(process.uptime() * 1000)}

*NOTA:* _Comandos directos sin prefijo._

*— LISTA DE COMANDOS —*
${customCommands}`


    try {
        let sendImage = typeof assistantImage === 'string' ? { url: assistantImage } : assistantImage
        
        await conn.sendMessage(m.chat, { 
            image: sendImage, 
            caption: caption.trim()
        }, { quoted: m })
        
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
