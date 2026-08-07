import React from 'react';
import { X, User, Phone, Mail, BookOpen, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import './instructor.css';

const StudentDetailModal = ({ isOpen, onClose, student }) => {
  if (!isOpen || !student) return null;

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content animate-slide-up" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2 className="modal-title">
            <User size={22} style={{ color: 'var(--primary)' }} />
            Chi tiết Học sinh
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '500px', overflowY: 'auto', padding: '24px' }}>
          {/* Thông tin cá nhân */}
          <div style={{ 
            backgroundColor: 'var(--bg-warm)', 
            padding: '20px', 
            borderRadius: '10px', 
            marginBottom: '24px',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: 'var(--primary)' }}>{student.name}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'var(--text)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} style={{ color: 'var(--text-secondary)' }} />
                <span>Số điện thoại: <strong>{student.phone}</strong></span>
              </div>
              {student.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={16} style={{ color: 'var(--text-secondary)' }} />
                  <span>Email: <strong>{student.email}</strong></span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={16} style={{ color: 'var(--text-secondary)' }} />
                <span>Tên đăng nhập: <strong>{student.username || 'Chưa thiết lập'}</strong></span>
              </div>
            </div>
          </div>

          {/* Danh sách bài giảng đã giao */}
          <div>
            <h4 style={{ fontSize: '16px', color: 'var(--text)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} style={{ color: 'var(--primary)' }} />
              Bài học đã giao ({student.assignedLessons?.length || 0})
            </h4>

            {!student.assignedLessons || student.assignedLessons.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '8px' }}>
                Học sinh này chưa được giao bài giảng nào.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {student.assignedLessons.map((item, index) => (
                  <div 
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      backgroundColor: 'var(--white)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>
                        {item.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <Clock size={12} />
                        Giao ngày: {new Date(item.assignedAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>

                    <div>
                      {item.status === 'completed' ? (
                        <span style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                          backgroundColor: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71'
                        }}>
                          <CheckCircle2 size={14} /> Hoàn thành
                        </span>
                      ) : (
                        <span style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                          backgroundColor: 'rgba(241, 196, 15, 0.1)', color: '#f1c40f'
                        }}>
                          <AlertCircle size={14} /> Đang học
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', padding: '16px 24px' }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;
