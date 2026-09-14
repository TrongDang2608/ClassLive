const AppError = require('../utils/AppError');

class CreateLessonDto {
  constructor(data) {
    this.title = data.title;
    this.description = data.description || '';
    this.subject = data.subject || '';
    this.grade = data.grade || '';
    this.content = data.content || '';
    this.files = data.files || [];
  }

  validate() {
    if (!this.title || typeof this.title !== 'string' || this.title.trim() === '') {
      throw new AppError('Tiêu đề bài giảng là bắt buộc.', 400);
    }
  }
}

class UpdateLessonDto {
  constructor(data) {
    this.title = data.title;
    this.description = data.description;
    this.subject = data.subject;
    this.grade = data.grade;
    this.content = data.content;
    this.files = data.files;
    this.existingFiles = data.existingFiles;
  }

  validate() {
    if (this.title !== undefined && (typeof this.title !== 'string' || this.title.trim() === '')) {
      throw new AppError('Tiêu đề bài giảng không được để trống.', 400);
    }
  }

  toUpdateData() {
    const updateData = {};
    if (this.title !== undefined) updateData.title = this.title.trim();
    if (this.description !== undefined) updateData.description = this.description;
    if (this.subject !== undefined) updateData.subject = this.subject;
    if (this.grade !== undefined) updateData.grade = this.grade;
    if (this.content !== undefined) updateData.content = this.content;
    return updateData;
  }
}

class AssignLessonDto {
  constructor(data) {
    this.schoolAdminIds = data.schoolAdminIds;
  }

  validate() {
    if (!Array.isArray(this.schoolAdminIds) || this.schoolAdminIds.length === 0) {
      throw new AppError('Vui lòng chọn ít nhất một School Admin để cấp quyền.', 400);
    }
    const allStrings = this.schoolAdminIds.every(id => typeof id === 'string' && id.trim() !== '');
    if (!allStrings) {
      throw new AppError('Danh sách School Admin ID không hợp lệ.', 400);
    }
  }
}

class GetLessonsQueryDto {
  constructor(query) {
    this.page = parseInt(query.page, 10) || 1;
    this.limit = parseInt(query.limit, 10) || 10;
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
  CreateLessonDto,
  UpdateLessonDto,
  AssignLessonDto,
  GetLessonsQueryDto
};
