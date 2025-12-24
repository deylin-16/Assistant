let handler = async (m, { conn }) => {
    const config = global.getAssistantConfig(conn.user.jid)
    
    let isBuffer = Buffer.isBuffer(config.assistantImage)
    let targetUrl = 'https://www.deylin.xyz'

    await conn.sendMessage(m.chat, {
        text: targetUrl, // El texto DEBE ser la URL para que el sistema la reconozca
        contextInfo: {
            externalAdReply: {
                title: `CÓDIGO DE EMPAREJAMIENTO`,
                body: `Asistente: ${config.assistantName}`,
                mediaType: 1,
                renderLargerThumbnail: true,
                thumbnail: isBuffer ? config.assistantImage : null,
                thumbnailUrl: !isBuffer ? config.assistantImage : null,
                sourceUrl: targetUrl,
                // Esto es lo que hace que al tocar la imagen te mande al link
                mediaUrl: targetUrl, 
                showAdAttribution: true
            }
        }
    }, { quoted: m })
}

handler.command = ['prueba']

export default handler
