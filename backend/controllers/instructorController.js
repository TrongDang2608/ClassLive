const instructorService = require('../services/instructorService');
const catchAsync = require('../utils/catchAsync');

class InstructorController {
  getDashboardStats = catchAsync(async (req, res, next) => {
    const result = await instructorService.getDashboardStats(req.user.id);
    res.status(200).json({ success: true, data: result });
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
