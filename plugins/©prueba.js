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
                mediaType: 1, // Cambiado a 1 para que sea un link normal
                renderLargerThumbnail: false, // Imagen pequeña a la derecha
                thumbnailUrl: fixedImage,
                sourceUrl: targetUrl,
                showAdAttribution: false // Esto elimina el texto de "anuncio"
            }
        }
    }, { quoted: m })
}

handler.command = ['prueba']

export default handler
