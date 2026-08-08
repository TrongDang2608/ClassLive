import axiosClient from '../../utils/axiosClient';

const ChatService = {
  // Lấy danh bạ (danh sách người có thể chat)
  getContacts: async () => {
    const response = await axiosClient.get('/chat/contacts');
    return response.data;
  },

  // Lấy lịch sử chat với 1 người cụ thể
  getMessages: async (partnerId) => {
    const response = await axiosClient.get(`/chat/messages/${partnerId}`);
    return response.data;
  }
};

export default ChatService;
