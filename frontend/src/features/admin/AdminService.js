import axiosClient from '../../utils/axiosClient';

const AdminService = {
  getUsers: async (role, page = 1, limit = 10) => {
    let url = `/admin/users?page=${page}&limit=${limit}`;
    if (role) url += `&role=${role}`;
    
    const response = await axiosClient.get(url);
    return response.data;
  },

  addUser: async (userData) => {
    const response = await axiosClient.post('/admin/addUser', userData);
    return response.data;
  },

  editUser: async (identifier, userData) => {
    const response = await axiosClient.put(`/admin/editUser/${identifier}`, userData);
    return response.data;
  },

  deleteUser: async (identifier) => {
    const response = await axiosClient.delete(`/admin/user/${identifier}`);
    return response.data;
  }
};

export default AdminService;
