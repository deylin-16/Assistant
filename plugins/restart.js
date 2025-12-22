let handler = async (m, { conn, usedPrefix, command }) => {

    try {
        m.reply(`Acción de reinicio en proceso...`)
        setTimeout(() => {
            process.exit(0)
        }, 3000) 
    } catch (error) {
        console.log(error)
        conn.reply(m.chat, `${error}`, m)
    }
}


handler.command = ['restart', 'reiniciar'] 
handler.rowner = true

export default handler