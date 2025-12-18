let handler = async (m, { conn, text }) => {
    let input = text ? text.replace(/@\d+/g, '').trim().toLowerCase() : ''
    let validPhrases = /^(foto de perfil|perfil|foto)$/i

    if (!validPhrases.test(input)) return

    let who
    if (m.quoted?.sender) {
        who = m.quoted.sender
    } else if (m.mentionedJid?.[0]) {
        who = m.mentionedJid[0]
    } else if (text) {
        let number = text.replace(/[^0-9]/g, '')
        if (number.length > 8) {
            who = number + '@s.whatsapp.net'
        }
    }

    if (!who) {
        return conn.sendMessage(m.chat, {
            text: 'Menciona a alguien o responde a un mensaje para obtener la foto.'
        }, {
            quoted: m
        })
    }

    let name = await (async () => {
        const dbName = global.db.data.users[who]?.name
        if (dbName) return dbName
        try {
            const contactName = await conn.getName(who)
            return (typeof contactName === 'string' && contactName.trim()) ? contactName : who.split('@')[0]
        } catch {
            return who.split('@')[0]
        }
    })()

    await m.react('🕒')

    let pp
    try {
        pp = await conn.profilePictureUrl(who, 'image')
    } catch {
        try {
            pp = await conn.profilePictureUrl(m.chat, 'image')
            await conn.sendMessage(m.chat, {
                text: `*Foto privada, se muestra la del grupo.*`
            }, {
                quoted: m
            })
        } catch {
            pp = 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg'
            await conn.sendMessage(m.chat, {
                text: `*No se encontró foto.*`
            }, {
                quoted: m
            })
        }
    }

    await conn.sendFile(m.chat, pp, 'profile.jpg', `*Aquí tienes la foto de perfil de ${name}*`, m)
    await m.react('✔️')
}

handler.command = ['robar', 'tomar', 'obtener']

export default handler
