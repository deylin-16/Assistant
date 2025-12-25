let handler = async (m, { conn }) => {
    const config = global.getAssistantConfig(conn.user.jid)
    let targetUrl = 'https://www.deylin.xyz'
    let fixedImage = 'https://raw.githubusercontent.com/deylin-16/Kirito.my/refs/heads/main/media/images/2.jpg?token=GHSAT0AAAAAADQVEIPPZ4NQNHC2T45Q7HQU2KMZCHQ'

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
