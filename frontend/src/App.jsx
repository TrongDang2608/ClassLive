import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import OtpPage from './features/auth/OtpPage';
import SetupAccountPage from './features/auth/SetupAccountPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/ResetPasswordPage';
import AdminDashboard from './features/admin/AdminDashboard';
import TenantDashboard from './features/tenant/TenantDashboard';
import SchoolDashboard from './features/school/SchoolDashboard';
import TeacherDashboard from './features/teacher/TeacherDashboard';
import { Toaster } from 'react-hot-toast';
import PrivateRoute from './features/auth/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '10px',
            background: '#ffffff',
            color: '#1B4D3E',
            fontWeight: '500',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            border: '1px solid rgba(27, 77, 62, 0.15)'
          }
        }} 
      />
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/setup-account" element={<SetupAccountPage />} />
        
        {/* Forgot & Reset Password (Hỗ trợ cả dấu gạch ngang và gạch dưới) */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/forgot_password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/reset_password" element={<ResetPasswordPage />} />
        
        {/* Dashboard Routes (Protected) */}
        <Route 
          path="/admin" 
          element={
            <PrivateRoute requiredRole="admin">
              <AdminDashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/tenant" 
          element={
            <PrivateRoute requiredRole="tenant_admin">
              <TenantDashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/school-admin" 
          element={
            <PrivateRoute requiredRole="school_admin">
              <SchoolDashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/teacher" 
          element={
            <PrivateRoute requiredRole="teacher">
              <TeacherDashboard />
            </PrivateRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
