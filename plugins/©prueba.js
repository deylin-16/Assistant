import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
    const config = global.getAssistantConfig(conn.user.jid)
    
    // 1. Enlace de tu canal (Destino real)
    let canalRedir = 'https://www.deylin.xyz/1' 
    
    // 2. URL de la imagen (Solo para descargarla, no se envía como link)
    let urlImagen = 'https://i.ibb.co/g8PsK57/IMG-20251224-WA0617.jpg'
    
    // 3. DESCARGAMOS LA IMAGEN: Esto convierte la URL en datos reales (buffer)
    // Así WhatsApp no ve una URL de imagen, ve una "foto" ya cargada.
    let response = await fetch(urlImagen)
    let bufferImagen = await response.buffer()

    await conn.sendMessage(m.chat, {
        text: canalRedir, // Texto base
        contextInfo: {
            externalAdReply: {
                title: config.assistantName,
                body: '🚀 ¡Únete a la comunidad!',
                
                // USAMOS 'thumbnail' (con el buffer), NO 'thumbnailUrl'
                // Esto evita que WhatsApp use la URL de la imagen como destino
                thumbnail: bufferImagen, 
                
                // Este es el ÚNICO link que WhatsApp reconocerá para el clic
                sourceUrl: canalRedir,
                
                mediaType: 1,
                renderLargerThumbnail: true,
                showAdAttribution: true
            }
        }
    }, { quoted: m })
}

handler.command = ['prueba']
export default handler
