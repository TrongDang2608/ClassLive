const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST,
      port: 587,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS
      }
    });
  }

  async sendOtpEmail(email, code) {
    try {
      const info = await this.transporter.sendMail({
        from: '"ClassLive Support" <no-reply@classlive.com>',
        to: email,
        subject: 'ClassLive - Login Access Code',
        html: `
          <h3>Welcome to ClassLive!</h3>
          <p>Your access code is: <strong>${code}</strong></p>
          <p>Please enter this code on the login page to continue. The code will expire in 5 minutes.</p>
        `
      });
      console.log(`[Email] OTP sent to ${email}. MessageId: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error(`[Email Error] Failed to send to ${email}:`, error.message);
      throw new Error('Không thể gửi email chứa mã truy cập.');
    }
  }
  async sendSetupEmail(email, token) {
    try {
      // Giả sử frontend chạy ở cổng 3000
      const setupLink = `http://localhost:3000/setup-account?token=${token}`;
      const info = await this.transporter.sendMail({
        from: '"ClassLive Support" <no-reply@classlive.com>',
        to: email,
        subject: 'ClassLive - Account Setup',
        html: `
          <h3>Welcome to ClassLive!</h3>
          <p>Your instructor has added you to the system.</p>
          <p>Please click the link below to set up your username and password:</p>
          <a href="${setupLink}">Set up your account</a>
          <p>If you did not expect this email, please ignore it.</p>
        `
      });
      console.log(`[Email] Setup link sent to ${email}. MessageId: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error(`[Email Error] Failed to send setup link to ${email}:`, error.message);
      throw new Error('Không thể gửi email thiết lập tài khoản.');
    }
  }
}

module.exports = new EmailService();
