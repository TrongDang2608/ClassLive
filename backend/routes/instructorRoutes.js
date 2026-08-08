const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');
const { verifyToken, requireInstructor } = require('../middlewares/authMiddleware');

// Áp dụng middleware cho tất cả các route bên dưới
router.use(verifyToken);
router.use(requireInstructor);

// CRUD Routes cho User Management
router.post('/addStudent', instructorController.addStudent);
router.get('/students', instructorController.getStudents);
router.get('/student/:identifier', instructorController.getStudent);
router.put('/editStudent/:identifier', instructorController.editStudent);
router.delete('/student/:identifier', instructorController.deleteStudent);

// API Dashboard Stats
router.get('/dashboard-stats', instructorController.getDashboardStats);

// API Profile
router.get('/profile', instructorController.getProfile);

module.exports = router;
