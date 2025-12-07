import { generateWAMessageFromContent } from '@whiskeysockets/baileys'
import { prepareWAMessageMedia } from '@whiskeysockets/baileys'

var handler = async (m, { conn, text, participants, isAdmin }) => {
  

  let users = participants.map(u => u.id);
  let extraText = text ? text : "Hello"; 

  if (!m.quoted) {
    let msg = generateWAMessageFromContent(
      m.chat,
      { extendedTextMessage: { text: extraText, contextInfo: { mentionedJid: users } } },
      { quoted: m, userJid: conn.user.id }
    );
    return await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
  }

  try {
    let quotedMessage = m.quoted.message;
    if (!quotedMessage) return;

    let mType = Object.keys(quotedMessage)[0];
    let content = quotedMessage[mType];

    if (content.text || content.caption) {
      let currentText = content.text || content.caption || '';
      let newText = `${extraText}\n\n---\n${currentText}`;
      
      if (content.text) {
          content.text = newText;
      } else if (content.caption) {
          content.caption = newText;
      }
      
      content.contextInfo = {
          ...content.contextInfo,
          mentionedJid: users
      };

      let newMessage = { [mType]: content };

      await conn.copyNForward(m.chat, newMessage, false, { 
          quoted: m, 
          contextInfo: { mentionedJid: users }
      });

    } else {
      let msg = generateWAMessageFromContent(
        m.chat,
        { extendedTextMessage: { text: extraText, contextInfo: { mentionedJid: users } } },
        { quoted: m.quoted, userJid: conn.user.id }
      );
      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    }

  } catch (error) {
    let msg = generateWAMessageFromContent(
        m.chat,
        { extendedTextMessage: { text: `${extraText}\n\n⚠️ Falló el reenvío del mensaje citado.`, contextInfo: { mentionedJid: users } } },
        { quoted: m, userJid: conn.user.id }
    );
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
  }
}

handler.help = ['notificar'];
handler.tags = ['grupo'];
handler.command = ['tag', 'n'];
handler.group = true;
handler.admin = true;

export default handler;
