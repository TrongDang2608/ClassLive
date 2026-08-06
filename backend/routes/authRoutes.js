const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public routes (No JWT required for these)
router.post('/setup-account', authController.setupAccount);
router.post('/login', authController.loginPassword);
router.post('/createAccessCode', authController.createAccessCode);
router.post('/validateAccessCode', authController.validateAccessCode);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

module.exports = router;
