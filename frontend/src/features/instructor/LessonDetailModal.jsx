import React from 'react';
import { X, BookOpen, FileText, Download } from 'lucide-react';
import './instructor.css';

const LessonDetailModal = ({ isOpen, onClose, lesson }) => {
  if (!isOpen || !lesson) return null;

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content animate-slide-up" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2 className="modal-title">
            <BookOpen size={22} style={{ color: 'var(--primary)' }} />
            Chi tiết Bài giảng
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '500px', overflowY: 'auto', padding: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: 'var(--primary)' }}>{lesson.title}</h3>
            <p style={{ color: 'var(--text)', lineHeight: '1.6', fontSize: '15px', whiteSpace: 'pre-wrap', margin: 0 }}>
              {lesson.description || 'Chưa có mô tả chi tiết cho bài giảng này.'}
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '16px', color: 'var(--text)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} style={{ color: 'var(--primary)' }} />
              Tài liệu đính kèm ({lesson.files?.length || 0})
            </h4>

            {!lesson.files || lesson.files.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '8px' }}>
                Không có tài liệu nào đính kèm trong bài giảng này.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {lesson.files.map((file, index) => (
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                      <FileText size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <div style={{ fontWeight: 500, color: 'var(--text)', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {file.originalName || file.name}
                      </div>
                    </div>
                    {file.url && (
                      <a 
                        href={`http://localhost:5000${file.url}`} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, padding: '6px 12px', backgroundColor: 'var(--bg-warm)', borderRadius: '6px' }}
                      >
                        <Download size={14} /> Tải xuống
                      </a>
                    )}
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

export default LessonDetailModal;
