import axiosClient from '../../utils/axiosClient';

const AuthService = {
  login: async (username, password) => {
    const response = await axiosClient.post('/auth/login', { username, password });
    return response.data;
  },

  validateOtp: async (userId, accessCode) => {
    const response = await axiosClient.post('/auth/validateAccessCode', { userId, accessCode });
    return response.data;
  },
  
  setupAccount: async (userId, username, password) => {
    const response = await axiosClient.post('/auth/setup-account', { userId, username, password });
    return response.data;
  },

  logout: async (refreshToken) => {
    const response = await axiosClient.post('/auth/logout', { refreshToken });
    return response.data;
  }
};

export default AuthService;
