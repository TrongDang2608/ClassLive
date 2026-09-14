const AppError = require('../utils/AppError');

class GetTeacherLessonsQueryDto {
  constructor(query = {}) {
    const rawPage = query.page !== undefined ? parseInt(query.page, 10) : 1;
    this.page = isNaN(rawPage) ? 1 : rawPage;

    const rawLimit = query.limit !== undefined ? parseInt(query.limit, 10) : 10;
    this.limit = isNaN(rawLimit) ? 10 : rawLimit;

    this.search = query.search ? String(query.search).trim() : '';
    this.subject = query.subject ? String(query.subject).trim() : '';
    this.grade = query.grade ? String(query.grade).trim() : '';
  }

  validate() {
    if (this.page < 1) {
      throw new AppError('Số trang (page) phải lớn hơn hoặc bằng 1.', 400);
    }
    if (this.limit < 1 || this.limit > 100) {
      throw new AppError('Số lượng (limit) phải từ 1 đến 100.', 400);
    }
  }
}

module.exports = {
  GetTeacherLessonsQueryDto
};
