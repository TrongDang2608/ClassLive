import axiosClient from '../../utils/axiosClient';

const StudentService = {
  // Lấy danh sách bài học được giao
  getLessons: async () => {
    const response = await axiosClient.get('/student/lessons');
    return response.data;
  },

  // Đánh dấu hoàn thành bài học
  markLessonDone: async (assignmentId) => {
    const response = await axiosClient.put(`/student/lessons/${assignmentId}/done`);
    return response.data;
  },

  // Lấy thông tin cá nhân
  getProfile: async () => {
    const response = await axiosClient.get('/student/profile');
    return response.data;
  },

  // Cập nhật thông tin cá nhân
  updateProfile: async (profileData) => {
    const response = await axiosClient.put('/student/profile', profileData);
    return response.data;
  }
};

export default StudentService;
