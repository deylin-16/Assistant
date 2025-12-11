import fetch from 'node-fetch';
import { sticker } from '../lib/sticker.js';

const GEMINI_API_KEY = 'AIzaSyD1V090ya1hDnW8ODQwdJ9RG5y8qK_Lmx0';
const MODEL_NAME = 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;


let handler = m => m

handler.all = async function (m, { conn }) {

  if (!conn.user) return
  
  // OMITIENDO FILTRO m.isBot (ASUMIENDO QUE NO ES UN BOT)

  let prefixRegex = new RegExp('^[' + (opts?.prefix || '‎z/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.,\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')
  if (prefixRegex.test(m.text)) return true // Si es un comando como /up o !menu, se detiene.
  
  // OBTENER TEXTO COMPLETO (CON MENCION)
  let query = m.text || ''
  let username = m.pushName || 'Usuario'

  if (query.length === 0) return 

  await conn.sendPresenceUpdate('composing', m.chat)

  // -----------------------------------------------------------
  // RESPUESTA DE PRUEBA SIMPLE A CUALQUIER TEXTO NO COMANDO
  // -----------------------------------------------------------
  await conn.reply(m.chat, `✅ PRUEBA EXITOSA. El texto COMPLETO recibido es: "${query}". Ahora, si la mención (@XYZ) NO aparece aquí, ¡ese es el problema!`, m)
  return true
  // -----------------------------------------------------------
}

export default handler
