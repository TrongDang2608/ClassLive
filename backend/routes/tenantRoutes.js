const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const tenantController = require('../controllers/tenantController');
const { verifyToken, restrictTo } = require('../middlewares/authMiddleware');

// Cấu hình Multer để upload file vào thư mục /uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // Giới hạn 50MB
});

// Middleware bảo vệ tất cả route bên dưới: Yêu cầu đăng nhập & Role tenant_admin
router.use(verifyToken);
router.use(restrictTo('tenant_admin'));

// === PROFILE & DASHBOARD ===
router.get('/profile', tenantController.getProfile);
router.get('/dashboard-stats', tenantController.getDashboardStats);

// === QUẢN LÝ BÀI GIẢNG ===
router.get('/lessons', tenantController.getLessons);
router.get('/lessons/:id', tenantController.getLessonDetails);
router.post('/lessons', upload.any(), tenantController.createLesson);
router.put('/lessons/:id', upload.any(), tenantController.updateLesson);
router.delete('/lessons/:id', tenantController.deleteLesson);

// === PHÂN BỔ BÀI GIẢNG CHO SCHOOL ADMIN ===
router.get('/school-admins', tenantController.getSchoolAdmins);
router.post('/lessons/:id/assign', tenantController.assignLessonToSchools);
router.get('/lessons/:id/assignments', tenantController.getLessonAssignments);
router.delete('/assignments/:assignmentId', tenantController.revokeAssignment);

// === CHAT SYSTEM ===
router.get('/chat-contacts', tenantController.getChatContacts);

module.exports = router;
