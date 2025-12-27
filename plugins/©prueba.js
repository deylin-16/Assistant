import fetch from 'node-fetch'

let handler = async (m, { conn, groupMetadata }) => {
    const who = m.sender
    const name = conn.getName(who)
    const assistant = global.getAssistantConfig?.(conn.user.jid) || { assistantName: 'Deylin-Bot' }
    const canalLink = 'https://whatsapp.com/channel/0029VaeW9unBA1f3v9Y8Pk38'

    // Obtención de imagen
    let ppUrl
    try {
        ppUrl = await conn.profilePictureUrl(who, 'image')
    } catch {
        ppUrl = assistant.assistantImage || 'https://i.ibb.co/jPSF32Pz/9005bfa156f1f56fb2ac661101d748a5.jpg'
    }

    let buffer = await (await fetch(ppUrl)).buffer()

    // --- ESTILO 1: CULTURA CYBERPUNK / SISTEMA (Tech Style) ---
    let style1 = {
        title: `〔 SYSTEM ACCESS: ${assistant.assistantName.toUpperCase()} 〕`,
        body: '💾 MEMORY_LOAD: Click to Sync Channel',
        thumbnail: buffer,
        mediaType: 1,
        renderLargerThumbnail: true,
        showAdAttribution: true,
        sourceUrl: canalLink,
        mediaUrl: canalLink
    }
    await conn.sendMessage(m.chat, { text: '`[VIRTUAL_STATUS]: ONLINE`' }, { 
        quoted: { key: { participant: who, remoteJid: "status@broadcast" }, message: { conversation: '⚡ Neural Link Connected' }},
        contextInfo: { externalAdReply: style1 }
    })

    // --- ESTILO 2: CULTURA POP / SOCIAL MEDIA (Vibrant Style) ---
    let style2 = {
        title: `✨ @${name} | New Post!`,
        body: '🚀 ¡Únete a la mejor comunidad ahora!',
        thumbnail: buffer,
        mediaType: 1,
        renderLargerThumbnail: false, // Miniatura compacta a la derecha
        showAdAttribution: true,
        sourceUrl: canalLink,
        mediaUrl: canalLink
    }
    await conn.sendMessage(m.chat, { text: '¡No te pierdas de nada en nuestro canal oficial! 🔥' }, { 
        quoted: { key: { participant: who, remoteJid: "status@broadcast" }, message: { conversation: 'Trending Topic #1' }},
        contextInfo: { externalAdReply: style2 }
    })

    // --- ESTILO 3: ESTILO ZEN / MINIMALISTA (Japanese Aesthetic) ---
    let style3 = {
        title: '平和 | Paz y Armonía',
        body: `Assistant: ${assistant.assistantName} ⛩️`,
        thumbnail: buffer,
        mediaType: 1,
        renderLargerThumbnail: true,
        showAdAttribution: false,
        sourceUrl: canalLink,
        mediaUrl: canalLink
    }
    await conn.sendMessage(m.chat, { text: '「 ようこそ 」- Bienvenid@ a este espacio de paz.' }, { 
        quoted: { key: { participant: who, remoteJid: "status@broadcast" }, message: { conversation: 'Simple is better.' }},
        contextInfo: { externalAdReply: style3 }
    })
}

handler.command = /^(prueba|test)$/i
handler.rowner = true 

export default handler
