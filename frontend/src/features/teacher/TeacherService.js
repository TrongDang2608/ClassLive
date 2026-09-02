import axiosClient from '../../utils/axiosClient';

const TeacherService = {
  // Lấy thông tin cá nhân giáo viên & thông tin trường quản lý
  getProfile: async () => {
    const response = await axiosClient.get('/teacher/profile');
    return response.data;
  },

  // Lấy dữ liệu thống kê Dashboard & biểu đồ xu hướng thực tế
  getDashboardStats: async () => {
    const response = await axiosClient.get('/teacher/dashboard-stats');
    return response.data;
  },

  // Lấy danh sách bài giảng nhận từ School Admin
  getAssignedLessons: async (page = 1, limit = 10, filters = {}) => {
    const { search = '', subject = '', grade = '' } = filters;
    const params = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
      ...(subject && { subject }),
      ...(grade && { grade })
    });
    const response = await axiosClient.get(`/teacher/lessons?${params.toString()}`);
    return response.data;
  },

  // Lấy chi tiết bài giảng và toàn bộ file đính kèm
  getLessonDetail: async (lessonId) => {
    const response = await axiosClient.get(`/teacher/lessons/${lessonId}`);
    return response.data;
  }
};

export default TeacherService;
