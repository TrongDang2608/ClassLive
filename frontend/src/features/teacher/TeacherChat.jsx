import React from 'react';
import ChatLayout from '../chat/ChatLayout';
import './teacher.css';

const TeacherChat = ({ currentUser }) => {
  return (
    <div style={{
      height: 'calc(100vh - 140px)',
      minHeight: '540px',
      background: '#FFFFFF',
      borderRadius: '16px',
      border: '1px solid var(--border-color)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-md)'
    }}>
      <ChatLayout currentUser={currentUser} />
    </div>
  );
};

export default TeacherChat;
