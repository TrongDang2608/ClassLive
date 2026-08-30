// Test UI Diff Antigravity
import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Download, FileText, Image as ImageIcon, Video, File, XCircle, BookOpen, Maximize, Minimize } from 'lucide-react';
import StudentService from './StudentService';
import toast from 'react-hot-toast';

const LessonViewer = ({ assignment, onBack, onCompleteSuccess }) => {
  const [activeFile, setActiveFile] = useState(
    assignment.lesson?.files && assignment.lesson.files.length > 0 
      ? assignment.lesson.files[0] 
      : null
  );
  const [completing, setCompleting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleMarkAsDone = async () => {
    setCompleting(true);
    try {
      await StudentService.markLessonDone(assignment.id);
      toast.success('Chúc mừng bạn đã hoàn thành bài học!');
      if (onCompleteSuccess) {
        onCompleteSuccess(assignment.id);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi hoàn thành bài học');
      console.error(error);
    } finally {
      setCompleting(false);
    }
  };

  const handleDownload = async (e, fileUrl, fileName) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Tạo toast loading
    const toastId = toast.loading('Đang chuẩn bị tải file...');
    
    try {
      // Dùng fetch để lấy file dạng Blob (Khắc phục lỗi cross-origin)
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      
      // Tạo URL ảo để tải về
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Dọn dẹp
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Bắt đầu tải xuống!', { id: toastId });
    } catch (error) {
      console.error('Lỗi khi tải file:', error);
      toast.error('Không thể tải file lúc này', { id: toastId });
    }
  };

  const getFileType = (fileName = '') => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return 'pdf';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
    return 'other';
  };

  const getFileIcon = (fileName) => {
    const type = getFileType(fileName);
    if (type === 'pdf') return <FileText size={18} />;
    if (type === 'image') return <ImageIcon size={18} />;
    if (type === 'video') return <Video size={18} />;
    return <File size={18} />;
  };

  const renderWebViewer = () => {
    if (!activeFile) {
      // Phương án B: Placeholder khi không có file
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          background: 'var(--bg-warm)',
          borderRadius: '12px',
          border: '1px dashed var(--border)'
        }}>
          <div style={{ width: '120px', height: '120px', background: 'var(--white)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
            <BookOpen size={48} color="var(--gold)" />
          </div>
          <h2 style={{ fontSize: '20px', color: 'var(--primary)', marginBottom: '8px' }}>Bài giảng lý thuyết</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', textAlign: 'center' }}>
            Bài giảng này không có tài liệu đính kèm. Vui lòng đọc kỹ nội dung hướng dẫn của Giảng viên ở cột bên phải.
          </p>
        </div>
      );
    }

    const { originalName, url } = activeFile;
    const type = getFileType(originalName);
    const fileUrl = `http://localhost:5000${url}`;

    if (type === 'pdf') {
      return (
        <iframe 
          src={fileUrl} 
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px', background: 'var(--white)' }}
          title={originalName}
        />
      );
    }

    if (type === 'image') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-warm)', borderRadius: '12px', padding: '24px' }}>
          <img src={fileUrl} alt={originalName} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
        </div>
      );
    }

    if (type === 'video') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', borderRadius: '12px' }}>
          <video controls style={{ width: '100%', maxHeight: '100%', outline: 'none' }}>
            <source src={fileUrl} />
            Trình duyệt của bạn không hỗ trợ video này.
          </video>
        </div>
      );
    }

    // Fallback cho file không hỗ trợ view (docx, zip...)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--white)', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <XCircle size={64} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
        <h3 style={{ fontSize: '18px', color: 'var(--text)', marginBottom: '8px' }}>Không hỗ trợ xem trước</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Định dạng file không được trình duyệt hỗ trợ xem trực tiếp.</p>
        <button 
          onClick={(e) => handleDownload(e, fileUrl, originalName)} 
          className="btn btn-gold" 
          style={{ textDecoration: 'none', border: 'none', cursor: 'pointer' }}
        >
          <Download size={18} /> Tải Về Máy
        </button>
      </div>
    );
  };

  const isCompleted = assignment.status === 'completed';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Navbar View */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button 
          onClick={onBack}
          style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--white)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <ArrowLeft size={20} color="var(--text)" />
        </button>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Không gian học tập
          </div>
          <h1 style={{ fontSize: '24px', color: 'var(--primary)', fontWeight: '700' }}>
            {assignment.lesson?.title}
          </h1>
        </div>
      </div>

      {/* Main Grid: 70% Viewer - 30% Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '24px', flex: 1, minHeight: 0 }}>
        
        {/* Left Column: Web Viewer */}
        <div style={{ 
          height: '100%', 
          minHeight: '600px', 
          display: 'flex', 
          flexDirection: 'column',
          position: isFullscreen ? 'fixed' : 'relative',
          top: isFullscreen ? 0 : 'auto',
          left: isFullscreen ? 0 : 'auto',
          right: isFullscreen ? 0 : 'auto',
          bottom: isFullscreen ? 0 : 'auto',
          zIndex: isFullscreen ? 9999 : 1,
          background: isFullscreen ? 'var(--bg)' : 'transparent',
          padding: isFullscreen ? '24px' : '0'
        }}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {renderWebViewer()}
            
            {/* Nút Fullscreen (chỉ hiện khi có file đính kèm thực sự) */}
            {activeFile && (
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '24px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  backdropFilter: 'blur(4px)',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                title={isFullscreen ? 'Thu nhỏ' : 'Phóng to'}
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Info & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          
          {/* Info Section */}
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--primary)', marginBottom: '12px', fontWeight: '700' }}>Nội dung chi tiết</h3>
            <div style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.6', maxHeight: '150px', overflowY: 'auto', paddingRight: '8px' }} className="custom-scrollbar">
              {assignment.lesson?.description || 'Giảng viên không cung cấp mô tả cho bài giảng này.'}
            </div>
          </div>

          {/* Files List */}
          <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
            <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600', marginBottom: '16px' }}>
              Tài liệu đính kèm ({assignment.lesson?.files?.length || 0})
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {assignment.lesson?.files?.map((file, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActiveFile(file)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: '8px',
                    border: activeFile?.url === file.url ? '1.5px solid var(--gold)' : '1px solid var(--border)',
                    background: activeFile?.url === file.url ? 'var(--gold-glow)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                    <div style={{ color: activeFile?.url === file.url ? 'var(--gold-dark)' : 'var(--text-muted)' }}>
                      {getFileIcon(file.originalName)}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {file.originalName}
                    </div>
                  </div>
                  
                  <a 
                    href={`http://localhost:5000${file.url}`} 
                    onClick={(e) => handleDownload(e, `http://localhost:5000${file.url}`, file.originalName)}
                    style={{ color: 'var(--text-secondary)', padding: '4px' }}
                    title="Tải xuống"
                  >
                    <Download size={16} />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ padding: '24px', background: 'var(--bg-warm)', borderTop: '1px solid var(--border)' }}>
            <button 
              onClick={handleMarkAsDone}
              disabled={isCompleted || completing}
              className="btn"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '8px',
                transition: 'all 0.3s',
                border: 'none',
                background: isCompleted ? 'var(--success-glow)' : 'var(--primary)',
                color: isCompleted ? 'var(--success)' : 'var(--white)',
                cursor: isCompleted ? 'default' : 'pointer'
              }}
            >
              <CheckCircle2 size={20} />
              {isCompleted ? 'Đã Hoàn Thành' : (completing ? 'Đang xử lý...' : 'Đánh dấu Đã Hoàn Thành')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;
