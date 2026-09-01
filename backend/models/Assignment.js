class Assignment {
  constructor(id, data) {
    this.id = id;
    this.lessonId = data.lessonId;
    this.tenantAdminId = data.tenantAdminId;
    this.schoolAdminId = data.schoolAdminId;
    this.assignedAt = data.assignedAt || Date.now();
    this.contractId = data.contractId || null;
  }
}

module.exports = Assignment;
