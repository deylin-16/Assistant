let handler = async (m, { conn }) => {
    const config = global.getAssistantConfig(conn.user.jid)
    let targetUrl = 'https://www.deylin.xyz'
    let fixedImage = 'https://i.ibb.co/g8PsK57/IMG-20251224-WA0617.jpg'

    await conn.sendMessage(m.chat, {
        text: targetUrl,
        contextInfo: {
            externalAdReply: {
                title: `CÓDIGO DE EMPAREJAMIENTO`,
                body: `Asistente: ${config.assistantName}`,
                mediaType: 2, 
                renderLargerThumbnail: true,
                thumbnailUrl: fixedImage,
                sourceUrl: targetUrl,
                mediaUrl: targetUrl,
                showAdAttribution: false
            }
        }
    }, { quoted: m })
}

handler.command = ['prueba']

export default handler
