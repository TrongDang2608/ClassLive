const AppError = require('../utils/AppError');

class CreateTeacherDto {
  constructor(data) {
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
  }

  validate() {
    if (!this.name || typeof this.name !== 'string' || !this.name.trim()) {
      throw new AppError('Họ và tên Giáo viên không được để trống.', 400);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email || typeof this.email !== 'string' || !emailRegex.test(this.email.trim())) {
      throw new AppError('Email Giáo viên không đúng định dạng.', 400);
    }
    if (!this.phone || typeof this.phone !== 'string' || !this.phone.trim()) {
      throw new AppError('Số điện thoại Giáo viên không được để trống.', 400);
    }
  }
}

class UpdateTeacherDto {
  constructor(data) {
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
  }

  validate() {
    if (this.name !== undefined && (typeof this.name !== 'string' || !this.name.trim())) {
      throw new AppError('Họ và tên Giáo viên không được để trống.', 400);
    }
    if (this.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (typeof this.email !== 'string' || !emailRegex.test(this.email.trim())) {
        throw new AppError('Email Giáo viên không đúng định dạng.', 400);
      }
    }
    if (this.phone !== undefined && (typeof this.phone !== 'string' || !this.phone.trim())) {
      throw new AppError('Số điện thoại Giáo viên không được để trống.', 400);
    }
  }

  toUpdateData() {
    const updateData = {};
    if (this.name !== undefined) updateData.name = this.name.trim();
    if (this.phone !== undefined) updateData.phone = this.phone.trim();
    if (this.email !== undefined) updateData.email = this.email.trim().toLowerCase();
    return updateData;
  }
}

class AssignLessonToTeachersDto {
  constructor(data) {
    this.lessonId = data.lessonId;
    this.teacherIds = data.teacherIds;
  }

  validate() {
    if (!this.lessonId || typeof this.lessonId !== 'string' || !this.lessonId.trim()) {
      throw new AppError('Thiếu ID bài giảng cần phân bổ.', 400);
    }
    if (!Array.isArray(this.teacherIds) || this.teacherIds.length === 0) {
      throw new AppError('Vui lòng chọn ít nhất 1 Giáo viên để cấp quyền.', 400);
    }
    const allStrings = this.teacherIds.every(id => typeof id === 'string' && id.trim() !== '');
    if (!allStrings) {
      throw new AppError('Danh sách Giáo viên ID không hợp lệ.', 400);
    }
  }
}

class GetTeachersQueryDto {
  constructor(query) {
    this.page = parseInt(query.page, 10) || 1;
    this.limit = parseInt(query.limit, 10) || 10;
    this.search = query.search || '';
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

class GetAssignedLessonsQueryDto {
  constructor(query) {
    this.page = parseInt(query.page, 10) || 1;
    this.limit = parseInt(query.limit, 10) || 10;
    this.subject = query.subject;
    this.grade = query.grade;
    this.search = query.search;
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
  CreateTeacherDto,
  UpdateTeacherDto,
  AssignLessonToTeachersDto,
  GetTeachersQueryDto,
  GetAssignedLessonsQueryDto
};
