const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const otpRepository = require('../repositories/otpRepository');
const smsService = require('./smsService');
const emailService = require('./emailService');

class AuthService {
  
  // Sinh OTP 6 số ngẫu nhiên
  _generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // 1. Học sinh thiết lập tài khoản từ Link (gửi qua email)
  async setupAccount(userId, username, password) {
    try {
      const user = await userRepository.findById(userId);
      if (!user) throw new Error('Tài khoản không tồn tại.');

      if (user.isSetup) throw new Error('Tài khoản này đã được thiết lập. Vui lòng chuyển đến trang đăng nhập.');

      // Kiểm tra username có bị trùng không
      const existingUser = await userRepository.findByUsername(username);
      if (existingUser) throw new Error('Username này đã có người sử dụng. Vui lòng chọn tên khác.');

      // Mã hóa mật khẩu
      const hashedPassword = await bcrypt.hash(password, 10);

      // Cập nhật DB
      await userRepository.update(userId, {
        username: username,
        password: hashedPassword,
        isSetup: true
      });

      return { message: 'Thiết lập tài khoản thành công.' };
    } catch (error) {
      throw error;
    }
  }

  // 2. Bước 1 Đăng nhập: Kiểm tra Username / Password
  async loginPassword(username, password) {
    const user = await userRepository.findByUsernameOrEmail(username);
    if (!user) throw new Error('Username/Email hoặc Mật khẩu không đúng.');

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Username/Email hoặc Mật khẩu không đúng.');

    // Tự động gửi OTP
    const code = this._generateCode();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    
    await otpRepository.saveOtp(user.id, code, expiresAt);

    if (!user.phone) throw new Error('Tài khoản không có số điện thoại để gửi mã OTP.');
    await smsService.sendOtpSms(user.phone, code);

    // Che số điện thoại dạng +84 ******678
    const rawPhone = user.phone;
    let maskedPhone = rawPhone;
    if (rawPhone.length > 6) {
      const prefix = rawPhone.startsWith('+') ? rawPhone.slice(0, 3) : rawPhone.slice(0, 2);
      const suffix = rawPhone.slice(-3);
      maskedPhone = `${prefix} ******${suffix}`;
    }

    // Trả về userId và maskedPhone để frontend tiếp tục gọi API validate OTP
    return {
      message: 'Đăng nhập thành công bước 1. Mã OTP đã được gửi.',
      userId: user.id,
      maskedPhone: maskedPhone
    };
  }

  // 3. Bước 2 Đăng nhập: Gửi mã OTP 2FA
  async requestAccessCode(userId, type) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('Tài khoản không tồn tại.');

    const code = this._generateCode();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    
    // Lưu với khóa là userId
    await otpRepository.saveOtp(userId, code, expiresAt);

    if (type === 'phone') {
      if (!user.phone) throw new Error('Tài khoản không có số điện thoại.');
      await smsService.sendOtpSms(user.phone, code);
    } else {
      if (!user.email) throw new Error('Tài khoản không có địa chỉ email.');
      await emailService.sendOtpEmail(user.email, code);
    }

    return { message: 'Đã gửi mã xác thực thành công' };
  }

  // 4. Bước cuối Đăng nhập: Xác thực OTP và trả về Token
  async validateAccessCode(userId, code) {
    const otp = await otpRepository.findOtp(userId);
    if (!otp) throw new Error('Mã xác thực không tồn tại hoặc đã hết hạn.');

    if (otp.code !== code) throw new Error('Mã xác thực không chính xác.');
    
    if (otp.isExpired()) {
      await otpRepository.deleteOtp(userId);
      throw new Error('Mã xác thực đã hết hạn.');
    }

    const user = await userRepository.findById(userId);
    if (!user) throw new Error('Tài khoản không tồn tại.');

    // Xóa mã OTP
    await otpRepository.deleteOtp(userId);

    // Sinh JWT Token để frontend lưu vào localStorage/Cookies
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    return {
      success: true,
      userType: user.role, // Trả về theo yêu cầu của spec cũ
      role: user.role,
      token: token
    };
  }
}

module.exports = new AuthService();
