import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, BookOpen, Calendar, FileText, Download, Eye, ExternalLink } from 'lucide-react';

const SchoolLessonDetailModal = ({ isOpen, onClose, lesson }) => {
  const [selectedPreviewFile, setSelectedPreviewFile] = useState(null);

  if (!isOpen || !lesson) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getFullFileUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  const isPdf = (url) => url?.toLowerCase().endsWith('.pdf');
  const isImage = (url) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url || '');

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-dialog" 
        style={{ maxWidth: '820px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          {/* HEADER */}
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(212, 175, 55, 0.2)', color: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <BookOpen size={20} />
              </div>
              <div>
                <h5 className="modal-title">Chi Tiết Bài Giảng</h5>
                <span style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '12px' }}>Mã học liệu: {lesson.id}</span>
              </div>
            </div>
            <button className="btn-close" onClick={onClose} title="Đóng">
              <X size={20} />
            </button>
          </div>

          {/* BODY */}
          <div className="modal-body">
            {/* Title & Meta Info */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#230C3B', margin: '0 0 10px 0' }}>{lesson.title}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                {lesson.subject && (
                  <span className="badge" style={{ background: 'rgba(59, 24, 95, 0.08)', color: '#3B185F', border: '1px solid rgba(59, 24, 95, 0.2)' }}>
                    {lesson.subject}
                  </span>
                )}
                {lesson.grade && (
                  <span className="badge" style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#854D0E', border: '1px solid #D4AF37' }}>
                    {lesson.grade}
                  </span>
                )}
                <span style={{ fontSize: '13px', color: '#6B7280', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={14} /> Ngày cấp: {formatDate(lesson.createdAt)}
                </span>
              </div>
            </div>

            {/* Description */}
            {lesson.description && (
              <div style={{ background: '#F8F6FA', border: '1px solid #E8E2EE', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                <strong style={{ display: 'block', color: '#3B185F', fontSize: '13px', marginBottom: '6px' }}>Mô tả bài học:</strong>
                <p style={{ margin: 0, color: '#4B5563', fontSize: '14px', lineHeight: 1.6 }}>{lesson.description}</p>
              </div>
            )}

            {/* Files Attached & Live Preview */}
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#3B185F', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} /> Tài liệu đính kèm ({lesson.files?.length || 0})
              </h4>

              {(!lesson.files || lesson.files.length === 0) ? (
                <p style={{ color: '#6B7280', fontSize: '13px', fontStyle: 'italic', margin: 0 }}>Không có file tài liệu đính kèm nào cho bài học này.</p>
              ) : (
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                    {lesson.files.map((file, idx) => {
                      const fullUrl = getFullFileUrl(file.url);
                      const isSelected = selectedPreviewFile?.url === file.url;
                      return (
                        <div 
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: isSelected ? '2px solid #3B185F' : '1px solid #E8E2EE',
                            background: isSelected ? 'rgba(59, 24, 95, 0.06)' : '#FFFFFF',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                          }}
                          onClick={() => setSelectedPreviewFile(file)}
                        >
                          <FileText size={16} style={{ color: '#3B185F', flexShrink: 0 }} />
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#230C3B', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {file.originalName || `Tài liệu ${idx + 1}`}
                          </span>
                          <a 
                            href={fullUrl} 
                            download 
                            target="_blank" 
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{ color: '#3B185F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '6px', marginLeft: '4px' }}
                            title="Tải về máy"
                          >
                            <Download size={14} />
                          </a>
                        </div>
                      );
                    })}
                  </div>

                  {/* LIVE PREVIEW AREA */}
                  {selectedPreviewFile && (
                    <div style={{ background: '#F8F6FA', border: '1px solid #E8E2EE', borderRadius: '12px', padding: '16px', marginTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontWeight: 600, color: '#3B185F', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Eye size={16} /> Xem trước: {selectedPreviewFile.originalName}
                        </span>
                        <a 
                          href={getFullFileUrl(selectedPreviewFile.url)} 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn btn-sm btn-outline-secondary"
                          style={{ fontSize: '12px', padding: '4px 10px' }}
                        >
                          Mở tab mới <ExternalLink size={12} />
                        </a>
                      </div>

                      {isPdf(selectedPreviewFile.url) ? (
                        <iframe 
                          src={getFullFileUrl(selectedPreviewFile.url)} 
                          style={{ width: '100%', height: '460px', border: 'none', borderRadius: '10px', background: '#FFFFFF' }}
                          title={selectedPreviewFile.originalName}
                        />
                      ) : isImage(selectedPreviewFile.url) ? (
                        <div style={{ textAlign: 'center', padding: '16px', background: '#FFFFFF', borderRadius: '10px' }}>
                          <img 
                            src={getFullFileUrl(selectedPreviewFile.url)} 
                            alt={selectedPreviewFile.originalName}
                            style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: '8px' }}
                          />
                        </div>
                      ) : (
                        <div style={{ padding: '24px', textAlign: 'center', background: '#FFFFFF', borderRadius: '10px' }}>
                          <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '12px' }}>Định dạng file không hỗ trợ xem trực tiếp.</p>
                          <a href={getFullFileUrl(selectedPreviewFile.url)} download className="btn btn-sm btn-primary">
                            <Download size={15} /> Tải về máy
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose} style={{ padding: '8px 24px' }}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SchoolLessonDetailModal;
