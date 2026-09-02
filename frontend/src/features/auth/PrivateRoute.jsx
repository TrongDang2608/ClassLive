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

  // Chuẩn hóa role kiểm tra (Hỗ trợ cả 'instructor' và 'teacher')
  const isTeacherRole = (r) => r === 'instructor' || r === 'teacher';
  const isTeacherRequired = requiredRole === 'instructor' || requiredRole === 'teacher';

  const isRoleMatch = isTeacherRequired ? isTeacherRole(role) : role === requiredRole;

  // Nếu có truyền requiredRole mà role không khớp -> cấm truy cập
  if (requiredRole && !isRoleMatch) {
    // Chuyển hướng về đúng dashboard của role đó
    if (role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (role === 'tenant_admin') {
      return <Navigate to="/tenant" replace />;
    } else if (role === 'school_admin') {
      return <Navigate to="/school-admin" replace />;
    } else if (isTeacherRole(role)) {
      return <Navigate to="/teacher" replace />;
    } else if (role === 'student') {
      return <Navigate to="/student" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
