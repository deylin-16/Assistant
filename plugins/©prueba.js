let handler = async (m, { conn }) => {
    const config = global.getAssistantConfig(conn.user.jid)
    
    let isBuffer = Buffer.isBuffer(config.assistantImage)
    let targetUrl = 'https://www.deylin.xyz'

    await conn.sendMessage(m.chat, {
        text: targetUrl,
        contextInfo: {
            externalAdReply: {
                title: `CÓDIGO DE EMPAREJAMIENTO`,
                body: `Asistente: ${config.assistantName}`,
                mediaType: 1,
                renderLargerThumbnail: true,
                // Usamos una validación estricta para el thumbnail
                thumbnail: isBuffer ? config.assistantImage : null,
                thumbnailUrl: !isBuffer ? config.assistantImage : null,
                sourceUrl: targetUrl,
                // Estas dos líneas son clave para evitar el error de "aplicación compatible"
                mediaUrl: null,
                containsAutoReply: true
            }
        }
    }, { quoted: m })
}

handler.command = ['prueba']

export default handler
