import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { getSocket } from '../../utils/socketClient';
import ChatService from './ChatService';
import toast from 'react-hot-toast';

const ChatWindow = ({ partner, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const socket = getSocket();

  // Helper sinh Room ID đồng bộ với Backend
  const getRoomId = (u1, u2) => {
    const sorted = [u1, u2].sort();
    return `room_${sorted[0]}_${sorted[1]}`;
  };

  const roomId = getRoomId(currentUser.id, partner.id);

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Tải lịch sử tin nhắn & Join room
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await ChatService.getMessages(partner.id);
        setMessages(response.data || []);
      } catch (error) {
        console.error('Lỗi khi tải tin nhắn:', error);
        toast.error('Không thể tải lịch sử tin nhắn');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    if (socket) {
      socket.emit('join_room', roomId);
    }
  }, [partner.id, roomId, socket]);

  // 2. Lắng nghe sự kiện socket (Real-time)
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      // Chỉ nhận tin nhắn thuộc phòng hiện tại
      if (msg.roomId === roomId) {
        setMessages((prev) => {
          // Ngăn chặn hiển thị trùng lặp tin nhắn (do socket.io đôi khi emit nhiều lần qua nhiều room)
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    };

    const handleUserTyping = (data) => {
      // data = { userId, isTyping }
      if (data.userId === partner.id) {
        setIsPartnerTyping(data.isTyping);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);

    // Dọn dẹp listener khi unmount hoặc đổi partner (Gotcha: Tránh rò rỉ bộ nhớ)
    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
    };
  }, [socket, roomId, partner.id]);

  // Tự động cuộn khi messages hoặc typing thay đổi
  useEffect(() => {
    scrollToBottom();
  }, [messages, isPartnerTyping]);

  // 3. Gửi tin nhắn
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    // Bắn tin nhắn qua Socket
    socket.emit('send_message', {
      receiverId: partner.id,
      content: newMessage.trim()
    });

    // Dừng báo hiệu gõ phím ngay
    socket.emit('typing', { receiverId: partner.id, isTyping: false });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    setNewMessage('');
  };

  // 4. Xử lý gõ phím (Typing Indicator)
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (!socket) return;

    // Phát tín hiệu đang gõ
    socket.emit('typing', { receiverId: partner.id, isTyping: true });

    // Trễ 1.5 giây nếu không gõ tiếp thì báo dừng
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { receiverId: partner.id, isTyping: false });
    }, 1500);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Loader2 size={32} className="animate-spin" color="var(--gold)" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden', background: 'var(--white)' }}>
      {/* Chat Header */}
      <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gold-glow)', color: 'var(--gold-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' }}>
          {partner.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: '600', color: 'var(--primary)' }}>{partner.name}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{partner.email}</div>
        </div>
      </div>

      {/* Messages List Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-warm)' }} className="custom-scrollbar">
        {messages.length === 0 ? (
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '14px', fontStyle: 'italic' }}>
            Bắt đầu cuộc trò chuyện mới...
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div 
                key={msg.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: isMe ? 'flex-end' : 'flex-start',
                  width: '100%' 
                }}
              >
                <div style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isMe ? 'var(--gold)' : 'var(--white)',
                  color: isMe ? 'var(--white)' : 'var(--text)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  wordBreak: 'break-word'
                }}>
                  {msg.content}
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicator Bubble */}
        {isPartnerTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
            <div style={{
              padding: '10px 16px',
              borderRadius: '16px 16px 16px 4px',
              background: 'var(--white)',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              fontStyle: 'italic',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span className="animate-pulse" style={{ display: 'inline-block', width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%' }}></span>
              <span className="animate-pulse" style={{ display: 'inline-block', width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%', animationDelay: '0.2s' }}></span>
              <span className="animate-pulse" style={{ display: 'inline-block', width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%', animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Footer Input */}
      <form onSubmit={handleSendMessage} style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          placeholder="Nhập tin nhắn..."
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            fontSize: '14px',
            outline: 'none',
            transition: 'border 0.2s'
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--gold)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            background: newMessage.trim() ? 'var(--gold)' : 'var(--border)',
            color: 'var(--white)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: newMessage.trim() ? 'pointer' : 'default',
            transition: 'all 0.2s'
          }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
