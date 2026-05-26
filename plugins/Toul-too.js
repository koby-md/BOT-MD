import fs from 'fs';
import uploadFile from '../src/libraries/uploadFile.js';
import uploadImage from '../src/libraries/uploadImage.js';

const handler = async (m, { conn, command, prefix }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.convertidor_tourl;

  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';

  if (!mime || !/image\/(png|jpe?g)/i.test(mime)) {
    throw `*${tradutor.texto1 || 'قم بالرد على صورة لتحويلها إلى ستايل جيبلي'}*`;
  }
m.reply(wait);
  await conn.sendMessage(m.chat, { react: { text: "🔎", key: m.key } });

  const media = await q.download();
  const link = await uploadImage(media);

  const ghibliUrl = `https://fgsi1-restapi.hf.space/api/ai/toGhibli?url=${link}`;

  await conn.sendMessage(m.chat, { image: { url: ghibliUrl } }, { quoted: m });
};

handler.help = ['too'];
handler.tags = ['TOUL'];
handler.command = /^too$/i;

export default handler;