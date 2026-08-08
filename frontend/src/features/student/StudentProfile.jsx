import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Save, Loader2 } from 'lucide-react';
import StudentService from './StudentService';
import toast from 'react-hot-toast';

const StudentProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    email: '',
    username: '',
    role: 'student'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await StudentService.getProfile();
        if (res.success) {
          setProfile({
            name: res.data.name || '',
            phone: res.data.phone || '',
            email: res.data.email || '',
            username: res.data.username || '',
            role: res.data.role || 'student'
          });
        }
      } catch (error) {
        toast.error('Không thể tải thông tin cá nhân');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await StudentService.updateProfile({
        name: profile.name,
        email: profile.email,
        phone: profile.phone
      });
      toast.success('Cập nhật thông tin cá nhân thành công!');
    } catch (error) {
      toast.error('Lỗi khi cập nhật thông tin');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', color: 'var(--text-secondary)' }}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', color: 'var(--primary)', fontWeight: '700' }}>Hồ Sơ Cá Nhân</h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Quản lý thông tin liên lạc và tài khoản của bạn.
        </p>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '32px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--gold)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '600' }}>
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <h2 style={{ fontSize: '24px', color: 'var(--primary)', fontWeight: '700', marginBottom: '4px' }}>{profile.name || 'Học viên chưa cập nhật tên'}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
              <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '100px', background: 'var(--primary-glow)', color: 'var(--primary)', fontSize: '12px', fontWeight: '600' }}>HỌC VIÊN</span>
              {profile.username && <span>• @{profile.username}</span>}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Họ và Tên</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px', color: 'var(--text-muted)' }}>
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên"
                  style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '15px', fontFamily: 'inherit', color: 'var(--text)', outline: 'none' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Số điện thoại</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px', color: 'var(--text-muted)' }}>
                  <Phone size={18} />
                </div>
                <input 
                  type="text" 
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="Ví dụ: +84123456789"
                  style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '15px', fontFamily: 'inherit', color: 'var(--text)', outline: 'none' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email liên hệ</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px', color: 'var(--text-muted)' }}>
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="Ví dụ: name@email.com"
                  style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '15px', fontFamily: 'inherit', color: 'var(--text)', outline: 'none' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', paddingTop: '24px', borderTop: '1px solid var(--border-light)' }}>
            <button 
              type="submit"
              disabled={saving}
              className="btn btn-gold"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Lưu Thay Đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentProfile;
