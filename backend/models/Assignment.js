class Assignment {
  constructor(id, data) {
    this.id = id;
    this.lessonId = data.lessonId;
    this.studentId = data.studentId;
    this.instructorId = data.instructorId;
    this.status = data.status || 'pending'; // 'pending' | 'completed'
    this.assignedAt = data.assignedAt || Date.now();
    this.completedAt = data.completedAt || null;
  }
}

module.exports = Assignment;
