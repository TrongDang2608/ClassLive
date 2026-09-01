import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Edit2, Trash2, Mail, Phone, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import SchoolService from './SchoolService';
import SchoolTeacherModal from './SchoolTeacherModal';
import toast from 'react-hot-toast';

const SchoolTeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacherForEdit, setSelectedTeacherForEdit] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, [pagination.page]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await SchoolService.getTeachers(pagination.page, pagination.limit, search);
      if (res.success) {
        setTeachers(res.data || []);
        if (res.pagination) {
          setPagination(prev => ({ ...prev, ...res.pagination }));
        }
      }
    } catch (err) {
      toast.error('Không thể tải danh sách Giáo viên.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchTeachers();
  };

  const handleOpenAdd = () => {
    setSelectedTeacherForEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (teacher) => {
    setSelectedTeacherForEdit(teacher);
    setIsModalOpen(true);
  };

  const handleDeleteTeacher = async (teacherId, teacherName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa Giáo viên "${teacherName}"? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      setDeletingId(teacherId);
      const res = await SchoolService.deleteTeacher(teacherId);
      if (res.success) {
        toast.success(res.message || 'Đã xóa tài khoản Giáo viên thành công!');
        fetchTeachers();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xóa Giáo viên thất bại.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* HEADER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#230C3B', margin: '0 0 4px 0' }}>Quản Lý Giáo Viên</h2>
          <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>Quản lý đội ngũ Giáo viên trong trường, cấp tài khoản và phân quyền giảng dạy</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-outline-secondary"
            onClick={fetchTeachers}
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={16} /> Làm mới
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleOpenAdd}
          >
            <UserPlus size={18} /> Thêm Giáo Viên Mới
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="card">
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <span className="input-group-text">
                <Search size={16} />
              </span>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Tìm kiếm theo Họ tên, Email, Số điện thoại Giáo viên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
              Tìm kiếm
            </button>
          </form>
        </div>
      </div>

      {/* TEACHERS TABLE */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6B7280' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid rgba(59, 24, 95, 0.2)', borderTopColor: '#3B185F', borderRadius: '50%', animation: 'pulse 1s infinite linear', margin: '0 auto 12px' }} />
            Đang tải danh sách Giáo viên...
          </div>
        ) : teachers.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6B7280' }}>
            <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <h3 style={{ fontSize: '16px', color: '#230C3B', marginBottom: '6px' }}>Chưa có Giáo viên nào</h3>
            <p style={{ fontSize: '14px', margin: '0 0 20px 0' }}>Bấm "Thêm Giáo Viên Mới" để tạo tài khoản đầu tiên cho trường học của bạn.</p>
            <button className="btn btn-primary" onClick={handleOpenAdd}>
              <UserPlus size={16} /> Thêm Giáo Viên Mới
            </button>
          </div>
        ) : (
          <table className="table table-hover">
            <thead>
              <tr>
                <th style={{ width: '28%' }}>Giáo Viên</th>
                <th style={{ width: '24%' }}>Email / Tài khoản</th>
                <th style={{ width: '16%' }}>Số Điện Thoại</th>
                <th style={{ width: '16%' }}>Trạng Thái</th>
                <th style={{ width: '16%', textAlign: 'right' }}>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #3B185F 0%, #5A2A8C 100%)', color: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', flexShrink: 0 }}>
                        {teacher.name ? teacher.name.charAt(0) : 'G'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#230C3B', fontSize: '14px' }}>{teacher.name}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>{teacher.username || 'Chưa thiết lập username'}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#230C3B' }}>
                      <Mail size={14} style={{ color: '#3B185F' }} />
                      <span>{teacher.email}</span>
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#230C3B' }}>
                      <Phone size={14} style={{ color: '#3B185F' }} />
                      <span>{teacher.phone}</span>
                    </div>
                  </td>

                  <td>
                    {teacher.isSetup ? (
                      <span className="badge" style={{ background: 'rgba(46, 125, 50, 0.1)', color: '#2E7D32', border: '1px solid rgba(46, 125, 50, 0.2)' }}>
                        <CheckCircle size={12} /> Đã kích hoạt
                      </span>
                    ) : (
                      <span className="badge" style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#854D0E', border: '1px solid #D4AF37' }}>
                        <Clock size={12} /> Chờ kích hoạt
                      </span>
                    )}
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button 
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handleOpenEdit(teacher)}
                        title="Sửa thông tin"
                      >
                        <Edit2 size={14} /> Sửa
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                        disabled={deletingId === teacher.id}
                        title="Xóa Giáo viên"
                      >
                        <Trash2 size={14} /> {deletingId === teacher.id ? '...' : 'Xóa'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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

      {/* MODAL */}
      <SchoolTeacherModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        teacher={selectedTeacherForEdit}
        onSuccess={fetchTeachers}
      />
    </div>
  );
};

export default SchoolTeacherManagement;
