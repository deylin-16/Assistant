let handler = async (m, { conn }) => {
    const config = global.getAssistantConfig(conn.user.jid)
    let channelUrl = 'https://www.deylin.xyz/1' 
    let fixedImage = 'https://i.ibb.co/g8PsK57/IMG-20251224-WA0617.jpg'

    await conn.sendMessage(m.chat, {
        // IMPORTANTE: El texto debe ser el link para que WhatsApp valide la redirección
        text: channelUrl, 
        contextInfo: {
            externalAdReply: {
                title: `COMUNIDAD: ${config.assistantName}`,
                body: '¡Toca aquí para unirte al canal!',
                thumbnailUrl: fixedImage,
                sourceUrl: channelUrl,
                mediaType: 1,
                // Estas dos líneas son clave en las versiones nuevas de la API
                renderLargerThumbnail: true,
                showAdAttribution: true 
            }
        }
    }, { quoted: m })
}

handler.command = ['prueba']
export default handler
