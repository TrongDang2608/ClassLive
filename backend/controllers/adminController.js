const adminService = require('../services/adminService');
const { AddUserDto, EditUserDto, GetUsersQueryDto } = require('../dtos/adminDto');
const catchAsync = require('../utils/catchAsync');

class AdminController {
  // POST /api/admin/addUser
  addUser = catchAsync(async (req, res, next) => {
    const dto = new AddUserDto(req.body);
    dto.validate();

    const result = await adminService.addUser(dto, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Tạo tài khoản người dùng thành công.',
      data: result
    });
  });

  // GET /api/admin/users
  getUsers = catchAsync(async (req, res, next) => {
    const queryDto = new GetUsersQueryDto(req.query);
    queryDto.validate();

    const result = await adminService.getUsers(queryDto.role, queryDto.page, queryDto.limit);
    res.status(200).json({
      success: true,
      ...result
    });
  });

  // GET /api/admin/user/:identifier
  getUser = catchAsync(async (req, res, next) => {
    const { identifier } = req.params; 
    const result = await adminService.getUser(identifier);
    res.status(200).json({
      success: true,
      data: result
    });
  });

  // PUT /api/admin/editUser/:identifier
  editUser = catchAsync(async (req, res, next) => {
    const { identifier } = req.params;
    const dto = new EditUserDto(req.body);
    dto.validate();

    const result = await adminService.editUser(identifier, dto.toUpdateData());
    res.status(200).json({
      success: true,
      message: result.message
    });
  });

  // DELETE /api/admin/user/:identifier
  deleteUser = catchAsync(async (req, res, next) => {
    const { identifier } = req.params;
    const result = await adminService.deleteUser(identifier);
    res.status(200).json({
      success: true,
      message: result.message
    });
  });
}

module.exports = new AdminController();
