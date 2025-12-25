let handler = async (m, { conn }) => {
    const config = global.getAssistantConfig(conn.user.jid)
    let targetUrl = 'https://www.deylin.xyz'
    let fixedImage = 'https://i.ibb.co/g8PsK57/IMG-20251224-WA0617.jpg'

    await conn.sendMessage(m.chat, {
        text: targetUrl, // El link debe estar aquí para que WhatsApp lo detecte
        contextInfo: {
            externalAdReply: {
                title: `CÓDIGO DE EMPAREJAMIENTO`,
                body: `Asistente: ${config.assistantName}`,
                mediaType: 1, 
                renderLargerThumbnail: false,
                thumbnailUrl: fixedImage,
                sourceUrl: targetUrl,
                // No agregues mediaUrl ni showAdAttribution para evitar errores
                containsAutoReply: true
            }
        }
    }, { quoted: m })
}

handler.command = ['prueba']

export default handler
