import React from 'react';
import ChatLayout from '../chat/ChatLayout';
import './tenant.css';

const TenantChat = ({ currentUser }) => {
  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 120px)', minHeight: '500px', background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--tenant-border)', overflow: 'hidden' }}>
      <ChatLayout currentUser={currentUser} />
    </div>
  );
};

export default TenantChat;
