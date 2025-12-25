let handler = async (m, { conn }) => {
    const config = global.getAssistantConfig(conn.user.jid)
    let targetUrl = 'https://www.deylin.xyz'
    
    let thumb = config.assistantImage
    let isBuffer = Buffer.isBuffer(thumb)

    if (!isBuffer && typeof thumb === 'string' && thumb.startsWith('http')) {
        try {
            thumb = await global.getBuffer(thumb)
            isBuffer = true
        } catch {
            isBuffer = false
        }
    }

    await conn.sendMessage(m.chat, {
        text: targetUrl,
        contextInfo: {
            externalAdReply: {
                title: `CÓDIGO DE EMPAREJAMIENTO`,
                body: `Asistente: ${config.assistantName}`,
                mediaType: 1,
                renderLargerThumbnail: false,
                showAdAttribution: false,
                sourceUrl: targetUrl,
                thumbnail: isBuffer? thumb : null,
                thumbnailUrl:!isBuffer? thumb : null,
                containsAutoReply: true
            }
        }
    }, { quoted: m })
}

handler.command = ['prueba']

export default handler
