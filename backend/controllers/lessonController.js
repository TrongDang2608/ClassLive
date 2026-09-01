const lessonService = require('../services/lessonService');
const catchAsync = require('../utils/catchAsync');
const fs = require('fs');
const path = require('path');

exports.createLesson = catchAsync(async (req, res) => {
  const instructorId = req.user.id;
  const { title, description, videoUrl, attachmentUrl } = req.body;

  const lessonData = {
    title,
    description,
    videoUrl: videoUrl || null,
    attachmentUrl: attachmentUrl || null,
    files: []
  };

  // Xử lý files từ multer (nếu có)
  if (req.files && req.files.length > 0) {
    lessonData.files = req.files.map(file => ({
      originalName: file.originalname,
      // Tạo URL công khai tới thư mục tĩnh
      url: `/uploads/${file.filename}`
    }));
  }

  const lessonId = await lessonService.createLesson(instructorId, lessonData);

  res.status(201).json({
    success: true,
    message: 'Tạo bài giảng thành công',
    lessonId,
    lesson: lessonData
  });
});

exports.getLessons = catchAsync(async (req, res) => {
  const instructorId = req.user.id;
  const { page, limit } = req.query;

  const result = await lessonService.getInstructorLessons(instructorId, page, limit);

  res.status(200).json({
    success: true,
    data: result.lessons,
    pagination: result.pagination
  });
});

exports.getLessonDetails = catchAsync(async (req, res) => {
  const instructorId = req.user.id;
  const lessonId = req.params.id;

  const lesson = await lessonService.getLessonById(lessonId, instructorId);

  res.status(200).json({
    success: true,
    data: lesson
  });
});

exports.updateLesson = catchAsync(async (req, res) => {
  const instructorId = req.user.id;
  const lessonId = req.params.id;
  const { title, description, videoUrl, attachmentUrl } = req.body;

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
  if (attachmentUrl !== undefined) updateData.attachmentUrl = attachmentUrl;

  // Lấy bài giảng cũ để so sánh
  const oldLesson = await lessonService.getLessonById(lessonId, instructorId);
  const oldFiles = oldLesson?.files || [];

  let finalFiles = [];
  if (req.body.existingFiles !== undefined) {
    try {
      finalFiles = JSON.parse(req.body.existingFiles);
    } catch(e) {}

    // Xóa vật lý những file không còn nằm trong finalFiles
    const keptUrls = finalFiles.map(f => f.url);
    const removedFiles = oldFiles.filter(f => !keptUrls.includes(f.url));
    removedFiles.forEach(f => {
      if (f.url) {
        const filePath = path.join(__dirname, '..', f.url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    });
  } else {
    // Giữ nguyên file cũ
    finalFiles = oldFiles;
  }

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

  await lessonService.updateLesson(lessonId, instructorId, updateData);

  res.status(200).json({
    success: true,
    message: 'Cập nhật bài giảng thành công'
  });
});

exports.deleteLesson = catchAsync(async (req, res) => {
  const instructorId = req.user.id;
  const lessonId = req.params.id;

  // Lấy thông tin bài giảng để xóa file vật lý
  const oldLesson = await lessonService.getLessonById(lessonId, instructorId);
  
  await lessonService.deleteLesson(lessonId, instructorId);

  // Xóa các file đính kèm khỏi thư mục uploads
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
    message: 'Đã xóa bài giảng'
  });
});
