import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import OtpPage from './features/auth/OtpPage';
import StudentDashboard from './features/student/StudentDashboard';
import InstructorDashboard from './features/instructor/InstructorDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/otp" element={<OtpPage />} />
        
        {/* Dashboard Routes */}
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/instructor" element={<InstructorDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
