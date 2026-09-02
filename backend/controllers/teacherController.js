const teacherService = require('../services/teacherService');
const catchAsync = require('../utils/catchAsync');

class TeacherController {
  // GET /api/teacher/profile
  getProfile = catchAsync(async (req, res, next) => {
    const result = await teacherService.getProfile(req.user.id);
    res.status(200).json({
      success: true,
      data: result
    });
  });

  // GET /api/teacher/dashboard-stats
  getDashboardStats = catchAsync(async (req, res, next) => {
    const result = await teacherService.getDashboardStats(req.user.id);
    res.status(200).json({
      success: true,
      data: result
    });
  });

  // GET /api/teacher/lessons
  getLessons = catchAsync(async (req, res, next) => {
    const { page, limit, search, subject, grade } = req.query;
    const result = await teacherService.getAssignedLessons(req.user.id, page, limit, {
      search,
      subject,
      grade
    });
    res.status(200).json({
      success: true,
      data: result.lessons,
      pagination: result.pagination
    });
  });

  // GET /api/teacher/lessons/:id
  getLessonDetail = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const result = await teacherService.getLessonDetail(id, req.user.id);
    res.status(200).json({
      success: true,
      data: result
    });
  });
}

module.exports = new TeacherController();
