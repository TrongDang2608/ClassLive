import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, BookOpen, LifeBuoy, Bell, Search,
  GraduationCap, Laptop, CheckCircle, MessageSquare, Plus,
  Settings, LogOut, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Toaster } from 'react-hot-toast';
import AuthService from '../auth/AuthService';
import InstructorService from './InstructorService';
import UserManagement from './UserManagement';
import LessonManagement from './LessonManagement';
import ChatLayout from '../chat/ChatLayout';
import '../auth/auth.css'; // Reuse CSS vars

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeLessons: 0,
    passRate: 0,
    chartData: [],
    recentStudents: []
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await InstructorService.getProfile();
        if (res.success) {
          setCurrentUser(res.data);
        }
      } catch (err) {
        console.error('Không thể lấy thông tin giảng viên:', err);
      }
    };
    const fetchStats = async () => {
      try {
        const res = await InstructorService.getDashboardStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Không thể lấy số liệu thống kê:', err);
      }
    };
    fetchProfile();
    fetchStats();
  }, []);

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
    
    if (activeTab === 'chat') {
      return <ChatLayout currentUser={currentUser} />;
    }
    
    // Mặc định là dashboard
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }} className="animate-slide-right">
          <div>
            <h1 style={{ fontSize: '32px', color: 'var(--primary)' }}>Tổng Quan Giảng Dạy</h1>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '4px' }}>Chào buổi sáng, {currentUser?.name || 'Giảng viên'}. Chúc ngài một ngày làm việc hiệu quả.</p>
          </div>
        </div>
        
        {/* Thống kê 3 cột */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }} className="animate-slide-right">
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gold-glow)', color: 'var(--gold-dark)' }}>
                <GraduationCap size={22} />
              </div>
            </div>
            <div style={{ fontSize: '32px', color: 'var(--primary)', marginBottom: '4px', fontWeight: '700' }}>{stats.totalStudents}</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Tổng Sinh Viên</div>
          </div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                <Laptop size={22} />
              </div>
            </div>
            <div style={{ fontSize: '32px', color: 'var(--primary)', marginBottom: '4px', fontWeight: '700' }}>{stats.activeLessons}</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Bài Giảng Đã Đăng</div>
          </div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gold-glow)', color: 'var(--gold-dark)' }}>
                <CheckCircle size={22} />
              </div>
            </div>
            <div style={{ fontSize: '32px', color: 'var(--primary)', marginBottom: '4px', fontWeight: '700' }}>{stats.passRate}%</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Tỉ Lệ Đạt Chuẩn</div>
          </div>
        </div>

        {/* Biểu đồ & Học viên mới */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px', marginBottom: '40px' }} className="animate-slide-up">
          {/* Biểu đồ trạng thái bài học */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--primary)', fontWeight: '700', marginBottom: '16px' }}>Trạng Thái Bài Tập</h3>
            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.chartData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Học viên mới đăng ký */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', color: 'var(--primary)', fontWeight: '700' }}>Học Viên Mới Đăng Ký</h3>
              <button onClick={() => setActiveTab('users')} className="btn btn-gold" style={{ padding: '6px 12px', fontSize: '13px' }}>Quản lý</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {stats.recentStudents?.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0' }}>Chưa có học viên nào</div>
              ) : (
                stats.recentStudents?.map(student => (
                  <div key={student.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' }}>
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--text)' }}>{student.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{student.email || 'Không có email'}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{student.phone}</div>
                  </div>
                ))
              )}
            </div>
          </div>
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
      color: isActive ? 'var(--white)' : 'var(--text-secondary)',
      justifyContent: isSidebarOpen ? 'flex-start' : 'center'
    };
  };

  return (
    <div className="dashboard-layout animate-fade-in" style={{ display: 'grid', gridTemplateColumns: isSidebarOpen ? '280px 1fr' : '80px 1fr', transition: 'grid-template-columns 0.3s ease', height: '100vh' }}>
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '10px', background: 'var(--white)', color: 'var(--primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } }} />
      
      <aside className="sidebar" style={{ position: 'relative', background: 'var(--white)', borderRight: '1px solid var(--border)', padding: isSidebarOpen ? '32px 24px' : '32px 12px', display: 'flex', flexDirection: 'column', transition: 'padding 0.3s' }}>
        
        {/* Nút thu gọn / mở rộng */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{ position: 'absolute', top: '40px', right: '-12px', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--white)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', zIndex: 10 }}
        >
          {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        <div className="logo" style={{ fontSize: isSidebarOpen ? '28px' : '14px', marginBottom: '48px', color: 'var(--primary)', fontWeight: '700', textAlign: 'center', cursor: 'pointer' }} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <>Class<span style={{ color: 'var(--gold)' }}>Live</span></> : 'CL'}
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <a onClick={() => setActiveTab('dashboard')} style={getSidebarItemStyle('dashboard')} onMouseEnter={e => { if(activeTab !== 'dashboard') e.currentTarget.style.background = 'var(--bg)' }} onMouseLeave={e => { if(activeTab !== 'dashboard') e.currentTarget.style.background = 'transparent' }}>
            <LayoutDashboard size={18} /> {isSidebarOpen && 'Tổng quan'}
          </a>
          <a onClick={() => setActiveTab('users')} style={getSidebarItemStyle('users')} onMouseEnter={e => { if(activeTab !== 'users') e.currentTarget.style.background = 'var(--bg)' }} onMouseLeave={e => { if(activeTab !== 'users') e.currentTarget.style.background = 'transparent' }}>
            <Users size={18} /> {isSidebarOpen && 'Quản lý Học viên'}
          </a>
          <a onClick={() => setActiveTab('lessons')} style={getSidebarItemStyle('lessons')} onMouseEnter={e => { if(activeTab !== 'lessons') e.currentTarget.style.background = 'var(--bg)' }} onMouseLeave={e => { if(activeTab !== 'lessons') e.currentTarget.style.background = 'transparent' }}>
            <BookOpen size={18} /> {isSidebarOpen && 'Chương Trình Học'}
          </a>
          <a onClick={() => setActiveTab('chat')} style={getSidebarItemStyle('chat')} onMouseEnter={e => { if(activeTab !== 'chat') e.currentTarget.style.background = 'var(--bg)' }} onMouseLeave={e => { if(activeTab !== 'chat') e.currentTarget.style.background = 'transparent' }}>
            <MessageSquare size={18} /> {isSidebarOpen && 'Tin Nhắn'}
          </a>
        </nav>
        
        <div style={{ position: 'relative', paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          {showProfileMenu && isSidebarOpen && (
            <div className="animate-fade-in" style={{ position: 'absolute', bottom: '100%', left: 0, width: '100%', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '12px', padding: '8px', marginBottom: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', zIndex: 10 }}>
              <a onClick={handleLogout} className="sidebar-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: '#D32F2F', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(211, 47, 47, 0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <LogOut size={18} /> Đăng Xuất
              </a>
            </div>
          )}
          
          <div 
            onClick={() => { if(isSidebarOpen) setShowProfileMenu(!showProfileMenu); else setIsSidebarOpen(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', background: showProfileMenu ? 'var(--bg)' : 'var(--bg-warm)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s', justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}
            onMouseEnter={e => { if(!showProfileMenu) e.currentTarget.style.background = 'var(--bg)' }} 
            onMouseLeave={e => { if(!showProfileMenu) e.currentTarget.style.background = 'var(--bg-warm)' }}
          >
            <div style={{ minWidth: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600', color: 'var(--gold)' }}>
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'G'}
            </div>
            {isSidebarOpen && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {currentUser?.name || 'Đang tải...'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Giảng viên cấp cao</div>
              </div>
            )}
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
