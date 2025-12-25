import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
    const config = global.getAssistantConfig(conn.user.jid)
    
    let canalLink = 'https://www.deylin.xyz/1' 
    let iconoUrl = 'https://i.ibb.co/g8PsK57/IMG-20251224-WA0617.jpg'
    
    let buffer = await (await fetch(iconoUrl)).buffer()

    await conn.sendMessage(m.chat, {
        text: canalLink, // Texto obligatorio para que el mensaje tenga un "ancla"
        contextInfo: {
            externalAdReply: {
                title: config.assistantName,
                body: '🚀 COMUNIDAD OFICIAL',
                thumbnail: buffer,
                mediaType: 1,
                
                // ESTA ES LA CLAVE:
                // Si dejas mediaUrl vacío o con la URL de la imagen, da error.
                // Al poner el link del CANAL aquí también, WhatsApp asocia 
                // los datos visuales directamente con la web del canal.
                mediaUrl: canalLink, 
                sourceUrl: canalLink,
                
                renderLargerThumbnail: true,
                showAdAttribution: true
            }
        }
    }, { quoted: m })
}

handler.command = ['prueba']
export default handler
