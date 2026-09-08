class User {
  constructor(id, data) {
    this.id = id;
    this.name = data.name;
    this.phone = data.phone;
    this.email = data.email;
    this.role = data.role; // 'admin', 'tenant_admin', 'school_admin', 'teacher'
    this.username = data.username || null;
    this.password = data.password || null;
    this.isSetup = data.isSetup || false; // Đã setup mật khẩu chưa
    this.createdBy = data.createdBy || null;
    this.organizationId = data.organizationId || null;
    this.schoolName = data.schoolName || null;
    this.createdAt = data.createdAt || Date.now();
  }

  // Phương thức trả về dữ liệu an toàn (gỡ bỏ password)
  toSafeObject() {
    const { password, ...safeUser } = this;
    return safeUser;
  }
}

module.exports = User;
