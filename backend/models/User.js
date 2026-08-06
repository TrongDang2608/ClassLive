class User {
  constructor(id, data) {
    this.id = id;
    this.name = data.name;
    this.phone = data.phone;
    this.email = data.email;
    this.role = data.role; // 'instructor' hoặc 'student'
    this.username = data.username || null;
    this.password = data.password || null;
    this.isSetup = data.isSetup || false; // Đã setup mật khẩu chưa
  }
}

module.exports = User;
