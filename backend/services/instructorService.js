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
    const lessonRepository = require('../repositories/lessonRepository');
    
    const data = await Promise.all(users.map(async u => {
      let assigned = [];
      if (u.role === 'student') {
        const assignments = await lessonRepository.findAssignmentsByStudent(u.id);
        // Lấy thông tin chi tiết từng bài giảng
        assigned = await Promise.all(assignments.map(async assign => {
          const lesson = await lessonRepository.findLessonById(assign.lessonId);
          return {
            lessonId: assign.lessonId,
            title: lesson ? lesson.title : 'Bài giảng đã bị xóa',
            status: assign.status,
            assignedAt: assign.assignedAt
          };
        }));
      }
      return {
        id: u.id,
        name: u.name,
        username: u.username,
        phone: u.phone,
        email: u.email,
        role: u.role,
        assignedLessons: assigned
      };
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
    
    const lessonRepository = require('../repositories/lessonRepository');
    const assignments = await lessonRepository.findAssignmentsByStudent(user.id);
    const assignedLessons = await Promise.all(assignments.map(async assign => {
      const lesson = await lessonRepository.findLessonById(assign.lessonId);
      return {
        lessonId: assign.lessonId,
        title: lesson ? lesson.title : 'Bài giảng đã bị xóa',
        status: assign.status,
        assignedAt: assign.assignedAt
      };
    }));

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      assignedLessons
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

  // 6. Lấy số liệu thống kê Dashboard
  async getDashboardStats(instructorId) {
    const lessonRepository = require('../repositories/lessonRepository');
    
    // Tổng số học viên
    const totalStudents = await userRepository.countAll('student');
    
    // Số bài giảng đang mở của giảng viên này
    const activeLessons = await lessonRepository.countLessonsByInstructor(instructorId);
    
    // Tính tỉ lệ đạt chuẩn (Tỉ lệ hoàn thành các bài tập đã giao)
    const lessons = await lessonRepository.findLessonsByInstructor(instructorId, 1, 1000);
    let totalAssigned = 0;
    let totalCompleted = 0;
    
    for (const lesson of lessons) {
      const snapshot = await lessonRepository.assignmentsCollection.where('lessonId', '==', lesson.id).get();
      snapshot.forEach(doc => {
        totalAssigned++;
        if (doc.data().status === 'completed') {
          totalCompleted++;
        }
      });
    }
    
    const passRate = totalAssigned === 0 ? 0 : Math.round((totalCompleted / totalAssigned) * 100);

    // Dữ liệu biểu đồ (Thống kê trạng thái bài tập)
    const chartData = [
      { name: 'Đã hoàn thành', value: totalCompleted, color: '#D4AF37' },
      { name: 'Đang làm/Chờ', value: totalAssigned - totalCompleted, color: '#f3e5f5' }
    ];

    // Lấy top 5 học viên mới nhất thay cho Học Viên Xuất Sắc mock
    const allStudents = await userRepository.findAll('student', 1, 5);
    const recentStudents = allStudents.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone
    }));

    // Bỏ hẳn các số liệu mock (như pendingRequests)
    return {
      totalStudents,
      activeLessons,
      passRate,
      chartData,
      recentStudents
    };
  }
}

module.exports = new InstructorService();
