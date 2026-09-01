const chatRepository = require('../repositories/chatRepository');
const { getFirestore } = require('firebase-admin/firestore');
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
    const db = getFirestore();
    let contactIds = new Set();

    if (role === 'student') {
      // 1. Tìm các assignments của học sinh này
      const assignmentsSnap = await db.collection('assignments')
        .where('studentId', '==', userId)
        .get();
      
      const lessonIds = assignmentsSnap.docs.map(doc => doc.data().lessonId);
      
      if (lessonIds.length > 0) {
        // 2. Tìm các lessons có lessonId trong danh sách (Firestore in giới hạn 10, chia nhỏ nếu cần, nhưng ta dùng vòng lặp cho an toàn)
        // Vì Firestore mảng 'in' tối đa 10, ta query thủ công hoặc query từng phần.
        // Tối ưu hơn: Lấy toàn bộ lessons rồi filter (hoặc ngược lại)
        // Dễ nhất: 
        const instructorIdsSet = new Set();
        // Lấy tất cả lessons (nếu db nhỏ), hoặc query 'in' cho chunk 10.
        // Để an toàn, lấy tất cả lessons rồi check
        const lessonsSnap = await db.collection('lessons').get();
        lessonsSnap.docs.forEach(doc => {
          if (lessonIds.includes(doc.id)) {
            instructorIdsSet.add(doc.data().createdBy); // Schema dùng createdBy
          }
        });
        contactIds = instructorIdsSet;
      }

    } else if (role === 'instructor') {
      // 1. Tìm các lessons của giảng viên này
      const lessonsSnap = await db.collection('lessons')
        .where('createdBy', '==', userId)
        .get();
      
      const lessonIds = lessonsSnap.docs.map(doc => doc.id);

      if (lessonIds.length > 0) {
        // 2. Tìm assignments có lessonId thuộc lessonIds này
        const assignmentsSnap = await db.collection('assignments').get();
        assignmentsSnap.docs.forEach(doc => {
          if (lessonIds.includes(doc.data().lessonId)) {
            contactIds.add(doc.data().studentId);
          }
        });
      }
    } else if (role === 'tenant_admin') {
      // Lấy các school admin đã được Tenant Admin này giao bài
      const assignmentsSnap = await db.collection('assignments')
        .where('tenantAdminId', '==', userId)
        .get();
      assignmentsSnap.docs.forEach(doc => {
        const data = doc.data();
        if (data.schoolAdminId) contactIds.add(data.schoolAdminId);
      });
    } else if (role === 'school_admin') {
      // Lấy các tenant admin đã giao bài cho school admin này
      const assignmentsSnap = await db.collection('assignments')
        .where('schoolAdminId', '==', userId)
        .get();
      assignmentsSnap.docs.forEach(doc => {
        const data = doc.data();
        if (data.tenantAdminId) contactIds.add(data.tenantAdminId);
      });
      // Lấy các Giáo viên thuộc trường này
      const teachersSnap = await db.collection('users')
        .where('role', '==', 'teacher')
        .where('createdBy', '==', userId)
        .get();
      teachersSnap.docs.forEach(doc => contactIds.add(doc.id));
    } else if (role === 'teacher') {
      // Lấy School Admin đã tạo ra giáo viên này
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists && userDoc.data().createdBy) {
        contactIds.add(userDoc.data().createdBy);
      }
    }

    if (contactIds.size === 0) return [];

    // Lấy thông tin user của các contactIds
    const contacts = [];
    const usersSnap = await db.collection('users').get();
    
    // Tối ưu: map các contactId qua list users
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

    // Lấy tin nhắn cuối cùng (preview) và tính số tin chưa đọc (có thể nâng cấp sau)
    for (let contact of contacts) {
      const roomId = this.getRoomId(userId, contact.id);
      const lastMessage = await chatRepository.getLastMessageByRoomId(roomId);
      contact.lastMessage = lastMessage || null;
      contact.unreadCount = 0; // Tương lai: Count tin nhắn isRead = false & receiverId = userId
    }

    // Sort contacts by lastMessage createdAt descending
    contacts.sort((a, b) => {
      const timeA = a.lastMessage ? a.lastMessage.createdAt : 0;
      const timeB = b.lastMessage ? b.lastMessage.createdAt : 0;
      return timeB - timeA;
    });

    return contacts;
  }
}

module.exports = new ChatService();
