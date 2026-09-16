const cacheService = require('../services/cacheService');
const AppError = require('../utils/AppError');

/**
 * Khởi tạo Rate Limiter Middleware linh hoạt theo từng route
 * @param {Object} options 
 * @param {string} options.prefix - Tiền tố lưu trữ trong Redis
 * @param {number} options.maxRequests - Tối đa số lần gửi trong khoảng thời gian
 * @param {number} options.windowSeconds - Khoảng thời gian tính bằng giây
 * @param {string} options.errorMessage - Thông báo lỗi khi vượt giới hạn
 */
function createRateLimiter({
  prefix = 'ratelimit',
  maxRequests = 10,
  windowSeconds = 60,
  errorMessage = 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.'
} = {}) {
  return async (req, res, next) => {
    try {
      // Nhận diện người dùng theo IP (hoặc req.user?.id nếu đã login)
      const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown_ip';
      const key = `classlive:${prefix}:${clientIp}:${req.originalUrl}`;

      // 1. Tăng biến đếm trong Redis
      const currentCount = await cacheService.incr(key);

      // Nếu Redis không sẵn sàng (Graceful Fallback Mode), bỏ qua và cho đi tiếp
      if (currentCount === null) {
        return next();
      }

      // 2. Nếu là lần request đầu tiên trong khung giờ, đặt thời gian tự hủy (TTL)
      if (currentCount === 1) {
        await cacheService.expire(key, windowSeconds);
      }

      // 3. Nếu vượt quá ngưỡng cho phép -> Ném AppError HTTP 429
      if (currentCount > maxRequests) {
        return next(new AppError(errorMessage, 429));
      }

      next();
    } catch (err) {
      // Nếu có bất kỳ sự cố ngoài ý muốn nào, cho request đi tiếp để không chặn ứng dụng
      next();
    }
  };
}

// Pre-configured rate limiters cho các nghiệp vụ chính
const authRateLimiter = createRateLimiter({
  prefix: 'auth_limit',
  maxRequests: 10, // Tối đa 10 lần login / forgot-password trong 1 phút
  windowSeconds: 60,
  errorMessage: 'Bạn đã thử đăng nhập quá nhiều lần. Vui lòng đợi 1 phút rồi thử lại.'
});

const otpRateLimiter = createRateLimiter({
  prefix: 'otp_limit',
  maxRequests: 3, // Tối đa 3 lần yêu cầu gửi lại OTP trong 1 phút
  windowSeconds: 60,
  errorMessage: 'Bạn đã yêu cầu mã OTP quá thường xuyên. Vui lòng thử lại sau 1 phút.'
});

const generalApiRateLimiter = createRateLimiter({
  prefix: 'general_limit',
  maxRequests: 120, // Tối đa 120 request / phút cho các API khác
  windowSeconds: 60,
  errorMessage: 'Hệ thống ghi nhận quá nhiều yêu cầu từ thiết bị của bạn. Vui lòng thử lại sau.'
});

module.exports = {
  createRateLimiter,
  authRateLimiter,
  otpRateLimiter,
  generalApiRateLimiter
};
