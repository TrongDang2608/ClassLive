const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST,
      port: process.env.BREVO_SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS
      }
    });
  }

  async sendSetupAccountEmail(toEmail, fullName, token) {
    const setupLink = `${process.env.FRONTEND_URL}/setup-account?token=${token}`;

    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.BREVO_SMTP_USER;
    const mailOptions = {
      from: `"ClassLive System" <${senderEmail}>`,
      to: toEmail,
      subject: '👋 Chào mừng đến với ClassLive - Vui lòng thiết lập tài khoản',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9fa; padding: 40px 20px; border-radius: 12px;">
          <div style="background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <h2 style="color: #2c3e50; font-size: 24px; margin-bottom: 20px; text-align: center;">Chào mừng ${fullName}!</h2>
            <p style="color: #596a7b; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Tài khoản học tập của bạn tại hệ thống <strong>ClassLive</strong> đã được khởi tạo thành công. 
              Để bắt đầu tham gia lớp học, bạn cần thiết lập mật khẩu bảo vệ tài khoản của mình.
            </p>
            <div style="text-align: center; margin: 40px 0;">
              <a href="${setupLink}" style="background-color: #2c3e50; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
                Thiết Lập Tài Khoản Ngay
              </a>
            </div>
            <p style="color: #8c9baf; font-size: 14px; line-height: 1.5; text-align: center;">
              Đường dẫn này có hiệu lực trong 24 giờ.<br>
              Nếu bạn không yêu cầu tạo tài khoản, vui lòng bỏ qua email này.
            </p>
          </div>
          <div style="text-align: center; margin-top: 24px; color: #8c9baf; font-size: 13px;">
            &copy; ${new Date().getFullYear()} ClassLive App. All rights reserved.
          </div>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false; // Tránh quăng lỗi ra ngoài làm sập luồng chính (chỉ ghi log)
    }
  }
}

module.exports = new EmailService();
