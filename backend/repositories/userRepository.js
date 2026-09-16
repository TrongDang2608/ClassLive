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

  // Hỗ trợ lấy danh sách tài khoản theo Username hoặc Email
  async findAllByUsernameOrEmail(identifier) {
    let snapshot = await this.collection.where('username', '==', identifier).get();
    let docs = snapshot.docs;

    if (snapshot.empty) {
      snapshot = await this.collection.where('email', '==', identifier).get();
      docs = snapshot.docs;
    }
    if (!docs || docs.length === 0) return [];
    return docs.map(doc => new User(doc.id, doc.data()));
  }

  async findByUsernameOrEmail(identifier) {
    const users = await this.findAllByUsernameOrEmail(identifier);
    return users.length > 0 ? users[0] : null;
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

  async findByPhoneOrId(identifier) {
    let doc = await this.collection.doc(identifier).get();
    if (doc.exists) {
      return new User(doc.id, doc.data());
    }
    const snapshot = await this.collection.where('phone', '==', identifier).limit(1).get();
    if (!snapshot.empty) {
      return new User(snapshot.docs[0].id, snapshot.docs[0].data());
    }
    return null;
  }

  async findAll(roleFilter = null, page = 1, limit = 10) {
    let query = this.collection;
    if (roleFilter) {
      query = query.where('role', '==', roleFilter);
    }
    
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;
    if (offset > 0) {
      query = query.offset(offset);
    }
    query = query.limit(limitNum);

    const snapshot = await query.get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => new User(doc.id, doc.data()));
  }

  async countAll(roleFilter = null) {
    let query = this.collection;
    if (roleFilter) {
      query = query.where('role', '==', roleFilter);
    }
    const snapshot = await query.count().get();
    return snapshot.data().count;
  }

  async findTeachersBySchool(schoolAdminId, page = 1, limit = 10) {
    let query = this.collection
      .where('role', '==', 'teacher')
      .where('createdBy', '==', schoolAdminId);

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;
    if (offset > 0) {
      query = query.offset(offset);
    }
    query = query.limit(limitNum);

    const snapshot = await query.get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => new User(doc.id, doc.data()));
  }

  async countTeachersBySchool(schoolAdminId) {
    const snapshot = await this.collection
      .where('role', '==', 'teacher')
      .where('createdBy', '==', schoolAdminId)
      .count()
      .get();
    return snapshot.data().count;
  }

  async create(userData) {
    const docRef = await this.collection.add(userData);
    return docRef.id;
  }

  async update(id, data) {
    await this.collection.doc(id).update(data);
  }

  async delete(id) {
    await this.collection.doc(id).delete();
  }
}

module.exports = new UserRepository();
