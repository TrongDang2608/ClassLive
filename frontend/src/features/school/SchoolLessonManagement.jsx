import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Eye, Share2, Users, Filter, RefreshCw, FileText } from 'lucide-react';
import SchoolService from './SchoolService';
import SchoolLessonDetailModal from './SchoolLessonDetailModal';
import SchoolAssignModal from './SchoolAssignModal';
import SchoolAssignmentListModal from './SchoolAssignmentListModal';
import toast from 'react-hot-toast';

const SchoolLessonManagement = () => {
  const [lessons, setLessons] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [filters, setFilters] = useState({ subject: 'all', grade: 'all', search: '' });
  const [loading, setLoading] = useState(true);

  // Map lưu số lượng GV đã được cấp bài cho mỗi lesson: { [lessonId]: count }
  const [assignedCounts, setAssignedCounts] = useState({});

  // Modals state
  const [selectedLessonForDetail, setSelectedLessonForDetail] = useState(null);
  const [selectedLessonForAssign, setSelectedLessonForAssign] = useState(null);
  const [selectedLessonForAssignmentsList, setSelectedLessonForAssignmentsList] = useState(null);

  useEffect(() => {
    fetchLessons();
  }, [pagination.page, filters.subject, filters.grade]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const res = await SchoolService.getAssignedLessons(pagination.page, pagination.limit, filters);
      if (res.success) {
        setLessons(res.data || []);
        if (res.pagination) {
          setPagination(prev => ({ ...prev, ...res.pagination }));
        }

        // Tải badge số lượng GV đã được cấp cho từng bài giảng
        fetchAssignedCounts(res.data || []);
      }
    } catch (err) {
      toast.error('Không thể tải kho bài giảng.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedCounts = async (lessonList) => {
    const countsMap = {};
    await Promise.all(
      lessonList.map(async (lesson) => {
        try {
          const res = await SchoolService.getLessonAssignments(lesson.id);
          if (res.success) {
            countsMap[lesson.id] = res.data.length;
          }
        } catch (e) {
          countsMap[lesson.id] = 0;
        }
      })
    );
    setAssignedCounts(countsMap);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchLessons();
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* HEADER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#230C3B', margin: '0 0 4px 0' }}>Kho Bài Giảng Được Cấp</h2>
          <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>Xem bài giảng nhận từ Tenant Admin & Phân bổ xuống Giáo viên trong trường</p>
        </div>
        <button 
          className="btn btn-outline-secondary"
          onClick={fetchLessons}
          title="Làm mới dữ liệu"
        >
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="card">
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ flex: 2, minWidth: '260px' }}>
              <div className="input-group">
                <span className="input-group-text">
                  <Search size={16} />
                </span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Tìm kiếm tiêu đề, từ khóa bài giảng..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>

            {/* Môn học */}
            <div style={{ flex: 1, minWidth: '180px' }}>
              <select 
                className="form-select" 
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
              >
                <option value="all">-- Tất cả Môn học --</option>
                <option value="Toán Học">Toán Học</option>
                <option value="Ngữ Văn">Ngữ Văn</option>
                <option value="Tiếng Anh">Tiếng Anh</option>
                <option value="Vật Lý">Vật Lý</option>
                <option value="Hóa Học">Hóa Học</option>
                <option value="Sinh Học">Sinh Học</option>
                <option value="Lịch Sử">Lịch Sử</option>
                <option value="Địa Lý">Địa Lý</option>
              </select>
            </div>

            {/* Khối lớp */}
            <div style={{ flex: 1, minWidth: '160px' }}>
              <select 
                className="form-select" 
                value={filters.grade}
                onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
              >
                <option value="all">-- Tất cả Khối lớp --</option>
                <option value="Lớp 10">Lớp 10</option>
                <option value="Lớp 11">Lớp 11</option>
                <option value="Lớp 12">Lớp 12</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>
              <Filter size={16} /> Lọc
            </button>
          </form>
        </div>
      </div>

      {/* LESSONS TABLE */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6B7280' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid rgba(59, 24, 95, 0.2)', borderTopColor: '#3B185F', borderRadius: '50%', animation: 'pulse 1s infinite linear', margin: '0 auto 12px' }} />
            Đang tải danh sách bài giảng...
          </div>
        ) : lessons.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6B7280' }}>
            <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <h3 style={{ fontSize: '16px', color: '#230C3B', marginBottom: '6px' }}>Không có bài giảng nào</h3>
            <p style={{ fontSize: '14px', margin: 0 }}>Trường của bạn chưa được cấp bài giảng nào từ Tenant Admin.</p>
          </div>
        ) : (
          <table className="table table-hover">
            <thead>
              <tr>
                <th style={{ width: '35%' }}>Bài Giảng</th>
                <th style={{ width: '15%' }}>Môn / Khối</th>
                <th style={{ width: '20%' }}>Trạng Thái Cấp GV (Badge)</th>
                <th style={{ width: '12%' }}>Tài Liệu</th>
                <th style={{ width: '18%', textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson) => {
                const count = assignedCounts[lesson.id] || 0;

                return (
                  <tr key={lesson.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(59, 24, 95, 0.08)', color: '#3B185F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', flexShrink: 0 }}>
                          <BookOpen size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#230C3B', fontSize: '14px', marginBottom: '2px' }}>{lesson.title}</div>
                          <div style={{ fontSize: '12px', color: '#6B7280', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {lesson.description || 'Không có mô tả'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                        <span className="badge" style={{ background: 'rgba(59, 24, 95, 0.08)', color: '#3B185F', border: '1px solid rgba(59, 24, 95, 0.2)' }}>
                          {lesson.subject || 'Môn học'}
                        </span>
                        <span className="badge" style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#854D0E', border: '1px solid #D4AF37' }}>
                          {lesson.grade || 'Khối'}
                        </span>
                      </div>
                    </td>

                    {/* HUY HIỆU BADGE THEO YÊU CẦU NGƯỜI DÙNG */}
                    <td>
                      <button 
                        type="button"
                        className="assigned-count-badge"
                        onClick={() => setSelectedLessonForAssignmentsList(lesson)}
                        title="Click để xem danh sách Giáo viên đã nhận"
                        style={{ border: 'none', cursor: 'pointer' }}
                      >
                        <Users size={14} /> Đã cấp: {count} GV
                      </button>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6B7280' }}>
                        <FileText size={15} style={{ color: '#3B185F' }} />
                        <span>{lesson.files?.length || 0} file</span>
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button 
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setSelectedLessonForDetail(lesson)}
                          title="Xem chi tiết & Live Preview file"
                        >
                          <Eye size={14} /> Xem
                        </button>

                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => setSelectedLessonForAssign(lesson)}
                        >
                          <Share2 size={14} /> Phân bổ GV
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* PAGINATION */}
        {pagination.totalPages > 1 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--school-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>Trang {pagination.page} / {pagination.totalPages}</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                className="btn btn-sm btn-outline-secondary"
                disabled={pagination.page <= 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Trước
              </button>
              <button 
                className="btn btn-sm btn-outline-secondary"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <SchoolLessonDetailModal 
        isOpen={!!selectedLessonForDetail}
        onClose={() => setSelectedLessonForDetail(null)}
        lesson={selectedLessonForDetail}
      />

      <SchoolAssignModal 
        isOpen={!!selectedLessonForAssign}
        onClose={() => setSelectedLessonForAssign(null)}
        lesson={selectedLessonForAssign}
        onSuccess={fetchLessons}
      />

      <SchoolAssignmentListModal 
        isOpen={!!selectedLessonForAssignmentsList}
        onClose={() => setSelectedLessonForAssignmentsList(null)}
        lesson={selectedLessonForAssignmentsList}
        onRevokeSuccess={fetchLessons}
      />
    </div>
  );
};

export default SchoolLessonManagement;
