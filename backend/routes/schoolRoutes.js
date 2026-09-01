const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');
const { verifyToken, restrictTo } = require('../middlewares/authMiddleware');

// Bảo vệ tất cả route bên dưới: Yêu cầu đăng nhập & Role school_admin
router.use(verifyToken);
router.use(restrictTo('school_admin'));

// === PROFILE & DASHBOARD ===
router.get('/profile', schoolController.getProfile);
router.get('/dashboard-stats', schoolController.getDashboardStats);

// === BÀI GIẢNG ĐƯỢC CẤP (LESSONS) ===
router.get('/lessons', schoolController.getAssignedLessons);
router.get('/lessons/:id', schoolController.getLessonDetails);

// === QUẢN LÝ GIÁO VIÊN (TEACHERS) ===
router.get('/teachers', schoolController.getTeachers);
router.post('/teachers', schoolController.createTeacher);
router.put('/teachers/:id', schoolController.updateTeacher);
router.delete('/teachers/:id', schoolController.deleteTeacher);

// === PHÂN BỔ BÀI GIẢNG CHO GIÁO VIÊN ===
router.post('/lessons/:id/assign', schoolController.assignLessonToTeachers);
router.get('/lessons/:id/assignments', schoolController.getLessonAssignments);
router.delete('/assignments/:assignmentId', schoolController.revokeTeacherAssignment);

// === CHAT SYSTEM CONTACTS ===
router.get('/chat-contacts', schoolController.getChatContacts);

module.exports = router;
