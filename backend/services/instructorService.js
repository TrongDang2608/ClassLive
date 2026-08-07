const userRepository = require('../repositories/userRepository');

class InstructorService {
  // 1. Thêm User (Có thể thêm Student hoặc Instructor)
  async addUser(data) {
    const { name, username, phone, email, role = 'student' } = data;

    if (!name || !phone) {
      throw new Error('Tên và Số điện thoại là bắt buộc.');
    }

    // Kiểm tra xem username, phone, email đã tồn tại chưa
    if (username) {
      const existingUsername = await userRepository.findByUsername(username);
      if (existingUsername) {
        throw new Error(`Username '${username}' đã được sử dụng.`);
      }
    }

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
      username: username || '',
      phone,
      email: email || '',
      role,
      createdAt: Date.now()
    };

    const newId = await userRepository.create(userData);

    // Tạo JWT token cho việc setup mật khẩu (hạn 24h)
    const jwt = require('jsonwebtoken');
    const emailService = require('./emailService');
    const setupToken = jwt.sign({ id: newId }, process.env.JWT_SECRET, { expiresIn: '24h' });

    // Gọi tiến trình gửi mail nền nếu user có cung cấp email
    if (email) {
      // Chạy không await để không block API
      emailService.sendSetupAccountEmail(email, name, setupToken).catch(err => {
        console.error('Lỗi khi gửi email setup cho:', email, err);
      });
    }

    return { id: newId, ...userData };
  }

  // 2. Lấy danh sách tất cả học viên (hoặc tất cả user nếu roleFilter rỗng)
  async getUsers(roleFilter, page = 1, limit = 10) {
    const total = await userRepository.countAll(roleFilter);
    const users = await userRepository.findAll(roleFilter, page, limit);
    
    const data = users.map(u => ({
      id: u.id,
      name: u.name,
      username: u.username,
      phone: u.phone,
      email: u.email,
      role: u.role
    }));

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // 3. Lấy thông tin 1 học viên (Linh hoạt dùng id hoặc phone)
  async getUser(identifier) {
    const user = await userRepository.findByPhoneOrId(identifier);
    if (!user) throw new Error('Không tìm thấy người dùng này.');
    
    // Tạm thời chưa có bảng Lesson, trả về thông tin user cơ bản
    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      assignedLessons: [] // Placeholder cho tương lai
    };
  }

  // 4. Sửa thông tin học viên
  async editUser(identifier, updateData) {
    const user = await userRepository.findByPhoneOrId(identifier);
    if (!user) throw new Error('Không tìm thấy người dùng này.');

    // Chặn đổi username thành username đã có của người khác
    if (updateData.username && updateData.username !== user.username) {
      const existing = await userRepository.findByUsername(updateData.username);
      if (existing) throw new Error(`Username '${updateData.username}' đã tồn tại trong hệ thống.`);
    }

    // Chặn đổi số điện thoại thành số đã có của người khác
    if (updateData.phone && updateData.phone !== user.phone) {
      const existing = await userRepository.findByPhone(updateData.phone);
      if (existing) throw new Error(`Số điện thoại '${updateData.phone}' đã tồn tại trong hệ thống.`);
    }

    // Chặn đổi email thành email đã có của người khác
    if (updateData.email && updateData.email !== user.email) {
      const existing = await userRepository.findByEmail(updateData.email);
      if (existing) throw new Error(`Email '${updateData.email}' đã tồn tại trong hệ thống.`);
    }

    await userRepository.update(user.id, updateData);
    return { success: true, message: 'Cập nhật thành công' };
  }

  // 5. Xóa học viên
  async deleteUser(identifier) {
    const user = await userRepository.findByPhoneOrId(identifier);
    if (!user) throw new Error('Không tìm thấy người dùng này.');

    await userRepository.delete(user.id);
    return { success: true, message: 'Xóa thành công' };
  }
}

module.exports = new InstructorService();
