const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');
const otpRepository = require('../repositories/otpRepository');
const refreshTokenRepository = require('../repositories/refreshTokenRepository');
const smsService = require('./smsService');
const emailService = require('./emailService');
const AppError = require('../utils/AppError');

class AuthService {
  // Sinh OTP 6 số ngẫu nhiên
  _generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // 1. Thiết lập tài khoản từ Token Link (gửi qua email)
  async setupAccount(token, newUsername, newPassword) {
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new AppError('Link thiết lập tài khoản không hợp lệ hoặc đã hết hạn.', 400);
    }

    const userId = decoded.id;
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('Tài khoản không tồn tại trong hệ thống.', 404);
    }

    if (user.isSetup) {
      throw new AppError('Tài khoản này đã được thiết lập trước đó. Vui lòng chuyển đến trang đăng nhập.', 400);
    }

    // Kiểm tra username có bị trùng không
    const existingUser = await userRepository.findByUsername(newUsername);
    if (existingUser && existingUser.id !== userId) {
      throw new AppError('Tên đăng nhập này đã có người sử dụng. Vui lòng chọn tên khác.', 400);
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật DB
    await userRepository.update(userId, {
      username: newUsername,
      password: hashedPassword,
      isSetup: true
    });

    return { message: 'Thiết lập tài khoản thành công.' };
  }

  // 2. Bước 1 Đăng nhập: Kiểm tra Username / Password
  async loginPassword(username, password) {
    const user = await userRepository.findByUsernameOrEmail(username);
    if (!user) {
      throw new AppError('Tên đăng nhập / Email hoặc Mật khẩu không chính xác.', 401);
    }

    // Kiểm tra mật khẩu
    if (!user.password) {
      throw new AppError('Tài khoản chưa được thiết lập mật khẩu. Vui lòng kiểm tra email kích hoạt.', 400);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Tên đăng nhập / Email hoặc Mật khẩu không chính xác.', 401);
    }

    // Tự động sinh và lưu OTP
    const code = this._generateCode();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    await otpRepository.saveOtp(user.id, code, expiresAt);

    if (!user.phone) {
      throw new AppError('Tài khoản chưa có số điện thoại để nhận mã OTP.', 400);
    }

    await smsService.sendOtpSms(user.phone, code);

    // Che số điện thoại dạng +84 ******678
    const rawPhone = user.phone;
    let maskedPhone = rawPhone;
    if (rawPhone.length > 6) {
      const prefix = rawPhone.startsWith('+') ? rawPhone.slice(0, 3) : rawPhone.slice(0, 2);
      const suffix = rawPhone.slice(-3);
      maskedPhone = `${prefix} ******${suffix}`;
    }

    return {
      message: 'Đăng nhập thành công bước 1. Mã OTP đã được gửi.',
      userId: user.id,
      maskedPhone: maskedPhone
    };
  }

  // 3. Bước 2 Đăng nhập: Gửi lại mã OTP 2FA
  async requestAccessCode(userId, type) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('Tài khoản không tồn tại.', 404);
    }

    const code = this._generateCode();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    await otpRepository.saveOtp(userId, code, expiresAt);

    if (type === 'phone') {
      if (!user.phone) {
        throw new AppError('Tài khoản không có số điện thoại.', 400);
      }
      await smsService.sendOtpSms(user.phone, code);
    } else {
      if (!user.email) {
        throw new AppError('Tài khoản không có địa chỉ email.', 400);
      }
      await emailService.sendOtpEmail(user.email, code);
    }

    return { message: 'Đã gửi mã xác thực thành công.' };
  }

  // 4. Bước cuối Đăng nhập: Xác thực OTP và trả về Token
  async validateAccessCode(userId, code) {
    const otp = await otpRepository.findOtp(userId);
    if (!otp) {
      throw new AppError('Mã xác thực không tồn tại hoặc đã hết hạn.', 400);
    }

    if (otp.code !== code) {
      throw new AppError('Mã xác thực OTP không chính xác.', 400);
    }
    
    if (otp.isExpired()) {
      await otpRepository.deleteOtp(userId);
      throw new AppError('Mã xác thực OTP đã hết hạn. Vui lòng yêu cầu mã mới.', 400);
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('Tài khoản không tồn tại.', 404);
    }

    // Xóa mã OTP sau khi dùng xong
    await otpRepository.deleteOtp(userId);

    // Sinh Access Token (15 phút)
    const accessToken = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '15m' }
    );

    // Sinh Refresh Token (lưu DB, hết hạn sau 2 ngày)
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = Date.now() + 2 * 24 * 60 * 60 * 1000;
    await refreshTokenRepository.save(user.id, refreshToken, expiresAt);

    return {
      role: user.role,
      token: accessToken,
      refreshToken: refreshToken,
      user: user.toSafeObject()
    };
  }

  // 5. Cấp lại Access Token mới dựa vào Refresh Token
  async refreshToken(token) {
    const tokenData = await refreshTokenRepository.findByToken(token);
    if (!tokenData) {
      throw new AppError('Refresh Token không hợp lệ hoặc đã bị thu hồi.', 401);
    }

    const user = await userRepository.findById(tokenData.userId);
    if (!user) {
      await refreshTokenRepository.deleteByToken(token);
      throw new AppError('Tài khoản người dùng không tồn tại.', 404);
    }

    // Sinh Access Token mới (15 phút)
    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '15m' }
    );

    return {
      token: newAccessToken
    };
  }

  // 6. Đăng xuất: Xóa Refresh Token
  async logout(token) {
    await refreshTokenRepository.deleteByToken(token);
    return { message: 'Đăng xuất thành công.' };
  }
}

module.exports = new AuthService();
