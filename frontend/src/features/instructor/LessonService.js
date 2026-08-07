import axiosClient from '../../utils/axiosClient';

const LessonService = {
  // Lấy danh sách bài giảng (phân trang)
  getLessons: async (page = 1, limit = 10) => {
    const response = await axiosClient.get(`/lessons?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Tạo bài giảng mới (Hỗ trợ upload file qua FormData)
  createLesson: async (formData) => {
    const response = await axiosClient.post('/lessons', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Sửa bài giảng (Hỗ trợ upload file qua FormData)
  updateLesson: async (id, data) => {
    const response = await axiosClient.put(`/lessons/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Xóa bài giảng
  deleteLesson: async (id) => {
    const response = await axiosClient.delete(`/lessons/${id}`);
    return response.data;
  },

  // Giao bài cho danh sách học viên
  assignLesson: async (lessonId, studentIds) => {
    const response = await axiosClient.post(`/lessons/${lessonId}/assign`, { studentIds });
    return response.data;
  }
};

export default LessonService;
