const userRepository = require('../repositories/userRepository');
const lessonRepository = require('../repositories/lessonRepository');
const teacherAssignmentRepository = require('../repositories/teacherAssignmentRepository');
const AppError = require('../utils/AppError');

class TeacherService {
  // === 1. PROFILE & DASHBOARD STATS ===
  async getProfile(teacherId) {
    const user = await userRepository.findById(teacherId);
    if (!user) throw new AppError('Không tìm thấy tài khoản Giáo viên.', 404);

    let schoolAdmin = null;
    if (user.schoolAdminId) {
      const schoolUser = await userRepository.findById(user.schoolAdminId);
      if (schoolUser) {
        schoolAdmin = {
          id: schoolUser.id,
          name: schoolUser.name,
          email: schoolUser.email,
          phone: schoolUser.phone,
          schoolName: schoolUser.schoolName || schoolUser.name
        };
      }
    }

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      schoolAdminId: user.schoolAdminId,
      schoolAdmin
    };
  }

  async getDashboardStats(teacherId) {
    const teacherAssignments = await teacherAssignmentRepository.findByTeacherId(teacherId);
    const totalLessons = teacherAssignments.length;

    // Lấy thông tin trường chủ quản
    const user = await userRepository.findById(teacherId);
    let schoolAdmin = null;
    if (user && user.schoolAdminId) {
      const schoolUser = await userRepository.findById(user.schoolAdminId);
      if (schoolUser) {
        schoolAdmin = {
          id: schoolUser.id,
          name: schoolUser.name,
          email: schoolUser.email,
          schoolName: schoolUser.schoolName || schoolUser.name
        };
      }
    }

    // Lấy danh sách chi tiết các bài học để đếm tổng số tệp đính kèm
    let totalFiles = 0;
    const lessonsWithMeta = await Promise.all(
      teacherAssignments.map(async (assign) => {
        const lesson = await lessonRepository.findLessonById(assign.lessonId);
        if (lesson && lesson.files) {
          totalFiles += lesson.files.length;
        }
        return lesson;
      })
    );

    // Tính toán xu hướng học liệu nhận thực tế 6 tháng gần nhất từ Firestore
    const now = new Date();
    const trendData = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthLabel = `Tháng ${month + 1}`;

      const startOfMonth = new Date(year, month, 1).getTime();
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();

      const count = teacherAssignments.filter(a => {
        const t = typeof a.assignedAt === 'number' ? a.assignedAt : new Date(a.assignedAt || 0).getTime();
        return t >= startOfMonth && t <= endOfMonth;
      }).length;

      trendData.push({
        month: monthLabel,
        lessons: count
      });
    }

    return {
      totalLessons,
      totalFiles,
      schoolAdmin,
      trendData
    };
  }

  // === 2. KHO HỌC LIỆU ĐƯỢC TRƯỜNG CẤP (ASSIGNED LESSONS) ===
  async getAssignedLessons(teacherId, page = 1, limit = 10, filters = {}) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    const teacherAssignments = await teacherAssignmentRepository.findByTeacherId(teacherId);
    if (teacherAssignments.length === 0) {
      return {
        lessons: [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalLessons: 0,
          totalPages: 1
        }
      };
    }

    // Lấy thông tin chi tiết từng bài học song song
    const lessonsWithMeta = await Promise.all(
      teacherAssignments.map(async (assign) => {
        const lesson = await lessonRepository.findLessonById(assign.lessonId);
        if (!lesson) return null;

        return {
          id: lesson.id,
          title: lesson.title,
          description: lesson.description || '',
          subject: lesson.subject || 'Chưa phân loại',
          grade: lesson.grade || 'Toàn trường',
          files: lesson.files || [],
          fileCount: (lesson.files || []).length,
          assignedAt: assign.assignedAt || Date.now(),
          assignmentId: assign.id
        };
      })
    );

    // Lọc bỏ các bài học bị null (đã bị xóa ở gốc)
    let validLessons = lessonsWithMeta.filter(Boolean);

    // Áp dụng bộ lọc
    if (filters.search && filters.search.trim()) {
      const s = filters.search.toLowerCase().trim();
      validLessons = validLessons.filter(l => 
        l.title.toLowerCase().includes(s) || 
        (l.description && l.description.toLowerCase().includes(s))
      );
    }

    if (filters.subject && filters.subject.trim()) {
      validLessons = validLessons.filter(l => l.subject === filters.subject.trim());
    }

    if (filters.grade && filters.grade.trim()) {
      validLessons = validLessons.filter(l => l.grade === filters.grade.trim());
    }

    // Sắp xếp mới nhất lên đầu theo ngày nhận
    validLessons.sort((a, b) => b.assignedAt - a.assignedAt);

    // Phân trang
    const totalLessons = validLessons.length;
    const totalPages = Math.ceil(totalLessons / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedLessons = validLessons.slice(startIndex, startIndex + limitNum);

    return {
      lessons: paginatedLessons,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalLessons,
        totalPages
      }
    };
  }

  // === 3. CHI TIẾT BÀI HỌC VÀ TÀI LIỆU ĐÍNH KÈM (LESSON DETAIL) ===
  async getLessonDetail(lessonId, teacherId) {
    // Kiểm tra quyền truy cập của giáo viên
    const assignment = await teacherAssignmentRepository.findExistingAssignment(lessonId, teacherId);
    if (!assignment) {
      throw new AppError('Bạn không có quyền truy cập bài giảng này hoặc chưa được School Admin phân bổ.', 403);
    }

    const lesson = await lessonRepository.findLessonById(lessonId);
    if (!lesson) {
      throw new AppError('Bài giảng không tồn tại hoặc đã bị xóa.', 404);
    }

    return {
      ...lesson,
      assignedAt: assignment.assignedAt,
      assignmentId: assignment.id
    };
  }
}

module.exports = new TeacherService();
