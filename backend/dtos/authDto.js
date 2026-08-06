class SetupAccountDto {
  constructor(data) {
    this.userId = data.userId; // Dùng ID truyền trực tiếp từ URL
    this.username = data.username;
    this.password = data.password;
  }

  validate() {
    if (!this.userId) throw new Error('Link cài đặt không hợp lệ (thiếu ID).');
    if (!this.username) throw new Error('Vui lòng nhập Username.');
    if (!this.password || this.password.length < 6) throw new Error('Mật khẩu phải có ít nhất 6 ký tự.');
  }
}

class LoginPasswordDto {
  constructor(data) {
    this.username = data.username;
    this.password = data.password;
  }

  validate() {
    if (!this.username) throw new Error('Vui lòng nhập Username.');
    if (!this.password) throw new Error('Vui lòng nhập Mật khẩu.');
  }
}

class CreateAccessCodeDto {
  constructor(data) {
    this.userId = data.userId; // Dùng userId thay vì số điện thoại sau khi login mật khẩu
    this.type = data.type; // 'phone' hoặc 'email'
  }

  validate() {
    if (!this.userId) throw new Error('Thiếu thông tin người dùng.');
    if (this.type !== 'phone' && this.type !== 'email') throw new Error('Loại nhận mã không hợp lệ.');
  }
}

class ValidateAccessCodeDto {
  constructor(data) {
    this.userId = data.userId;
    this.accessCode = data.accessCode;
  }

  validate() {
    if (!this.userId) throw new Error('Thiếu thông tin người dùng.');
    if (!this.accessCode) throw new Error('Vui lòng nhập mã OTP.');
  }
}

module.exports = {
  SetupAccountDto,
  LoginPasswordDto,
  CreateAccessCodeDto,
  ValidateAccessCodeDto
};
