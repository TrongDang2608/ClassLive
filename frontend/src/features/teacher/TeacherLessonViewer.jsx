import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Download, FileText, Image as ImageIcon, Video, File, 
  BookOpen, Maximize, Minimize, ExternalLink, Calendar, Layers, Clock, Info, CheckCircle2, X
} from 'lucide-react';
import toast from 'react-hot-toast';

const TeacherLessonViewer = ({ lesson, onBack }) => {
  const contentRef = useRef(null);

  const getFullFileUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const normalizeFile = (file, idx) => {
    if (!file) return { fileName: `Tài liệu ${idx + 1}`, fileUrl: '', rawUrl: '', ext: '' };
    if (typeof file === 'string') {
      const fileName = file.split('/').pop() || `Tài liệu ${idx + 1}`;
      const ext = fileName.split('.').pop().toLowerCase();
      return {
        fileName,
        fileUrl: getFullFileUrl(file),
        rawUrl: file,
        ext
      };
    }
    const name = file.originalName || file.originalname || file.fileName || file.name || (file.url ? file.url.split('/').pop() : `Tài liệu ${idx + 1}`);
    const rawPath = file.url || file.filePath || file.path || '';
    const ext = name.split('.').pop().toLowerCase();
    return {
      fileName: name,
      fileUrl: getFullFileUrl(rawPath),
      rawUrl: rawPath,
      ext
    };
  };

  const normalizedFiles = (lesson?.files || []).map((f, idx) => normalizeFile(f, idx));

  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('files'); // 'files' | 'details'
  const [isContentFullscreen, setIsContentFullscreen] = useState(false);

  const activeFile = normalizedFiles.length > 0 ? normalizedFiles[selectedFileIdx] : null;

  // Lắng nghe sự kiện fullscreenchange từ trình duyệt
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsContentFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleContentFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (contentRef.current?.requestFullscreen) {
          await contentRef.current.requestFullscreen();
        } else {
          setIsContentFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else {
          setIsContentFullscreen(false);
        }
      }
    } catch (err) {
      console.warn('Lỗi bật toàn màn hình:', err);
      // Fallback CSS fullscreen
      setIsContentFullscreen(!isContentFullscreen);
    }
  };

  const handleDownload = async (e, fileUrl, fileName) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!fileUrl) {
      toast.error('Đường dẫn file không hợp lệ');
      return;
    }

    const toastId = toast.loading('Đang tải file...');
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Network response error');
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'tai-lieu');
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Tải file thành công!', { id: toastId });
    } catch (error) {
      console.error('Lỗi khi tải file:', error);
      window.open(fileUrl, '_blank');
      toast.dismiss(toastId);
    }
  };

  const getFileType = (ext = '') => {
    if (['pdf'].includes(ext)) return 'pdf';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return 'office';
    return 'other';
  };

  const getFileIcon = (ext) => {
    const type = getFileType(ext);
    if (type === 'pdf') return <FileText size={18} color="#DC2626" />;
    if (type === 'image') return <ImageIcon size={18} color="#059669" />;
    if (type === 'video') return <Video size={18} color="#D97706" />;
    if (type === 'office') return <FileText size={18} color="#2563EB" />;
    return <File size={18} color="#64748B" />;
  };

  const renderWebViewer = () => {
    if (!activeFile) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '40px',
          textAlign: 'center',
          background: '#FFFFFF'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'rgba(37, 99, 235, 0.08)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            border: '1px solid rgba(37, 99, 235, 0.15)'
          }}>
            <BookOpen size={38} color="#2563EB" />
          </div>
          <h3 style={{ fontSize: '18px', color: '#0F172A', marginBottom: '8px', fontWeight: 700 }}>
            Học liệu Lý thuyết
          </h3>
          <p style={{ color: '#64748B', maxWidth: '420px', fontSize: '14px', lineHeight: '1.6' }}>
            Bài giảng này không đính kèm tệp tài liệu PDF hoặc Hình ảnh. Quý Thầy/Cô vui lòng xem hướng dẫn chi tiết ở tab "Mô tả & Hướng dẫn".
          </p>
        </div>
      );
    }

    const type = getFileType(activeFile.ext);

    if (type === 'pdf') {
      return (
        <div style={{ width: '100%', height: '100%', position: 'relative', background: '#525659' }}>
          <iframe
            src={`${activeFile.fileUrl}#toolbar=1&navpanes=0`}
            title={activeFile.fileName}
            style={{ width: '100%', height: '100%', border: 'none', background: '#FFFFFF' }}
          />
        </div>
      );
    }

    if (type === 'image') {
      return (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          overflow: 'auto',
          background: '#F8FAFC'
        }}>
          <img
            src={activeFile.fileUrl}
            alt={activeFile.fileName}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF'
            }}
          />
        </div>
      );
    }

    if (type === 'video') {
      return (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#0F172A'
        }}>
          <video
            controls
            src={activeFile.fileUrl}
            style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
          />
        </div>
      );
    }

    if (type === 'office') {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '40px',
          textAlign: 'center',
          background: '#FFFFFF'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: '#EFF6FF',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            border: '1px solid #BFDBFE'
          }}>
            <FileText size={40} color="#2563EB" />
          </div>
          <h3 style={{ fontSize: '18px', color: '#0F172A', marginBottom: '6px', fontWeight: 700 }}>
            {activeFile.fileName}
          </h3>
          <p style={{ color: '#64748B', maxWidth: '440px', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
            Tệp tài liệu Microsoft Office ({activeFile.ext.toUpperCase()}). Vui lòng tải về máy để xem và chỉnh sửa bài giảng bằng phần mềm chuyên dụng.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={(e) => handleDownload(e, activeFile.fileUrl, activeFile.fileName)}
              className="btn-teacher-primary"
            >
              <Download size={16} /> Tải tệp về máy
            </button>
            <a
              href={activeFile.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-teacher-outline"
            >
              <ExternalLink size={16} /> Mở tab mới
            </a>
          </div>
        </div>
      );
    }

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '40px',
        textAlign: 'center',
        background: '#FFFFFF'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          background: '#F1F5F9',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <File size={36} color="#64748B" />
        </div>
        <h3 style={{ fontSize: '17px', color: '#0F172A', marginBottom: '6px', fontWeight: 700 }}>
          {activeFile.fileName}
        </h3>
        <p style={{ color: '#64748B', maxWidth: '400px', fontSize: '13px', marginBottom: '20px' }}>
          Định dạng file không hỗ trợ xem trực tiếp trên trình duyệt. Thầy/Cô có thể tải file về để mở trên máy.
        </p>
        <button
          onClick={(e) => handleDownload(e, activeFile.fileUrl, activeFile.fileName)}
          className="btn-teacher-primary"
        >
          <Download size={16} /> Tải file về máy
        </button>
      </div>
    );
  };

  return (
    <div className="teacher-viewer-container">
      {/* LIGHT HEADER SAPPHIRE NAVY THEME */}
      <div className="teacher-viewer-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onBack}
            className="btn-teacher-outline"
            style={{ padding: '7px 12px', fontSize: '13px' }}
          >
            <ArrowLeft size={16} /> Danh sách
          </button>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                {lesson?.title}
              </h2>
              <span className="teacher-badge teacher-badge-blue" style={{ fontSize: '11px' }}>
                {lesson?.subject}
              </span>
              <span className="teacher-badge teacher-badge-gold" style={{ fontSize: '11px' }}>
                {lesson?.grade}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {activeFile && (
            <button
              onClick={(e) => handleDownload(e, activeFile.fileUrl, activeFile.fileName)}
              className="btn-teacher-outline"
              style={{ fontSize: '13px', padding: '7px 14px' }}
              title="Tải tệp đang chọn"
            >
              <Download size={15} /> Tải file này
            </button>
          )}

          <button
            onClick={toggleContentFullscreen}
            className="btn-teacher-outline"
            style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}
            title={isContentFullscreen ? 'Thu nhỏ tệp' : 'Toàn màn hình tệp học liệu'}
          >
            {isContentFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            <span>{isContentFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
          </button>
        </div>
      </div>

      {/* SPLIT VIEWER BODY */}
      <div className="teacher-viewer-split">
        {/* MAIN CANVAS - MỞ TOÀN MÀN HÌNH CHÍNH TỆP HỌC LIỆU NÀY */}
        <div 
          ref={contentRef} 
          className={`teacher-viewer-content ${isContentFullscreen ? 'content-fullscreen-active' : ''}`}
        >
          {renderWebViewer()}

          {/* NÚT THOÁT TOÀN MÀN HÌNH KHI ĐANG FULL FILE CANVAS */}
          {isContentFullscreen && (
            <button
              onClick={toggleContentFullscreen}
              style={{
                position: 'fixed',
                top: '16px',
                right: '16px',
                zIndex: 999999,
                background: 'rgba(15, 23, 42, 0.85)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
              }}
            >
              <X size={16} /> Thoát toàn màn hình
            </button>
          )}
        </div>

        {/* SIDEBAR TABS (LIGHT THEME) */}
        <div className="teacher-viewer-sidebar">
          <div className="teacher-viewer-tabs">
            <button
              className={`teacher-viewer-tab ${activeTab === 'files' ? 'active' : ''}`}
              onClick={() => setActiveTab('files')}
            >
              Tệp tài liệu ({normalizedFiles.length})
            </button>
            <button
              className={`teacher-viewer-tab ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Mô tả & Hướng dẫn
            </button>
          </div>

          <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
            {activeTab === 'files' ? (
              <div>
                {normalizedFiles.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#64748B', padding: '32px 0', fontSize: '13px' }}>
                    Không có file đính kèm nào.
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Chọn file để xem trực tiếp
                    </div>
                    {normalizedFiles.map((file, idx) => {
                      const isSelected = selectedFileIdx === idx;
                      return (
                        <div
                          key={idx}
                          className={`teacher-file-item ${isSelected ? 'active' : ''}`}
                          onClick={() => setSelectedFileIdx(idx)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: isSelected ? '#EFF6FF' : '#F8FAFC',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {getFileIcon(file.ext)}
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{
                                fontSize: '13px',
                                fontWeight: isSelected ? 700 : 500,
                                color: isSelected ? '#1E3A8A' : '#0F172A',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {file.fileName}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', textTransform: 'uppercase' }}>
                                {file.ext ? `Định dạng .${file.ext}` : `Tệp #${idx + 1}`}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={(e) => handleDownload(e, file.fileUrl, file.fileName)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#64748B',
                              cursor: 'pointer',
                              padding: '6px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title="Tải về"
                          >
                            <Download size={15} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Mô tả bài giảng
                  </div>
                  <div style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#0F172A',
                    background: '#F8FAFC',
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    whiteSpace: 'pre-line'
                  }}>
                    {lesson?.description || 'Không có mô tả chi tiết cho bài giảng này.'}
                  </div>
                </div>

                <div style={{
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} color="#2563EB" /> Hướng dẫn giảng dạy
                  </div>
                  <div style={{ fontSize: '12px', color: '#1E3A8A', lineHeight: '1.5' }}>
                    Tài liệu này được phân bổ từ Ban Giám Hiệu. Quý Thầy/Cô có thể trình chiếu trực tiếp trên lớp hoặc tải về soạn giáo án.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherLessonViewer;
