const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authRateLimiter, otpRateLimiter } = require('../middlewares/rateLimiter');

// Public routes với Redis Rate Limiter bảo vệ
router.post('/setup-account', authRateLimiter, authController.setupAccount);
router.post('/login', authRateLimiter, authController.loginPassword);
router.post('/createAccessCode', otpRateLimiter, authController.createAccessCode);
router.post('/validateAccessCode', authRateLimiter, authController.validateAccessCode);
router.post('/forgot-password', authRateLimiter, authController.forgotPassword);
router.post('/reset-password', authRateLimiter, authController.resetPassword);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

module.exports = router;
