import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
    const config = global.getAssistantConfig(conn.user.jid)
    const iconoUrl = 'https://i.ibb.co/g8PsK57/IMG-20251224-WA0617.jpg'

    try {
        const response = await fetch(iconoUrl)
        if (!response.ok) throw new Error('No se pudo descargar la imagen')
        const buffer = await response.buffer()

        // Usamos await para asegurar que la función termine antes de reaccionar
        // Prueba esto en tu plugin
await conn.sendModify(m.chat, "Prueba de enlace normal", m, {
    title: 'TEST NAVIGATOR',
    body: 'Haz clic para probar Google',
    url: "https://www.google.com", // Si esto abre, tu simple.js ya está bien
    thumbnail: buffer,
    largeThumb: true
})


        await m.react('✅')

    } catch (e) {
        console.error(e)
        // No enviamos el error al chat si es un problema de red menor
        if (m.quoted) return
    }
}

handler.command = ['prueba2']
export default handler
