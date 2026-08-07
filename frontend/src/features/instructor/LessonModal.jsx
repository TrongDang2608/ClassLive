import React, { useState, useEffect, useRef } from 'react';
import { X, UploadCloud, FileText, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import LessonService from './LessonService';
import './instructor.css';

const LessonModal = ({ isOpen, onClose, onSuccess, editingLesson }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (editingLesson) {
        setTitle(editingLesson.title || '');
        setDescription(editingLesson.description || '');
        setFiles(editingLesson.files || []); 
      } else {
        setTitle('');
        setDescription('');
        setFiles([]);
      }
    }
  }, [isOpen, editingLesson]);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    e.target.value = null; // Reset value để có thể tải lên lại cùng 1 file
  };

  const handleFiles = (newFiles) => {
    // Convert FileList to Array and append
    const fileArray = Array.from(newFiles);
    setFiles((prev) => [...prev, ...fileArray]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      
      const existingFiles = files.filter(f => !f.size); // Các file cũ từ db thì ko có properties size của JS File obj
      const newFiles = files.filter(f => f.size);

      formData.append('existingFiles', JSON.stringify(existingFiles));
      newFiles.forEach(file => {
        formData.append('files', file);
      });

      if (editingLesson) {
        await LessonService.updateLesson(editingLesson.id, formData);
        toast.success('Cập nhật bài giảng thành công!');
      } else {
        await LessonService.createLesson(formData);
        toast.success('Tạo bài giảng mới thành công!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content animate-slide-up" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2 className="modal-title">{editingLesson ? 'Chỉnh sửa Bài giảng' : 'Thêm Bài giảng mới'}</h2>
          <button className="modal-close" onClick={onClose} disabled={loading}>
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Tiêu đề Bài giảng <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="VD: Bài 1 - Giới thiệu Mỹ Thuật" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Mô tả (Nội dung chính)</label>
              <textarea 
                className="form-input" 
                rows="4"
                placeholder="Nhập nội dung mô tả chi tiết..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

              <div className="form-group">
                <label>Tài liệu đính kèm (Kéo thả file)</label>
                <div 
                  className={`drag-drop-zone ${isDragging ? 'dragging' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                  style={{
                    border: isDragging ? '2px dashed var(--primary)' : '2px dashed var(--border)',
                    borderRadius: '8px',
                    padding: '30px',
                    textAlign: 'center',
                    backgroundColor: isDragging ? 'rgba(88, 28, 44, 0.05)' : 'var(--bg-warm)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <input 
                    type="file" 
                    multiple 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleFileInput}
                  />
                  <UploadCloud size={40} style={{ color: isDragging ? 'var(--primary)' : 'var(--text-secondary)', marginBottom: '10px' }} />
                  <p style={{ margin: 0, color: 'var(--text)', fontWeight: 500 }}>
                    Kéo thả file vào đây hoặc <span style={{ color: 'var(--primary)' }}>Bấm để Chọn</span>
                  </p>
                  <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    Hỗ trợ: PDF, DOCX, PPTX (Tối đa 50MB)
                  </p>
                </div>

                {/* Danh sách file đã chọn */}
                {files.length > 0 && (
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {files.map((file, index) => (
                      <div key={index} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 12px', backgroundColor: 'var(--bg-warm)', 
                        border: '1px solid var(--border)', borderRadius: '6px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                          <FileText size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                          <span style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {file.name || file.originalName}
                          </span>
                        </div>
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>Hủy</button>
            <button type="submit" className="btn btn-gold" disabled={loading || !title.trim()}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Lưu Bài Giảng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LessonModal;
