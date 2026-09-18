const { Worker } = require('bullmq');
const { redisConnectionOptions } = require('../config/redis');
const { EMAIL_QUEUE_NAME } = require('../queues/emailQueue');
const emailService = require('../services/emailService');

let emailWorker = null;

function initEmailWorker() {
  if (emailWorker) return emailWorker;

  try {
    emailWorker = new Worker(
      EMAIL_QUEUE_NAME,
      async (job) => {
        const { name, data } = job;
        console.log(`📩 [BullMQ Worker] Đang xử lý Job ${job.id} (${name}) tới: ${data.toEmail || data.email}`);

        switch (name) {
          case 'sendOtpEmail':
            return await emailService.sendOtpEmail(data.toEmail, data.code);

          case 'sendSetupEmail':
            return await emailService.sendSetupEmail(data.toEmail, data.userId, data.name);

          case 'sendSetupAccountEmail':
            return await emailService.sendSetupAccountEmail(data.toEmail, data.fullName, data.token);

          case 'sendResetPasswordEmail':
            return await emailService.sendResetPasswordEmail(data.toEmail, data.fullName, data.token);

          default:
            throw new Error(`Tác vụ Email không hợp lệ: ${name}`);
        }
      },
      {
        connection: redisConnectionOptions,
        concurrency: 5 // Xử lý đồng thời tối đa 5 email cùng lúc
      }
    );

    emailWorker.on('completed', (job) => {
      console.log(`✅ [BullMQ Worker] Job ${job.id} (${job.name}) hoàn thành thành công!`);
    });

    emailWorker.on('failed', (job, err) => {
      console.error(`❌ [BullMQ Worker] Job ${job?.id} (${job?.name}) thất bại. Lỗi: ${err.message}`);
    });

    console.log('🚀 [BullMQ Worker] Email Background Worker đã sẵn sàng hoạt động.');
    return emailWorker;
  } catch (error) {
    console.warn(`⚠️ [BullMQ Worker Init Warning]: ${error.message}`);
    return null;
  }
}

module.exports = {
  initEmailWorker
};
