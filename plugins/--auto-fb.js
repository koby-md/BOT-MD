 import { fbdown } from 'btch-downloader';

const handler = async (m, { conn }) => {
    const messageText = m.text.trim(); // استخدام m.text للحصول على محتوى الرسالة

    // التأكد من أن الرابط موجود
    if (!messageText) {
        return conn.reply(m.chat, 'يرجى إرسال رابط Facebook لتحميله.', m);
    }
m.reply(wait);

    // استدعاء API لتحميل الفيديو من Facebook
    try {
        let res = await fbdown(messageText);
        const { Normal_video, HD, creator } = res;

        // إرسال الفيديو
        if (HD) {
            await conn.sendMessage(m.chat, {
                video: { url: HD },
                caption: `🌟 *فيديو HD من Facebook تم تحميله!*`
            });
        } else if (Normal_video) {
            await conn.sendMessage(m.chat, {
                video: { url: Normal_video },
                caption: `🎥 *فيديو Facebook تم تحميله!*`
            });
        }
    } catch (error) {
        console.error(error);
        conn.reply(m.chat, 'حدث خطأ أثناء معالجة الرابط.', m);
    }
};

// استخدام RegExp في customPrefix للتحقق من روابط Facebook تلقائيًا
handler.customPrefix = /https:\/\/(www\.)?(facebook\.com|fb\.com)\/.+/;  // تحقق من رابط Facebook
handler.command = new RegExp(); // بدون أمر محدد

export default handler;