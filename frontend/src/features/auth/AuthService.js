import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const AuthService = {
  login: async (username, password) => {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    return response.data;
  },

  validateOtp: async (userId, accessCode) => {
    const response = await axios.post(`${API_URL}/validateAccessCode`, { userId, accessCode });
    return response.data;
  },
  
  setupAccount: async (userId, username, password) => {
    const response = await axios.post(`${API_URL}/setup-account`, { userId, username, password });
    return response.data;
  }
};

export default AuthService;
