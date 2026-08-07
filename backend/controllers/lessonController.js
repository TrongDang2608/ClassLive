const lessonService = require('../services/lessonService');
const catchAsync = require('../utils/catchAsync');

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

  // Nếu muốn update files phức tạp hơn, ta có thể xử lý req.files thêm tại đây.
  // Hiện tại phiên bản đơn giản chỉ cập nhật text.

  await lessonService.updateLesson(lessonId, instructorId, updateData);

  res.status(200).json({
    success: true,
    message: 'Cập nhật bài giảng thành công'
  });
});

exports.deleteLesson = catchAsync(async (req, res) => {
  const instructorId = req.user.id;
  const lessonId = req.params.id;

  await lessonService.deleteLesson(lessonId, instructorId);

  res.status(200).json({
    success: true,
    message: 'Đã xóa bài giảng'
  });
});

exports.assignLesson = catchAsync(async (req, res) => {
  const instructorId = req.user.id;
  const lessonId = req.params.id;
  const { studentIds } = req.body;

  const assignedCount = await lessonService.assignLessonToStudents(lessonId, instructorId, studentIds);

  res.status(200).json({
    success: true,
    message: `Đã giao bài giảng thành công cho ${assignedCount} học sinh`
  });
});
