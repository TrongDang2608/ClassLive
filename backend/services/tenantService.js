const lessonRepository = require('../repositories/lessonRepository');
const assignmentRepository = require('../repositories/assignmentRepository');
const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');

class TenantService {
  // === PROFILE & DASHBOARD ===
  async getProfile(tenantAdminId) {
    const user = await userRepository.findById(tenantAdminId);
    if (!user) {
      throw new AppError('Không tìm thấy tài khoản Tenant Admin', 404);
    }
    const { passwordHash, ...safeUserData } = user;
    return safeUserData;
  }

  async getDashboardStats(tenantAdminId) {
    const totalLessons = await lessonRepository.countLessonsByInstructor(tenantAdminId);
    const assignments = await assignmentRepository.findByTenantAdminId(tenantAdminId);
    const allLessons = await lessonRepository.findLessonsByInstructor(tenantAdminId, 1, 1000);
    
    // Đếm số lượng School Admin duy nhất đã được cấp quyền
    const uniqueSchoolAdmins = new Set(assignments.map(a => a.schoolAdminId));

    // 4. Tính toán xu hướng biểu đồ thực tế 6 tháng gần nhất
    const now = new Date();
    const trendData = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthLabel = `Tháng ${month + 1}`;

      const startOfMonth = new Date(year, month, 1).getTime();
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();

      const lessonsCount = allLessons.filter(l => {
        const t = typeof l.createdAt === 'number' ? l.createdAt : new Date(l.createdAt || 0).getTime();
        return t >= startOfMonth && t <= endOfMonth;
      }).length;

      const assignmentsCount = assignments.filter(a => {
        const t = typeof a.assignedAt === 'number' ? a.assignedAt : new Date(a.assignedAt || 0).getTime();
        return t >= startOfMonth && t <= endOfMonth;
      }).length;

      trendData.push({
        month: monthLabel,
        lessons: lessonsCount,
        assignments: assignmentsCount
      });
    }

    return {
      totalLessons,
      totalAssignedSchools: uniqueSchoolAdmins.size,
      totalAssignments: assignments.length,
      trendData
    };
  }

  // === LESSON MANAGEMENT ===
  async getLessons(tenantAdminId, page = 1, limit = 10) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    const lessons = await lessonRepository.findLessonsByInstructor(tenantAdminId, pageNum, limitNum);
    const totalLessons = await lessonRepository.countLessonsByInstructor(tenantAdminId);

    return {
      lessons,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalLessons,
        totalPages: Math.ceil(totalLessons / limitNum) || 1
      }
    };
  }

  async getLessonById(lessonId, tenantAdminId) {
    const lesson = await lessonRepository.findLessonById(lessonId);
    if (!lesson) {
      throw new AppError('Bài giảng không tồn tại', 404);
    }
    if (lesson.createdBy !== tenantAdminId) {
      throw new AppError('Bạn không có quyền truy cập bài giảng này', 403);
    }
    return lesson;
  }

  async createLesson(tenantAdminId, lessonData) {
    if (!lessonData.title || lessonData.title.trim() === '') {
      throw new AppError('Tiêu đề bài giảng không được để trống', 400);
    }

    const newLessonData = {
      title: lessonData.title.trim(),
      description: lessonData.description || '',
      subject: lessonData.subject || '',
      grade: lessonData.grade || '',
      content: lessonData.content || '',
      files: lessonData.files || [],
      createdBy: tenantAdminId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const lessonId = await lessonRepository.createLesson(newLessonData);
    return { id: lessonId, ...newLessonData };
  }

  async updateLesson(lessonId, tenantAdminId, updateData) {
    const lesson = await lessonRepository.findLessonById(lessonId);
    if (!lesson) {
      throw new AppError('Bài giảng không tồn tại', 404);
    }
    if (lesson.createdBy !== tenantAdminId) {
      throw new AppError('Bạn không có quyền chỉnh sửa bài giảng này', 403);
    }

    const payload = {
      ...updateData,
      updatedAt: Date.now()
    };

    // Giữ nguyên createdBy và id
    delete payload.id;
    delete payload.createdBy;
    delete payload.createdAt;

    await lessonRepository.updateLesson(lessonId, payload);
    return { id: lessonId, ...lesson, ...payload };
  }

  async deleteLesson(lessonId, tenantAdminId) {
    const lesson = await lessonRepository.findLessonById(lessonId);
    if (!lesson) {
      throw new AppError('Bài giảng không tồn tại', 404);
    }
    if (lesson.createdBy !== tenantAdminId) {
      throw new AppError('Bạn không có quyền xóa bài giảng này', 403);
    }

    // Xóa lesson
    await lessonRepository.deleteLesson(lessonId);
    // Cascade xóa assignments liên quan
    await assignmentRepository.deleteByLessonId(lessonId);
  }

  // === SCHOOL ADMIN & ASSIGNMENT MANAGEMENT ===
  async getSchoolAdmins(tenantAdminId) {
    // 🔮 Tương lai: Lọc theo Contracts active với tenantAdminId
    const users = await userRepository.findAll('school_admin', 1, 100);
    return users.map(user => {
      const { passwordHash, ...safeUser } = user;
      return safeUser;
    });
  }

  async assignLessonToSchools(lessonId, tenantAdminId, schoolAdminIds) {
    const lesson = await lessonRepository.findLessonById(lessonId);
    if (!lesson) {
      throw new AppError('Bài giảng không tồn tại', 404);
    }
    if (lesson.createdBy !== tenantAdminId) {
      throw new AppError('Bạn không có quyền cấp bài giảng này', 403);
    }

    if (!Array.isArray(schoolAdminIds) || schoolAdminIds.length === 0) {
      throw new AppError('Danh sách School Admin không hợp lệ', 400);
    }

    const assignmentsToCreate = [];
    for (const schoolAdminId of schoolAdminIds) {
      const user = await userRepository.findById(schoolAdminId);
      if (user && user.role === 'school_admin') {
        const existing = await assignmentRepository.findExistingAssignment(lessonId, schoolAdminId);
        if (!existing) {
          assignmentsToCreate.push({
            lessonId,
            tenantAdminId,
            schoolAdminId,
            assignedAt: Date.now(),
            contractId: null // 🔮 Sau này sẽ điền Contract ID tương ứng
          });
        }
      }
    }

    if (assignmentsToCreate.length === 0) {
      return { message: 'Tất cả School Admin được chọn đã được cấp quyền trước đó hoặc không hợp lệ', count: 0 };
    }

    const created = await assignmentRepository.createAssignments(assignmentsToCreate);
    return {
      message: `Đã cấp quyền bài giảng cho ${created.length} School Admin`,
      count: created.length,
      assignments: created
    };
  }

  async getLessonAssignments(lessonId, tenantAdminId) {
    const lesson = await lessonRepository.findLessonById(lessonId);
    if (!lesson) {
      throw new AppError('Bài giảng không tồn tại', 404);
    }
    if (lesson.createdBy !== tenantAdminId) {
      throw new AppError('Bạn không có quyền xem thông tin bài giảng này', 403);
    }

    const assignments = await assignmentRepository.findByLessonId(lessonId);
    
    // Populate thông tin School Admin
    const populated = await Promise.all(
      assignments.map(async (assign) => {
        const schoolAdmin = await userRepository.findById(assign.schoolAdminId);
        return {
          ...assign,
          schoolAdmin: schoolAdmin
            ? {
                id: schoolAdmin.id,
                name: schoolAdmin.name,
                email: schoolAdmin.email,
                phone: schoolAdmin.phone,
                schoolName: schoolAdmin.schoolName || ''
              }
            : null
        };
      })
    );

    return populated;
  }

  async revokeAssignment(assignmentId, tenantAdminId) {
    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new AppError('Không tìm thấy thông tin cấp quyền', 404);
    }
    if (assignment.tenantAdminId !== tenantAdminId) {
      throw new AppError('Bạn không có quyền thu hồi bài giảng này', 403);
    }

    await assignmentRepository.deleteAssignment(assignmentId);
  }

  // === CHAT SYSTEM CONTACTS ===
  async getChatContacts(tenantAdminId) {
    const assignments = await assignmentRepository.findByTenantAdminId(tenantAdminId);
    const uniqueSchoolAdminIds = Array.from(new Set(assignments.map(a => a.schoolAdminId)));

    const contacts = await Promise.all(
      uniqueSchoolAdminIds.map(async (schoolAdminId) => {
        const user = await userRepository.findById(schoolAdminId);
        if (!user) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          schoolName: user.schoolName || '',
          avatarUrl: user.avatarUrl || ''
        };
      })
    );

    return contacts.filter(Boolean);
  }
}

module.exports = new TenantService();
