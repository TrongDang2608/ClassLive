const lessonRepository = require('../repositories/lessonRepository');
const cacheService = require('./cacheService');
const AppError = require('../utils/AppError');

class LessonService {
  async createLesson(instructorId, lessonData) {
    lessonData.createdBy = instructorId;
    lessonData.createdAt = Date.now();
    
    const lessonId = await lessonRepository.createLesson(lessonData);

    // Invalidate Cache liên quan đến bài giảng của giảng viên này
    await cacheService.delPattern(`classlive:lesson:*:${instructorId}*`);
    await cacheService.delPattern(`classlive:tenant:*:${instructorId}*`);

    return lessonId;
  }

  async getInstructorLessons(instructorId, page = 1, limit = 10) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const cacheKey = `classlive:lesson:instructor:${instructorId}:${pageNum}:${limitNum}`;

    return await cacheService.remember(cacheKey, 600, async () => {
      const lessons = await lessonRepository.findLessonsByInstructor(instructorId, pageNum, limitNum);
      const totalLessons = await lessonRepository.countLessonsByInstructor(instructorId);
      
      return {
        lessons,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalLessons,
          totalPages: Math.ceil(totalLessons / limitNum) || 1
        }
      };
    });
  }

  async getLessonById(lessonId, instructorId) {
    const cacheKey = `classlive:lesson:detail:${instructorId}:${lessonId}`;
    return await cacheService.remember(cacheKey, 1800, async () => {
      const lesson = await lessonRepository.findLessonById(lessonId);
      if (!lesson) {
        throw new AppError('Bài giảng không tồn tại', 404);
      }
      if (lesson.createdBy !== instructorId) {
        throw new AppError('Bạn không có quyền truy cập bài giảng này', 403);
      }
      return lesson;
    });
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

    // Invalidate Cache
    await cacheService.delPattern(`classlive:lesson:*:${instructorId}*`);
    await cacheService.delPattern(`classlive:tenant:*:${instructorId}*`);
    await cacheService.delPattern(`classlive:school:*`);
    await cacheService.delPattern(`classlive:teacher:*`);
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

    // Invalidate Cache
    await cacheService.delPattern(`classlive:lesson:*:${instructorId}*`);
    await cacheService.delPattern(`classlive:tenant:*:${instructorId}*`);
    await cacheService.delPattern(`classlive:school:*`);
    await cacheService.delPattern(`classlive:teacher:*`);
  }
}

module.exports = new LessonService();
