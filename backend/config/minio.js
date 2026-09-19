const Minio = require('minio');

let minioClient = null;
let isMinioConnected = false;

const BUCKETS = {
  LESSONS: 'classlive-lessons',
  AVATARS: 'classlive-avatars',
  CHAT: 'classlive-chat'
};

/**
 * Khởi tạo kết nối MinIO Client và tự động khởi tạo các Buckets
 */
async function initMinio() {
  if (minioClient) return minioClient;

  const endPoint = process.env.MINIO_ENDPOINT || '127.0.0.1';
  const port = parseInt(process.env.MINIO_PORT, 10) || 9000;
  const useSSL = process.env.MINIO_USE_SSL === 'true';
  const accessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
  const secretKey = process.env.MINIO_SECRET_KEY || 'minioadmin';

  try {
    minioClient = new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey
    });

    // Tự động kiểm tra & tạo 3 Buckets nếu chưa có
    for (const bucketName of Object.values(BUCKETS)) {
      const exists = await minioClient.bucketExists(bucketName).catch(() => false);
      if (!exists) {
        await minioClient.makeBucket(bucketName, 'us-east-1');
        console.log(`📦 [MinIO] Đã tự động tạo Bucket mới: '${bucketName}'`);
      }
    }

    isMinioConnected = true;
    console.log(`⚡ [MinIO] Kết nối thành công tới MinIO S3 Server tại ${endPoint}:${port}`);
    return minioClient;
  } catch (error) {
    isMinioConnected = false;
    console.warn(`⚠️ [MinIO Warning]: Không thể kết nối MinIO Server (${error.message}). Kích hoạt Fallback Mode.`);
    return null;
  }
}

function getMinioClient() {
  if (!minioClient) {
    initMinio();
  }
  return minioClient;
}

function isMinioReady() {
  return isMinioConnected && minioClient !== null;
}

module.exports = {
  initMinio,
  getMinioClient,
  isMinioReady,
  BUCKETS
};
