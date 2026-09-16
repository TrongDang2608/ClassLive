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
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; padding: 40px 20px; border-radius: 16px; color: #f8fafc;">
          <div style="background-color: #1e293b; padding: 40px; border-radius: 12px; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 28px; font-weight: 800; color: #fbbf24; letter-spacing: -0.5px;">Class<span style="color: #ffffff;">Live</span></span>
            </div>
            <h2 style="color: #ffffff; font-size: 22px; margin-bottom: 16px; text-align: center;">Chào mừng ${fullName}!</h2>
            <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin-bottom: 24px; text-align: center;">
              Tài khoản học tập của bạn tại hệ thống <strong>ClassLive</strong> đã được khởi tạo thành công.<br>
              Vui lòng bấm vào nút bên dưới để thiết lập tên đăng nhập và mật khẩu của bạn.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${setupLink}" style="background-color: #d97706; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4);">
                Thiết Lập Tài Khoản Ngay
              </a>
            </div>
            <p style="color: #64748b; font-size: 13px; line-height: 1.5; text-align: center;">
              Đường dẫn có hiệu lực trong 24 giờ.<br>
              Nếu bạn không có yêu cầu này, vui lòng bỏ qua email.
            </p>
          </div>
          <div style="text-align: center; margin-top: 24px; color: #64748b; font-size: 12px;">
            &copy; ${new Date().getFullYear()} ClassLive App. All rights reserved.
          </div>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Setup Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending setup email:', error.message);
      return false;
    }
  }

  async sendOtpEmail(toEmail, code) {
    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.BREVO_SMTP_USER;

    const mailOptions = {
      from: `"ClassLive Security" <${senderEmail}>`,
      to: toEmail,
      subject: '🔑 Mã xác thực OTP đăng nhập - ClassLive',
      html: `
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 550px; margin: 0 auto; background-color: #0f172a; padding: 40px 20px; border-radius: 16px; color: #f8fafc;">
          <div style="background-color: #1e293b; padding: 36px 32px; border-radius: 12px; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 26px; font-weight: 800; color: #fbbf24; letter-spacing: -0.5px;">Class<span style="color: #ffffff;">Live</span></span>
            </div>
            <h2 style="color: #ffffff; font-size: 20px; margin-bottom: 12px; text-align: center;">Xác Thực Đăng Nhập (2FA)</h2>
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; text-align: center; margin-bottom: 24px;">
              Dưới đây là mã OTP xác thực hai bước để hoàn tất đăng nhập vào hệ thống ClassLive:
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <div style="display: inline-block; background-color: #0f172a; border: 2px dashed #d97706; padding: 16px 36px; border-radius: 12px; letter-spacing: 8px; font-size: 32px; font-weight: 800; color: #fbbf24;">
                ${code}
              </div>
            </div>
            <p style="color: #f59e0b; font-size: 13px; font-weight: 500; text-align: center; margin-bottom: 8px;">
              ⏱️ Mã này có hiệu lực trong 5 phút.
            </p>
            <p style="color: #64748b; font-size: 12px; line-height: 1.5; text-align: center;">
              Tuyệt đối KHÔNG chia sẻ mã này cho bất kỳ ai để bảo vệ an toàn tài khoản.
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #64748b; font-size: 12px;">
            &copy; ${new Date().getFullYear()} ClassLive Education Platform.
          </div>
        </div>
      `
    };

    try {
      if (this.transporter && process.env.BREVO_SMTP_USER) {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('OTP Email sent successfully:', info.messageId);
      } else {
        console.log(`[DEV MODE] OTP Code for ${toEmail}: ${code}`);
      }
      return true;
    } catch (err) {
      console.error('Error sending OTP email:', err.message);
      return false;
    }
  }
}

module.exports = new EmailService();
