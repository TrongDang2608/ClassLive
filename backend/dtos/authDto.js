const AppError = require('../utils/AppError');

class SetupAccountDto {
  constructor(data) {
    this.token = data.token;
    this.newUsername = data.newUsername || data.username;
    this.newPassword = data.newPassword || data.password;
  }

  validate() {
    if (!this.token) throw new AppError('Token cài đặt là bắt buộc.', 400);
    if (!this.newUsername || this.newUsername.trim() === '') {
      throw new AppError('Vui lòng nhập Username.', 400);
    }
    if (!this.newPassword || this.newPassword.length < 6) {
      throw new AppError('Mật khẩu phải có ít nhất 6 ký tự.', 400);
    }
  }
}

class LoginPasswordDto {
  constructor(data) {
    this.username = data.username;
    this.password = data.password;
  }

  validate() {
    if (!this.username || this.username.trim() === '') {
      throw new AppError('Vui lòng nhập Username hoặc Email.', 400);
    }
    if (!this.password) {
      throw new AppError('Vui lòng nhập Mật khẩu.', 400);
    }
  }
}

class CreateAccessCodeDto {
  constructor(data) {
    this.userId = data.userId;
    this.type = data.type || 'phone'; // 'phone' hoặc 'email'
  }

  validate() {
    if (!this.userId) {
      throw new AppError('Thiếu thông tin người dùng (userId).', 400);
    }
    if (this.type !== 'phone' && this.type !== 'email') {
      throw new AppError('Loại nhận mã không hợp lệ (chỉ chấp nhận phone hoặc email).', 400);
    }
  }
}

class ValidateAccessCodeDto {
  constructor(data) {
    this.userId = data.userId;
    this.accessCode = data.accessCode || data.code;
  }

  validate() {
    if (!this.userId) {
      throw new AppError('Thiếu thông tin người dùng (userId).', 400);
    }
    if (!this.accessCode || this.accessCode.trim().length !== 6) {
      throw new AppError('Vui lòng nhập đầy đủ mã OTP 6 chữ số.', 400);
    }
  }
}

class RefreshTokenDto {
  constructor(data) {
    this.refreshToken = data.refreshToken;
  }

  validate() {
    if (!this.refreshToken || this.refreshToken.trim() === '') {
      throw new AppError('Thiếu Refresh Token.', 400);
    }
  }
}

class LogoutDto {
  constructor(data) {
    this.refreshToken = data.refreshToken;
  }

  validate() {
    if (!this.refreshToken || this.refreshToken.trim() === '') {
      throw new AppError('Thiếu Refresh Token.', 400);
    }
  }
}

module.exports = {
  SetupAccountDto,
  LoginPasswordDto,
  CreateAccessCodeDto,
  ValidateAccessCodeDto,
  RefreshTokenDto,
  LogoutDto
};
