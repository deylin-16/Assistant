import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
    const config = global.getAssistantConfig(conn.user.jid)
    const iconoUrl = 'https://i.ibb.co/g8PsK57/IMG-20251224-WA0617.jpg'
    
    try {
        const response = await fetch(iconoUrl)
        const buffer = await response.buffer()

        await conn.sendModify(m.chat, "Haz clic para unirte 🚀", m, {
            title: config?.assistantName || 'Assembly System',
            body: '🚀 Testing Sub-Bot Design',
            url: "https://chat.whatsapp.com/Kj6tqzVJ6WJGPiC8wrL8gw",
            thumbnail: buffer,
            largeThumb: true
        })
        
        await m.react('✅')

    } catch (e) {
        console.log("--- DETALLE DEL ERROR ---")
        console.log(e)
        m.reply(`❌ Error crítico: ${e.message}`)
    }
}

handler.command = ['prueba2']
export default handler
