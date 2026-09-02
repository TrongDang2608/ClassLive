import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import OtpPage from './features/auth/OtpPage';
import SetupAccountPage from './features/auth/SetupAccountPage';
import StudentDashboard from './features/student/StudentDashboard';
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
            <PrivateRoute requiredRole="instructor">
              <TeacherDashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/instructor" 
          element={<Navigate to="/teacher" replace />} 
        />
        <Route 
          path="/student" 
          element={
            <PrivateRoute requiredRole="student">
              <StudentDashboard />
            </PrivateRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

