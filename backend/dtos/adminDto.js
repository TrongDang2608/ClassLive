const AppError = require('../utils/AppError');

const ALLOWED_ROLES = ['admin', 'tenant_admin', 'school_admin', 'teacher'];

class AddUserDto {
  constructor(data) {
    this.name = data.name;
    this.phone = data.phone;
    this.email = data.email || '';
    this.role = data.role || 'tenant_admin';
    this.organizationId = data.organizationId || 'root';
  }

  validate() {
    if (!this.name || typeof this.name !== 'string' || this.name.trim() === '') {
      throw new AppError('Tên người dùng là bắt buộc.', 400);
    }
    if (!this.phone || typeof this.phone !== 'string' || this.phone.trim() === '') {
      throw new AppError('Số điện thoại là bắt buộc.', 400);
    }
    // Simple phone check
    const cleanPhone = this.phone.trim();
    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
      throw new AppError('Số điện thoại không hợp lệ.', 400);
    }
    if (this.email && !this.email.includes('@')) {
      throw new AppError('Địa chỉ email không đúng định dạng.', 400);
    }
    if (!ALLOWED_ROLES.includes(this.role)) {
      throw new AppError(`Vai trò (role) không hợp lệ. Chỉ chấp nhận: ${ALLOWED_ROLES.join(', ')}`, 400);
    }
  }
}

class EditUserDto {
  constructor(data) {
    this.name = data.name;
    this.phone = data.phone;
    this.email = data.email;
    this.role = data.role;
    this.organizationId = data.organizationId;
  }

  validate() {
    const hasUpdate = this.name || this.phone || this.email || this.role || this.organizationId;
    if (!hasUpdate) {
      throw new AppError('Vui lòng cung cấp ít nhất một thông tin cần cập nhật.', 400);
    }
    if (this.role && !ALLOWED_ROLES.includes(this.role)) {
      throw new AppError(`Vai trò (role) không hợp lệ. Chỉ chấp nhận: ${ALLOWED_ROLES.join(', ')}`, 400);
    }
    if (this.email && !this.email.includes('@')) {
      throw new AppError('Địa chỉ email không đúng định dạng.', 400);
    }
  }

  toUpdateData() {
    const updateData = {};
    if (this.name !== undefined) updateData.name = this.name;
    if (this.phone !== undefined) updateData.phone = this.phone;
    if (this.email !== undefined) updateData.email = this.email;
    if (this.role !== undefined) updateData.role = this.role;
    if (this.organizationId !== undefined) updateData.organizationId = this.organizationId;
    return updateData;
  }
}

class GetUsersQueryDto {
  constructor(query) {
    this.role = query.role || null;
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
    if (this.role && !ALLOWED_ROLES.includes(this.role)) {
      throw new AppError(`Bộ lọc role không hợp lệ.`, 400);
    }
  }
}

module.exports = {
  AddUserDto,
  EditUserDto,
  GetUsersQueryDto
};
