// CÓDIGO EN plugins/...Assistant.js
// ...
handler.all = async function (m, { conn }) {

  if (!conn.user) return
  
  // OMITIENDO FILTROS DE BOT/PREFIJO

  let prefixRegex = new RegExp('^[' + (opts?.prefix || '‎z/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.,\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')
  if (prefixRegex.test(m.text)) return true 
  
  // OBTENER TEXTO COMPLETO (CON MENCION)
  let query = m.text || ''
  let username = m.pushName || 'Usuario'

  if (query.length === 0) return 

  await conn.sendPresenceUpdate('composing', m.chat)

  // -----------------------------------------------------------
  // RESPUESTA DE PRUEBA SIMPLE A CUALQUIER TEXTO NO COMANDO
  // -----------------------------------------------------------
  await conn.reply(m.chat, `✅ ¡TE HE OÍDO! Texto completo recibido: "${query}".`, m)
  return true
  // -----------------------------------------------------------
}
// ...
