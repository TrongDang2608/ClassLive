import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  const role = localStorage.getItem('role');

  // Nếu không có cả 2 token, chắc chắn chưa đăng nhập -> đuổi về login
  if (!token && !refreshToken) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có truyền requiredRole mà role không khớp -> cấm truy cập
  if (requiredRole && role !== requiredRole) {
    // Chuyển hướng về đúng dashboard của role đó
    if (role === 'instructor') {
      return <Navigate to="/instructor" replace />;
    } else if (role === 'student') {
      return <Navigate to="/student" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
