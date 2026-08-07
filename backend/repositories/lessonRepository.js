const { getFirestore } = require('firebase-admin/firestore');
const Lesson = require('../models/Lesson');
const Assignment = require('../models/Assignment');

class LessonRepository {
  constructor() {
    this.db = getFirestore();
    this.lessonsCollection = this.db.collection('lessons');
    this.assignmentsCollection = this.db.collection('assignments');
  }

  // === LESSON CRUD ===
  async findLessonById(id) {
    const doc = await this.lessonsCollection.doc(id).get();
    if (!doc.exists) return null;
    return new Lesson(doc.id, doc.data());
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
    const snapshot = await this.assignmentsCollection.where('lessonId', '==', id).get();
    if (!snapshot.empty) {
      const batch = this.db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }
  }

  // === ASSIGNMENT CRUD ===
  async assignToStudents(assignmentsList) {
    const batch = this.db.batch();
    
    assignmentsList.forEach(assign => {
      // Dùng ref tự sinh ID
      const docRef = this.assignmentsCollection.doc();
      batch.set(docRef, assign);
    });

    await batch.commit();
  }

  async findAssignmentById(id) {
    const doc = await this.assignmentsCollection.doc(id).get();
    if (!doc.exists) return null;
    return new Assignment(doc.id, doc.data());
  }

  async findAssignmentsByStudent(studentId) {
    const snapshot = await this.assignmentsCollection.where('studentId', '==', studentId).get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => new Assignment(doc.id, doc.data()));
  }

  async updateAssignmentStatus(assignmentId, status, completedAt = null) {
    const data = { status };
    if (completedAt !== undefined) {
      data.completedAt = completedAt;
    }
    await this.assignmentsCollection.doc(assignmentId).update(data);
  }
}

module.exports = new LessonRepository();
