let handler = async (m, { conn }) => {
    // Obtenemos la configuración del asistente
    const config = global.getAssistantConfig(conn.user.jid)
    
    // AQUÍ pones el enlace de tu Canal de WhatsApp
    let channelUrl = 'https://whatsapp.com/channel/TU_ID_DEL_CANAL' 
    let fixedImage = 'https://i.ibb.co/g8PsK57/IMG-20251224-WA0617.jpg'

    await conn.sendMessage(m.chat, {
        text: '¡Únete a mi canal para más actualizaciones!', // Puedes cambiar este texto
        contextInfo: {
            externalAdReply: {
                title: `Canal Oficial de ${config.assistantName}`, // Un título hace que se vea mejor
                body: `Toca aquí para unirte`,
                mediaType: 1,
                renderLargerThumbnail: true, // Cambiado a true para que la imagen se vea grande y llamativa
                showAdAttribution: true, 
                sourceUrl: channelUrl, // Este es el enlace que se abre al tocar
                thumbnailUrl: fixedImage,
            }
        }
    }, { quoted: m })
}

handler.command = ['prueba']

export default handler
