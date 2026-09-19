import axiosClient from '../../utils/axiosClient';

const TenantService = {
  // === PROFILE & DASHBOARD ===
  getProfile: async () => {
    const res = await axiosClient.get('/tenant/profile');
    return res.data;
  },

  getDashboardStats: async () => {
    const res = await axiosClient.get('/tenant/dashboard-stats');
    return res.data;
  },

  // === LESSON MANAGEMENT & DIRECT S3 UPLOADS ===
  getPresignedUploadUrl: async ({ fileName, mimeType, lessonId }) => {
    const res = await axiosClient.post('/tenant/lessons/presigned-upload-url', {
      fileName,
      mimeType,
      lessonId
    });
    return res.data;
  },

  uploadDirectToS3: async (uploadUrl, file, onProgress) => {
    // Gửi trực tiếp HTTP PUT lên MinIO S3 bằng fetch/XHR không qua axiosClient để tránh dính Authorization header của BE
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(true);
        } else {
          reject(new Error(`Upload lên MinIO thất bại với mã lỗi ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Lỗi mạng khi upload file lên MinIO S3'));
      xhr.send(file);
    });
  },

  getLessons: async (page = 1, limit = 10) => {
    const res = await axiosClient.get(`/tenant/lessons?page=${page}&limit=${limit}`);
    return res.data;
  },

  getLessonDetails: async (id) => {
    const res = await axiosClient.get(`/tenant/lessons/${id}`);
    return res.data;
  },

  createLesson: async (payload) => {
    // Hỗ trợ cả JSON object lẫn FormData
    const isFormData = payload instanceof FormData;
    const res = await axiosClient.post('/tenant/lessons', payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }
    });
    return res.data;
  },

  updateLesson: async (id, payload) => {
    const isFormData = payload instanceof FormData;
    const res = await axiosClient.put(`/tenant/lessons/${id}`, payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }
    });
    return res.data;
  },

  deleteLesson: async (id) => {
    const res = await axiosClient.delete(`/tenant/lessons/${id}`);
    return res.data;
  },

  // === ASSIGNMENTS & SCHOOL ADMINS ===
  getSchoolAdmins: async () => {
    const res = await axiosClient.get('/tenant/school-admins');
    return res.data;
  },

  assignLessonToSchools: async (lessonId, schoolAdminIds) => {
    const res = await axiosClient.post(`/tenant/lessons/${lessonId}/assign`, { schoolAdminIds });
    return res.data;
  },

  getLessonAssignments: async (lessonId) => {
    const res = await axiosClient.get(`/tenant/lessons/${lessonId}/assignments`);
    return res.data;
  },

  revokeAssignment: async (assignmentId) => {
    const res = await axiosClient.delete(`/tenant/assignments/${assignmentId}`);
    return res.data;
  },

  revokeLessonAssignment: async (assignmentId) => {
    const res = await axiosClient.delete(`/tenant/assignments/${assignmentId}`);
    return res.data;
  },

  // === CHAT SYSTEM CONTACTS ===
  getChatContacts: async () => {
    const res = await axiosClient.get('/tenant/chat-contacts');
    return res.data;
  }
};

export default TenantService;
