class TeacherAssignment {
  constructor(id, data = {}) {
    this.id = id;
    this.lessonId = data.lessonId;
    this.schoolAdminId = data.schoolAdminId;
    this.teacherId = data.teacherId;
    this.assignedAt = data.assignedAt || Date.now();
  }

  toFirestore() {
    return {
      lessonId: this.lessonId,
      schoolAdminId: this.schoolAdminId,
      teacherId: this.teacherId,
      assignedAt: this.assignedAt
    };
  }
}

module.exports = TeacherAssignment;
