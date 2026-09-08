const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');
const emailService = require('./emailService');

class AdminService {
  // 1. Thêm User mới (dành cho Admin tạo cấp dưới)
  async addUser(data, creatorId) {
    const { name, phone, email, role = 'tenant_admin', organizationId = 'root' } = data;

    // Kiểm tra trùng lặp số điện thoại
    const existingPhone = await userRepository.findByPhone(phone);
    if (existingPhone) {
      throw new AppError(`Số điện thoại '${phone}' đã được đăng ký.`, 400);
    }
    
    // Kiểm tra trùng lặp email nếu có
    if (email && email.trim() !== '') {
      const existingEmail = await userRepository.findByEmail(email);
      if (existingEmail) {
        throw new AppError(`Email '${email}' đã được đăng ký.`, 400);
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

    // Gửi email cài đặt tài khoản
    if (email && email.trim() !== '') {
      const setupToken = jwt.sign({ id: newId }, process.env.JWT_SECRET, { expiresIn: '24h' });
      emailService.sendSetupAccountEmail(email, name, setupToken).catch(err => {
        console.error('Lỗi khi gửi email setup cho:', email, err);
      });
    }

    return { id: newId, ...userData };
  }

  // 2. Lấy danh sách tất cả user (phân trang + lọc theo role)
  async getUsers(roleFilter, page = 1, limit = 10) {
    const total = await userRepository.countAll(roleFilter);
    const users = await userRepository.findAll(roleFilter, page, limit);
    
    const data = users.map(u => u.toSafeObject ? u.toSafeObject() : {
      id: u.id,
      name: u.name,
      username: u.username,
      phone: u.phone,
      email: u.email,
      role: u.role,
      createdBy: u.createdBy,
      organizationId: u.organizationId,
      createdAt: u.createdAt
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // 3. Xem chi tiết 1 User
  async getUser(identifier) {
    const user = await userRepository.findByPhoneOrId(identifier) 
      || await userRepository.findByUsernameOrEmail(identifier);
    if (!user) {
      throw new AppError('Không tìm thấy tài khoản người dùng.', 404);
    }
    return user.toSafeObject ? user.toSafeObject() : user;
  }

  // 4. Sửa User
  async editUser(identifier, updateData) {
    const user = await userRepository.findByPhoneOrId(identifier) 
      || await userRepository.findByUsernameOrEmail(identifier);
    if (!user) {
      throw new AppError('Không tìm thấy tài khoản để cập nhật.', 404);
    }

    // Nếu cập nhật số điện thoại, kiểm tra trùng lặp
    if (updateData.phone && updateData.phone !== user.phone) {
      const existingPhone = await userRepository.findByPhone(updateData.phone);
      if (existingPhone && existingPhone.id !== user.id) {
        throw new AppError(`Số điện thoại '${updateData.phone}' đã có tài khoản khác sử dụng.`, 400);
      }
    }

    // Nếu cập nhật email, kiểm tra trùng lặp
    if (updateData.email && updateData.email !== user.email) {
      const existingEmail = await userRepository.findByEmail(updateData.email);
      if (existingEmail && existingEmail.id !== user.id) {
        throw new AppError(`Email '${updateData.email}' đã có tài khoản khác sử dụng.`, 400);
      }
    }

    await userRepository.update(user.id, updateData);
    return { success: true, message: 'Cập nhật tài khoản thành công.' };
  }

  // 5. Xóa User
  async deleteUser(identifier) {
    const user = await userRepository.findByPhoneOrId(identifier) 
      || await userRepository.findByUsernameOrEmail(identifier);
    if (!user) {
      throw new AppError('Không tìm thấy tài khoản để xóa.', 404);
    }
    
    if (user.role === 'admin' && user.createdBy === 'system') {
      throw new AppError('Không thể xóa Root Admin của hệ thống!', 403);
    }
    
    await userRepository.delete(user.id);
    return { success: true, message: 'Xóa tài khoản thành công.' };
  }
}

module.exports = new AdminService();
