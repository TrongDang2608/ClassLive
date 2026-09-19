const fs = require('fs');
const path = require('path');
const { getMinioClient, isMinioReady, BUCKETS } = require('../config/minio');

class StorageService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  _sanitizeFileName(originalName) {
    return originalName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9.-]/g, '_');
  }

  /**
   * Upload file bài giảng theo chuẩn Multi-Tenant Prefix:
   * tenants/{tenantId}/lessons/{lessonId}/{timestamp}_{fileName}
   */
  async uploadLessonFile(tenantId, lessonId, file) {
    const sanitizedName = this._sanitizeFileName(file.originalname || file.name || 'file');
    const timestamp = Date.now();
    const objectKey = `tenants/${tenantId}/lessons/${lessonId}/${timestamp}_${sanitizedName}`;
    const bucketName = BUCKETS.LESSONS;

    return await this._uploadBuffer(bucketName, objectKey, file, sanitizedName);
  }

  /**
   * Upload Avatar người dùng:
   * users/{role}/{userId}/avatar_{timestamp}_{fileName}
   */
  async uploadAvatar(role, userId, file) {
    const sanitizedName = this._sanitizeFileName(file.originalname || file.name || 'avatar.png');
    const timestamp = Date.now();
    const objectKey = `users/${role}/${userId}/avatar_${timestamp}_${sanitizedName}`;
    const bucketName = BUCKETS.AVATARS;

    return await this._uploadBuffer(bucketName, objectKey, file, sanitizedName);
  }

  /**
   * Upload tệp đính kèm trong tin nhắn Chat:
   * conversations/{conversationId}/{YYYY}/{MM}/{timestamp}_{fileName}
   */
  async uploadChatAttachment(conversationId, file) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const sanitizedName = this._sanitizeFileName(file.originalname || file.name || 'chat_file');
    const timestamp = Date.now();
    const objectKey = `conversations/${conversationId}/${year}/${month}/${timestamp}_${sanitizedName}`;
    const bucketName = BUCKETS.CHAT;

    return await this._uploadBuffer(bucketName, objectKey, file, sanitizedName);
  }

  /**
   * Xử lý upload Buffer lên MinIO S3 với cơ chế Fallback Disk Storage
   */
  async _uploadBuffer(bucketName, objectKey, file, originalName) {
    const buffer = file.buffer || (file.path ? fs.readFileSync(file.path) : null);
    const mimeType = file.mimetype || 'application/octet-stream';
    const size = file.size || (buffer ? buffer.length : 0);

    // 1. Nếu MinIO sẵn sàng -> Đẩy lên MinIO S3
    if (isMinioReady() && buffer) {
      try {
        const client = getMinioClient();
        await client.putObject(bucketName, objectKey, buffer, size, {
          'Content-Type': mimeType
        });

        // Tạo Presigned URL mặc định (7 ngày) hoặc tải theo yêu cầu
        const presignedUrl = await client.presignedGetObject(bucketName, objectKey, 7 * 24 * 3600);

        return {
          storageType: 'minio',
          bucket: bucketName,
          key: objectKey,
          name: originalName,
          size: size,
          mimetype: mimeType,
          url: presignedUrl
        };
      } catch (err) {
        console.warn(`⚠️ [MinIO Upload Fallback]: ${err.message}. Chuyển sang lưu đĩa cục bộ.`);
      }
    }

    // 2. Graceful Fallback Mode: Lưu vào thư mục uploads/
    const fallbackFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${originalName}`;
    const fallbackFilePath = path.join(this.uploadsDir, fallbackFileName);

    if (buffer) {
      fs.writeFileSync(fallbackFilePath, buffer);
    } else if (file.path && file.path !== fallbackFilePath) {
      fs.copyFileSync(file.path, fallbackFilePath);
    }

    return {
      storageType: 'local',
      bucket: 'local',
      key: `uploads/${fallbackFileName}`,
      name: originalName,
      size: size,
      mimetype: mimeType,
      url: `/uploads/${fallbackFileName}`
    };
  }

  /**
   * Sinh Presigned Upload URL (HTTP PUT) để Frontend đẩy file trực tiếp vào MinIO S3 (Hạn 15 phút)
   */
  async getPresignedPutUrl(bucketName, objectKey, expirySeconds = 900) {
    if (isMinioReady() && bucketName !== 'local') {
      try {
        const client = getMinioClient();
        return await client.presignedPutObject(bucketName, objectKey, expirySeconds);
      } catch (err) {
        console.warn(`⚠️ [MinIO Presigned PUT Error]: ${err.message}`);
      }
    }
    return null;
  }

  /**
   * Khởi tạo URL upload trực tiếp cho bài giảng (Direct-to-S3)
   */
  async createLessonUploadUrl(tenantId, lessonId, originalName, mimeType) {
    const sanitizedName = this._sanitizeFileName(originalName || 'file');
    const timestamp = Date.now();
    const objectKey = `tenants/${tenantId}/lessons/${lessonId}/${timestamp}_${sanitizedName}`;
    const bucketName = BUCKETS.LESSONS;

    const uploadUrl = await this.getPresignedPutUrl(bucketName, objectKey, 900);

    return {
      uploadUrl,
      key: objectKey,
      bucket: bucketName,
      name: sanitizedName,
      mimetype: mimeType,
      storageType: uploadUrl ? 'minio' : 'local'
    };
  }

  /**
   * Lấy Presigned URL xem/tải an toàn (mặc định 1 giờ = 3600s)
   */
  async getPresignedUrl(bucketName, objectKey, expirySeconds = 3600, customReqParams = {}) {
    if (isMinioReady() && bucketName !== 'local') {
      try {
        const client = getMinioClient();
        const ext = (objectKey.split('?')[0].split('.').pop() || '').toLowerCase();
        let mimeType = 'application/octet-stream';
        if (ext === 'pdf') mimeType = 'application/pdf';
        else if (['jpg', 'jpeg'].includes(ext)) mimeType = 'image/jpeg';
        else if (ext === 'png') mimeType = 'image/png';
        else if (ext === 'webp') mimeType = 'image/webp';
        else if (ext === 'mp4') mimeType = 'video/mp4';

        const reqParams = {
          'response-content-disposition': 'inline',
          'response-content-type': mimeType,
          ...customReqParams
        };

        return await client.presignedGetObject(bucketName, objectKey, expirySeconds, reqParams);
      } catch (err) {
        console.warn(`⚠️ [MinIO Presigned URL Error]: ${err.message}`);
      }
    }
    // Fallback nếu là file local hoặc MinIO offline
    return objectKey.startsWith('/') ? objectKey : `/${objectKey}`;
  }

  /**
   * Xóa một file khỏi MinIO S3
   */
  async deleteFile(bucketName, objectKey) {
    if (isMinioReady() && bucketName !== 'local') {
      try {
        const client = getMinioClient();
        await client.removeObject(bucketName, objectKey);
        return true;
      } catch (err) {
        console.warn(`⚠️ [MinIO Delete Error]: ${err.message}`);
      }
    } else {
      // Xóa file local nếu có
      const localPath = path.join(__dirname, '..', objectKey);
      if (fs.existsSync(localPath)) {
        try { fs.unlinkSync(localPath); } catch (_) {}
      }
    }
    return false;
  }

  /**
   * Xóa toàn bộ file trong một thư mục (Prefix) - ví dụ khi xóa bài giảng
   */
  async deleteFolder(bucketName, prefix) {
    if (!isMinioReady() || bucketName === 'local') return;

    try {
      const client = getMinioClient();
      const objectsStream = client.listObjectsV2(bucketName, prefix, true);
      const objectsToDelete = [];

      for await (const obj of objectsStream) {
        if (obj && obj.name) {
          objectsToDelete.push(obj.name);
        }
      }

      if (objectsToDelete.length > 0) {
        await client.removeObjects(bucketName, objectsToDelete);
        console.log(`🗑️ [MinIO] Đã xóa ${objectsToDelete.length} file trong prefix: '${prefix}'`);
      }
    } catch (err) {
      console.warn(`⚠️ [MinIO Delete Folder Error]: ${err.message}`);
    }
  }
}

module.exports = new StorageService();
