const { getFirestore } = require('firebase-admin/firestore');
const RefreshToken = require('../models/RefreshToken');

class RefreshTokenRepository {
  constructor() {
    this.db = getFirestore();
    this.collection = this.db.collection('refreshTokens');
  }

  // Lưu Refresh Token vào Database
  async save(userId, token, expiresAt) {
    const refreshTokenInstance = new RefreshToken(token, {
      userId,
      token,
      expiresAt,
      createdAt: Date.now()
    });
    const docRef = this.collection.doc(token);
    await docRef.set(refreshTokenInstance.toFirestore());
    return refreshTokenInstance;
  }

  // Tìm Refresh Token trong Database
  async findByToken(token) {
    const docRef = this.collection.doc(token);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    
    const tokenInstance = new RefreshToken(doc.id, doc.data());
    
    // Kiểm tra hết hạn
    if (tokenInstance.isExpired()) {
      await this.deleteByToken(token); // Xóa nếu hết hạn
      return null;
    }
    
    return tokenInstance;
  }

  // Xóa Refresh Token khi Logout
  async deleteByToken(token) {
    await this.collection.doc(token).delete();
  }
}

module.exports = new RefreshTokenRepository();
