import axiosClient from '../../utils/axiosClient';

const SchoolService = {
  // === PROFILE & DASHBOARD ===
  getProfile: async () => {
    const res = await axiosClient.get('/school/profile');
    return res.data;
  },

  getDashboardStats: async () => {
    const res = await axiosClient.get('/school/dashboard-stats');
    return res.data;
  },

  // === LESSON MANAGEMENT (ASSIGNED BY TENANT) ===
  getAssignedLessons: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      page,
      limit,
      ...(filters.subject && filters.subject !== 'all' ? { subject: filters.subject } : {}),
      ...(filters.grade && filters.grade !== 'all' ? { grade: filters.grade } : {}),
      ...(filters.search ? { search: filters.search } : {})
    });
    const res = await axiosClient.get(`/school/lessons?${params.toString()}`);
    return res.data;
  },

  getLessonDetails: async (id) => {
    const res = await axiosClient.get(`/school/lessons/${id}`);
    return res.data;
  },

  // === TEACHER MANAGEMENT ===
  getTeachers: async (page = 1, limit = 10, search = '') => {
    const params = new URLSearchParams({
      page,
      limit,
      ...(search ? { search } : {})
    });
    const res = await axiosClient.get(`/school/teachers?${params.toString()}`);
    return res.data;
  },

  createTeacher: async (data) => {
    const res = await axiosClient.post('/school/teachers', data);
    return res.data;
  },

  updateTeacher: async (id, data) => {
    const res = await axiosClient.put(`/school/teachers/${id}`, data);
    return res.data;
  },

  deleteTeacher: async (id) => {
    const res = await axiosClient.delete(`/school/teachers/${id}`);
    return res.data;
  },

  // === LESSON ALLOCATION (SCHOOL -> TEACHERS) ===
  assignLessonToTeachers: async (lessonId, teacherIds) => {
    const res = await axiosClient.post(`/school/lessons/${lessonId}/assign`, { teacherIds });
    return res.data;
  },

  getLessonAssignments: async (lessonId) => {
    const res = await axiosClient.get(`/school/lessons/${lessonId}/assignments`);
    return res.data;
  },

  revokeTeacherAssignment: async (assignmentId) => {
    const res = await axiosClient.delete(`/school/assignments/${assignmentId}`);
    return res.data;
  },

  // === CHAT SYSTEM CONTACTS ===
  getChatContacts: async () => {
    const res = await axiosClient.get('/school/chat-contacts');
    return res.data;
  }
};

export default SchoolService;
