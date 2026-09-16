const jwt = require('jsonwebtoken');
const cacheService = require('../services/cacheService');

exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Không tìm thấy Access Token' });
  }

  const token = authHeader.split(' ')[1];

  // 1. Kiểm tra Token Blacklist trong Redis (nếu user đã Logout hoặc Reset Password)
  try {
    const isBlacklisted = await cacheService.exists(`classlive:token:blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Phiên đăng nhập đã bị thu hồi. Vui lòng đăng nhập lại.' });
    }
  } catch (err) {
    // Nếu Redis lỗi/offline, bỏ qua và tiếp tục verify JWT
  }

  // 2. Giải mã và kiểm tra hạn của JWT
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains id and role
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Access Token đã hết hạn' });
    }
    return res.status(401).json({ error: 'Access Token không hợp lệ' });
  }
};

exports.requireTeacher = (req, res, next) => {
  if (!req.user || req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Chỉ Giáo viên mới có quyền thực hiện hành động này' });
  }
  next();
};

// Hàm đa phân quyền (Dành cho mô hình 4 Roles: admin, tenant_admin, school_admin, teacher)
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Bạn không có quyền truy cập. Yêu cầu Role: ${roles.join(' hoặc ')}` 
      });
    }
    next();
  };
};
