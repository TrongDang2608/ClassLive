const lessonRepository = require('../repositories/lessonRepository');
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
}

module.exports = new LessonService();
