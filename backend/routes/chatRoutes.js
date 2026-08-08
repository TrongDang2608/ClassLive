const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Yêu cầu đăng nhập
router.use(verifyToken);

router.get('/contacts', chatController.getContacts);
router.get('/messages/:partnerId', chatController.getMessages);

module.exports = router;
