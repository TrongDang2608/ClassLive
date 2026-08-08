const { getFirestore } = require('firebase-admin/firestore');

class ChatRepository {
  constructor() {
    this.collection = 'messages';
  }

  getDb() {
    return getFirestore();
  }

  async saveMessage(data) {
    const db = this.getDb();
    const docRef = db.collection(this.collection).doc();
    const message = {
      id: docRef.id,
      ...data,
      createdAt: Date.now(),
      isRead: false
    };
    await docRef.set(message);
    return message;
  }

  async getMessagesByRoomId(roomId) {
    const db = this.getDb();
    const snapshot = await db.collection(this.collection)
      .where('roomId', '==', roomId)
      .orderBy('createdAt', 'asc')
      .get();
      
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => doc.data());
  }

  async getLastMessageByRoomId(roomId) {
    const db = this.getDb();
    const snapshot = await db.collection(this.collection)
      .where('roomId', '==', roomId)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
      
    if (snapshot.empty) return null;
    return snapshot.docs[0].data();
  }
}

module.exports = new ChatRepository();
