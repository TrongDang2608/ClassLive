import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, LifeBuoy, Bell, Search, GraduationCap, Laptop, CheckCircle, MessageSquare, LogOut } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import AuthService from '../auth/AuthService';
import UserManagement from './UserManagement';
import LessonManagement from './LessonManagement';
import '../auth/auth.css'; // Reuse CSS vars

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

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

  const renderContent = () => {
    if (activeTab === 'users') {
      return <UserManagement />;
    }
    
    if (activeTab === 'lessons') {
      return <LessonManagement />;
    }
    
    // Mặc định là dashboard
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }} className="animate-slide-right">
          <div>
            <h1 style={{ fontSize: '32px', color: 'var(--primary)' }}>Tổng Quan Giảng Dạy</h1>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '4px' }}>Chào buổi sáng, Giáo sư Trọng. Chúc ngài một ngày làm việc hiệu quả.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: '100px', background: 'var(--white)', border: '1px solid var(--border)', width: '280px' }}>
              <Search size={18} color="var(--text-muted)" />
              <input type="text" placeholder="Tìm kiếm tài liệu..." style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px', fontFamily: 'inherit' }} />
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--white)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)', border: '2px solid var(--white)' }}></div>
              <Bell size={20} />
            </div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }} className="animate-slide-right">
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gold-glow)', color: 'var(--gold-dark)' }}>
                <GraduationCap size={22} />
              </div>
            </div>
            <div style={{ fontSize: '32px', color: 'var(--primary)', marginBottom: '4px', fontWeight: '700' }}>124</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Tổng Sinh Viên</div>
          </div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                <Laptop size={22} />
              </div>
            </div>
            <div style={{ fontSize: '32px', color: 'var(--primary)', marginBottom: '4px', fontWeight: '700' }}>12</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Chuyên Đề Đang Mở</div>
          </div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gold-glow)', color: 'var(--gold-dark)' }}>
                <CheckCircle size={22} />
              </div>
            </div>
            <div style={{ fontSize: '32px', color: 'var(--primary)', marginBottom: '4px', fontWeight: '700' }}>98%</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Tỷ Lệ Đạt Chuẩn</div>
          </div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                <MessageSquare size={22} />
              </div>
            </div>
            <div style={{ fontSize: '32px', color: 'var(--primary)', marginBottom: '4px', fontWeight: '700' }}>3</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Yêu Cầu Cần Duyệt</div>
          </div>
        </div>
        
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '28px', marginBottom: '32px' }} className="animate-slide-right">
          <div style={{ fontSize: '20px', color: 'var(--primary)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '700' }}>
            Học Viên Xuất Sắc 
            <button className="btn btn-gold">+ Thêm Mới</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>Học Viên</th>
                <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>Chuyên Ngành</th>
                <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>Trạng Thái</th>
                <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>Tiến Độ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', fontSize: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', color: 'var(--white)', background: 'var(--gold)' }}>AJ</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Alice Johnson</div>
                  </div>
                </td>
                <td style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', fontSize: '14px' }}>Nghệ Thuật Học</td>
                <td style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', fontSize: '14px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '500', color: 'var(--success)', background: 'var(--success-glow)', border: '1px solid rgba(46,125,50,0.2)' }}>Đang Học</span>
                </td>
                <td style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', fontSize: '14px', color: 'var(--primary)', fontWeight: '600' }}>85%</td>
              </tr>
              <tr>
                <td style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', fontSize: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', color: 'var(--white)', background: 'var(--primary)' }}>DW</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>David Wilson</div>
                  </div>
                </td>
                <td style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', fontSize: '14px' }}>Triết Học</td>
                <td style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', fontSize: '14px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '500', color: 'var(--success)', background: 'var(--success-glow)', border: '1px solid rgba(46,125,50,0.2)' }}>Đang Học</span>
                </td>
                <td style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', fontSize: '14px', color: 'var(--gold-dark)', fontWeight: '600' }}>100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const getSidebarItemStyle = (tabName) => {
    const isActive = activeTab === tabName;
    return {
      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', 
      fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
      fontWeight: isActive ? '600' : '500',
      background: isActive ? 'var(--primary)' : 'transparent',
      color: isActive ? 'var(--white)' : 'var(--text-secondary)'
    };
  };

  return (
    <div className="dashboard-layout animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: '100vh' }}>
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '10px', background: 'var(--white)', color: 'var(--primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } }} />
      
      <aside className="sidebar" style={{ background: 'var(--white)', borderRight: '1px solid var(--border)', padding: '32px 24px', display: 'flex', flexDirection: 'column' }}>
        <div className="logo" style={{ fontSize: '28px', marginBottom: '48px', color: 'var(--primary)', fontWeight: '700' }}>
          Class<span style={{ color: 'var(--gold)' }}>Live</span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <a onClick={() => setActiveTab('dashboard')} style={getSidebarItemStyle('dashboard')} onMouseEnter={e => { if(activeTab !== 'dashboard') e.currentTarget.style.background = 'var(--bg)' }} onMouseLeave={e => { if(activeTab !== 'dashboard') e.currentTarget.style.background = 'transparent' }}>
            <LayoutDashboard size={18} /> Tổng quan
          </a>
          <a onClick={() => setActiveTab('users')} style={getSidebarItemStyle('users')} onMouseEnter={e => { if(activeTab !== 'users') e.currentTarget.style.background = 'var(--bg)' }} onMouseLeave={e => { if(activeTab !== 'users') e.currentTarget.style.background = 'transparent' }}>
            <Users size={18} /> Quản lý Học viên
          </a>
          <a onClick={() => setActiveTab('lessons')} style={getSidebarItemStyle('lessons')} onMouseEnter={e => { if(activeTab !== 'lessons') e.currentTarget.style.background = 'var(--bg)' }} onMouseLeave={e => { if(activeTab !== 'lessons') e.currentTarget.style.background = 'transparent' }}>
            <BookOpen size={18} /> Chương Trình Học
          </a>
          <a style={getSidebarItemStyle('support')}>
            <LifeBuoy size={18} /> Hỗ Trợ 
            <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '100px', background: 'var(--gold)', color: 'var(--white)' }}>3</span>
          </a>
        </nav>
        <div style={{ paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <a onClick={handleLogout} className="sidebar-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: '#D32F2F', cursor: 'pointer', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(211, 47, 47, 0.08)' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
            <LogOut size={18} /> Đăng xuất
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', background: 'var(--bg-warm)', border: '1px solid var(--border)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600', color: 'var(--gold)' }}>
              NT
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Nguyễn Trọng</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Giảng viên cấp cao</div>
            </div>
          </div>
        </div>
      </aside>
      
      <main style={{ padding: '48px', overflowY: 'auto', background: 'var(--bg)' }}>
        {renderContent()}
      </main>
    </div>
  );
};

export default InstructorDashboard;
