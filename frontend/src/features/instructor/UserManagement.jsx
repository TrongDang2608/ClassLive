import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, User, Shield, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import InstructorService from './InstructorService';
import UserModal from './UserModal';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      // Gọi API lấy toàn bộ user (không truyền role để thấy cả Học sinh & Giảng viên)
      const res = await InstructorService.getUsers(null, page, pagination.limit);
      if (res.success) {
        setUsers(res.data);
        setPagination(res.pagination);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (data, identifier) => {
    try {
      if (identifier) {
        // Chỉnh sửa
        await InstructorService.editUser(identifier, data);
        toast.success('Cập nhật tài khoản thành công!');
      } else {
        // Thêm mới
        await InstructorService.addUser(data);
        toast.success('Tạo tài khoản thành công!');
      }
      fetchUsers(pagination.page); // Tải lại trang hiện tại
    } catch (error) {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
      throw error; // Quăng lỗi để Modal không đóng nếu lỗi
    }
  };

  const handleDelete = async (identifier) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác.')) {
      try {
        await InstructorService.deleteUser(identifier);
        toast.success('Đã xóa tài khoản!');
        fetchUsers(1);
      } catch (error) {
        toast.error(error.response?.data?.error || 'Lỗi khi xóa tài khoản');
      }
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--primary)', margin: '0 0 8px 0' }}>Quản lý User</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Xem, thêm, sửa, xóa học sinh và giảng viên hệ thống.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: 'var(--primary)', color: 'var(--white)', 
            padding: '12px 20px', borderRadius: '8px', 
            border: 'none', cursor: 'pointer', fontWeight: '600',
            boxShadow: '0 4px 12px rgba(44, 62, 80, 0.2)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(44, 62, 80, 0.3)' }}
          onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(44, 62, 80, 0.2)' }}
        >
          <Plus size={20} />
          Thêm Tài Khoản
        </button>
      </div>

      {/* Bảng Dữ Liệu */}
      <div style={{ background: 'var(--white)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg)', color: 'var(--text-secondary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '16px 24px', fontWeight: '600' }}>Họ và Tên</th>
              <th style={{ padding: '16px 24px', fontWeight: '600' }}>Username</th>
              <th style={{ padding: '16px 24px', fontWeight: '600' }}>Liên hệ</th>
              <th style={{ padding: '16px 24px', fontWeight: '600' }}>Vai trò</th>
              <th style={{ padding: '16px 24px', fontWeight: '600', textAlign: 'right' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Đang tải dữ liệu...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Chưa có tài khoản nào.</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <User size={20} />
                      </div>
                      <span style={{ fontWeight: '500', color: 'var(--primary)' }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--text)' }}>
                    {user.username || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Chưa cập nhật</span>}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text)', fontSize: '14px' }}>
                        <Phone size={14} color="var(--text-secondary)" /> {user.phone}
                      </div>
                      {user.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                          <Mail size={14} /> {user.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {user.role === 'instructor' ? (
                      <span style={{ background: 'rgba(212, 175, 55, 0.15)', color: 'var(--gold)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Shield size={14} /> Giảng Viên
                      </span>
                    ) : (
                      <span style={{ background: 'rgba(44, 62, 80, 0.1)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                        Học Sinh
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button onClick={() => handleOpenModal(user)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '8px', marginRight: '8px' }}>
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(user.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#e74c3c', padding: '8px' }}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Phân trang */}
        {!loading && pagination.totalPages > 1 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => fetchUsers(pageNum)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: pageNum === pagination.page ? 'none' : '1px solid var(--border)',
                  background: pageNum === pagination.page ? 'var(--primary)' : 'var(--white)',
                  color: pageNum === pagination.page ? 'var(--white)' : 'var(--text)',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: '0.2s'
                }}
              >
                {pageNum}
              </button>
            ))}
          </div>
        )}
      </div>

      <UserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveUser} 
        initialData={editingUser} 
      />
    </div>
  );
};

export default UserManagement;
