const Redis = require('ioredis');

let redisClient = null;
let isRedisConnected = false;

/**
 * Khởi tạo kết nối Redis với cơ chế tự phục hồi và Graceful Fallback
 */
function initRedis() {
  if (redisClient) return redisClient;

  const redisHost = process.env.REDIS_HOST || '127.0.0.1';
  const redisPort = parseInt(process.env.REDIS_PORT, 10) || 6379;
  const redisPassword = process.env.REDIS_PASSWORD || undefined;

  redisClient = new Redis({
    host: redisHost,
    port: redisPort,
    password: redisPassword,
    lazyConnect: true,
    maxRetriesPerRequest: 1, // Không treo request khi Redis offline
    retryStrategy(times) {
      if (times > 5) {
        console.warn('⚠️ [Redis] Tạm dừng thử lại kết nối Redis. Hệ thống tự động chuyển sang Fallback Mode.');
        return null; // Dừng retry để tránh spam log
      }
      return Math.min(times * 300, 2000);
    }
  });

  redisClient.on('connect', () => {
    isRedisConnected = true;
    console.log('⚡ [Redis] Kết nối thành công tới Redis Server tại ' + redisHost + ':' + redisPort);
  });

  redisClient.on('ready', () => {
    isRedisConnected = true;
  });

  redisClient.on('error', (err) => {
    isRedisConnected = false;
    // Log nhẹ nhàng dạng warning để không làm sập ứng dụng
    console.warn(`⚠️ [Redis Warning]: ${err.message}. Hệ thống đang dùng Firestore trực tiếp.`);
  });

  redisClient.on('close', () => {
    isRedisConnected = false;
  });

  // Thực hiện kết nối non-blocking
  redisClient.connect().catch((err) => {
    isRedisConnected = false;
    console.warn('⚠️ [Redis Init]: Chưa thể kết nối Redis Server (' + err.message + '). Đang kích hoạt Fallback Mode.');
  });

  return redisClient;
}

function getRedisClient() {
  if (!redisClient) {
    return initRedis();
  }
  return redisClient;
}

function isRedisReady() {
  return isRedisConnected && redisClient && redisClient.status === 'ready';
}

module.exports = {
  initRedis,
  getRedisClient,
  isRedisReady
};
