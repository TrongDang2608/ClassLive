class CreateTeacherDto {
  constructor(data) {
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
  }

  validate() {
    if (!this.name || !this.name.trim()) {
      throw new Error('Họ và tên Giáo viên không được để trống.');
    }
    if (!this.email || !this.email.includes('@')) {
      throw new Error('Email Giáo viên không hợp lệ.');
    }
    if (!this.phone) {
      throw new Error('Số điện thoại Giáo viên không được để trống.');
    }
  }
}

class AssignLessonToTeachersDto {
  constructor(data) {
    this.lessonId = data.lessonId;
    this.teacherIds = data.teacherIds;
  }

  validate() {
    if (!this.lessonId) {
      throw new Error('Thiếu ID bài giảng cần phân bổ.');
    }
    if (!Array.isArray(this.teacherIds) || this.teacherIds.length === 0) {
      throw new Error('Vui lòng chọn ít nhất 1 Giáo viên để cấp quyền.');
    }
  }
}

module.exports = {
  CreateTeacherDto,
  AssignLessonToTeachersDto
};
