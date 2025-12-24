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
                previewType: 'PHOTO',
                renderLargerThumbnail: true,
                ...(isBuffer ? { thumbnail: config.assistantImage } : { thumbnailUrl: config.assistantImage }),
                sourceUrl: targetUrl,
                mediaUrl: targetUrl
            }
        }
    }, { quoted: m })
}

handler.command = ['prueba']

export default handler
