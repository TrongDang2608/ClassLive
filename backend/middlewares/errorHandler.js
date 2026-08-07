const AppError = require('../utils/AppError');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Trong quá trình dev, in log đầy đủ
  console.error('💥 [GLOBAL ERROR]:', err);

  // Phân tích các loại lỗi cụ thể của Firebase/Node để ép về AppError (nếu cần)
  let error = { ...err };
  error.message = err.message;

  // Lỗi do chúng ta tự bắn ra (Operational Error)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  // Lỗi hệ thống hoặc lỗi do Firebase chưa biết (Programming or other unknown error)
  // Đừng trả về chi tiết stacktrace cho client để bảo mật
  return res.status(error.statusCode).json({
    success: false,
    error: error.message || 'Đã có lỗi xảy ra trên Server. Vui lòng thử lại sau.'
  });
};
