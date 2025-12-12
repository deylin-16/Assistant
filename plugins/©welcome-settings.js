import { areJidsSameUser } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text, command, isAdmin, isGroup }) => {


    let chat = global.db.data.chats[m.chat] || {}

    switch (command.toLowerCase()) {
        case 'setwelcome':


            let usedPrefix = m.text.charAt(0)


            const commandPattern = usedPrefix + command.toLowerCase()



            let customMessage = m.text.substring(commandPattern.length).trimStart()



            if (!customMessage) return m.reply(`*Uso:* ${usedPrefix}setwelcome ¡Bienvenido, @user! Eres el miembro @total del grupo @grupo.`)

            // Guardamos el mensaje personalizado
            chat.customWelcome = customMessage
            // Aseguramos que el welcome esté activado al establecer el mensaje (si no lo estaba)
            chat.welcome = true

            m.reply(`✅ Mensaje de bienvenida personalizado establecido para este grupo.\n\n*Nota:* Usa *@user*, *@grupo* y *@total* en tu mensaje.`)
            break

        default:
            break
    }
}

handler.command = ['setwelcome']
handler.botAdmin = false
handler.admin = true
export default handler
