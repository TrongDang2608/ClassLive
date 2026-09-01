import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  MessageSquare, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck,
  Home
} from 'lucide-react';
import toast from 'react-hot-toast';
import SchoolService from './SchoolService';
import SchoolOverview from './SchoolOverview';
import SchoolLessonManagement from './SchoolLessonManagement';
import SchoolTeacherManagement from './SchoolTeacherManagement';
import SchoolChat from './SchoolChat';
import './school.css';

const SchoolDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await SchoolService.getProfile();
      if (res.success) {
        setProfile(res.data);
      }
    } catch (error) {
      console.error('Lỗi lấy profile School Admin:', error);
      toast.error('Không thể nạp thông tin trường học.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Đã đăng xuất tài khoản thành công');
    navigate('/login');
  };

  const navItems = [
    { id: 'overview', label: 'Tổng Quan', icon: LayoutDashboard },
    { id: 'lessons', label: 'Kho Học Liệu Được Cấp', icon: BookOpen },
    { id: 'teachers', label: 'Quản Lý Giáo Viên', icon: Users },
    { id: 'chat', label: 'Trao Đổi & Hỗ Trợ', icon: MessageSquare }
  ];

  const currentUser = {
    id: profile?.id,
    name: profile?.name || 'School Admin',
    role: 'school_admin'
  };

  return (
    <div className="school-layout">
      {/* SIDEBAR THU GỌN BÊN TRÁI (THEME TÍM HOÀNG GIA #3B185F) */}
      <aside className={`school-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header-school">
          {!isSidebarCollapsed && (
            <div className="brand-badge-school">
              <div className="logo">Class<span>Live</span></div>
              <span className="role-pill-school">SCHOOL</span>
            </div>
          )}
          <button 
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: isSidebarCollapsed ? '0 auto' : '0'
            }}
            title={isSidebarCollapsed ? 'Mở rộng Sidebar' : 'Thu gọn Sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="sidebar-nav-school">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item-school ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                title={isSidebarCollapsed ? item.label : ''}
              >
                <Icon size={20} />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer / User Brief */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
          {!isSidebarCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'var(--gold)', color: '#3B185F',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '14px', flexShrink: 0
                }}>
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {profile?.name || 'School Admin'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {profile?.email || 'school@classlive.edu.vn'}
                  </div>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: '6px' }}
                title="Đăng xuất"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: '10px', width: '100%', display: 'flex', justifyContent: 'center' }}
              title="Đăng xuất"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={`school-main ${isSidebarCollapsed ? 'expanded' : ''}`}>
        {/* Topbar Header */}
        <header className="school-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Home size={22} style={{ color: '#3B185F' }} />
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#854D0E', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Hệ Thống Quản Lý Giáo Dục Cấp Trường
              </span>
              <h2 style={{ fontSize: '16px', color: '#230C3B', margin: 0, fontWeight: 600 }}>
                {profile?.schoolName || profile?.name || 'Trường THPT Chu Văn An'}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(59, 24, 95, 0.08)', padding: '6px 12px', borderRadius: '20px', border: '1px solid #E8E2EE' }}>
              <ShieldCheck size={16} style={{ color: '#3B185F' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#3B185F' }}>Quản Trị Trường Học</span>
            </div>

            <button 
              type="button" 
              className="btn btn-outline-danger d-flex align-items-center gap-2"
              style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }}
              onClick={handleLogout}
            >
              <LogOut size={15} /> Đăng Xuất
            </button>
          </div>
        </header>

        {/* Dynamic Tab Content */}
        <div className="school-content">
          {activeTab === 'overview' && (
            <SchoolOverview />
          )}

          {activeTab === 'lessons' && (
            <SchoolLessonManagement />
          )}

          {activeTab === 'teachers' && (
            <SchoolTeacherManagement />
          )}

          {activeTab === 'chat' && (
            <SchoolChat currentUser={currentUser} />
          )}
        </div>
      </main>
    </div>
  );
};

export default SchoolDashboard;
