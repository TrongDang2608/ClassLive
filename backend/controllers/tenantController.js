const tenantService = require('../services/tenantService');
const {
  CreateLessonDto,
  UpdateLessonDto,
  AssignLessonDto,
  GetLessonsQueryDto
} = require('../dtos/tenantDto');
const catchAsync = require('../utils/catchAsync');
const fs = require('fs');
const path = require('path');

class TenantController {
  // GET /api/tenant/profile
  getProfile = catchAsync(async (req, res, next) => {
    const tenantAdminId = req.user.id;
    const profile = await tenantService.getProfile(tenantAdminId);

    res.status(200).json({
      success: true,
      data: profile
    });
  });

  // GET /api/tenant/dashboard-stats
  getDashboardStats = catchAsync(async (req, res, next) => {
    const tenantAdminId = req.user.id;
    const stats = await tenantService.getDashboardStats(tenantAdminId);

    res.status(200).json({
      success: true,
      data: stats
    });
  });

  // GET /api/tenant/lessons
  getLessons = catchAsync(async (req, res, next) => {
    const tenantAdminId = req.user.id;
    const queryDto = new GetLessonsQueryDto(req.query);
    queryDto.validate();

    const result = await tenantService.getLessons(tenantAdminId, queryDto.page, queryDto.limit);

    res.status(200).json({
      success: true,
      data: result.lessons,
      pagination: result.pagination
    });
  });

  // GET /api/tenant/lessons/:id
  getLessonDetails = catchAsync(async (req, res, next) => {
    const tenantAdminId = req.user.id;
    const lessonId = req.params.id;

    const lesson = await tenantService.getLessonById(lessonId, tenantAdminId);

    res.status(200).json({
      success: true,
      data: lesson
    });
  });

  // POST /api/tenant/lessons
  createLesson = catchAsync(async (req, res, next) => {
    const tenantAdminId = req.user.id;
    const dto = new CreateLessonDto(req.body);
    dto.validate();

    const lessonData = {
      title: dto.title,
      description: dto.description,
      subject: dto.subject,
      grade: dto.grade,
      content: dto.content,
      files: []
    };

    // Upload files qua Multer
    if (req.files && req.files.length > 0) {
      lessonData.files = req.files.map(file => ({
        originalName: file.originalname,
        url: `/uploads/${file.filename}`
      }));
    }

    const createdLesson = await tenantService.createLesson(tenantAdminId, lessonData);

    res.status(201).json({
      success: true,
      message: 'Tạo bài giảng thành công',
      data: createdLesson
    });
  });

  // PUT /api/tenant/lessons/:id
  updateLesson = catchAsync(async (req, res, next) => {
    const tenantAdminId = req.user.id;
    const lessonId = req.params.id;
    const dto = new UpdateLessonDto(req.body);
    dto.validate();

    const updateData = dto.toUpdateData();

    // Xử lý giữ/xóa file cũ
    const oldLesson = await tenantService.getLessonById(lessonId, tenantAdminId);
    const oldFiles = oldLesson?.files || [];

    let finalFiles = [];
    if (req.body.existingFiles !== undefined) {
      try {
        finalFiles = typeof req.body.existingFiles === 'string' 
          ? JSON.parse(req.body.existingFiles) 
          : req.body.existingFiles;
      } catch (e) {
        finalFiles = oldFiles;
      }

      // Xóa file không giữ lại khỏi thư mục uploads
      const keptUrls = finalFiles.map(f => f.url);
      const removedFiles = oldFiles.filter(f => !keptUrls.includes(f.url));
      removedFiles.forEach(f => {
        if (f.url) {
          const filePath = path.join(__dirname, '..', f.url);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      });
    } else {
      finalFiles = oldFiles;
    }

    // Thêm các file mới tải lên
    if (req.files && req.files.length > 0) {
      const newFiles = req.files.map(file => ({
        originalName: file.originalname,
        url: `/uploads/${file.filename}`
      }));
      finalFiles = [...finalFiles, ...newFiles];
    }

    if (req.body.existingFiles !== undefined || (req.files && req.files.length > 0)) {
      updateData.files = finalFiles;
    }

    const updatedLesson = await tenantService.updateLesson(lessonId, tenantAdminId, updateData);

    res.status(200).json({
      success: true,
      message: 'Cập nhật bài giảng thành công',
      data: updatedLesson
    });
  });

  // DELETE /api/tenant/lessons/:id
  deleteLesson = catchAsync(async (req, res, next) => {
    const tenantAdminId = req.user.id;
    const lessonId = req.params.id;

    const oldLesson = await tenantService.getLessonById(lessonId, tenantAdminId);
    await tenantService.deleteLesson(lessonId, tenantAdminId);

    // Xóa các file vật lý khỏi uploads
    if (oldLesson && oldLesson.files) {
      oldLesson.files.forEach(f => {
        if (f.url) {
          const filePath = path.join(__dirname, '..', f.url);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã xóa bài giảng thành công'
    });
  });

  // GET /api/tenant/school-admins
  getSchoolAdmins = catchAsync(async (req, res, next) => {
    const tenantAdminId = req.user.id;
    const schoolAdmins = await tenantService.getSchoolAdmins(tenantAdminId);

    res.status(200).json({
      success: true,
      data: schoolAdmins
    });
  });

  // POST /api/tenant/lessons/:id/assign
  assignLessonToSchools = catchAsync(async (req, res, next) => {
    const tenantAdminId = req.user.id;
    const lessonId = req.params.id;
    const dto = new AssignLessonDto(req.body);
    dto.validate();

    const result = await tenantService.assignLessonToSchools(lessonId, tenantAdminId, dto.schoolAdminIds);

    res.status(200).json({
      success: true,
      ...result
    });
  });

  // GET /api/tenant/lessons/:id/assignments
  getLessonAssignments = catchAsync(async (req, res, next) => {
    const tenantAdminId = req.user.id;
    const lessonId = req.params.id;

    const assignments = await tenantService.getLessonAssignments(lessonId, tenantAdminId);

    res.status(200).json({
      success: true,
      data: assignments
    });
  });

  // DELETE /api/tenant/assignments/:assignmentId
  revokeAssignment = catchAsync(async (req, res, next) => {
    const tenantAdminId = req.user.id;
    const assignmentId = req.params.assignmentId;

    await tenantService.revokeAssignment(assignmentId, tenantAdminId);

    res.status(200).json({
      success: true,
      message: 'Đã thu hồi quyền bài giảng thành công'
    });
  });

  // GET /api/tenant/chat-contacts
  getChatContacts = catchAsync(async (req, res, next) => {
    const tenantAdminId = req.user.id;
    const contacts = await tenantService.getChatContacts(tenantAdminId);

    res.status(200).json({
      success: true,
      data: contacts
    });
  });
}

module.exports = new TenantController();
