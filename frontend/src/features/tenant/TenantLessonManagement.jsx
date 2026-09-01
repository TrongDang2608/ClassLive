import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, BookOpen, Edit2, Trash2, Send, Users, Eye, FileText, Loader2, Calendar, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import TenantService from './TenantService';
import TenantLessonModal from './TenantLessonModal';
import TenantLessonDetailModal from './TenantLessonDetailModal';
import TenantAssignModal from './TenantAssignModal';
import TenantAssignmentListModal from './TenantAssignmentListModal';
import './tenant.css';

const TenantLessonManagement = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');

  // Modals state
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingLesson, setViewingLesson] = useState(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningLesson, setAssigningLesson] = useState(null);

  const [isAssignmentListOpen, setIsAssignmentListOpen] = useState(false);
  const [managingLesson, setManagingLesson] = useState(null);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const res = await TenantService.getLessons(1, 100);
      setLessons(res.data || []);
    } catch (error) {
      console.error('Lỗi tải danh sách bài giảng:', error);
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

  const handleView = (lesson) => {
    setViewingLesson(lesson);
    setIsDetailModalOpen(true);
  };

  const handleAssign = (lesson) => {
    setAssigningLesson(lesson);
    setIsAssignModalOpen(true);
  };

  const handleManageAssignments = (lesson) => {
    setManagingLesson(lesson);
    setIsAssignmentListOpen(true);
  };

  const handleDelete = async (lesson) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài giảng "${lesson.title}" không? Toàn bộ file đính kèm và quyền truy cập liên quan sẽ bị xóa vĩnh viễn.`)) {
      return;
    }

    try {
      await TenantService.deleteLesson(lesson.id);
      toast.success('Xóa bài giảng thành công!');
      fetchLessons();
    } catch (error) {
      console.error('Lỗi xóa bài giảng:', error);
      toast.error(error.response?.data?.error || 'Xóa bài giảng thất bại.');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  // Filter lessons
  const filteredLessons = lessons.filter(lesson => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      (lesson.title && lesson.title.toLowerCase().includes(term)) ||
      (lesson.description && lesson.description.toLowerCase().includes(term))
    );
    const matchesSubject = selectedSubject === 'all' || lesson.subject === selectedSubject;
    const matchesGrade = selectedGrade === 'all' || lesson.grade === selectedGrade;

    return matchesSearch && matchesSubject && matchesGrade;
  });

  return (
    <div className="animate-fade-in">
      {/* Header & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: 'var(--tenant-primary)', margin: '0 0 6px 0', fontWeight: 700 }}>
            Quản Lý Học Liệu Số
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>
            Soạn thảo bài giảng, tài liệu đính kèm và phân quyền cho các trường học đối tác.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn-emerald-outline" onClick={fetchLessons} title="Làm mới danh sách">
            <RefreshCw size={15} /> Làm mới
          </button>
          <button className="btn-emerald" onClick={handleCreate}>
            <Plus size={16} /> Tạo Học Liệu Mới
          </button>
        </div>
      </div>

      {/* Bộ Lọc & Tìm Kiếm */}
      <div className="tenant-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Input Tìm kiếm */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-warm)', border: '1px solid var(--tenant-border)', borderRadius: 'var(--radius-sm)', padding: '8px 14px', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Tìm theo tiêu đề hoặc nội dung bài giảng..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px' }}
            />
          </div>

          {/* Lọc Môn học */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Môn:</span>
            <select 
              className="form-input" 
              style={{ width: 'auto', padding: '8px 12px', fontSize: '13px' }}
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
            >
              <option value="all">Tất cả môn học</option>
              <option value="Toán Học">Toán Học</option>
              <option value="Vật Lý">Vật Lý</option>
              <option value="Hóa Học">Hóa Học</option>
              <option value="Ngữ Văn">Ngữ Văn</option>
              <option value="Tiếng Anh">Tiếng Anh</option>
              <option value="Sinh Học">Sinh Học</option>
              <option value="Tin Học">Tin Học</option>
            </select>
          </div>

          {/* Lọc Khối lớp */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Khối:</span>
            <select 
              className="form-input" 
              style={{ width: 'auto', padding: '8px 12px', fontSize: '13px' }}
              value={selectedGrade}
              onChange={e => setSelectedGrade(e.target.value)}
            >
              <option value="all">Tất cả các khối</option>
              <option value="Lớp 10">Lớp 10</option>
              <option value="Lớp 11">Lớp 11</option>
              <option value="Lớp 12">Lớp 12</option>
              <option value="Lớp 9">Lớp 9</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bảng Danh Sách Bài Giảng */}
      <div className="tenant-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Loader2 size={32} className="animate-spin" color="var(--tenant-primary)" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Đang tải danh sách học liệu...</p>
          </div>
        ) : filteredLessons.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <BookOpen size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '16px', color: 'var(--text)', marginBottom: '6px' }}>Không tìm thấy học liệu nào</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 20px' }}>
              Hãy bắt đầu tạo bài giảng đầu tiên để cung cấp tài liệu cho các trường học đối tác.
            </p>
            <button className="btn-emerald" onClick={handleCreate}>
              <Plus size={16} /> Tạo Bài Giảng Ngay
            </button>
          </div>
        ) : (
          <table className="tenant-table">
            <thead>
              <tr>
                <th style={{ width: '35%' }}>Học Liệu & Nội Dung</th>
                <th style={{ width: '15%' }}>Phân Loại</th>
                <th style={{ width: '12%' }}>Tài Liệu</th>
                <th style={{ width: '15%' }}>Ngày Tạo</th>
                <th style={{ width: '23%', textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredLessons.map(lesson => (
                <tr key={lesson.id}>
                  {/* Tiêu đề & mô tả */}
                  <td>
                    <div 
                      style={{ fontWeight: 600, color: 'var(--text)', fontSize: '14px', cursor: 'pointer', marginBottom: '4px' }}
                      onClick={() => handleView(lesson)}
                    >
                      {lesson.title}
                    </div>
                    {lesson.description && (
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '360px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lesson.description}
                      </div>
                    )}
                  </td>

                  {/* Môn học & Khối */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                      {lesson.subject && <span className="tag-emerald">{lesson.subject}</span>}
                      {lesson.grade && <span className="tag-gold">{lesson.grade}</span>}
                    </div>
                  </td>

                  {/* Số lượng file */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <FileText size={15} color="var(--tenant-primary)" />
                      <span>{lesson.files?.length || 0} file</span>
                    </div>
                  </td>

                  {/* Ngày tạo */}
                  <td>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} color="var(--text-muted)" />
                      {formatDate(lesson.createdAt)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                      {/* Xem chi tiết */}
                      <button 
                        className="btn-emerald-outline" 
                        style={{ padding: '6px 10px', fontSize: '12px' }} 
                        onClick={() => handleView(lesson)}
                        title="Xem chi tiết & Preview file"
                      >
                        <Eye size={14} />
                      </button>

                      {/* Cấp quyền */}
                      <button 
                        className="btn-emerald" 
                        style={{ padding: '6px 10px', fontSize: '12px' }} 
                        onClick={() => handleAssign(lesson)}
                        title="Cấp quyền bài giảng cho School Admin"
                      >
                        <Send size={14} /> Cấp quyền
                      </button>

                      {/* Xem danh sách đã cấp */}
                      <button 
                        className="btn-emerald-outline" 
                        style={{ padding: '6px 10px', fontSize: '12px' }} 
                        onClick={() => handleManageAssignments(lesson)}
                        title="Xem & Thu hồi quyền đã cấp"
                      >
                        <Users size={14} />
                      </button>

                      {/* Sửa */}
                      <button 
                        className="btn-emerald-outline" 
                        style={{ padding: '6px 10px', fontSize: '12px' }} 
                        onClick={() => handleEdit(lesson)}
                        title="Chỉnh sửa bài giảng"
                      >
                        <Edit2 size={14} />
                      </button>

                      {/* Xóa */}
                      <button 
                        className="btn-emerald-outline" 
                        style={{ padding: '6px 10px', fontSize: '12px', color: '#d32f2f', borderColor: '#d32f2f20' }} 
                        onClick={() => handleDelete(lesson)}
                        title="Xóa bài giảng"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      <TenantLessonModal 
        isOpen={isLessonModalOpen} 
        onClose={() => setIsLessonModalOpen(false)} 
        lesson={editingLesson}
        onSuccess={fetchLessons}
      />

      <TenantLessonDetailModal 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
        lesson={viewingLesson}
      />

      <TenantAssignModal 
        isOpen={isAssignModalOpen} 
        onClose={() => setIsAssignModalOpen(false)} 
        lesson={assigningLesson}
        onSuccess={fetchLessons}
      />

      <TenantAssignmentListModal 
        isOpen={isAssignmentListOpen} 
        onClose={() => setIsAssignmentListOpen(false)} 
        lesson={managingLesson}
        onRevokeSuccess={fetchLessons}
      />
    </div>
  );
};

export default TenantLessonManagement;
