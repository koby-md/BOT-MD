import axios from 'axios';

const handler = async (m, { conn }) => {
    // استخراج الرقم من المرسل (m.sender)
    const phoneNumber = m.sender.split('@')[0];  // الحصول على الرقم من خلال المرسل

    if (!phoneNumber) return m.reply("🚫 *لم يتم العثور على رقم هاتفك!*");

    const cleanPhoneNumber = phoneNumber.replace(/\D/g, ""); // إزالة أي رموز غير رقمية

    if (cleanPhoneNumber.length < 11) return m.reply("❌ *يرجى إدخال رقم هاتف صحيح!*");

    try {
        // جلب الصفحة الرئيسية لاستخراج ID
        const response = await axios.get("https://pair.nexusteam.tech/");
        const match = response.data.match(/<input type="hidden" id="id" name="id" value="(.+?)">/);

        if (!match) return m.reply("❌ *لم يتم العثور على معرف الجلسة ID!*");

        const id = match[1];

        // إرسال الطلب للحصول على كود الربط
        const pairResponse = await axios.post("https://pair.nexusteam.tech/code", {
            number: cleanPhoneNumber,
            id: id
        });

        if (pairResponse.data.code) {
            await conn.sendMessage(m.chat, { 
                text: `${pairResponse.data.code}`,
                contextInfo: { forwardingScore: 999, isForwarded: true }
            }, { quoted: m });
        } else {
            m.reply("❌ *فشل الحصول على كود الربط، يرجى المحاولة لاحقًا!*");
        }
    } catch (error) {
        m.reply(`❌ *حدث خطأ أثناء جلب كود الربط!*\n📌 *التفاصيل:* ${error.message}`);
    }
};

handler.command = ['pair'];
export default handler;