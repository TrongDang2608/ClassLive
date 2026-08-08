const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken, requireStudent } = require('../middlewares/authMiddleware');

// Áp dụng middleware bảo vệ toàn bộ routes của student
router.use(verifyToken, requireStudent);

// API Bài học
router.get('/lessons', studentController.getAssignedLessons);
router.put('/lessons/:id/done', studentController.completeLesson);

// API Profile
router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateProfile);

// API Dashboard
router.get('/dashboard-stats', studentController.getDashboardStats);

module.exports = router;
