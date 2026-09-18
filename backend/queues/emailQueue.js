const { Queue } = require('bullmq');
const { redisConnectionOptions, isRedisReady } = require('../config/redis');
const emailService = require('../services/emailService');

const EMAIL_QUEUE_NAME = 'emailQueue';

let emailQueue = null;

try {
  emailQueue = new Queue(EMAIL_QUEUE_NAME, {
    connection: redisConnectionOptions,
    defaultJobOptions: {
      attempts: 3, // Thử lại tối đa 3 lần nếu Brevo SMTP bị lỗi
      backoff: {
        type: 'exponential',
        delay: 3000 // Thử lại sau 3s, 6s, 12s...
      },
      removeOnComplete: {
        count: 100, // Giữ lại tối đa 100 jobs thành công gần nhất
        age: 3600 // Tự xóa sau 1 giờ
      },
      removeOnFail: {
        count: 500,
        age: 86400 * 3 // Giữ lại 3 ngày để kiểm tra log nếu lỗi
      }
    }
  });

  emailQueue.on('error', (err) => {
    console.warn(`⚠️ [BullMQ emailQueue Error]: ${err.message}`);
  });
} catch (error) {
  console.warn(`⚠️ [BullMQ emailQueue Init Warning]: ${error.message}`);
}

/**
 * Đẩy job gửi Email vào hàng đợi BullMQ với cơ chế Graceful Fallback
 * @param {string} jobName - Tên loại công việc (sendOtp, sendSetup, sendResetPassword)
 * @param {object} data - Payload dữ liệu cần gửi
 */
async function addEmailJob(jobName, data) {
  // Nếu Redis đang online và Queue khởi tạo tốt -> Đẩy vào BullMQ
  if (emailQueue && isRedisReady()) {
    try {
      const job = await emailQueue.add(jobName, data);
      return { success: true, jobId: job.id, queued: true };
    } catch (err) {
      console.warn(`⚠️ [BullMQ Fallback]: Lỗi khi enqueue ${jobName} (${err.message}). Chuyển sang gửi trực tiếp.`);
    }
  }

  // Graceful Fallback Mode: Gửi trực tiếp nếu Redis/Queue không khả dụng
  return await executeDirectEmail(jobName, data);
}

/**
 * Hàm gửi trực tiếp khi Fallback
 */
async function executeDirectEmail(jobName, data) {
  try {
    switch (jobName) {
      case 'sendOtpEmail':
        await emailService.sendOtpEmail(data.toEmail, data.code);
        break;
      case 'sendSetupEmail':
        await emailService.sendSetupEmail(data.toEmail, data.userId, data.name);
        break;
      case 'sendSetupAccountEmail':
        await emailService.sendSetupAccountEmail(data.toEmail, data.fullName, data.token);
        break;
      case 'sendResetPasswordEmail':
        await emailService.sendResetPasswordEmail(data.toEmail, data.fullName, data.token);
        break;
      default:
        console.warn(`⚠️ Không tìm thấy handler trực tiếp cho job: ${jobName}`);
    }
    return { success: true, queued: false };
  } catch (error) {
    console.error(`❌ [Email Fallback Direct Error] ${jobName}:`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  emailQueue,
  EMAIL_QUEUE_NAME,
  addEmailJob
};
