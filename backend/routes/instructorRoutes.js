const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');
const { verifyToken, requireInstructor } = require('../middlewares/authMiddleware');

// Áp dụng middleware cho tất cả các route bên dưới
router.use(verifyToken);
router.use(requireInstructor);

// API Dashboard Stats
router.get('/dashboard-stats', instructorController.getDashboardStats);

// API Profile
router.get('/profile', instructorController.getProfile);

module.exports = router;
