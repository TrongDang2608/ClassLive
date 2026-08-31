const userRepository = require('../repositories/userRepository');

class AdminService {
  // 1. Thêm User mới (dành cho Admin tạo cấp dưới)
  async addUser(data, creatorId) {
    const { name, phone, email, role = 'tenant_admin', organizationId = 'root' } = data;

    if (!name || !phone) {
      throw new Error('Tên và Số điện thoại là bắt buộc.');
    }

    // Role admin chỉ có thể tạo các role nhất định
    const allowedRoles = ['admin', 'tenant_admin', 'school_admin', 'teacher'];
    if (!allowedRoles.includes(role)) {
      throw new Error('Role không hợp lệ.');
    }

    // Kiểm tra trùng lặp
    const existingPhone = await userRepository.findByPhone(phone);
    if (existingPhone) {
      throw new Error(`Số điện thoại '${phone}' đã được đăng ký.`);
    }
    
    if (email) {
      const existingEmail = await userRepository.findByEmail(email);
      if (existingEmail) {
        throw new Error(`Email '${email}' đã được đăng ký.`);
      }
    }

    const userData = {
      name,
      username: '',
      phone,
      email: email || '',
      role,
      createdBy: creatorId,
      organizationId,
      createdAt: Date.now()
    };

    const newId = await userRepository.create(userData);

    // Gửi email cài đặt tài khoản (tương tự instructor cũ)
    const jwt = require('jsonwebtoken');
    const emailService = require('./emailService');
    const setupToken = jwt.sign({ id: newId }, process.env.JWT_SECRET, { expiresIn: '24h' });

    if (email) {
      emailService.sendSetupAccountEmail(email, name, setupToken).catch(err => {
        console.error('Lỗi khi gửi email setup cho:', email, err);
      });
    }

    return { id: newId, ...userData };
  }

  // 2. Lấy danh sách tất cả user
  async getUsers(roleFilter, page = 1, limit = 10) {
    const total = await userRepository.countAll(roleFilter);
    const users = await userRepository.findAll(roleFilter, page, limit);
    
    // Admin không cần fetch bài tập như instructor cũ
    const data = users.map(u => ({
      id: u.id,
      name: u.name,
      username: u.username,
      phone: u.phone,
      email: u.email,
      role: u.role,
      createdBy: u.createdBy,
      organizationId: u.organizationId,
      createdAt: u.createdAt
    }));

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // 3. Xem chi tiết 1 User
  async getUser(identifier) {
    const user = await userRepository.findByUsernameOrEmail(identifier) || await userRepository.findByPhone(identifier) || await userRepository.findById(identifier);
    if (!user) throw new Error('Không tìm thấy tài khoản.');
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      phone: user.phone,
      email: user.email,
      role: user.role,
      createdBy: user.createdBy,
      organizationId: user.organizationId
    };
  }

  // 4. Sửa User
  async editUser(identifier, updateData) {
    const user = await userRepository.findByUsernameOrEmail(identifier) || await userRepository.findByPhone(identifier) || await userRepository.findById(identifier);
    if (!user) throw new Error('Không tìm thấy tài khoản để sửa.');
    await userRepository.update(user.id, updateData);
    return { success: true, message: 'Cập nhật thành công' };
  }

  // 5. Xóa User
  async deleteUser(identifier) {
    const user = await userRepository.findByUsernameOrEmail(identifier) || await userRepository.findByPhone(identifier) || await userRepository.findById(identifier);
    if (!user) throw new Error('Không tìm thấy tài khoản để xóa.');
    
    if (user.role === 'admin' && user.createdBy === 'system') {
        throw new Error('Không thể xóa Root Admin!');
    }
    
    await userRepository.delete(user.id);
    return { success: true, message: 'Xóa tài khoản thành công' };
  }
}

module.exports = new AdminService();
