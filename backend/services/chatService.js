const chatRepository = require('../repositories/chatRepository');
const { getFirestore } = require('firebase-admin/firestore');
const cacheService = require('./cacheService');
const AppError = require('../utils/AppError');

class ChatService {
  getRoomId(user1, user2) {
    const sorted = [user1, user2].sort();
    return `room_${sorted[0]}_${sorted[1]}`;
  }

  async getMessages(userId, partnerId) {
    const roomId = this.getRoomId(userId, partnerId);
    return await chatRepository.getMessagesByRoomId(roomId);
  }

  async getContacts(userId, role) {
    const cacheKey = `classlive:chat:contacts:${userId}:${role}`;
    return await cacheService.remember(cacheKey, 300, async () => {
      const db = getFirestore();
      let contactIds = new Set();

      if (role === 'student') {
        const assignmentsSnap = await db.collection('assignments')
          .where('studentId', '==', userId)
          .get();
        
        const lessonIds = assignmentsSnap.docs.map(doc => doc.data().lessonId);
        
        if (lessonIds.length > 0) {
          const instructorIdsSet = new Set();
          const lessonsSnap = await db.collection('lessons').get();
          lessonsSnap.docs.forEach(doc => {
            if (lessonIds.includes(doc.id)) {
              instructorIdsSet.add(doc.data().createdBy);
            }
          });
          contactIds = instructorIdsSet;
        }

      } else if (role === 'instructor') {
        const lessonsSnap = await db.collection('lessons')
          .where('createdBy', '==', userId)
          .get();
        
        const lessonIds = lessonsSnap.docs.map(doc => doc.id);

        if (lessonIds.length > 0) {
          const assignmentsSnap = await db.collection('assignments').get();
          assignmentsSnap.docs.forEach(doc => {
            if (lessonIds.includes(doc.data().lessonId)) {
              contactIds.add(doc.data().studentId);
            }
          });
        }
      } else if (role === 'tenant_admin') {
        const assignmentsSnap = await db.collection('assignments')
          .where('tenantAdminId', '==', userId)
          .get();
        assignmentsSnap.docs.forEach(doc => {
          const data = doc.data();
          if (data.schoolAdminId) contactIds.add(data.schoolAdminId);
        });
      } else if (role === 'school_admin') {
        const assignmentsSnap = await db.collection('assignments')
          .where('schoolAdminId', '==', userId)
          .get();
        assignmentsSnap.docs.forEach(doc => {
          const data = doc.data();
          if (data.tenantAdminId) contactIds.add(data.tenantAdminId);
        });
        const teachersSnap = await db.collection('users')
          .where('role', '==', 'teacher')
          .where('createdBy', '==', userId)
          .get();
        teachersSnap.docs.forEach(doc => contactIds.add(doc.id));
      } else if (role === 'teacher') {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists && userDoc.data().createdBy) {
          contactIds.add(userDoc.data().createdBy);
        }
      }

      if (contactIds.size === 0) return [];

      const contacts = [];
      const usersSnap = await db.collection('users').get();
      
      usersSnap.docs.forEach(doc => {
        if (contactIds.has(doc.id)) {
          const data = doc.data();
          contacts.push({
            id: doc.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: data.role
          });
        }
      });

      for (let contact of contacts) {
        const roomId = this.getRoomId(userId, contact.id);
        const lastMessage = await chatRepository.getLastMessageByRoomId(roomId);
        contact.lastMessage = lastMessage || null;
        contact.unreadCount = 0;
      }

      contacts.sort((a, b) => {
        const timeA = a.lastMessage ? a.lastMessage.createdAt : 0;
        const timeB = b.lastMessage ? b.lastMessage.createdAt : 0;
        return timeB - timeA;
      });

      return contacts;
    });
  }
}

module.exports = new ChatService();
