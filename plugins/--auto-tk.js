import axios from 'axios'

let handler = async (m, { conn, text }) => {
  // استخراج النص سواء كان من رسالة مباشرة أو رابط مقتبس
  const input = m.text || m.message?.conversation || m.message?.extendedTextMessage?.text;

  // التحقق من وجود رابط تيك توك في النص
  const tiktokRegex = /^(https?:\/\/)?(www\.)?(tiktok\.com|vt\.tiktok\.com)\/.+$/;
  if (!tiktokRegex.test(input)) return;

  try {
    // إرسال رسالة انتظار (اختياري)
     await m.reply(wait);

    const encodedParams = new URLSearchParams()
    encodedParams.set("url", input)
    encodedParams.set("hd", "2")

    const response = await axios({
      method: "POST",
      url: "https://tikwm.com/api/",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Cookie: "current_language=en",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
      },
      data: encodedParams,
    })

    const res = response.data.data
    if (!res || !res.play) throw new Error('لم يتم العثور على الفيديو')

    await conn.sendFile(
      m.chat, 
      res.play, 
      'tiktok.mp4',m
    )
  } catch (e) {
    console.error(e)
    // لا نرسل رد خطأ في التلقائي عادةً لتجنب الإزعاج، لكن يمكنك تفعيله:
    // m.reply('❌ فشل تحميل الفيديو، تأكد من أن الرابط صحيح.')
  }
}

// التعديل السحري هنا لجعل العمل تلقائي
handler.customPrefix = /^(https?:\/\/)?(www\.)?(tiktok\.com|vt\.tiktok\.com)\/.+$/;
handler.command = new RegExp();

export default handler