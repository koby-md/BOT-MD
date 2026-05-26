import fs from 'fs';
import fetch from 'node-fetch'; // أو استخدم fetch المدمج في Node 18+
import { igdl } from 'btch-downloader';

const handler = async (m, { conn, text }) => {
  const instagramUrl = text || m.text || (m.message?.conversation);

  if (!instagramUrl) return m.reply('❌ أرسل رابط Instagram لتنزيل الفيديو أو الصورة');

  const instagramUrlPattern = /^(https?:\/\/)?(www\.)?(instagram\.com|ig\.me)\/.+$/;
  if (!instagramUrlPattern.test(instagramUrl)) return;

  m.reply(wait);

  try {
    const res = await igdl(instagramUrl);

    if (!res?.result || res.result.length === 0) {
      return m.reply('⚠️ لم يتم العثور على محتوى صالح في هذا الرابط.');
    }

    for (const i of res.result) {
      const fileExt = i.url.includes('.jpg') ? 'jpg' : 'mp4';
      const filePath = `./src/tmp/instagram_${Date.now()}.${fileExt}`;

      // تنزيل الفيديو أو الصورة
      const buffer = await (await fetch(i.url)).arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));

      // إرسال الملف للمستخدم
      await conn.sendFile(m.chat, filePath, `instagram.${fileExt}`, '*✅ تم التنزيل!*', m);

      // حذف الملف المؤقت بعد الإرسال
      fs.unlinkSync(filePath);
    }

  } catch (err) {
    console.error('❌ خطأ أثناء تنزيل محتوى Instagram:', err);
    m.reply('⚠️ حدث خطأ أثناء التنزيل. حاول مرة أخرى لاحقًا.');
  }
};

// البوت يتفاعل تلقائيًا مع أي رابط Instagram
handler.customPrefix = /^(https?:\/\/)?(www\.)?(instagram\.com|ig\.me)\/.+$/;
handler.command = new RegExp(); // بدون أمر محدد

export default handler;