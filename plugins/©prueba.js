import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
    const config = global.getAssistantConfig(conn.user.jid)
    
    // Variables base
    let redes = 'https://www.deylin.xyz/1' 
    let icono = 'https://i.ibb.co/g8PsK57/IMG-20251224-WA0617.jpg'
    let botname = config.assistantName
    let dev = '🚀 ♡⃝𝑻𝒆𝒄𝒏𝒐-𝑩𝒐𝒕҉ᚐ'
    let channelRD = { id: '120363160031023229@newsletter', name: 'Canal de Prueba' }

    // Descarga de imagen para el buffer
    let imageBuffer = await (await fetch(icono)).buffer()

    // --- PRUEBA 1 (Formato Forwarded Newsletter) ---
    await conn.sendMessage(m.chat, {
        text: 'Prueba 1: Forwarded + Buffer',
        contextInfo: { 
            isForwarded: true, 
            forwardedNewsletterMessageInfo: { 
                newsletterJid: channelRD.id, 
                serverMessageId: '', 
                newsletterName: channelRD.name 
            }, 
            externalAdReply: { 
                title: botname, 
                body: dev, 
                mediaUrl: null, 
                description: null, 
                previewType: "PHOTO", 
                thumbnail: imageBuffer, 
                sourceUrl: redes, 
                mediaType: 1, 
                renderLargerThumbnail: false 
            }, 
            mentionedJid: null 
        }
    }, { quoted: m })

    // --- PRUEBA 2 (Formato AdReply Directo con Large Thumbnail) ---
    await conn.sendMessage(m.chat, {
        text: 'Prueba 2: Directo + MediaUrl + Large',
        contextInfo: {
            externalAdReply: {
                title: botname,
                body: dev,
                mediaType: 1,
                mediaUrl: redes,
                sourceUrl: redes,
                thumbnail: imageBuffer,
                showAdAttribution: false,
                containsAutoReply: true,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m })
}

handler.command = ['prueba']

export default handler
