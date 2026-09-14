const AppError = require('../utils/AppError');

class GetMessagesDto {
  constructor(params = {}) {
    this.partnerId = params.partnerId;
  }

  validate() {
    if (!this.partnerId || typeof this.partnerId !== 'string' || !this.partnerId.trim()) {
      throw new AppError('Thiếu ID đối tác hội thoại (partnerId).', 400);
    }
  }
}

class SendMessageDto {
  constructor(data = {}) {
    this.receiverId = data.receiverId;
    this.content = data.content;
  }

  validate() {
    if (!this.receiverId || typeof this.receiverId !== 'string' || !this.receiverId.trim()) {
      throw new AppError('Thiếu người nhận tin nhắn (receiverId).', 400);
    }
    if (!this.content || typeof this.content !== 'string' || !this.content.trim()) {
      throw new AppError('Nội dung tin nhắn không được để trống.', 400);
    }
  }
}

module.exports = {
  GetMessagesDto,
  SendMessageDto
};
