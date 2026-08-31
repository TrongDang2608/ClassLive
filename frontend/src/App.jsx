import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import OtpPage from './features/auth/OtpPage';
import SetupAccountPage from './features/auth/SetupAccountPage';
import StudentDashboard from './features/student/StudentDashboard';
import InstructorDashboard from './features/instructor/InstructorDashboard';
import AdminDashboard from './features/admin/AdminDashboard';
import PrivateRoute from './features/auth/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
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
          path="/student" 
          element={
            <PrivateRoute requiredRole="student">
              <StudentDashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/instructor" 
          element={
            <PrivateRoute requiredRole="instructor">
              <InstructorDashboard />
            </PrivateRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

