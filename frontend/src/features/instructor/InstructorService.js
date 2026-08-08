import axiosClient from '../../utils/axiosClient';

const InstructorService = {
  getUsers: async (role, page = 1, limit = 10) => {
    let url = `/instructor/students?page=${page}&limit=${limit}`;
    if (role) url += `&role=${role}`;
    
    const response = await axiosClient.get(url);
    return response.data;
  },

  addUser: async (userData) => {
    const response = await axiosClient.post('/instructor/addStudent', userData);
    return response.data;
  },

  editUser: async (identifier, userData) => {
    const response = await axiosClient.put(`/instructor/editStudent/${identifier}`, userData);
    return response.data;
  },

  deleteUser: async (identifier) => {
    const response = await axiosClient.delete(`/instructor/student/${identifier}`);
    return response.data;
  },

  getProfile: async () => {
    const response = await axiosClient.get('/instructor/profile');
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await axiosClient.get('/instructor/dashboard-stats');
    return response.data;
  }
};

export default InstructorService;
