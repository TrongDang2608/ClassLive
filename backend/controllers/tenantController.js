const tenantService = require('../services/tenantService');
const catchAsync = require('../utils/catchAsync');
const fs = require('fs');
const path = require('path');

exports.getProfile = catchAsync(async (req, res) => {
  const tenantAdminId = req.user.id;
  const profile = await tenantService.getProfile(tenantAdminId);

  res.status(200).json({
    success: true,
    data: profile
  });
});

exports.getDashboardStats = catchAsync(async (req, res) => {
  const tenantAdminId = req.user.id;
  const stats = await tenantService.getDashboardStats(tenantAdminId);

  res.status(200).json({
    success: true,
    data: stats
  });
});

exports.getLessons = catchAsync(async (req, res) => {
  const tenantAdminId = req.user.id;
  const { page, limit } = req.query;

  const result = await tenantService.getLessons(tenantAdminId, page, limit);

  res.status(200).json({
    success: true,
    data: result.lessons,
    pagination: result.pagination
  });
});

exports.getLessonDetails = catchAsync(async (req, res) => {
  const tenantAdminId = req.user.id;
  const lessonId = req.params.id;

  const lesson = await tenantService.getLessonById(lessonId, tenantAdminId);

  res.status(200).json({
    success: true,
    data: lesson
  });
});

exports.createLesson = catchAsync(async (req, res) => {
  const tenantAdminId = req.user.id;
  const { title, description, subject, grade, content } = req.body;

  const lessonData = {
    title,
    description,
    subject,
    grade,
    content,
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

exports.updateLesson = catchAsync(async (req, res) => {
  const tenantAdminId = req.user.id;
  const lessonId = req.params.id;
  const { title, description, subject, grade, content } = req.body;

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (subject !== undefined) updateData.subject = subject;
  if (grade !== undefined) updateData.grade = grade;
  if (content !== undefined) updateData.content = content;

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

exports.deleteLesson = catchAsync(async (req, res) => {
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

exports.getSchoolAdmins = catchAsync(async (req, res) => {
  const tenantAdminId = req.user.id;
  const schoolAdmins = await tenantService.getSchoolAdmins(tenantAdminId);

  res.status(200).json({
    success: true,
    data: schoolAdmins
  });
});

exports.assignLessonToSchools = catchAsync(async (req, res) => {
  const tenantAdminId = req.user.id;
  const lessonId = req.params.id;
  const { schoolAdminIds } = req.body;

  const result = await tenantService.assignLessonToSchools(lessonId, tenantAdminId, schoolAdminIds);

  res.status(200).json({
    success: true,
    ...result
  });
});

exports.getLessonAssignments = catchAsync(async (req, res) => {
  const tenantAdminId = req.user.id;
  const lessonId = req.params.id;

  const assignments = await tenantService.getLessonAssignments(lessonId, tenantAdminId);

  res.status(200).json({
    success: true,
    data: assignments
  });
});

exports.revokeAssignment = catchAsync(async (req, res) => {
  const tenantAdminId = req.user.id;
  const assignmentId = req.params.assignmentId;

  await tenantService.revokeAssignment(assignmentId, tenantAdminId);

  res.status(200).json({
    success: true,
    message: 'Đã thu hồi quyền bài giảng thành công'
  });
});

exports.getChatContacts = catchAsync(async (req, res) => {
  const tenantAdminId = req.user.id;
  const contacts = await tenantService.getChatContacts(tenantAdminId);

  res.status(200).json({
    success: true,
    data: contacts
  });
});
