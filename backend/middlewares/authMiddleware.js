const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Không tìm thấy Access Token' });
  }

  const token = authHeader.split(' ')[1];

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

exports.requireInstructor = (req, res, next) => {
  if (!req.user || req.user.role !== 'instructor') {
    return res.status(403).json({ error: 'Chỉ Giảng viên mới có quyền thực hiện hành động này' });
  }
  next();
};
