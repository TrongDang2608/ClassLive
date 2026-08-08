const instructorService = require('../services/instructorService');
const catchAsync = require('../utils/catchAsync');

class InstructorController {
  addStudent = catchAsync(async (req, res, next) => {
    // Yêu cầu gốc là addStudent nhưng ta viết service hỗ trợ addUser để tạo được cả Instructor
    const result = await instructorService.addUser(req.body);
    res.status(201).json({ success: true, data: result });
  });

  getStudents = catchAsync(async (req, res, next) => {
    const roleFilter = req.query.role || 'student';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const result = await instructorService.getUsers(roleFilter, page, limit);
    res.status(200).json({ success: true, ...result });
  });

  getStudent = catchAsync(async (req, res, next) => {
    const { identifier } = req.params; // Có thể là phone hoặc id
    const result = await instructorService.getUser(identifier);
    res.status(200).json({ success: true, data: result });
  });

  editStudent = catchAsync(async (req, res, next) => {
    const { identifier } = req.params;
    const result = await instructorService.editUser(identifier, req.body);
    res.status(200).json(result);
  });

  deleteStudent = catchAsync(async (req, res, next) => {
    const { identifier } = req.params;
    const result = await instructorService.deleteUser(identifier);
    res.status(200).json(result);
  });

  getProfile = catchAsync(async (req, res, next) => {
    const instructorId = req.user.id;
    const userRepository = require('../repositories/userRepository');
    const user = await userRepository.findById(instructorId);
    if (!user) {
      throw new (require('../utils/AppError'))('Giảng viên không tồn tại', 404);
    }
    const { password, ...safeUser } = user;
    res.status(200).json({
      success: true,
      data: safeUser
    });
  });
}

module.exports = new InstructorController();
