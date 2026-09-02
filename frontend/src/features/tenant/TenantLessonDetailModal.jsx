import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, BookOpen, Calendar, Tag, FileText, Download, Eye, ExternalLink } from 'lucide-react';
import './tenant.css';

const TenantLessonDetailModal = ({ isOpen, onClose, lesson }) => {
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
    <div className="tenant-modal-overlay animate-fade-in" onClick={onClose}>
      <div 
        className="tenant-modal-card" 
        style={{ maxWidth: '750px', maxHeight: '90vh', margin: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tenant-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="tenant-stat-icon" style={{ width: '38px', height: '38px' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', color: 'var(--tenant-primary)', margin: 0, fontWeight: 700 }}>Chi Tiết Học Liệu</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ID: {lesson.id}</span>
            </div>
          </div>
          <button 
            className="btn-close-circle"
            onClick={onClose}
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <div className="tenant-modal-body">
          {/* Tiêu đề & Badges */}
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '22px', color: 'var(--text)', marginBottom: '10px' }}>{lesson.title}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              {lesson.subject && <span className="tag-emerald">{lesson.subject}</span>}
              {lesson.grade && <span className="tag-gold">{lesson.grade}</span>}
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                <Calendar size={14} /> Ngày tạo: {formatDate(lesson.createdAt)}
              </span>
            </div>
          </div>

          {/* Mô tả */}
          {lesson.description && (
            <div style={{ marginBottom: '20px', padding: '14px', background: 'var(--bg-warm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--tenant-border)' }}>
              <strong style={{ display: 'block', fontSize: '13px', color: 'var(--tenant-primary)', marginBottom: '4px' }}>Mô tả bài học:</strong>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text)' }}>{lesson.description}</p>
            </div>
          )}

          {/* Nội dung chi tiết */}
          {lesson.content && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '15px', color: 'var(--tenant-primary)', marginBottom: '10px' }}>Nội dung bài giảng:</h3>
              <div 
                style={{ 
                  padding: '16px', 
                  border: '1px solid var(--tenant-border)', 
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--white)',
                  fontSize: '14px',
                  lineHeight: '1.7'
                }}
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
            </div>
          )}

          {/* Danh sách File đính kèm & Preview */}
          <div>
            <h3 style={{ fontSize: '15px', color: 'var(--tenant-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} /> Tài liệu đính kèm ({lesson.files?.length || 0})
            </h3>

            {(!lesson.files || lesson.files.length === 0) ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Không có tài liệu đính kèm nào cho bài học này.</p>
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
                          gap: '8px',
                          padding: '8px 14px',
                          border: isSelected ? '2px solid var(--tenant-primary)' : '1px solid var(--tenant-border)',
                          borderRadius: 'var(--radius-sm)',
                          background: isSelected ? 'var(--tenant-primary-subtle)' : 'var(--white)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => setSelectedPreviewFile(file)}
                      >
                        <FileText size={16} color="var(--tenant-primary)" />
                        <span style={{ fontSize: '13px', fontWeight: 500, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.originalName || `File ${idx + 1}`}
                        </span>
                        <a 
                          href={fullUrl} 
                          download 
                          target="_blank" 
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ color: 'var(--tenant-primary-light)', display: 'flex', alignItems: 'center', marginLeft: '4px' }}
                          title="Tải về máy"
                        >
                          <Download size={14} />
                        </a>
                      </div>
                    );
                  })}
                </div>

                {/* Khu vực Live Preview */}
                {selectedPreviewFile && (
                  <div style={{ marginTop: '16px', border: '1px solid var(--tenant-border)', borderRadius: 'var(--radius)', padding: '16px', background: 'var(--bg-warm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tenant-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Eye size={16} /> Xem trước: {selectedPreviewFile.originalName}
                      </span>
                      <a 
                        href={getFullFileUrl(selectedPreviewFile.url)} 
                        target="_blank" 
                        rel="noreferrer"
                        className="btn-emerald-outline"
                        style={{ fontSize: '12px', padding: '4px 10px' }}
                      >
                        Mở tab mới <ExternalLink size={12} />
                      </a>
                    </div>

                    {isPdf(selectedPreviewFile.url) ? (
                      <iframe 
                        src={getFullFileUrl(selectedPreviewFile.url)} 
                        className="file-preview-embed"
                        title={selectedPreviewFile.originalName}
                      />
                    ) : isImage(selectedPreviewFile.url) ? (
                      <div style={{ textAlign: 'center', background: '#00000010', borderRadius: '8px', padding: '16px' }}>
                        <img 
                          src={getFullFileUrl(selectedPreviewFile.url)} 
                          alt={selectedPreviewFile.originalName}
                          style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '6px' }}
                        />
                      </div>
                    ) : (
                      <div style={{ padding: '30px', textAlign: 'center', background: 'var(--white)', borderRadius: '8px' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>
                          Định dạng file không hỗ trợ xem trước trực tiếp. Bạn có thể tải file về máy.
                        </p>
                        <a 
                          href={getFullFileUrl(selectedPreviewFile.url)} 
                          download 
                          className="btn-emerald"
                          style={{ fontSize: '13px' }}
                        >
                          <Download size={15} /> Tải file về máy
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="tenant-modal-footer">
          <button type="button" className="btn-emerald-outline" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TenantLessonDetailModal;
