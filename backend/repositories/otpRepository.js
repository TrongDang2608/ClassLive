const { getFirestore } = require('firebase-admin/firestore');
const Otp = require('../models/Otp');

class OtpRepository {
  constructor() {
    this.db = getFirestore();
    this.collection = this.db.collection('otps');
  }

  async saveOtp(identifier, code, expiresAt) {
    // Lưu với ID là identifier (SĐT hoặc Email) để dễ quản lý, mỗi người 1 OTP duy nhất cùng lúc
    await this.collection.doc(identifier).set({
      identifier,
      code,
      expiresAt
    });
  }

  async findOtp(identifier) {
    const doc = await this.collection.doc(identifier).get();
    if (!doc.exists) return null;
    return new Otp(doc.id, doc.data());
  }

  async deleteOtp(identifier) {
    await this.collection.doc(identifier).delete();
  }
}

module.exports = new OtpRepository();
