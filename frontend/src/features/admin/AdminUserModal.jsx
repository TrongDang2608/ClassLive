import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_OPTIONS = [
  { value: 'tenant_admin', label: 'Tenant Admin (Chủ hệ thống)' },
  { value: 'school_admin', label: 'School Admin (Hiệu trưởng)' },
  { value: 'admin', label: 'Admin (Quản trị viên)' },
  { value: 'teacher', label: 'Teacher (Giáo viên)' },
];

const AdminUserModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'tenant_admin',
    organizationId: 'root'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        role: initialData.role || 'tenant_admin',
        organizationId: initialData.organizationId || 'root'
      });
    } else {
      setFormData({ name: '', phone: '', email: '', role: 'tenant_admin', organizationId: 'root' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Tên và Số điện thoại là bắt buộc!');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData, initialData?.id || initialData?.phone);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="animate-fade-in" style={{
        background: 'var(--white)',
        width: '100%',
        maxWidth: '520px',
        borderRadius: '12px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--primary)', fontWeight: '600' }}>
            {initialData ? 'Chỉnh Sửa Tài Khoản' : 'Thêm Tài Khoản Mới'}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Tên */}
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>Họ và Tên *</label>
            <input
              name="name" value={formData.name} onChange={handleChange}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }}
              placeholder="Ví dụ: Nguyễn Văn A"
            />
          </div>

          {/* SĐT */}
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>Số điện thoại *</label>
            <input
              name="phone" value={formData.phone} onChange={handleChange}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }}
              placeholder="+84..."
            />
          </div>

          {/* Email */}
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>
              Email <span style={{ fontSize: '12px', color: 'var(--gold)' }}>(Dùng gửi link setup tài khoản)</span>
            </label>
            <input
              type="email" name="email" value={formData.email} onChange={handleChange}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }}
              placeholder="nguyenvana@gmail.com"
            />
          </div>

          {/* Role */}
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>Loại tài khoản</label>
            <select
              name="role" value={formData.role} onChange={handleChange}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', fontSize: '15px', background: 'var(--white)', cursor: 'pointer', boxSizing: 'border-box' }}
            >
              {ROLE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* OrganizationId */}
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>
              Mã tổ chức <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>(mặc định: root)</span>
            </label>
            <input
              name="organizationId" value={formData.organizationId} onChange={handleChange}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }}
              placeholder="root"
            />
          </div>

          {/* Buttons */}
          <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose}
              style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', fontWeight: '500' }}>
              Hủy
            </button>
            <button type="submit" disabled={loading}
              style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'var(--white)', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Đang lưu...' : (initialData ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUserModal;
