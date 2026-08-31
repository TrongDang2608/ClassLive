const adminService = require('../services/adminService');
const catchAsync = require('../utils/catchAsync');

class AdminController {
  addUser = catchAsync(async (req, res, next) => {
    // req.user.id lấy từ jwt middleware
    const result = await adminService.addUser(req.body, req.user.id);
    res.status(201).json({ success: true, data: result });
  });

  getUsers = catchAsync(async (req, res, next) => {
    const roleFilter = req.query.role || '';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const result = await adminService.getUsers(roleFilter, page, limit);
    res.status(200).json({ success: true, ...result });
  });

  getUser = catchAsync(async (req, res, next) => {
    const { identifier } = req.params; 
    const result = await adminService.getUser(identifier);
    res.status(200).json({ success: true, data: result });
  });

  editUser = catchAsync(async (req, res, next) => {
    const { identifier } = req.params;
    const result = await adminService.editUser(identifier, req.body);
    res.status(200).json(result);
  });

  deleteUser = catchAsync(async (req, res, next) => {
    const result = await adminService.deleteUser(req.params.identifier);
    res.status(200).json(result);
  });
}

module.exports = new AdminController();
