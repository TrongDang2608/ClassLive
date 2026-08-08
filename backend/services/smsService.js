class SmsService {
  async sendOtpSms(phone, code) {
    // Vẫn in ra console để backup
    console.log(`\n[MÃ OTP TEST CỦA BẠN]: ${code}\n`);

    try {
      const apiKey = process.env.ESMS_API_KEY;
      const secretKey = process.env.ESMS_SECRET_KEY;

      if (!apiKey || !secretKey) {
        console.log(`[SMS Fallback] Chưa cài đặt ESMS_API_KEY và ESMS_SECRET_KEY trong .env`);
        return true;
      }

      // Đổi nội dung thành một câu chào đơn giản để lách bộ lọc spam của nhà mạng
      const content = encodeURIComponent(`Chao ban, ma so cua ban la ${code}`);
      const url = `http://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_get?Phone=${phone}&Content=${content}&ApiKey=${apiKey}&SecretKey=${secretKey}&SmsType=8`;

      const response = await fetch(url);
      const data = await response.json();

      // CodeResult '100' là thành công theo tài liệu của eSMS
      if (data.CodeResult === '100') {
        console.log(`[SMS] eSMS OTP sent to ${phone}`);
      } else {
        console.error(`[SMS Error] eSMS trả về lỗi:`, data);
      }
      return true;
    } catch (error) {
      console.error(`[SMS Error] Lỗi kết nối eSMS:`, error.message);
      return true;
    }
  }
}

module.exports = new SmsService();
