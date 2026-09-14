class Message {
  constructor(id, data = {}) {
    this.id = id;
    this.roomId = data.roomId;
    this.senderId = data.senderId;
    this.receiverId = data.receiverId;
    this.content = data.content;
    this.createdAt = data.createdAt || Date.now();
    this.isRead = data.isRead !== undefined ? data.isRead : false;
  }

  toFirestore() {
    return {
      roomId: this.roomId,
      senderId: this.senderId,
      receiverId: this.receiverId,
      content: this.content,
      createdAt: this.createdAt,
      isRead: this.isRead
    };
  }
}

module.exports = Message;
