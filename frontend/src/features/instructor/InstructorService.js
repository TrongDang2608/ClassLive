import axiosClient from '../../utils/axiosClient';

const InstructorService = {
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
