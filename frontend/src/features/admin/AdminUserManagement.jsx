import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, User, Shield, Phone, Mail, Eye, Search, Filter, Building2, UserCog } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminService from './AdminService';
import AdminUserModal from './AdminUserModal';

const ROLE_LABELS = {
  admin: { label: 'Admin', color: '#e74c3c', bg: 'rgba(231, 76, 60, 0.12)', icon: Shield },
  tenant_admin: { label: 'Tenant Admin', color: 'var(--gold-dark)', bg: 'var(--gold-glow)', icon: Building2 },
  school_admin: { label: 'School Admin', color: '#2980b9', bg: 'rgba(41, 128, 185, 0.12)', icon: UserCog },
  teacher: { label: 'Teacher', color: 'var(--primary)', bg: 'rgba(44, 62, 80, 0.1)', icon: User },
};

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await AdminService.getUsers(null, page, pagination.limit);
      if (res.success) {
        setUsers(res.data);
        setPagination({ page: res.page, limit: res.limit, totalPages: res.totalPages });
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách tài khoản');
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
        await AdminService.editUser(identifier, data);
        toast.success('Cập nhật tài khoản thành công!');
      } else {
        await AdminService.addUser(data);
        toast.success('Tạo tài khoản thành công! Email setup đã được gửi.');
      }
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
      throw error;
    }
  };

  const handleDelete = async (user) => {
    if (user.createdBy === 'system') {
      toast.error('Không thể xóa Root Admin!');
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.name}"? Hành động này không thể hoàn tác.`)) {
      try {
        await AdminService.deleteUser(user.id);
        toast.success('Đã xóa tài khoản!');
        fetchUsers(1);
      } catch (error) {
        toast.error(error.response?.data?.error || 'Lỗi khi xóa tài khoản');
      }
    }
  };

  const renderRoleBadge = (role) => {
    const config = ROLE_LABELS[role] || { label: role, color: '#999', bg: '#f0f0f0', icon: User };
    const IconComponent = config.icon;
    return (
      <span style={{
        background: config.bg, color: config.color,
        padding: '6px 12px', borderRadius: '20px', fontSize: '12px',
        fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px'
      }}>
        <IconComponent size={14} /> {config.label}
      </span>
    );
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--primary)', margin: '0 0 8px 0' }}>Quản lý Tài Khoản</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Tạo và quản lý tài khoản Tenant Admin, School Admin, Teacher.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 16px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Tìm tên, SĐT, Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '200px' }}
            />
          </div>

          {/* Filter Role */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 16px' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', cursor: 'pointer', color: 'var(--text)' }}
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Admin</option>
              <option value="tenant_admin">Tenant Admin</option>
              <option value="school_admin">School Admin</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          {/* Add Button */}
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
          >
            <Plus size={20} />
            Thêm Tài Khoản
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--white)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg)', color: 'var(--text-secondary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '16px 24px', fontWeight: '600' }}>Họ và Tên</th>
              <th style={{ padding: '16px 24px', fontWeight: '600' }}>Liên hệ</th>
              <th style={{ padding: '16px 24px', fontWeight: '600' }}>Vai trò</th>
              <th style={{ padding: '16px 24px', fontWeight: '600' }}>Tổ chức</th>
              <th style={{ padding: '16px 24px', fontWeight: '600', textAlign: 'right' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Đang tải dữ liệu...</td></tr>
            ) : (() => {
              const filteredUsers = users.filter(u => {
                const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      u.phone?.includes(searchTerm) ||
                                      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));
                const matchesRole = filterRole === 'all' || u.role === filterRole;
                return matchesSearch && matchesRole;
              });

              if (filteredUsers.length === 0) {
                return <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Không tìm thấy tài khoản nào phù hợp.</td></tr>;
              }

              return filteredUsers.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  {/* Tên */}
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: '600', fontSize: '16px' }}>
                        {user.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <span style={{ fontWeight: '500', color: 'var(--primary)', display: 'block' }}>{user.name}</span>
                        {user.username && <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>@{user.username}</span>}
                      </div>
                    </div>
                  </td>
                  {/* Liên hệ */}
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
                  {/* Role */}
                  <td style={{ padding: '16px 24px' }}>
                    {renderRoleBadge(user.role)}
                  </td>
                  {/* Tổ chức */}
                  <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building2 size={14} /> {user.organizationId || 'root'}
                    </div>
                  </td>
                  {/* Actions */}
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button onClick={() => handleOpenModal(user)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '8px', marginRight: '4px' }} title="Sửa">
                      <Edit2 size={18} />
                    </button>
                    {user.createdBy !== 'system' && (
                      <button onClick={() => handleDelete(user)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#e74c3c', padding: '8px' }} title="Xóa">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => fetchUsers(pageNum)}
                style={{
                  padding: '8px 16px', borderRadius: '6px',
                  border: pageNum === pagination.page ? 'none' : '1px solid var(--border)',
                  background: pageNum === pagination.page ? 'var(--primary)' : 'var(--white)',
                  color: pageNum === pagination.page ? 'var(--white)' : 'var(--text)',
                  cursor: 'pointer', fontWeight: '500', transition: '0.2s'
                }}
              >
                {pageNum}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AdminUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        initialData={editingUser}
      />
    </div>
  );
};

export default AdminUserManagement;
