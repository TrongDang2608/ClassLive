const { getFirestore } = require('firebase-admin/firestore');
const User = require('../models/User');

class UserRepository {
  constructor() {
    this.db = getFirestore();
    this.collection = this.db.collection('users');
  }

  async findById(id) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return new User(doc.id, doc.data());
  }

  async findByUsername(username) {
    const snapshot = await this.collection.where('username', '==', username).get();
    if (snapshot.empty) return null;
    return new User(snapshot.docs[0].id, snapshot.docs[0].data());
  }

  // Hỗ trợ đăng nhập cả Username và Email
  async findByUsernameOrEmail(identifier) {
    // Thử tìm theo username trước
    let snapshot = await this.collection.where('username', '==', identifier).get();
    if (snapshot.empty) {
      // Nếu không thấy, thử tìm theo email
      snapshot = await this.collection.where('email', '==', identifier).get();
    }
    if (snapshot.empty) return null;
    return new User(snapshot.docs[0].id, snapshot.docs[0].data());
  }

  async findByPhone(phone) {
    const snapshot = await this.collection.where('phone', '==', phone).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return new User(doc.id, doc.data());
  }

  async findByEmail(email) {
    const snapshot = await this.collection.where('email', '==', email).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return new User(doc.id, doc.data());
  }

  async update(id, data) {
    await this.collection.doc(id).update(data);
  }
}

module.exports = new UserRepository();
