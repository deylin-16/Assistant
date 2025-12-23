import axios from 'axios';
import { search } from 'tiktok-scraper-without-apikey';


let handler = async (m, { conn, text }) => {
  

  if (!text) return conn.reply(m.chat, `🍪 Por favor, ingresa lo que deseas buscar.`, m);

  try {
    await m.react(rwait);
    
    const searchResults = await search(text);

    if (!searchResults || searchResults.length === 0) {
      await m.react('❌');
      return conn.reply(m.chat, `No se encontraron resultados para "${text}".`, m);
    }

    const primerVideo = searchResults[0];
    const videoUrl = primerVideo.link; 

    const downloadApi = `https://www.deylin.xyz/api/download/tiktok?url=${encodeURIComponent(videoUrl)}&apikey=by_deylin`;
    const { data: dlData } = await axios.get(downloadApi);

    if (!dlData.success) {
      await m.react('❌');
      return conn.reply(m.chat, `Error al procesar el video con la API de descarga.`, m);
    }

    const caption = `*TIKTOK SEARCH*
📝 *Título:* ${dlData.title || 'Sin título'}
👤 *Autor:* ${dlData.author || dlData.autor}
🔗 *Enlace original:* ${videoUrl}
`.trim();

    
    await conn.sendMessage(m.chat, { 
      video: { url: dlData.video_url }, 
      caption: caption,
      mimetype: 'video/mp4'
    }, { quoted: m });

    await m.react(done);

  } catch (error) {
    console.error("Error:", error);
    await m.react('❌');
    conn.reply(m.chat, `Ocurrió un error inesperado.\nDetalles: ${error.message}`, m);
  }
};

handler.help = ['tiktoksearch <txt>'];
handler.tags = ['buscador'];
handler.command = ['tiktoksearch', 'ttss', 'tiktoks'];

export default handler;
