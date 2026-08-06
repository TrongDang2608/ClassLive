import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FolderOpen, HeadphonesIcon, LogOut } from 'lucide-react';
import AuthService from '../auth/AuthService';
import '../auth/auth.css'; // Reuse CSS vars, ideally we should have a dashboard.css

const StudentDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }
    } catch (err) {
      console.error('Lỗi khi đăng xuất:', err);
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  return (
    <div className="dashboard-layout animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: '100vh' }}>
      <aside className="sidebar" style={{ background: 'var(--white)', borderRight: '1px solid var(--border)', padding: '32px 24px', display: 'flex', flexDirection: 'column' }}>
        <div className="logo" style={{ fontSize: '28px', marginBottom: '48px', color: 'var(--primary)', fontWeight: '700' }}>
          Class<span style={{ color: 'var(--gold)' }}>Live</span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <a className="sidebar-item active" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', background: 'var(--primary)', color: 'var(--white)', cursor: 'pointer' }}>
            <BookOpen size={18} /> Góc Học Tập
          </a>
          <a className="sidebar-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <FolderOpen size={18} /> Tài Liệu
          </a>
          <a className="sidebar-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <HeadphonesIcon size={18} /> Liên Hệ Giảng Viên
          </a>
        </nav>
        <div style={{ paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <a onClick={handleLogout} className="sidebar-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: '#D32F2F', cursor: 'pointer', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(211, 47, 47, 0.08)' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
            <LogOut size={18} /> Đăng xuất
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', background: 'var(--bg-warm)', border: '1px solid var(--border)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600', color: 'var(--white)' }}>
              AJ
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Alice Johnson</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Học Viên</div>
            </div>
          </div>
        </div>
      </aside>
      <main style={{ padding: '48px', overflowY: 'auto', background: 'var(--bg)' }}>
        <div style={{ marginBottom: '40px' }} className="animate-slide-right">
          <h1 style={{ fontSize: '32px', color: 'var(--primary)' }}>Khóa Học Của Tôi</h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '4px' }}>Tiếp tục hành trình trau dồi tri thức của bạn.</p>
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '28px', animationDelay: '0.1s' }} className="animate-slide-right">
          <div className="card-title" style={{ fontSize: '20px', color: 'var(--primary)', marginBottom: '24px' }}>Chuyên Đề Đang Tham Gia</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ padding: '24px', border: '1px solid var(--gold-border)', borderRadius: '8px', background: 'var(--gold-glow)' }}>
              <h3 style={{ color: 'var(--gold-dark)', marginBottom: '8px', fontSize: '16px' }}>Nghệ Thuật Phục Hưng</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>Khám phá tư tưởng và tác phẩm nghệ thuật tiêu biểu thời kỳ Phục Hưng.</p>
              <button className="btn btn-gold">Tiếp Tục Học</button>
            </div>
            <div style={{ padding: '24px', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <h3 style={{ color: 'var(--primary)', marginBottom: '8px', fontSize: '16px' }}>Triết Học Hiện Đại</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>Nghiên cứu các trào lưu triết học phương Tây thế kỷ 20.</p>
              <button className="btn" style={{ border: '1.5px solid var(--border)', color: 'var(--text)', background: 'transparent' }}>Bắt Đầu</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
