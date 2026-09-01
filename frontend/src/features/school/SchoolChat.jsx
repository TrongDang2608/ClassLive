import React from 'react';
import ChatLayout from '../chat/ChatLayout';
import './school.css';

const SchoolChat = ({ currentUser }) => {
  return (
    <div style={{ height: 'calc(100vh - 140px)', minHeight: '520px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E8E2EE', overflow: 'hidden', boxShadow: '0 4px 16px rgba(59, 24, 95, 0.05)' }}>
      <ChatLayout currentUser={currentUser} />
    </div>
  );
};

export default SchoolChat;
