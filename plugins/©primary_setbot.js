let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!m.isGroup) return;

    if (text === 'off' || text === 'reset' || text === 'liberar') {
        global.db.data.chats[m.chat].primaryBot = '';
        return m.reply(`✅ Grupo liberado. Todos los asistentes pueden responder.`);
    }

    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null;

    if (!who) return m.reply(`Menciona al bot que quieres dejar como único asistente.\n\nEjemplo: ${usedPrefix + command} @bot\nPara resetear: ${usedPrefix + command} off`);

    const mainBotJid = global.conn?.user?.jid;
    const subBotsJids = (global.conns || []).map(v => v.user?.jid).filter(Boolean);
    const allBots = [mainBotJid, ...subBotsJids];

    if (!allBots.includes(who)) {
        return m.reply(`❌ El usuario @${who.split('@')[0]} no es un asistente activo del sistema. Por favor, menciona a un bot real.`, null, { mentions: [who] });
    }

    global.db.data.chats[m.chat].primaryBot = who;

    await conn.sendMessage(m.chat, {
        text: `✅ *Prioridad Establecida*\n\nSolo @${who.split('@')[0]} responderá en este grupo. Los demás se mantendrán en espera.`,
        mentions: [who]
    }, { quoted: m });
};

handler.command = /^(prioridad|primary|setbot)$/i;
handler.rowner = true;

export default handler;
