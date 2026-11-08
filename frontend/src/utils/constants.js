// Backend Base URL: lấy từ biến môi trường VITE_API_URL, mặc định http://localhost:5000 khi chạy local
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

// API Root URL (VD: http://localhost:5000/api hoặc https://your-backend.onrender.com/api)
export const API_URL = `${API_BASE_URL}/api`;

/**
 * Chuẩn hóa URL file từ server (ảnh, PDF, video, v.v.)
 * Hỗ trợ cả full URL (MinIO S3 / Cloudflare R2 / External) và đường dẫn relative (uploads nội bộ)
 */
export const getFullFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

