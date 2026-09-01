const { getFirestore } = require('firebase-admin/firestore');

class AssignmentRepository {
  constructor() {
    this.db = getFirestore();
    this.collection = this.db.collection('assignments');
  }

  async createAssignments(assignmentsList) {
    const batch = this.db.batch();
    const createdDocs = [];

    assignmentsList.forEach(assign => {
      const docRef = this.collection.doc();
      const docData = {
        lessonId: assign.lessonId,
        tenantAdminId: assign.tenantAdminId,
        schoolAdminId: assign.schoolAdminId,
        assignedAt: assign.assignedAt || Date.now(),
        contractId: assign.contractId || null
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

  async findByLessonId(lessonId) {
    const snapshot = await this.collection.where('lessonId', '==', lessonId).get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async findByTenantAdminId(tenantAdminId) {
    const snapshot = await this.collection.where('tenantAdminId', '==', tenantAdminId).get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async findBySchoolAdminId(schoolAdminId) {
    const snapshot = await this.collection.where('schoolAdminId', '==', schoolAdminId).get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async findExistingAssignment(lessonId, schoolAdminId) {
    const snapshot = await this.collection
      .where('lessonId', '==', lessonId)
      .where('schoolAdminId', '==', schoolAdminId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }

  async deleteAssignment(id) {
    await this.collection.doc(id).delete();
  }

  async deleteByLessonId(lessonId) {
    const snapshot = await this.collection.where('lessonId', '==', lessonId).get();
    if (!snapshot.empty) {
      const batch = this.db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
  }

  async countByTenantAdminId(tenantAdminId) {
    const snapshot = await this.collection.where('tenantAdminId', '==', tenantAdminId).count().get();
    return snapshot.data().count;
  }
}

module.exports = new AssignmentRepository();
