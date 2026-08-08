import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, BookOpen, Clock, FileText, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import LessonService from './LessonService';
import LessonModal from './LessonModal';
import AssignLessonModal from './AssignLessonModal';
import LessonDetailModal from './LessonDetailModal';
import { Eye, Search, Filter, ArrowUpDown } from 'lucide-react';
import './instructor.css';

const LessonManagement = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Modals state
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningLesson, setAssigningLesson] = useState(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingLesson, setViewingLesson] = useState(null);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      // Gọi API lấy bài giảng của giảng viên hiện tại
      const res = await LessonService.getLessons(1, 50); 
      setLessons(res.data || []);
    } catch (error) {
      toast.error('Không thể tải danh sách bài giảng.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingLesson(null);
    setIsLessonModalOpen(true);
  };

  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    setIsLessonModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài giảng này không? Tất cả bài tập đã giao sẽ bị xóa theo.')) return;
    try {
      await LessonService.deleteLesson(id);
      toast.success('Xóa bài giảng thành công!');
      fetchLessons();
    } catch (error) {
      toast.error('Xóa bài giảng thất bại.');
    }
  };

  const handleAssign = (lesson) => {
    setAssigningLesson(lesson);
    setIsAssignModalOpen(true);
  };

  const handleViewDetail = (lesson) => {
    setViewingLesson(lesson);
    setIsDetailModalOpen(true);
  };

  // Helper chuyển đổi timestamp sang ngày tháng
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  return (
    <div className="tab-content animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--primary)', margin: '0 0 8px 0' }}>Quản lý Bài giảng</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Thiết kế bài giảng và tài liệu học tập của bạn.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 16px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Tìm tiêu đề, mô tả..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '200px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 16px' }}>
            <ArrowUpDown size={16} color="var(--text-muted)" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', cursor: 'pointer', color: 'var(--text)' }}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="title_asc">Tên (A-Z)</option>
              <option value="title_desc">Tên (Z-A)</option>
            </select>
          </div>

          <button 
            onClick={handleCreate}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: 'var(--primary)', color: 'var(--white)', 
              padding: '12px 20px', borderRadius: '8px', 
              border: 'none', cursor: 'pointer', fontWeight: '600',
              boxShadow: '0 4px 12px rgba(88, 28, 44, 0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(88, 28, 44, 0.3)' }}
            onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(88, 28, 44, 0.2)' }}
          >
            <Plus size={20} />
            Thêm Bài giảng
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu bài giảng...</p>
        </div>
      ) : lessons.length === 0 ? (
        <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <BookOpen size={48} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px', color: 'var(--text-main)' }}>Bạn chưa có bài giảng nào</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Hãy chia sẻ kiến thức của bạn ngay hôm nay!</p>
          <button className="btn btn-gold" onClick={handleCreate}>Bắt đầu Tạo Bài giảng</button>
        </div>
      ) : (() => {
        let filtered = lessons.filter(lesson => {
          const match = lesson.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        lesson.description?.toLowerCase().includes(searchTerm.toLowerCase());
          return match;
        });

        if (sortBy === 'newest') {
          filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        } else if (sortBy === 'oldest') {
          filtered.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        } else if (sortBy === 'title_asc') {
          filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        } else if (sortBy === 'title_desc') {
          filtered.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        }

        if (filtered.length === 0) {
          return (
            <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <BookOpen size={40} style={{ color: 'var(--text-secondary)', marginBottom: '12px' }} />
              <h4 style={{ margin: '0 0 4px', color: 'var(--text)' }}>Không tìm thấy bài giảng phù hợp</h4>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.</p>
            </div>
          );
        }

        return (
          <div className="lesson-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filtered.map(lesson => (
            <div key={lesson.id} className="lesson-card" style={{ 
              backgroundColor: 'var(--white)', 
              borderRadius: '12px', 
              border: '1px solid var(--border)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <div style={{ padding: '20px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--primary)', lineHeight: '1.4' }}>{lesson.title}</h3>
                </div>
                
                <p style={{ 
                  color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5',
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  margin: '0 0 16px'
                }}>
                  {lesson.description || 'Chưa có mô tả chi tiết cho bài giảng này.'}
                </p>

                <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} />
                    {formatDate(lesson.createdAt)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FileText size={14} />
                    {lesson.files?.length || 0} tài liệu
                  </div>
                </div>
              </div>

              <div style={{ 
                padding: '12px 20px', 
                backgroundColor: 'var(--bg-warm)', 
                borderTop: '1px solid var(--border)',
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <button 
                  onClick={() => handleAssign(lesson)}
                  className="btn btn-outline" 
                  style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                >
                  <Send size={14} /> Giao bài
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleViewDetail(lesson)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '4px' }} title="Xem chi tiết">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => handleEdit(lesson)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }} title="Sửa">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(lesson.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Xóa">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
            ))}
          </div>
        );
      })()}

      {/* Modals */}
      <LessonModal 
        isOpen={isLessonModalOpen} 
        onClose={() => setIsLessonModalOpen(false)} 
        onSuccess={fetchLessons}
        editingLesson={editingLesson}
      />

      <AssignLessonModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        lesson={assigningLesson}
      />

      <LessonDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        lesson={viewingLesson}
      />
    </div>
  );
};

export default LessonManagement;
