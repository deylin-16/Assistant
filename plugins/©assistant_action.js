import { webp2png } from '../lib/webp2mp4.js'
import { isJidGroup } from '@whiskeysockets/baileys'

const ACTION_SYNONYMS = {
    CLOSE: ['cierra', 'cerrar', 'bloquea', 'ciérralo', 'silencia el grupo', 'modo-admin'],
    OPEN: ['abre', 'abrir', 'desbloquea', 'ábrelo', 'quita modo-admin'],
    RENAME: ['cambia el nombre a', 'renombrar a', 'ponle nombre', 'nuevo nombre', 'actualiza nombre a'],
    DESC: ['cambia la descripción a', 'pon descripción', 'nueva descripción', 'descr', 'actualiza descripción'],
    PHOTO: ['cambia la foto', 'pon foto', 'cambiar imagen'],
    REMOVE: ['elimina', 'sacar', 'kickea', 'expulsa', 'saca', 'fuera', 'eliminalo', 'sácalo'],
    TAGALL: ['menciona todos', 'tagall', 'menciónalos', 'aviso a todos']
};

const RESPONSES = {
    NO_BOT_ADMIN: ['Debo ser administrador para poder gestionar el grupo.', 'Por favor, asígneme permisos de administrador para ejecutar el comando.', 'No puedo proceder; no tengo los permisos necesarios.'],
    RENAME_MISSING: ['Debe proporcionar el nuevo nombre del grupo.', 'Especifique el título a asignar.', 'El nombre no puede estar vacío.'],
    RENAME_LENGTH: ['El nombre del grupo no debe exceder los 25 caracteres.', 'Nombre demasiado largo. Limite a 25 caracteres.'],
    RENAME_SUCCESS: (subject) => [`Nombre de grupo actualizado a: *\( {subject}*.`, `Título modificado correctamente a * \){subject}*.`, `Confirmación: Se ha cambiado el nombre a *${subject}*.`],
    DESC_MISSING: ['Debe proporcionar la nueva descripción.', 'Especifique el texto de la descripción.', 'Por favor, ingrese o cite la nueva descripción.'],
    DESC_SUCCESS: ['Descripción del grupo actualizada.', 'La nueva descripción ha sido guardada.', 'Detalles del grupo modificados con éxito.'],
    PHOTO_MISSING: ['Debe responder a una imagen para cambiar la foto del grupo.', 'Por favor, cite o adjunte una imagen.', 'No se detectó ninguna imagen para el perfil.'],
    PHOTO_SUCCESS: ['Foto de perfil del grupo actualizada.', 'Imagen de grupo cambiada exitosamente.', 'La foto del grupo ha sido renovada.'],
    PHOTO_FAIL: ['Ocurrió un error al procesar la imagen. Intente con otro formato.', 'Fallo en la actualización de la foto. Revise la imagen.', 'No pude cambiar la foto del grupo debido a un error interno.'],
    REMOVE_MISSING: ['Mencione o cite el mensaje del usuario a expulsar.', 'Necesito el identificador del usuario para ejecutar la expulsión.', 'Indique el usuario objetivo.'],
    REMOVE_IS_ADMIN: (user) => [`@\( {user.split('@')[0]} es administrador. No puedo expulsarle sin ser Propietario/Super Admin.`, `Imposible expulsar a @ \){user.split('@')[0]} ya que tiene privilegios de administrador.`, `Acción denegada: @${user.split('@')[0]} es un administrador.`].map(s => s.replace(/\@/g, '')),
    REMOVE_SELF: ['No puedo expulsarme a mí mismo.', 'La autoexpulsión no es posible.', 'El bot no puede ser eliminado.'],
    REMOVE_OWNER_GROUP: (user) => [`No se puede eliminar al Propietario del grupo: @\( {user.split('@')[0]}.`, `El creador del grupo no puede ser expulsado: @ \){user.split('@')[0]}.`, `Acción imposible: @${user.split('@')[0]} es el dueño del grupo.`].map(s => s.replace(/\@/g, '')),
    REMOVE_OWNER_BOT: (user) => [`No puedo eliminar al dueño del software: @\( {user.split('@')[0]}.`, `Protegido: @ \){user.split('@')[0]} es el propietario del bot.`, `Imposible expulsar al creador del bot: @${user.split('@')[0]}.`].map(s => s.replace(/\@/g, '')),
    REMOVE_SUCCESS: (user) => [`El usuario @\( {user.split('@')[0]} ha sido expulsado del grupo.`, `Expulsión exitosa: @ \){user.split('@')[0]} ha sido removido.`, `@${user.split('@')[0]} ya no es miembro del grupo.`].map(s => s.replace(/\@/g, '')),
    REMOVE_FAIL: (user) => [`Fallo al intentar expulsar a @\( {user.split('@')[0]}. Verifique los permisos.`, `No se pudo remover a @ \){user.split('@')[0]}. Es posible que ya no esté.`, `Error de expulsión para @${user.split('@')[0]}.`],
    CLOSE_SUCCESS: ['El grupo ha sido configurado en modo solo administradores.', 'Ajuste completado: solo los administradores pueden enviar mensajes.', 'Modo de anuncio activado exitosamente.'],
    OPEN_SUCCESS: ['El grupo ha vuelto a su configuración normal.', 'Permisos de envío restaurados para todos los miembros.', 'Modo abierto activado.'],
    TAGALL_HEADER: (sender) => [`Aviso importante de @\( {sender}:`, `Mensaje global iniciado por @ \){sender}:`, `Notificación general de @${sender}:`],
    TAGALL_DEFAULT: ['¡Atención a todos los miembros!', 'Se requiere su atención, por favor.', 'Notificación importante del sistema:']
}

const randomResponse = (key, ...args) => {
    const responses = RESPONSES[key];
    if (typeof responses === 'function') {
        return responses(...args)[Math.floor(Math.random() * responses(...args).length)]
    }
    return responses[Math.floor(Math.random() * responses.length)]
}

const handler = async (m, { conn, text, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, participants, groupMetadata, command }) => {

    if (!m.isGroup) return;
    if (!isAdmin) return;
    if (!isBotAdmin) return m.reply(randomResponse('NO_BOT_ADMIN'), m.chat, { quoted: m });

    const actionText = text.toLowerCase().trim();

    if (!actionText || actionText === 'jiji') return;

    let actionKey = null;
    let commandPhraseUsed = '';

    const actionSynonymsFlat = Object.entries(ACTION_SYNONYMS).flatMap(([key, syns]) => 
        syns.map(syn => ({ key, syn }))
    ).sort((a, b) => b.syn.length - a.syn.length);

    for (const { key, syn } of actionSynonymsFlat) {
        if (actionText.includes(syn)) {
            actionKey = key;
            commandPhraseUsed = syn;
            break;
        }
    }

    if (!actionKey) return;

    const cleanArgument = (fullText, usedPhrase) => {
        return fullText.replace(command, '').trim()
                       .replace(usedPhrase, '').trim()
                       .replace(new RegExp(usedPhrase, 'gi'), '').trim();
    };

    if (actionKey === 'CLOSE') {
        await conn.groupSettingUpdate(m.chat, 'announcement');
        m.reply(randomResponse('CLOSE_SUCCESS'), m.chat, { quoted: m });

    } else if (actionKey === 'OPEN') {
        await conn.groupSettingUpdate(m.chat, 'not_announcement');
        m.reply(randomResponse('OPEN_SUCCESS'), m.chat, { quoted: m });

    } else if (actionKey === 'RENAME') {
        const newSubject = cleanArgument(actionText, commandPhraseUsed);
        if (!newSubject) return m.reply(randomResponse('RENAME_MISSING'), m.chat, { quoted: m });
        if (newSubject.length > 25) return m.reply(randomResponse('RENAME_LENGTH'), m.chat, { quoted: m });
        await conn.groupUpdateSubject(m.chat, newSubject);
        m.reply(randomResponse('RENAME_SUCCESS', newSubject), m.chat, { quoted: m });

    } else if (actionKey === 'DESC') {
        let newDesc = cleanArgument(actionText, commandPhraseUsed);
        if (!newDesc && m.quoted && m.quoted.text) {
            newDesc = m.quoted.text.trim();
        }
        if (!newDesc) return m.reply(randomResponse('DESC_MISSING'), m.chat, { quoted: m });
        await conn.groupUpdateDescription(m.chat, newDesc);
        m.reply(randomResponse('DESC_SUCCESS'), m.chat, { quoted: m });

    } else if (actionKey === 'PHOTO') {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || q.mediaType || '';
        if (!/image\/(jpe?g|png)|webp/.test(mime)) {
            return m.reply(randomResponse('PHOTO_MISSING'), m.chat, { quoted: m });
        }
        try {
            let media = await q.download?.();
            if (/webp/.test(mime)) {
                media = await webp2png(media);
            }
            await conn.updateProfilePicture(m.chat, media);
            m.reply(randomResponse('PHOTO_SUCCESS'), m.chat, { quoted: m });
        } catch (e) {
            console.error(e);
            m.reply(randomResponse('PHOTO_FAIL'), m.chat, { quoted: m });
        }

    } else if (actionKey === 'REMOVE') {
        let users = m.mentionedJid?.filter(u => u.endsWith('@s.whatsapp.net')) || [];
        if (users.length === 0 && m.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            users.push(...m.message.extendedTextMessage.contextInfo.mentionedJid.filter(u => u.endsWith('@s.whatsapp.net')));
        }
        if (users.length === 0 && m.quoted) {
            const targetJid = m.quoted.sender;
            if (targetJid?.endsWith('@s.whatsapp.net')) users.push(targetJid);
        }
        users = [...new Set(users)].filter(u => u?.endsWith('@s.whatsapp.net'));
        if (users.length === 0) return m.reply(randomResponse('REMOVE_MISSING'), m.chat, { quoted: m });

        const groupInfo = await conn.groupMetadata(m.chat);
        const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net';
        const ownerBot = global.owner[0][0] + '@s.whatsapp.net';

        for (let user of users) {
            const isTargetAdmin = groupMetadata.participants.find(p => p.id === user)?.admin;

            if (user === conn.user.jid) {
                m.reply(randomResponse('REMOVE_SELF'), m.chat, { quoted: m });
                continue;
            }
            if (user === ownerGroup) {
                conn.sendMessage(m.chat, { text: randomResponse('REMOVE_OWNER_GROUP', user), contextInfo: { mentionedJid: [user] } }, { quoted: m });
                continue;
            }
            if (user === ownerBot) {
                conn.sendMessage(m.chat, { text: randomResponse('REMOVE_OWNER_BOT', user), contextInfo: { mentionedJid: [user] } }, { quoted: m });
                continue;
            }
            if (isTargetAdmin === 'admin' && !isRAdmin && !isOwner) {
                conn.sendMessage(m.chat, { text: randomResponse('REMOVE_IS_ADMIN', user), contextInfo: { mentionedJid: [user] } }, { quoted: m });
                continue;
            }
            try {
                await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
                conn.sendMessage(m.chat, { text: randomResponse('REMOVE_SUCCESS', user), contextInfo: { mentionedJid: [user] } }, { quoted: m });
            } catch (e) {
                conn.sendMessage(m.chat, { text: randomResponse('REMOVE_FAIL', user), contextInfo: { mentionedJid: [user] } }, { quoted: m });
            }
        }

    } else if (actionKey === 'TAGALL') {
        const members = participants.map(p => p.id);
        const customText = cleanArgument(actionText, commandPhraseUsed);
        let mentionText = customText 
            ? randomResponse('TAGALL_HEADER', m.sender.split('@')[0]) + '\n\n' + `*${customText}*\n\n`
            : randomResponse('TAGALL_DEFAULT') + '\n\n';
        mentionText += members.map(jid => `@${jid.split('@')[0]}`).join(' ');
        conn.sendMessage(m.chat, { text: mentionText, contextInfo: { mentionedJid: members } }, { quoted: m });
    }
}

handler.command = ['jiji']
handler.group = true
handler.admin = true

export default handler