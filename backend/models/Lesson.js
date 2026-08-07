class Lesson {
  constructor(id, data) {
    this.id = id;
    this.title = data.title;
    this.description = data.description || '';
    this.files = data.files || []; // [{ originalName, url }]
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt || Date.now();
  }
}

module.exports = Lesson;
