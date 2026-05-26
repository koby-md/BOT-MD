import yts from 'yt-search';

let handler = async (m, { conn, usedPrefix, text }) => {
    if (!text) {
        return conn.reply(m.chat, 'Please provide the name of a YouTube video or channel.', m);
    }

    try {
        let result = await yts(text);
        let ytres = result.videos;

        if (!ytres || ytres.length === 0) {
            return conn.reply(m.chat, 'No results found.', m);
        }

        let v = ytres[0];

        // مصفوفة الأزرار
        let buttons = [
            { buttonId: `${usedPrefix}ytmp3 ${v.url}`, buttonText: { displayText: '🎧 Audio' }, type: 1 },
            { buttonId: `${usedPrefix}ytmp4 ${v.url}`, buttonText: { displayText: '🎬 Video' }, type: 1 }
        ];

        // إرسال الصورة مع العنوان والأزرار في رسالة واحدة
        await conn.sendMessage(
            m.chat,
            {
                image: { url: v.thumbnail },
                caption: `*${v.title}*\n\n🔗 ${v.url}\n\n*_📥 إختر الوسيلة للتنزيل_*`,
                footer: 'YouTube Search',
                buttons: buttons,
                headerType: 4
            },
            { quoted: m }
        );

    } catch (e) {
        console.log(e);
        m.reply('حدث خطأ، يرجى المحاولة لاحقاً.');
    }
};

handler.help = ['play'];
handler.tags = ['dl'];
handler.command = /^play|ytbuscar|yts(earch)?$/i;

export default handler;