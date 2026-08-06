class SmsService {
  async sendOtpSms(phone, code) {
    // Vẫn in ra console để backup
    console.log(`\n[MÃ OTP TEST CỦA BẠN]: ${code}\n`);

    // Tạm thời comment lại để dev, sau này xong hết mở ra lại
    /*
    try {
      const username = process.env.CLICKSEND_USERNAME;
      const apiKey = process.env.CLICKSEND_API_KEY;
      
      if (!username || !apiKey) {
        console.log(`[SMS Fallback] Chưa cài đặt ClickSend Username/API Key trong .env`);
        return true;
      }

      const auth = Buffer.from(`${username}:${apiKey}`).toString('base64');
      
      const response = await fetch('https://rest.clicksend.com/v3/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify({
          messages: [
            {
              source: "ClassLive",
              body: `Your ClassLive access code is: ${code}`,
              to: phone
            }
          ]
        })
      });

      const data = await response.json();
      
      if (response.ok && data.http_code === 200) {
        console.log(`[SMS] ClickSend OTP sent to ${phone}`);
      } else {
        console.error(`[SMS Error] ClickSend trả về lỗi:`, data);
      }
      return true;
    } catch (error) {
      console.error(`[SMS Error] Lỗi kết nối ClickSend:`, error.message);
      return true;
    }
    */

    return true; // Fake success để test luồng
  }
}

module.exports = new SmsService();
