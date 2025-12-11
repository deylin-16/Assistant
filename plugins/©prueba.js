const handler = async (m, { conn }) => {

let h = conn.user.jid

returt m.reply(h)

handler.command = ['h']

export handler