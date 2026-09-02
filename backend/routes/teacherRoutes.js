const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { verifyToken, requireInstructor } = require('../middlewares/authMiddleware');

// Áp dụng middleware xác thực Token và Role Giảng viên/Giáo viên cho toàn bộ route
router.use(verifyToken);
router.use(requireInstructor);

// === ROUTES TEACHER PORTAL ===

// Lấy thông tin cá nhân & trường chủ quản
router.get('/profile', teacherController.getProfile);

// Lấy thông số thống kê Dashboard
router.get('/dashboard-stats', teacherController.getDashboardStats);

// Lấy danh sách kho bài giảng được School Admin cấp
router.get('/lessons', teacherController.getLessons);

// Lấy chi tiết bài giảng và các file đính kèm
router.get('/lessons/:id', teacherController.getLessonDetail);

module.exports = router;
