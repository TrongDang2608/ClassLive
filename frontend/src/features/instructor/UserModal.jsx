import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const UserModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    phone: '',
    email: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        username: initialData.username || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        role: initialData.role || 'student'
      });
    } else {
      setFormData({ name: '', username: '', phone: '', email: '', role: 'student' });
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
      // Error is handled in the parent component via react-hot-toast or here
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
        maxWidth: '500px',
        borderRadius: '12px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--primary)', fontWeight: '600' }}>
            {initialData ? 'Chỉnh Sửa Tài Khoản' : 'Thêm Tài Khoản Mới'}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Họ và Tên *</label>
            <input 
              name="name" value={formData.name} onChange={handleChange}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', fontSize: '15px' }}
              placeholder="Ví dụ: Nguyễn Văn A"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Username</label>
              <input 
                name="username" value={formData.username} onChange={handleChange}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', fontSize: '15px' }}
                placeholder="Ví dụ: nguyenvana123"
              />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Số điện thoại *</label>
              <input 
                name="phone" value={formData.phone} onChange={handleChange}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', fontSize: '15px' }}
                placeholder="+84..."
              />
            </div>
          </div>

          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Email</label>
            <input 
              type="email" name="email" value={formData.email} onChange={handleChange}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', fontSize: '15px' }}
              placeholder="nguyenvana@gmail.com"
            />
          </div>

          {!initialData && (
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Loại tài khoản</label>
              <select 
                name="role" value={formData.role} onChange={handleChange}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', fontSize: '15px', background: 'var(--white)', cursor: 'pointer' }}
              >
                <option value="student">Học sinh</option>
                <option value="instructor">Giảng viên</option>
              </select>
            </div>
          )}

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', fontWeight: '500' }}>
              Hủy
            </button>
            <button type="submit" disabled={loading} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'var(--white)', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600' }}>
              {loading ? 'Đang lưu...' : (initialData ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
