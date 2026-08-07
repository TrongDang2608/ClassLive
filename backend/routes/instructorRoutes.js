const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');
const { verifyToken, requireInstructor } = require('../middlewares/authMiddleware');

// Áp dụng middleware cho tất cả các route bên dưới
router.use(verifyToken);
router.use(requireInstructor);

// CRUD Routes cho User Management
// Lưu ý: Đề bài yêu cầu dùng :phone, nhưng ở Controller ta lấy `identifier` nên truyền vào đây phone hay ID đều chạy được!
router.post('/addStudent', instructorController.addStudent);
router.get('/students', instructorController.getStudents);
router.get('/student/:identifier', instructorController.getStudent);
router.put('/editStudent/:identifier', instructorController.editStudent);
router.delete('/student/:identifier', instructorController.deleteStudent);

module.exports = router;
