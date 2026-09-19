const userRepository = require('../repositories/userRepository');
const lessonRepository = require('../repositories/lessonRepository');
const assignmentRepository = require('../repositories/assignmentRepository');
const teacherAssignmentRepository = require('../repositories/teacherAssignmentRepository');
const { addEmailJob } = require('../queues');
const jwt = require('jsonwebtoken');
const cacheService = require('./cacheService');
const storageService = require('./storageService');
const { BUCKETS } = require('../config/minio');
const AppError = require('../utils/AppError');

class SchoolService {
  // === 1. PROFILE & DASHBOARD STATS ===
  async getProfile(schoolAdminId) {
    const cacheKey = `classlive:school:profile:${schoolAdminId}`;
    return await cacheService.remember(cacheKey, 1800, async () => {
      const user = await userRepository.findById(schoolAdminId);
      if (!user) throw new AppError('Không tìm thấy tài khoản School Admin.', 404);
      return user.toSafeObject ? user.toSafeObject() : user;
    });
  }

  async getDashboardStats(schoolAdminId) {
    const cacheKey = `classlive:school:stats:${schoolAdminId}`;
    return await cacheService.remember(cacheKey, 600, async () => {
      // 1. Số bài giảng được Tenant cấp
      const assignments = await assignmentRepository.findBySchoolAdminId(schoolAdminId);
      const uniqueLessonIds = [...new Set(assignments.map(a => a.lessonId))];
      const totalLessons = uniqueLessonIds.length;

      // 2. Số Giáo viên trong trường
      const totalTeachers = await userRepository.countTeachersBySchool(schoolAdminId);

      // 3. Các lượt phân bổ cho Giáo viên
      const teacherAssignments = await teacherAssignmentRepository.findBySchoolAdminId(schoolAdminId);
      const totalTeacherAssignments = teacherAssignments.length;

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

        const lessonsCount = assignments.filter(a => {
          const t = typeof a.assignedAt === 'number' ? a.assignedAt : new Date(a.assignedAt || 0).getTime();
          return t >= startOfMonth && t <= endOfMonth;
        }).length;

        const assignmentsCount = teacherAssignments.filter(a => {
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
        totalTeachers,
        totalTeacherAssignments,
        trendData
      };
    });
  }

  // === 2. BÀI GIẢNG ĐƯỢC CẤP (LESSONS) ===
  async getAssignedLessons(schoolAdminId, page = 1, limit = 10, filters = {}) {
    const filterKey = JSON.stringify(filters);
    const cacheKey = `classlive:school:lessons:${schoolAdminId}:${page}:${limit}:${filterKey}`;

    return await cacheService.remember(cacheKey, 600, async () => {
      const assignments = await assignmentRepository.findBySchoolAdminId(schoolAdminId);
      if (assignments.length === 0) {
        return {
          lessons: [],
          pagination: { total: 0, page: Number(page), limit: Number(limit), totalPages: 0 }
        };
      }

      const lessonIds = [...new Set(assignments.map(a => a.lessonId))];
      
      // Lấy thông tin chi tiết từng bài giảng
      let lessons = [];
      for (const id of lessonIds) {
        const lesson = await lessonRepository.findById(id);
        if (lesson) {
          lessons.push(lesson);
        }
      }

      // Áp dụng bộ lọc Subject, Grade, Search
      const { subject, grade, search } = filters;
      if (subject && subject !== 'all') {
        lessons = lessons.filter(l => l.subject === subject);
      }
      if (grade && grade !== 'all') {
        lessons = lessons.filter(l => l.grade === grade);
      }
      if (search && search.trim()) {
        const term = search.toLowerCase();
        lessons = lessons.filter(l => 
          (l.title && l.title.toLowerCase().includes(term)) ||
          (l.description && l.description.toLowerCase().includes(term))
        );
      }

      const total = lessons.length;
      const offset = (page - 1) * limit;
      const paginatedLessons = lessons.slice(offset, offset + Number(limit));

      // Đính kèm số lượng giáo viên đã được trường cấp quyền cho mỗi bài
      const lessonsWithTeacherCount = await Promise.all(paginatedLessons.map(async (lesson) => {
        const teacherAssigns = await teacherAssignmentRepository.findByLessonAndSchool(lesson.id, schoolAdminId);
        return {
          ...lesson,
          assignedTeachersCount: teacherAssigns.length
        };
      }));

      return {
        lessons: lessonsWithTeacherCount,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit) || 1
        }
      };
    });
  }

  async getLessonDetails(schoolAdminId, lessonId) {
    const cacheKey = `classlive:school:lesson_detail:${schoolAdminId}:${lessonId}`;
    return await cacheService.remember(cacheKey, 1800, async () => {
      const hasAccess = await assignmentRepository.findExistingAssignment(lessonId, schoolAdminId);
      if (!hasAccess) {
        throw new AppError('Bạn không có quyền truy cập hoặc bài giảng này chưa được cấp cho trường.', 403);
      }

      const lesson = await lessonRepository.findById(lessonId);
      if (!lesson) throw new AppError('Bài giảng không tồn tại.', 404);

      const filesWithUrls = await Promise.all(
        (lesson.files || []).map(async (file) => {
          if (file && (file.storageType === 'minio' || file.key)) {
            const presignedUrl = await storageService.getPresignedUrl(
              file.bucket || BUCKETS.LESSONS,
              file.key,
              7200
            );
            return {
              ...file,
              url: presignedUrl
            };
          }
          return file;
        })
      );

      return {
        ...lesson,
        files: filesWithUrls
      };
    });
  }

  // === 3. QUẢN LÝ GIÁO VIÊN (TEACHERS) ===
  async getTeachers(schoolAdminId, page = 1, limit = 10, search = '') {
    const cacheKey = `classlive:school:teachers:${schoolAdminId}:${page}:${limit}:${search.trim()}`;
    return await cacheService.remember(cacheKey, 600, async () => {
      const teachers = await userRepository.findTeachersBySchool(schoolAdminId, page, limit);
      const total = await userRepository.countTeachersBySchool(schoolAdminId);

      let filteredTeachers = teachers;
      if (search && search.trim()) {
        const term = search.toLowerCase();
        filteredTeachers = filteredTeachers.filter(t => 
          (t.name && t.name.toLowerCase().includes(term)) ||
          (t.email && t.email.toLowerCase().includes(term)) ||
          (t.phone && t.phone.includes(term))
        );
      }

      const sanitizedTeachers = filteredTeachers.map(t => (t.toSafeObject ? t.toSafeObject() : t));

      return {
        teachers: sanitizedTeachers,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit) || 1
        }
      };
    });
  }

  async createTeacher(schoolAdminId, teacherData) {
    const schoolAdmin = await userRepository.findById(schoolAdminId);
    if (!schoolAdmin) throw new AppError('Không tìm thấy thông tin School Admin.', 404);

    // Kiểm tra email trùng
    const existingEmail = await userRepository.findByEmail(teacherData.email);
    if (existingEmail) {
      throw new AppError('Email này đã được sử dụng bởi một tài khoản khác trong hệ thống.', 400);
    }

    const newTeacherData = {
      name: teacherData.name.trim(),
      email: teacherData.email.trim().toLowerCase(),
      phone: teacherData.phone.trim(),
      role: 'teacher',
      schoolName: schoolAdmin.schoolName || schoolAdmin.name,
      organizationId: schoolAdmin.organizationId || `school-${schoolAdminId}`,
      createdBy: schoolAdminId,
      createdAt: Date.now(),
      isSetup: false
    };

    const teacherId = await userRepository.create(newTeacherData);

    // Gửi email thiết lập tài khoản qua BullMQ Queue
    const setupToken = jwt.sign({ id: teacherId }, process.env.JWT_SECRET, { expiresIn: '24h' });
    addEmailJob('sendSetupAccountEmail', { 
      toEmail: teacherData.email, 
      fullName: teacherData.name, 
      token: setupToken 
    }).catch(err => {
      console.warn('⚠️ [BullMQ Dispatch Error]:', err.message);
    });

    // Xóa cache liên quan đến danh sách giáo viên & stats của trường
    await cacheService.delPattern(`classlive:school:*:${schoolAdminId}*`);

    return {
      id: teacherId,
      ...newTeacherData
    };
  }

  async updateTeacher(schoolAdminId, teacherId, updateData) {
    const teacher = await userRepository.findById(teacherId);
    if (!teacher || teacher.createdBy !== schoolAdminId) {
      throw new AppError('Không tìm thấy Giáo viên hoặc bạn không có quyền chỉnh sửa tài khoản này.', 404);
    }

    const payload = {};
    if (updateData.name) payload.name = updateData.name.trim();
    if (updateData.phone) payload.phone = updateData.phone.trim();
    if (updateData.email && updateData.email !== teacher.email) {
      const existingEmail = await userRepository.findByEmail(updateData.email);
      if (existingEmail) throw new AppError('Email mới đã được sử dụng.', 400);
      payload.email = updateData.email.trim().toLowerCase();
    }

    await userRepository.update(teacherId, payload);

    // Xóa cache liên quan đến trường này
    await cacheService.delPattern(`classlive:school:*:${schoolAdminId}*`);

    return { id: teacherId, ...teacher, ...payload };
  }

  async deleteTeacher(schoolAdminId, teacherId) {
    const teacher = await userRepository.findById(teacherId);
    if (!teacher || teacher.createdBy !== schoolAdminId) {
      throw new AppError('Không tìm thấy Giáo viên hoặc bạn không có quyền xóa tài khoản này.', 404);
    }

    // Xóa phân bổ bài giảng của giáo viên này trước
    await teacherAssignmentRepository.deleteByTeacherId(teacherId);

    // Xóa user
    await userRepository.delete(teacherId);

    // Invalidate Cache
    await cacheService.delPattern(`classlive:school:*:${schoolAdminId}*`);

    return { message: 'Đã xóa tài khoản Giáo viên thành công.' };
  }

  // === 4. PHÂN BỔ HỌC LIỆU CHO GIÁO VIÊN ===
  async assignLessonToTeachers(schoolAdminId, lessonId, teacherIds) {
    const hasAccess = await assignmentRepository.findExistingAssignment(lessonId, schoolAdminId);
    if (!hasAccess) {
      throw new AppError('Trường của bạn không có quyền truy cập bài giảng này để phân bổ.', 403);
    }

    const assignmentsToCreate = [];
    for (const teacherId of teacherIds) {
      const teacher = await userRepository.findById(teacherId);
      if (!teacher || teacher.createdBy !== schoolAdminId) {
        continue;
      }

      const existing = await teacherAssignmentRepository.findExistingAssignment(lessonId, teacherId);
      if (!existing) {
        assignmentsToCreate.push({
          lessonId,
          schoolAdminId,
          teacherId,
          assignedAt: Date.now()
        });
      }
    }

    if (assignmentsToCreate.length === 0) {
      return { message: 'Tất cả các Giáo viên được chọn đã được cấp quyền bài giảng này từ trước.', assignedCount: 0 };
    }

    const created = await teacherAssignmentRepository.createBatchAssignments(assignmentsToCreate);

    // Invalidate Cache
    await cacheService.delPattern(`classlive:school:*:${schoolAdminId}*`);

    return {
      message: `Đã cấp quyền bài giảng thành công cho ${created.length} Giáo viên.`,
      assignedCount: created.length,
      assignments: created
    };
  }

  async getLessonAssignmentsToTeachers(schoolAdminId, lessonId) {
    const cacheKey = `classlive:school:lesson_assignments:${schoolAdminId}:${lessonId}`;
    return await cacheService.remember(cacheKey, 600, async () => {
      const assignments = await teacherAssignmentRepository.findByLessonAndSchool(lessonId, schoolAdminId);
      if (assignments.length === 0) return [];

      const result = [];
      for (const item of assignments) {
        const teacher = await userRepository.findById(item.teacherId);
        result.push({
          assignmentId: item.id,
          lessonId: item.lessonId,
          teacherId: item.teacherId,
          assignedAt: item.assignedAt,
          teacherName: teacher?.name || 'Giáo viên',
          teacherEmail: teacher?.email || '',
          teacherPhone: teacher?.phone || ''
        });
      }

      return result;
    });
  }

  async revokeTeacherAssignment(schoolAdminId, assignmentId) {
    const assignment = await teacherAssignmentRepository.findById(assignmentId);
    if (!assignment || assignment.schoolAdminId !== schoolAdminId) {
      throw new AppError('Không tìm thấy thông tin phân bổ hoặc bạn không có quyền thu hồi.', 404);
    }

    await teacherAssignmentRepository.deleteAssignment(assignmentId);

    // Invalidate Cache
    await cacheService.delPattern(`classlive:school:*:${schoolAdminId}*`);

    return { message: 'Đã thu hồi quyền bài giảng của Giáo viên thành công.' };
  }

  // === 5. CHAT CONTACTS ===
  async getChatContacts(schoolAdminId) {
    const cacheKey = `classlive:school:contacts:${schoolAdminId}`;
    return await cacheService.remember(cacheKey, 600, async () => {
      const tenantAssignments = await assignmentRepository.findBySchoolAdminId(schoolAdminId);
      const tenantAdminIds = [...new Set(tenantAssignments.map(a => a.tenantAdminId).filter(Boolean))];

      const tenantContacts = [];
      for (const tId of tenantAdminIds) {
        const tenant = await userRepository.findById(tId);
        if (tenant) {
          tenantContacts.push({
            id: tenant.id,
            name: tenant.name,
            email: tenant.email,
            role: 'tenant_admin',
            type: 'Cấp trên (Tenant Admin)'
          });
        }
      }

      const teachers = await userRepository.findTeachersBySchool(schoolAdminId, 1, 100);
      const teacherContacts = teachers.map(t => ({
        id: t.id,
        name: t.name,
        email: t.email,
        role: 'teacher',
        type: 'Giáo viên trường'
      }));

      return [...tenantContacts, ...teacherContacts];
    });
  }
}

module.exports = new SchoolService();
