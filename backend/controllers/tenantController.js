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

  // POST /api/tenant/lessons/presigned-upload-url
  getPresignedUploadUrl = catchAsync(async (req, res, next) => {
    const tenantAdminId = req.user.id;
    const { lessonId, fileName, mimeType } = req.body;

    if (!fileName) {
      return res.status(400).json({ success: false, message: 'Tên file là bắt buộc' });
    }

    const result = await tenantService.getPresignedUploadUrl(
      tenantAdminId,
      lessonId,
      fileName,
      mimeType || 'application/octet-stream'
    );

    res.status(200).json({
      success: true,
      data: result
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
      files: req.body.files || [],
      uploadedFiles: req.files || []
    };

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
    updateData.existingFiles = req.body.existingFiles;

    const updatedLesson = await tenantService.updateLesson(lessonId, tenantAdminId, updateData, req.files || []);

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
