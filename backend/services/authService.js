const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');
const otpRepository = require('../repositories/otpRepository');
const refreshTokenRepository = require('../repositories/refreshTokenRepository');
const emailService = require('./emailService');
const cacheService = require('./cacheService');
const AppError = require('../utils/AppError');

class AuthService {
  // Sinh OTP 6 số ngẫu nhiên
  _generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Che email dạng d*****8@gmail.com
  _maskEmail(email) {
    if (!email || !email.includes('@')) return email || '';
    const [name, domain] = email.split('@');
    if (name.length <= 2) {
      return `${name[0]}***@${domain}`;
    }
    const firstChar = name[0];
    const lastChar = name[name.length - 1];
    return `${firstChar}*****${lastChar}@${domain}`;
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

  // 2. Bước 1 Đăng nhập: Kiểm tra Username / Password -> Gửi OTP qua Email
  async loginPassword(username, password) {
    const users = await userRepository.findAllByUsernameOrEmail(username);
    if (!users || users.length === 0) {
      throw new AppError('Tên đăng nhập / Email hoặc Mật khẩu không chính xác.', 401);
    }

    // Tìm tài khoản khớp mật khẩu (xử lý an toàn khi nhiều role dùng chung email)
    let user = null;
    for (const u of users) {
      if (u.password && await bcrypt.compare(password, u.password)) {
        user = u;
        break;
      }
    }

    if (!user) {
      throw new AppError('Tên đăng nhập / Email hoặc Mật khẩu không chính xác.', 401);
    }

    if (!user.email) {
      throw new AppError('Tài khoản chưa được cấu hình địa chỉ Email để nhận mã OTP.', 400);
    }

    // Tự động sinh và lưu OTP
    const code = this._generateCode();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    // 1. Lưu đồng thời vào Firestore (bền vững) và Redis Cache (tốc độ cao TTL 300s)
    await otpRepository.saveOtp(user.id, code, expiresAt);
    await cacheService.set(`classlive:otp:${user.id}`, code, 300);

    // Gửi OTP qua Email
    await emailService.sendOtpEmail(user.email, code);

    const maskedEmail = this._maskEmail(user.email);

    return {
      message: 'Đăng nhập bước 1 thành công. Mã OTP đã được gửi đến hòm thư Email.',
      userId: user.id,
      maskedEmail: maskedEmail,
      maskedPhone: maskedEmail // Tránh breaking change với các client cũ
    };
  }

  // 3. Bước 2 Đăng nhập: Gửi lại mã OTP 2FA qua Email
  async requestAccessCode(userId, type) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('Tài khoản không tồn tại.', 404);
    }

    if (!user.email) {
      throw new AppError('Tài khoản không có địa chỉ email.', 400);
    }

    const code = this._generateCode();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    // Lưu vào Firestore + Redis Cache
    await otpRepository.saveOtp(userId, code, expiresAt);
    await cacheService.set(`classlive:otp:${userId}`, code, 300);

    await emailService.sendOtpEmail(user.email, code);

    return { message: 'Đã gửi mã xác thực OTP về Email thành công.' };
  }

  // 4. Bước cuối Đăng nhập: Xác thực OTP và trả về Token
  async validateAccessCode(userId, code) {
    // 1. Kiểm tra nhanh trên Redis Cache trước (Fast-path)
    const cachedCode = await cacheService.get(`classlive:otp:${userId}`);
    let isValid = false;

    if (cachedCode && cachedCode === code) {
      isValid = true;
    } else {
      // 2. Cache miss hoặc hết hạn trên Redis -> fallback kiểm tra trong Firestore
      const otp = await otpRepository.findOtp(userId);
      if (!otp) {
        throw new AppError('Mã xác thực không tồn tại hoặc đã hết hạn.', 400);
      }
      if (otp.code !== code) {
        throw new AppError('Mã xác thực OTP không chính xác.', 400);
      }
      if (otp.isExpired()) {
        await otpRepository.deleteOtp(userId);
        await cacheService.del(`classlive:otp:${userId}`);
        throw new AppError('Mã xác thực OTP đã hết hạn. Vui lòng yêu cầu mã mới.', 400);
      }
      isValid = true;
    }

    if (!isValid) {
      throw new AppError('Mã xác thực OTP không chính xác.', 400);
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('Tài khoản không tồn tại.', 404);
    }

    // Xóa mã OTP ngay sau khi dùng xong (tránh replay attack)
    await otpRepository.deleteOtp(userId);
    await cacheService.del(`classlive:otp:${userId}`);

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

  // 5. Quên mật khẩu: Gửi email link reset mật khẩu
  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Địa chỉ email không tồn tại trong hệ thống.', 404);
    }

    // Tạo Reset Token (15 phút)
    const resetToken = jwt.sign(
      { id: user.id, purpose: 'reset_password' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    await emailService.sendResetPasswordEmail(user.email, user.name, resetToken);

    return {
      message: 'Mã liên kết đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hòm thư (hiệu lực trong 15 phút).'
    };
  }

  // 6. Đặt lại mật khẩu mới từ Reset Token
  async resetPassword(token, newPassword) {
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new AppError('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.', 400);
    }

    if (decoded.purpose !== 'reset_password') {
      throw new AppError('Token không đúng mục đích đặt lại mật khẩu.', 400);
    }

    const userId = decoded.id;
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('Tài khoản không tồn tại trong hệ thống.', 404);
    }

    // Băm mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.update(userId, {
      password: hashedPassword,
      isSetup: true
    });

    // Vô hiệu hóa toàn bộ Refresh Tokens của user
    await refreshTokenRepository.deleteByUserId(userId);

    // Đưa token hiện tại vào Blacklist để không dùng lại được
    await cacheService.set(`classlive:token:blacklist:${token}`, 'revoked', 900);

    return { message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.' };
  }

  // 7. Cấp lại Access Token mới dựa vào Refresh Token
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

  // 8. Đăng xuất: Xóa Refresh Token & Đưa vào Redis Blacklist
  async logout(token, accessToken = null) {
    if (token) {
      await refreshTokenRepository.deleteByToken(token);
    }
    if (accessToken) {
      // Blacklist Access Token trên Redis (900s = 15 phút)
      await cacheService.set(`classlive:token:blacklist:${accessToken}`, 'revoked', 900);
    }
    return { message: 'Đăng xuất thành công.' };
  }
}

module.exports = new AuthService();
