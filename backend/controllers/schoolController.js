const schoolService = require('../services/schoolService');
const catchAsync = require('../utils/catchAsync');

class SchoolController {
  // === PROFILE & DASHBOARD ===
  getProfile = catchAsync(async (req, res) => {
    const schoolAdminId = req.user.id;
    const profile = await schoolService.getProfile(schoolAdminId);
    res.status(200).json({
      success: true,
      data: profile
    });
  });

  getDashboardStats = catchAsync(async (req, res) => {
    const schoolAdminId = req.user.id;
    const stats = await schoolService.getDashboardStats(schoolAdminId);
    res.status(200).json({
      success: true,
      data: stats
    });
  });

  // === BÀI GIẢNG ĐƯỢC CẤP (LESSONS) ===
  getAssignedLessons = catchAsync(async (req, res) => {
    const schoolAdminId = req.user.id;
    const { page = 1, limit = 10, subject, grade, search } = req.query;

    const result = await schoolService.getAssignedLessons(
      schoolAdminId, 
      parseInt(page, 10) || 1, 
      parseInt(limit, 10) || 10, 
      { subject, grade, search }
    );
    res.status(200).json({
      success: true,
      data: result.lessons,
      pagination: result.pagination
    });
  });

  getLessonDetails = catchAsync(async (req, res) => {
    const schoolAdminId = req.user.id;
    const { id } = req.params;

    const lesson = await schoolService.getLessonDetails(schoolAdminId, id);
    res.status(200).json({
      success: true,
      data: lesson
    });
  });

  // === QUẢN LÝ GIÁO VIÊN (TEACHERS) ===
  getTeachers = catchAsync(async (req, res) => {
    const schoolAdminId = req.user.id;
    const { page = 1, limit = 10, search } = req.query;

    const result = await schoolService.getTeachers(
      schoolAdminId, 
      parseInt(page, 10) || 1, 
      parseInt(limit, 10) || 10, 
      search
    );
    res.status(200).json({
      success: true,
      data: result.teachers,
      pagination: result.pagination
    });
  });

  createTeacher = catchAsync(async (req, res) => {
    const schoolAdminId = req.user.id;
    const teacher = await schoolService.createTeacher(schoolAdminId, req.body);
    res.status(201).json({
      success: true,
      message: 'Tạo tài khoản Giáo viên thành công và đã gửi email thiết lập.',
      data: teacher
    });
  });

  updateTeacher = catchAsync(async (req, res) => {
    const schoolAdminId = req.user.id;
    const { id } = req.params;

    const updated = await schoolService.updateTeacher(schoolAdminId, id, req.body);
    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin Giáo viên thành công.',
      data: updated
    });
  });

  deleteTeacher = catchAsync(async (req, res) => {
    const schoolAdminId = req.user.id;
    const { id } = req.params;

    const result = await schoolService.deleteTeacher(schoolAdminId, id);
    res.status(200).json({
      success: true,
      ...result
    });
  });

  // === PHÂN BỔ BÀI GIẢNG CHO GIÁO VIÊN ===
  assignLessonToTeachers = catchAsync(async (req, res) => {
    const schoolAdminId = req.user.id;
    const { id } = req.params; // Lesson ID
    const { teacherIds } = req.body;

    const result = await schoolService.assignLessonToTeachers(schoolAdminId, id, teacherIds);
    res.status(200).json({
      success: true,
      ...result
    });
  });

  getLessonAssignments = catchAsync(async (req, res) => {
    const schoolAdminId = req.user.id;
    const { id } = req.params; // Lesson ID

    const assignments = await schoolService.getLessonAssignmentsToTeachers(schoolAdminId, id);
    res.status(200).json({
      success: true,
      data: assignments
    });
  });

  revokeTeacherAssignment = catchAsync(async (req, res) => {
    const schoolAdminId = req.user.id;
    const { assignmentId } = req.params;

    const result = await schoolService.revokeTeacherAssignment(schoolAdminId, assignmentId);
    res.status(200).json({
      success: true,
      ...result
    });
  });

  // === CHAT CONTACTS ===
  getChatContacts = catchAsync(async (req, res) => {
    const schoolAdminId = req.user.id;
    const contacts = await schoolService.getChatContacts(schoolAdminId);
    res.status(200).json({
      success: true,
      data: contacts
    });
  });
}

module.exports = new SchoolController();
