const jwt = require('jsonwebtoken');
const chatRepository = require('../repositories/chatRepository');
const chatService = require('../services/chatService');

// Bộ nhớ đệm lưu trữ userId -> socket.id để biết ai đang online
const onlineUsers = new Map();

module.exports = (io) => {
  // Middleware xác thực kết nối Socket bằng JWT Token
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { id, role }
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log(`User connected via socket: ${userId}`);
    
    // Gia nhập phòng cá nhân để nhận thông báo toàn cục (bất kể đang mở khung chat nào)
    socket.join(userId);

    // Lưu trạng thái online
    onlineUsers.set(userId, socket.id);
    // Broadcast cho mọi người biết user này vừa online (có thể nâng cấp báo cho room cụ thể sau)
    io.emit('user_status', { userId, status: 'online' });

    // 1. Gia nhập phòng chat riêng 1-1
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);
    });

    // 2. Xử lý gửi tin nhắn
    socket.on('send_message', async (data) => {
      // data = { receiverId, content }
      const roomId = chatService.getRoomId(userId, data.receiverId);
      
      try {
        // Lưu tin nhắn vào DB
        const message = await chatRepository.saveMessage({
          senderId: userId,
          receiverId: data.receiverId,
          content: data.content,
          roomId: roomId
        });

        // 1. Bắn tin nhắn cho phòng chat 1-1 (để người gửi nhận được xác nhận, và người nhận đang mở chat nhận được)
        // 2. Đồng thời bắn cho phòng cá nhân của người nhận (để ChatLayout cập nhật danh bạ nếu họ đang mở khung chat khác)
        // Dùng cơ chế chuỗi .to().to() của Socket.IO để tự động tránh gửi trùng lặp (nếu người nhận ở cả 2 phòng thì chỉ nhận 1 sự kiện)
        io.to(roomId).to(data.receiverId).emit('receive_message', message);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // 3. Xử lý đang gõ (Typing Indicator)
    socket.on('typing', (data) => {
      // data = { receiverId, isTyping }
      const roomId = chatService.getRoomId(userId, data.receiverId);
      // Gửi tín hiệu typing cho những người khác trong phòng (trừ người gửi)
      socket.to(roomId).emit('user_typing', {
        userId: userId,
        isTyping: data.isTyping
      });
    });

    // 4. Ngắt kết nối
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
      onlineUsers.delete(userId);
      io.emit('user_status', { userId, status: 'offline' });
    });
  });
};
