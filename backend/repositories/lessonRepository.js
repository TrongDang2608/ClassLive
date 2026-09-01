const { getFirestore } = require('firebase-admin/firestore');
const Lesson = require('../models/Lesson');
const assignmentRepository = require('./assignmentRepository');

class LessonRepository {
  constructor() {
    this.db = getFirestore();
    this.lessonsCollection = this.db.collection('lessons');
  }

  // === LESSON CRUD ===
  async findLessonById(id) {
    const doc = await this.lessonsCollection.doc(id).get();
    if (!doc.exists) return null;
    return new Lesson(doc.id, doc.data());
  }

  async findById(id) {
    return this.findLessonById(id);
  }

  async findLessonsByInstructor(instructorId, page = 1, limit = 10) {
    let query = this.lessonsCollection.where('createdBy', '==', instructorId);
    
    const offset = (page - 1) * limit;
    if (offset > 0) {
      query = query.offset(offset);
    }
    query = query.limit(limit);

    const snapshot = await query.get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => new Lesson(doc.id, doc.data()));
  }

  async countLessonsByInstructor(instructorId) {
    const snapshot = await this.lessonsCollection.where('createdBy', '==', instructorId).count().get();
    return snapshot.data().count;
  }

  async createLesson(lessonData) {
    const docRef = await this.lessonsCollection.add(lessonData);
    return docRef.id;
  }

  async updateLesson(id, data) {
    await this.lessonsCollection.doc(id).update(data);
  }

  async deleteLesson(id) {
    // 1. Xóa bài giảng
    await this.lessonsCollection.doc(id).delete();

    // 2. Cascade delete: Xóa các assignment liên quan tới bài giảng này
    await assignmentRepository.deleteByLessonId(id);
  }
}

module.exports = new LessonRepository();
