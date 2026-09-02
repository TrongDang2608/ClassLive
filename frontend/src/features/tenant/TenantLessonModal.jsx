import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, FileText, Trash2, Loader2, Plus, CheckCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import TenantService from './TenantService';
import './tenant.css';

const TenantLessonModal = ({ isOpen, onClose, lesson, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: 'Toán Học',
    grade: 'Lớp 10',
    content: ''
  });

  const [existingFiles, setExistingFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (lesson) {
        setFormData({
          title: lesson.title || '',
          description: lesson.description || '',
          subject: lesson.subject || 'Toán Học',
          grade: lesson.grade || 'Lớp 10',
          content: lesson.content || ''
        });
        setExistingFiles(lesson.files || []);
      } else {
        setFormData({
          title: '',
          description: '',
          subject: 'Toán Học',
          grade: 'Lớp 10',
          content: ''
        });
        setExistingFiles([]);
      }
      setNewFiles([]);
    }
  }, [isOpen, lesson]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setNewFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const handleRemoveNewFile = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingFile = (index) => {
    setExistingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài giảng!');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('subject', formData.subject);
      data.append('grade', formData.grade);
      data.append('content', formData.content);

      if (lesson) {
        // Cập nhật bài giảng: truyền existingFiles dưới dạng JSON string
        data.append('existingFiles', JSON.stringify(existingFiles));
      }

      // Đính kèm các file mới được tải lên
      newFiles.forEach(file => {
        data.append('files', file);
      });

      if (lesson) {
        await TenantService.updateLesson(lesson.id, data);
        toast.success('Cập nhật bài giảng thành công!');
      } else {
        await TenantService.createLesson(data);
        toast.success('Tạo bài giảng mới thành công!');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Lỗi lưu bài giảng:', error);
      toast.error(error.response?.data?.error || 'Không thể lưu bài giảng. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="tenant-modal-overlay animate-fade-in" onClick={onClose}>
      <div 
        className="tenant-modal-card" 
        style={{ maxWidth: '750px', maxHeight: '90vh', margin: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tenant-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="tenant-stat-icon" style={{ width: '38px', height: '38px' }}>
              <FileText size={20} />
            </div>
            <h2 style={{ fontSize: '18px', color: 'var(--tenant-primary)', margin: 0, fontWeight: 700 }}>
              {lesson ? 'Cập Nhật Học Liệu' : 'Tạo Học Liệu Mới'}
            </h2>
          </div>
          <button className="btn-close-circle" onClick={onClose} title="Đóng">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="tenant-modal-body">
            {/* Tiêu đề */}
            <div className="form-group">
              <label>Tiêu đề Bài giảng <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="text" 
                name="title" 
                className="form-input" 
                placeholder="Ví dụ: Chương 1: Mệnh đề & Tập hợp Toán 10" 
                value={formData.title} 
                onChange={handleChange}
                required
              />
            </div>

            {/* Môn học & Khối lớp */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Môn học</label>
                <select name="subject" className="form-input" value={formData.subject} onChange={handleChange}>
                  <option value="Toán Học">Toán Học</option>
                  <option value="Vật Lý">Vật Lý</option>
                  <option value="Hóa Học">Hóa Học</option>
                  <option value="Ngữ Văn">Ngữ Văn</option>
                  <option value="Tiếng Anh">Tiếng Anh</option>
                  <option value="Sinh Học">Sinh Học</option>
                  <option value="Lịch Sử">Lịch Sử</option>
                  <option value="Địa Lý">Địa Lý</option>
                  <option value="Tin Học">Tin Học</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>Khối lớp</label>
                <select name="grade" className="form-input" value={formData.grade} onChange={handleChange}>
                  <option value="Lớp 10">Lớp 10</option>
                  <option value="Lớp 11">Lớp 11</option>
                  <option value="Lớp 12">Lớp 12</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>

            {/* Mô tả tóm tắt */}
            <div className="form-group">
              <label>Mô tả tóm tắt</label>
              <textarea 
                name="description" 
                className="form-input" 
                rows="2"
                placeholder="Mô tả mục tiêu kiến thức bài học..." 
                value={formData.description} 
                onChange={handleChange}
              />
            </div>

            {/* Nội dung chi tiết */}
            <div className="form-group">
              <label>Nội dung chi tiết (HTML / Văn bản)</label>
              <textarea 
                name="content" 
                className="form-input" 
                rows="4"
                placeholder="Nhập nội dung bài giảng tại đây..." 
                value={formData.content} 
                onChange={handleChange}
              />
            </div>

            {/* Tải tệp tài liệu đính kèm */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Tài liệu đính kèm (File PDF, Word, Ảnh, MP4...)</label>
              
              {/* Box upload */}
              <div 
                style={{
                  border: '2px dashed var(--tenant-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '20px',
                  textAlign: 'center',
                  background: 'var(--bg-warm)',
                  cursor: 'pointer',
                  transition: 'all var(--transition)'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={24} color="var(--tenant-primary)" style={{ marginBottom: '6px' }} />
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                  Bấm để chọn file từ máy tính
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Hỗ trợ nhiều định dạng tệp (Tối đa 50MB/file)
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  multiple 
                  style={{ display: 'none' }} 
                />
              </div>

              {/* Danh sách file cũ */}
              {existingFiles.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Tệp hiện có ({existingFiles.length}):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {existingFiles.map((file, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--white)', border: '1px solid var(--tenant-border)', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                          <FileText size={16} color="var(--tenant-primary)" />
                          <span>{file.originalName || file.url?.split('/').pop() || `File #${idx+1}`}</span>
                        </div>
                        <button type="button" onClick={() => handleRemoveExistingFile(idx)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }} title="Xóa file">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Danh sách file vừa chọn mới */}
              {newFiles.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tenant-primary)', marginBottom: '6px' }}>
                    Tệp mới chọn ({newFiles.length}):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {newFiles.map((file, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--tenant-primary-subtle)', border: '1px solid var(--tenant-border)', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                          <FileText size={16} color="var(--tenant-primary)" />
                          <span style={{ fontWeight: 500 }}>{file.name}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                        <button type="button" onClick={() => handleRemoveNewFile(idx)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }} title="Bỏ chọn">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="tenant-modal-footer">
            <button type="button" className="btn-emerald-outline" onClick={onClose} disabled={loading}>
              Hủy
            </button>
            <button type="submit" className="btn-emerald" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Đang lưu...
                </>
              ) : (
                <>
                  <CheckCircle size={16} /> {lesson ? 'Lưu Cập Nhật' : 'Tạo Bài Giảng'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default TenantLessonModal;
