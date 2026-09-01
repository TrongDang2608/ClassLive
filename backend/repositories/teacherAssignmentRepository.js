const { getFirestore } = require('firebase-admin/firestore');

class TeacherAssignmentRepository {
  constructor() {
    this.db = getFirestore();
    this.collection = this.db.collection('teacher_assignments');
  }

  async createBatchAssignments(assignmentsList) {
    const batch = this.db.batch();
    const createdDocs = [];

    assignmentsList.forEach(assign => {
      const docRef = this.collection.doc();
      const docData = {
        lessonId: assign.lessonId,
        schoolAdminId: assign.schoolAdminId,
        teacherId: assign.teacherId,
        assignedAt: assign.assignedAt || Date.now()
      };
      batch.set(docRef, docData);
      createdDocs.push({ id: docRef.id, ...docData });
    });

    await batch.commit();
    return createdDocs;
  }

  async findById(id) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async findByTeacherId(teacherId) {
    const snapshot = await this.collection.where('teacherId', '==', teacherId).get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async findBySchoolAdminId(schoolAdminId) {
    const snapshot = await this.collection.where('schoolAdminId', '==', schoolAdminId).get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async findByLessonAndSchool(lessonId, schoolAdminId) {
    const snapshot = await this.collection
      .where('lessonId', '==', lessonId)
      .where('schoolAdminId', '==', schoolAdminId)
      .get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async findExistingAssignment(lessonId, teacherId) {
    const snapshot = await this.collection
      .where('lessonId', '==', lessonId)
      .where('teacherId', '==', teacherId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }

  async deleteAssignment(id) {
    await this.collection.doc(id).delete();
  }

  async deleteByTeacherId(teacherId) {
    const snapshot = await this.collection.where('teacherId', '==', teacherId).get();
    if (!snapshot.empty) {
      const batch = this.db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
  }

  async countBySchoolAdminId(schoolAdminId) {
    const snapshot = await this.collection.where('schoolAdminId', '==', schoolAdminId).count().get();
    return snapshot.data().count;
  }
}

module.exports = new TeacherAssignmentRepository();
