import React, { useState, useEffect } from 'react';
import { Search, Loader2, MessageSquare } from 'lucide-react';
import ChatService from './ChatService';
import ChatWindow from './ChatWindow';
import { connectSocket, disconnectSocket, getSocket } from '../../utils/socketClient';
import toast from 'react-hot-toast';

const ChatLayout = ({ currentUser }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({}); // { contactId: count }

  useEffect(() => {
    // 1. Lấy danh bạ khi mở Chat
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const response = await ChatService.getContacts();
        setContacts(response.data || []);
      } catch (error) {
        console.error('Lỗi lấy danh bạ chat:', error);
        toast.error('Không thể lấy danh bạ');
      } finally {
        setLoading(false);
      }
    };
    
    fetchContacts();

    // 2. Kết nối Socket an toàn
    const token = localStorage.getItem('token');
    if (token) {
      connectSocket(token);
    }

    return () => {
      disconnectSocket();
    };
  }, []); // Chỉ chạy 1 lần khi mount

  // 3. Lắng nghe tin nhắn mới để cập nhật danh bạ
  const lastMsgRef = React.useRef(null); // Tránh trùng lặp do socket bắn nhiều sự kiện

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (msg) => {
      // Chặn trùng lặp tin nhắn (cùng 1 tin nhắn không được đếm 2 lần)
      if (lastMsgRef.current === msg.id) return;
      lastMsgRef.current = msg.id;

      setContacts(prev => {
        const newContacts = [...prev];
        const contactId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
        const index = newContacts.findIndex(c => c.id === contactId);
        
        if (index !== -1) {
          const contact = { ...newContacts[index], lastMessage: msg };
          // Đưa liên hệ có tin nhắn mới lên đầu
          newContacts.splice(index, 1);
          newContacts.unshift(contact);
        }
        return newContacts;
      });

      // Đưa setUnreadCounts ra ngoài updater function của setContacts để tránh bị React StrictMode gọi 2 lần
      const contactId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
      if (msg.senderId !== currentUser.id) {
        setUnreadCounts(counts => {
          const currentSelectedId = selectedPartner?.id;
          if (currentSelectedId !== contactId) {
            return { ...counts, [contactId]: (counts[contactId] || 0) + 1 };
          }
          return counts;
        });
      }
    };
    
    socket.on('receive_message', handleNewMessage);
    return () => {
      socket.off('receive_message', handleNewMessage);
    };
  }, [currentUser, selectedPartner]); // Update khi selectedPartner thay đổi

  const handleSelectPartner = (contact) => {
    setSelectedPartner(contact);
    // Reset unread count
    setUnreadCounts(prev => ({ ...prev, [contact.id]: 0 }));
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', height: '100%', width: '100%', background: 'var(--white)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
      
      {/* Cột trái: Danh bạ */}
      <div style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-warm)' }}>
        
        {/* Header & Search */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', background: 'var(--white)' }}>
          <h2 style={{ fontSize: '20px', color: 'var(--primary)', fontWeight: '700', marginBottom: '16px' }}>Tin Nhắn</h2>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Tìm kiếm liên hệ..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 36px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '14px',
                background: 'var(--bg-warm)'
              }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>

        {/* Contact List */}
        <div style={{ flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
          {loading ? (
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
              <Loader2 size={24} className="animate-spin" color="var(--text-muted)" />
            </div>
          ) : filteredContacts.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
              Không tìm thấy liên hệ nào.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredContacts.map(contact => {
                const isSelected = selectedPartner?.id === contact.id;
                return (
                  <div 
                    key={contact.id}
                    onClick={() => handleSelectPartner(contact)}
                    style={{
                      padding: '16px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--white)' : 'transparent',
                      borderLeft: isSelected ? '4px solid var(--gold)' : '4px solid transparent',
                      transition: 'all 0.2s',
                      borderBottom: '1px solid rgba(0,0,0,0.02)'
                    }}
                    onMouseEnter={e => !isSelected && (e.currentTarget.style.background = 'rgba(255,255,255,0.5)')}
                    onMouseLeave={e => !isSelected && (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gold-glow)', color: 'var(--gold-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                        {contact.name?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ position: 'absolute', bottom: 2, right: 2, width: '10px', height: '10px', background: 'var(--success)', borderRadius: '50%', border: '2px solid var(--white)' }}></div>
                    </div>
                    
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: (unreadCounts[contact.id] > 0 || isSelected) ? '700' : '500', color: (unreadCounts[contact.id] > 0) ? '#000' : 'var(--primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {contact.name}
                        </span>
                        {contact.lastMessage && (
                          <span style={{ fontSize: '11px', color: (unreadCounts[contact.id] > 0) ? '#1877F2' : 'var(--text-muted)', fontWeight: (unreadCounts[contact.id] > 0) ? '600' : 'normal' }}>
                            {new Date(contact.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '13px', color: (unreadCounts[contact.id] > 0) ? '#000' : 'var(--text-secondary)', fontWeight: (unreadCounts[contact.id] > 0) ? '600' : 'normal', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, paddingRight: '8px' }}>
                          {contact.lastMessage ? (
                            contact.lastMessage.senderId === currentUser.id 
                              ? `Bạn: ${contact.lastMessage.content}`
                              : contact.lastMessage.content
                          ) : 'Chưa có tin nhắn'}
                        </div>
                        {unreadCounts[contact.id] > 0 && (
                          <div style={{ background: '#E41E3F', color: '#FFF', fontSize: '11px', fontWeight: 'bold', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {unreadCounts[contact.id]}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cột phải: Khung Chat */}
      <div style={{ background: 'var(--bg-warm)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {selectedPartner ? (
          <ChatWindow partner={selectedPartner} currentUser={currentUser} />
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <MessageSquare size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '18px', color: 'var(--text)', marginBottom: '8px' }}>Chat Trực Tuyến</h3>
            <p style={{ fontSize: '14px' }}>Chọn một liên hệ từ danh bạ bên trái để bắt đầu nhắn tin.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default ChatLayout;
