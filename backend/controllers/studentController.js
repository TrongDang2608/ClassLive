const studentService = require('../services/studentService');
const catchAsync = require('../utils/catchAsync');

exports.getAssignedLessons = catchAsync(async (req, res) => {
  const studentId = req.user.id;
  const lessons = await studentService.getMyLessons(studentId);
  
  res.status(200).json({
    success: true,
    data: lessons
  });
});

exports.completeLesson = catchAsync(async (req, res) => {
  const studentId = req.user.id;
  const assignmentId = req.params.id;
  
  await studentService.markLessonAsDone(assignmentId, studentId);
  
  res.status(200).json({
    success: true,
    message: 'Đã hoàn thành bài học'
  });
});

exports.updateProfile = catchAsync(async (req, res) => {
  const studentId = req.user.id;
  const { name, email, phone } = req.body;
  
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  
  await studentService.updateProfile(studentId, updateData);
  
  res.status(200).json({
    success: true,
    message: 'Đã cập nhật thông tin cá nhân'
  });
});

exports.getProfile = catchAsync(async (req, res) => {
  const studentId = req.user.id;
  const profile = await studentService.getProfile(studentId);
  
  res.status(200).json({
    success: true,
    data: profile
  });
});

exports.getDashboardStats = catchAsync(async (req, res) => {
  const studentId = req.user.id;
  const stats = await studentService.getDashboardStats(studentId);
  
  res.status(200).json({
    success: true,
    data: stats
  });
});
