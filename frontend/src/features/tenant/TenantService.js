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

  // === LESSON MANAGEMENT ===
  getLessons: async (page = 1, limit = 10) => {
    const res = await axiosClient.get(`/tenant/lessons?page=${page}&limit=${limit}`);
    return res.data;
  },

  getLessonDetails: async (id) => {
    const res = await axiosClient.get(`/tenant/lessons/${id}`);
    return res.data;
  },

  createLesson: async (formData) => {
    const res = await axiosClient.post('/tenant/lessons', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },

  updateLesson: async (id, formData) => {
    const res = await axiosClient.put(`/tenant/lessons/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
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

  // === CHAT SYSTEM CONTACTS ===
  getChatContacts: async () => {
    const res = await axiosClient.get('/tenant/chat-contacts');
    return res.data;
  }
};

export default TenantService;
