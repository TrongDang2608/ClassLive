const lessonRepository = require('../repositories/lessonRepository');
const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');

class LessonService {
  async createLesson(instructorId, lessonData) {
    lessonData.createdBy = instructorId;
    lessonData.createdAt = Date.now();
    
    // lessonData.files có thể được populate bởi Controller qua multer
    const lessonId = await lessonRepository.createLesson(lessonData);
    return lessonId;
  }

  async getInstructorLessons(instructorId, page = 1, limit = 10) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const lessons = await lessonRepository.findLessonsByInstructor(instructorId, pageNum, limitNum);
    const totalLessons = await lessonRepository.countLessonsByInstructor(instructorId);
    
    return {
      lessons,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalLessons,
        totalPages: Math.ceil(totalLessons / limitNum)
      }
    };
  }

  async getLessonById(lessonId, instructorId) {
    const lesson = await lessonRepository.findLessonById(lessonId);
    if (!lesson) {
      throw new AppError('Bài giảng không tồn tại', 404);
    }
    // Kiểm tra quyền sở hữu
    if (lesson.createdBy !== instructorId) {
      throw new AppError('Bạn không có quyền truy cập bài giảng này', 403);
    }
    return lesson;
  }

  async updateLesson(lessonId, instructorId, updateData) {
    const lesson = await lessonRepository.findLessonById(lessonId);
    if (!lesson) {
      throw new AppError('Bài giảng không tồn tại', 404);
    }
    if (lesson.createdBy !== instructorId) {
      throw new AppError('Bạn không có quyền chỉnh sửa bài giảng này', 403);
    }

    await lessonRepository.updateLesson(lessonId, updateData);
  }

  async deleteLesson(lessonId, instructorId) {
    const lesson = await lessonRepository.findLessonById(lessonId);
    if (!lesson) {
      throw new AppError('Bài giảng không tồn tại', 404);
    }
    if (lesson.createdBy !== instructorId) {
      throw new AppError('Bạn không có quyền xóa bài giảng này', 403);
    }

    await lessonRepository.deleteLesson(lessonId);
  }

  async assignLessonToStudents(lessonId, instructorId, studentIds) {
    // 1. Kiểm tra bài giảng hợp lệ không
    const lesson = await lessonRepository.findLessonById(lessonId);
    if (!lesson) {
      throw new AppError('Bài giảng không tồn tại', 404);
    }
    if (lesson.createdBy !== instructorId) {
      throw new AppError('Bạn không có quyền giao bài giảng này', 403);
    }

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      throw new AppError('Danh sách học sinh không hợp lệ', 400);
    }

    // 2. Kiểm tra xem các student có tồn tại không
    // Để tối ưu, nếu mảng studentIds nhỏ, có thể Promise.all, nếu lớn cần logic khác. 
    // Tạm thời giả định là ID hợp lệ, hoặc ta check từng ID.
    const assignmentsToCreate = [];
    for (const studentId of studentIds) {
      const student = await userRepository.findById(studentId);
      if (student && student.role === 'student') {
        assignmentsToCreate.push({
          lessonId,
          studentId,
          instructorId,
          status: 'pending',
          assignedAt: Date.now(),
          completedAt: null
        });
      }
    }

    if (assignmentsToCreate.length === 0) {
      throw new AppError('Không có học sinh nào hợp lệ để giao bài', 400);
    }

    // 3. Batch insert
    await lessonRepository.assignToStudents(assignmentsToCreate);
    return assignmentsToCreate.length;
  }
}

module.exports = new LessonService();
