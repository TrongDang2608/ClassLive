const { getFirestore } = require('firebase-admin/firestore');

class RefreshTokenRepository {
  constructor() {
    this.db = getFirestore();
    this.collection = this.db.collection('refreshTokens');
  }

  // Lưu Refresh Token vào Database
  async save(userId, token, expiresAt) {
    const docRef = this.collection.doc(token);
    await docRef.set({
      userId: userId,
      token: token,
      expiresAt: expiresAt,
      createdAt: Date.now()
    });
  }

  // Tìm Refresh Token trong Database
  async findByToken(token) {
    const docRef = this.collection.doc(token);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    
    const data = doc.data();
    
    // Kiểm tra hết hạn
    if (Date.now() > data.expiresAt) {
      await this.deleteByToken(token); // Xóa nếu hết hạn
      return null;
    }
    
    return data;
  }

  // Xóa Refresh Token khi Logout
  async deleteByToken(token) {
    await this.collection.doc(token).delete();
  }
}

module.exports = new RefreshTokenRepository();
