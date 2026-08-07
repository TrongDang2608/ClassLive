const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const lessonController = require('../controllers/lessonController');
const { verifyToken, requireInstructor } = require('../middlewares/authMiddleware');

// Cấu hình Multer để upload file vào thư mục /uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Tạo tên file an toàn chống ghi đè
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // Giới hạn file 50MB
});

// Middleware xác thực tất cả route dưới đây
router.use(verifyToken);
router.use(requireInstructor);

// === ROUTES QUẢN LÝ BÀI HỌC CỦA GIẢNG VIÊN ===

// Lấy danh sách bài học do giảng viên tạo
router.get('/', lessonController.getLessons);

// Lấy chi tiết bài học
router.get('/:id', lessonController.getLessonDetails);

// Tạo bài học mới (Có nhận form-data chứa files)
// Dùng upload.array('files', 5) để nhận tối đa 5 file đính kèm với name form là 'files'
router.post('/', upload.array('files', 5), lessonController.createLesson);

// Cập nhật bài học
router.put('/:id', lessonController.updateLesson);

// Xóa bài học
router.delete('/:id', lessonController.deleteLesson);

// === ROUTES GIAO BÀI (ASSIGNMENT) ===

// Giao bài học cho danh sách học viên
router.post('/:id/assign', lessonController.assignLesson);

module.exports = router;
