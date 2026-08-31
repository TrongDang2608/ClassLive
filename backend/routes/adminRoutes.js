const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, restrictTo } = require('../middlewares/authMiddleware');

// Chỉ Role admin mới được truy cập các Route này
router.use(verifyToken);
router.use(restrictTo('admin'));

// CRUD Routes cho User Management của Admin
router.post('/addUser', adminController.addUser);
router.get('/users', adminController.getUsers);
router.get('/user/:identifier', adminController.getUser);
router.put('/editUser/:identifier', adminController.editUser);
router.delete('/user/:identifier', adminController.deleteUser);

module.exports = router;
