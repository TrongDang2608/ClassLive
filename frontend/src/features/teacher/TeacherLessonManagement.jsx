import React, { useState, useEffect } from 'react';
import TeacherService from './TeacherService';
import { Search, BookOpen, Eye, FileText, ChevronLeft, ChevronRight, RefreshCw, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const TeacherLessonManagement = ({ onSelectLesson }) => {
  const [lessons, setLessons] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, totalLessons: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ search: '', subject: '', grade: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons(1);
  }, [filters.subject, filters.grade]);

  const fetchLessons = async (page = 1) => {
    try {
      setLoading(true);
      const res = await TeacherService.getAssignedLessons(page, pagination.limit, filters);
      if (res.success) {
        setLessons(res.data || []);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Không thể tải kho học liệu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLessons(1);
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
            Kho Bài Giảng Được Cấp
          </h2>
          <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
            Danh sách tất cả bài giảng và tài liệu học liệu được Ban Giám Hiệu phân bổ cho bạn
          </p>
        </div>
        <button 
          className="btn-teacher-outline"
          onClick={() => fetchLessons(pagination.page)}
          title="Làm mới dữ liệu"
        >
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="teacher-card" style={{ marginBottom: '24px', padding: '18px 24px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 2, minWidth: '260px', position: 'relative' }}>
            <Search size={18} color="#64748B" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên bài học hoặc từ khóa..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 14px 10px 42px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                fontSize: '14px',
                outline: 'none',
                background: '#F8FAFC'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '280px' }}>
            <select
              value={filters.subject}
              onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                fontSize: '14px',
                background: '#FFFFFF',
                outline: 'none',
                color: '#0F172A',
                fontWeight: 500
              }}
            >
              <option value="">Tất cả môn học</option>
              <option value="Toán học">Toán học</option>
              <option value="Ngữ văn">Ngữ văn</option>
              <option value="Tiếng Anh">Tiếng Anh</option>
              <option value="Vật lý">Vật lý</option>
              <option value="Hóa học">Hóa học</option>
              <option value="Sinh học">Sinh học</option>
              <option value="Lịch sử">Lịch sử</option>
              <option value="Địa lý">Địa lý</option>
              <option value="Tin học">Tin học</option>
            </select>

            <select
              value={filters.grade}
              onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                fontSize: '14px',
                background: '#FFFFFF',
                outline: 'none',
                color: '#0F172A',
                fontWeight: 500
              }}
            >
              <option value="">Tất cả khối lớp</option>
              <option value="Lớp 10">Lớp 10</option>
              <option value="Lớp 11">Lớp 11</option>
              <option value="Lớp 12">Lớp 12</option>
            </select>

            <button type="submit" className="btn-teacher-primary">
              <Search size={16} /> Tìm kiếm
            </button>
          </div>
        </form>
      </div>

      {/* LESSON GRID */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '260px', flexDirection: 'column', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid rgba(30,58,138,0.2)', borderTopColor: '#1E3A8A', borderRadius: '50%', animation: 'spin 1s infinite linear' }} />
          <span style={{ color: '#64748B', fontSize: '14px' }}>Đang tải kho bài giảng...</span>
        </div>
      ) : lessons.length === 0 ? (
        <div className="teacher-card" style={{ textAlign: 'center', padding: '56px 24px' }}>
          <BookOpen size={52} color="#94A3B8" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', color: '#0F172A', marginBottom: '8px', fontWeight: 700 }}>Chưa có bài giảng nào</h3>
          <p style={{ color: '#64748B', fontSize: '14px', maxWidth: '420px', margin: '0 auto' }}>
            Không tìm thấy bài giảng phù hợp với bộ lọc hoặc School Admin chưa phân bổ bài giảng cho bạn.
          </p>
        </div>
      ) : (
        <>
          <div className="teacher-lesson-grid">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="teacher-lesson-card">
                <div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <span className="teacher-badge teacher-badge-blue">{lesson.subject}</span>
                    <span className="teacher-badge teacher-badge-gold">{lesson.grade}</span>
                  </div>
                  
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', marginBottom: '10px', lineHeight: '1.4' }}>
                    {lesson.title}
                  </h3>

                  <p style={{
                    fontSize: '13px',
                    color: '#64748B',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    marginBottom: '16px'
                  }}>
                    {lesson.description || 'Bài giảng lý thuyết chuẩn từ nhà trường.'}
                  </p>
                </div>

                <div style={{ paddingTop: '14px', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
                    <FileText size={16} color="#2563EB" />
                    <span><strong>{lesson.fileCount}</strong> tệp đính kèm</span>
                  </div>

                  <button
                    className="btn-teacher-primary"
                    onClick={() => onSelectLesson(lesson)}
                  >
                    <Eye size={15} /> Mở Trình Xem
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '32px' }}>
              <button
                className="btn-teacher-outline"
                disabled={pagination.page <= 1}
                onClick={() => fetchLessons(pagination.page - 1)}
                style={{ opacity: pagination.page <= 1 ? 0.5 : 1 }}
              >
                <ChevronLeft size={16} /> Trang trước
              </button>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <button
                className="btn-teacher-outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchLessons(pagination.page + 1)}
                style={{ opacity: pagination.page >= pagination.totalPages ? 0.5 : 1 }}
              >
                Trang sau <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeacherLessonManagement;
