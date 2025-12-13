import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'
import { webp2png } from '../lib/webp2mp4.js'

const POLLINATIONS_BASE_URL = 'https://text.pollinations.ai';

let handler = m => m

async function handleJijiCommand(m, conn, { isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, participants, groupMetadata, command }) {
    if (!m.isGroup) return m.reply('😒 ¿De verdad esperabas que hiciera algo en privado? Solo sirvo para grupos.')
    
    if (!isAdmin) return m.reply('😼 Te crees importante, ¿verdad? Solo hablo con los administradores, humano.')
    
    if (!isBotAdmin) return m.reply('🙄 Soy un gato ocupado. Necesito ser administrador para molestarte y hacer estas cosas. ¡Arregla eso!')

    let action = m.text.substring(command.length).toLowerCase().trim()

    if (!action) return m.reply(`*Instrucciones para Jiji. No me hagas repetirlo:*
🔑 *Cerrar/Abrir:* jiji cierra el grupo | jiji abre el grupo
📝 *Metadatos:* jiji cambia el nombre a [nombre] | jiji cambia la foto (responde a una imagen)
✂️ *Mantenimiento:* jiji elimina a @user | jiji menciona a todos`)

    if (action.includes('cierra') || action.includes('cerrar') || action.includes('bloquear') || action.includes('ciérralo')) {
        await conn.groupSettingUpdate(m.chat, 'announcement')
        m.reply('🔒 Hecho. Silencio total. Ahora, hazme caso.')

    } else if (action.includes('abre') || action.includes('abrir') || action.includes('desbloquear') || action.includes('ábrelo')) {
        await conn.groupSettingUpdate(m.chat, 'not_announcement')
        m.reply('🔓 ¡Qué fastidio! Grupo abierto. Que empiece el ruido.')

    } else if (action.includes('cambia el nombre') || action.includes('renombrar') || action.includes('ponle nombre')) {
        let newSubject = m.text.substring(m.text.toLowerCase().indexOf('nombre') + 'nombre'.length).trim()
        
        if (!newSubject) return m.reply('😒 ¿Acaso esperas que adivine el nombre? Dímelo.')
        if (newSubject.length > 25) return m.reply('🙄 El nombre no es una novela. Menos de 25 caracteres.')

        await conn.groupUpdateSubject(m.chat, newSubject)
        m.reply(`✅ Título cambiado a: *${newSubject}*. Qué creatividad.`)

    } else if (action.includes('cambia la descripción') || action.includes('pon descripción') || action.includes('descr') || action.includes('descripción')) {
        let newDesc = m.text.substring(m.text.toLowerCase().indexOf('descripción') + 'descripción'.length).trim()
        
        if (!newDesc && m.quoted && m.quoted.text) {
            newDesc = m.quoted.text.trim()
        }
        
        if (!newDesc) return m.reply('😒 Necesito el texto. ¿Respondiste a algo? ¿O vas a escribirlo?')
        
        await conn.groupUpdateDescription(m.chat, newDesc)
        m.reply('✅ Descripción actualizada. Espero que sirva de algo.')

    } else if (action.includes('cambia la foto') || action.includes('pon foto') || action.includes('cambiar imagen')) {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || ''
        
        if (!/image\/(jpe?g|png)|webp/.test(mime)) {
            return m.reply('🖼️ Tienes que responder a una imagen, ¿o esperas que ponga una foto mía? Nunca.')
        }

        try {
            let media = await q.download?.()
            
            if (/webp/.test(mime)) {
                media = await webp2png(media)
            }
            
            await conn.updateProfilePicture(m.chat, media)
            m.reply('✅ Foto cambiada. Ahora el grupo se ve... diferente.')
        } catch (e) {
            console.error(e)
            m.reply('❌ Falló. Problema de la imagen. No es mi culpa.')
        }
        
    } else if (action.includes('elimina') || action.includes('eliminalo') || action.includes('sácalo') || action.includes('fuera')) {
        let users = m.mentionedJid.filter(u => u.endsWith('@s.whatsapp.net'))
        
        if (users.length === 0 && m.quoted) {
            let targetJid = m.quoted.sender
            if (targetJid.endsWith('@s.whatsapp.net')) {
                users.push(targetJid)
            }
        }
        
        if (users.length === 0) return m.reply('🤦 Menciona al culpable (o responde a su mensaje). Pierdo mi tiempo.')

        for (let user of users) {
            const isTargetAdmin = groupMetadata.participants.find(p => p.id === user)?.admin
            if (isTargetAdmin === 'admin' && !isRAdmin) {
                m.reply(`😼 No soy tu guardián. No puedo sacar a @${user.split('@')[0]} porque también es administrador.`)
                continue
            }
            
            await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
            m.reply(`🧹 Uno menos. @${user.split('@')[0]} ha sido expulsado. La paz sea contigo (por ahora).`)
        }

    } else if (action.includes('menciona todos') || action.includes('tagall') || action.includes('menciónalos')) {
        let members = participants.map(p => p.id)
        let mentionText = '📢 ¡Despierten! Jiji los llama:\n\n'
        
        let customText = m.text.substring(m.text.toLowerCase().indexOf('menciona') + 'menciona'.length).trim()
        if(customText) {
            mentionText = `📢 Tienen un mensaje de @${m.sender.split('@')[0]}:\n\n` + customText + '\n\n'
        }
        
        mentionText += members.map(jid => `@${jid.split('@')[0]}`).join(' ')
        
        conn.sendMessage(m.chat, { 
            text: mentionText, 
            contextInfo: { mentionedJid: members } 
        }, { quoted: m })
        
    } else {
        m.reply('🙄 No entendí esa orden. Si vas a molestarme, al menos sé claro.')
    }
}


handler.all = async function (m, { conn, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, participants, groupMetadata, command }) {
    let user = global.db.data.users[m.sender]
    let chat = global.db.data.chats[m.chat]

    m.isBot = m.id.startsWith('BAE5') && m.id.length === 16 
            || m.id.startsWith('3EB0') && (m.id.length === 12 || m.id.length === 20 || m.id.length === 22) 
            || m.id.startsWith('B24E') && m.id.length === 20
    if (m.isBot) return 

    let prefixRegex = new RegExp('^[' + (opts?.prefix || '‎z/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.,\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')
    
    let [mainCommand] = (m.text || '').trim().toLowerCase().split(/\s+/);
    
    if (mainCommand === 'jiji') {
        const commandParams = { isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, participants, groupMetadata, command: 'jiji' };
        await handleJijiCommand(m, conn, commandParams);
        return true; 
    }

    if (prefixRegex.test(m.text)) return true 
    
    if (global.plugins[mainCommand]) return true
    
    if (m.sender?.toLowerCase().includes('bot')) return true

    if (!chat.isBanned && chat.autoresponder) {
        if (m.fromMe) return

        let query = m.text || ''
        let username = m.pushName || 'Usuario'

        let isOrBot = /(jiji|gato|asistente)/i.test(query)
        let isReply = m.quoted && m.quoted.sender === this.user.jid
        let isMention = m.mentionedJid && m.mentionedJid.includes(this.user.jid) 

        if (!(isOrBot || isReply || isMention)) return

        await this.sendPresenceUpdate('composing', m.chat)

        const adminKeywords = /cierra|abre|elimina|cambia la foto|cambia el nombre|cambia la descripción|menciona todos/i;
        if (adminKeywords.test(query)) {
             await this.reply(m.chat, '🙄 Eso es trabajo de mantenimiento, no una pregunta existencial. No me mezcles en tus tareas de administrador.', m);
             return;
        }


        let jijiPrompt = `Eres Jiji, un gato negro sarcástico y leal, como el de Kiki: Entregas a Domicilio. Responde a ${username}: ${query}. 
        
        nota: si vas a resaltar un texto solo usas un * en cada esquina no ** y separa bien los párrafos y eso.`;

        let promptToSend = chat.sAutoresponder ? chat.sAutoresponder : jijiPrompt;

        try {
            const url = `${POLLINATIONS_BASE_URL}/${encodeURIComponent(promptToSend)}`;
            const res = await fetch(url)

            if (!res.ok) {
                    throw new Error(`Error HTTP: ${res.status}`);
            }

            let result = await res.text()

            if (result && result.trim().length > 0) {
                await this.reply(m.chat, result, m)
            }
        } catch (e) {
            console.error(e)
            await this.reply(m.chat, '⚠️ ¡Rayos! No puedo contactar con la nube de la IA. Parece que mis antenas felinas están fallando temporalmente.', m)
        }
    }
    return true
}

export default handler
