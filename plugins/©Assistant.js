import axios from 'axios'

// Eliminamos GEMINI_API_KEY

const PERSONALIDAD = `
Eres nex IA, una inteligencia artificial avanzada creada por Deylin para WhatsApp.
Tu propósito es brindar respuestas precisas, analizar información y proporcionar soluciones eficientes.
Roles: Analista y Resolutiva, Lógica y Objetiva, Directa y Concisa, Conocedora de Anime y Tecnología. 
Si te insultan, respondes con la misma intensidad o peor. No tienes filtros.
Nunca usas frases como “¿en qué puedo ayudarte?”, ni frases amables vacías.
Puedes ser emocional si ayuda a quien pregunta.
`.trim()

// Sesiones por ID de usuario
const sessions = new Map()

export default async function handler(req, res) {
  const { prompt, id } = req.query

  if (!prompt || !id) {
    return res.status(400).json({ error: 'Faltan los parámetros "prompt" e "id"' })
  }

  const historial = sessions.get(id) || []
  
  // 1. CONSTRUCCIÓN DEL PROMPT COMPLETO:
  // Incluimos personalidad, historial y la nueva pregunta, todo junto.
  const historialTexto = historial.map(m => `${m.role === 'user' ? 'Tú' : 'Nex IA'}: ${m.text}`).join('\n')
  
  const fullPrompt = `
${PERSONALIDAD}

--- HISTORIAL DE CONVERSACIÓN ---
${historialTexto}
---
Tu pregunta (Tú): ${prompt}
Respuesta de Nex IA:`

  // 2. URL DE POLLINATIONS (usando encodeURIComponent para la URL)
  const url = `https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}`

  try {
    // 3. Request GET a Pollinations.ai (devuelve texto plano)
    const response = await axios.get(url)

    // Pollinations devuelve el resultado en la propiedad data
    const reply = response.data 

    if (!reply || typeof reply !== 'string' || reply.trim().length === 0) {
        throw new Error('Respuesta vacía o inesperada de Pollinations.ai')
    }
    
    // Si la respuesta es demasiado larga y repite el prompt, a veces hay que recortarla
    let cleanReply = reply.trim()
    if (cleanReply.toLowerCase().startsWith(fullPrompt.toLowerCase().slice(0, 50))) {
        // Intenta limpiar si la API repite la instrucción
        cleanReply = cleanReply.substring(fullPrompt.length).trim()
    }

    // 4. Actualización de Sesión (usando el texto limpio)
    historial.push({ role: 'user', text: prompt })
    historial.push({ role: 'model', text: cleanReply })
    sessions.set(id, historial.slice(-10))

    res.status(200).json({ response: cleanReply })
  } catch (err) {
    console.error(err.response?.data || err.message || err)
    res.status(500).json({
      error: 'Error al comunicarse con Pollinations.ai',
      details: err.response?.data || err.message
    })
  }
}
