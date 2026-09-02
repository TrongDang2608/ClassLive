import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  GraduationCap, 
  Home,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import TeacherService from './TeacherService';
import TeacherOverview from './TeacherOverview';
import TeacherLessonManagement from './TeacherLessonManagement';
import TeacherLessonViewer from './TeacherLessonViewer';
import TeacherChat from './TeacherChat';
import './teacher.css';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await TeacherService.getProfile();
      if (res.success) {
        setProfile(res.data);
      }
    } catch (error) {
      console.error('Lỗi lấy profile Giáo viên:', error);
      toast.error('Không thể nạp thông tin cá nhân.');
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
    { id: 'chat', label: 'Trao Đổi & Hỗ Trợ', icon: MessageSquare }
  ];

  const currentUser = {
    id: profile?.id,
    name: profile?.name || 'Giáo viên',
    role: profile?.role || 'instructor'
  };

  return (
    <div className="teacher-layout">
      {/* SIDEBAR THU GỌN BÊN TRÁI (THEME SAPPHIRE NAVY #1E3A8A) */}
      <aside className={`teacher-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header-teacher">
          {!isSidebarCollapsed && (
            <div className="brand-badge-teacher">
              <div className="logo">Class<span>Live</span></div>
              <span className="role-pill-teacher">TEACHER</span>
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
        <nav className="sidebar-nav-teacher">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !selectedLesson;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item-teacher ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setSelectedLesson(null);
                  setActiveTab(item.id);
                }}
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
                  background: 'var(--teacher-accent)', color: '#0F172A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '14px', flexShrink: 0
                }}>
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : 'G'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {profile?.name || 'Giáo viên'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {profile?.email || 'teacher@classlive.edu.vn'}
                  </div>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                style={{ background: 'none', border: 'none', color: '#FCA5A5', cursor: 'pointer', padding: '6px' }}
                title="Đăng xuất"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', color: '#FCA5A5', cursor: 'pointer', padding: '10px', width: '100%', display: 'flex', justifyContent: 'center' }}
              title="Đăng xuất"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={`teacher-main ${isSidebarCollapsed ? 'expanded' : ''}`}>
        {/* Topbar Header */}
        <header className="teacher-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Home size={22} style={{ color: '#1E3A8A' }} />
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Cổng Học Liệu Giáo Viên
              </span>
              <h2 style={{ fontSize: '16px', color: '#0F172A', margin: 0, fontWeight: 600 }}>
                {profile?.schoolAdmin?.schoolName || profile?.schoolName || 'Trường THPT Chu Văn An'}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(30, 58, 138, 0.08)', padding: '6px 12px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
              <GraduationCap size={16} style={{ color: '#1E3A8A' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#1E3A8A' }}>Giáo Viên Giảng Dạy</span>
            </div>

            <button 
              type="button" 
              className="btn-teacher-outline"
              style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px', color: '#DC2626', borderColor: '#FCA5A5' }}
              onClick={handleLogout}
            >
              <LogOut size={15} /> Đăng Xuất
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="teacher-content">
          {selectedLesson ? (
            <TeacherLessonViewer
              lesson={selectedLesson}
              onBack={() => setSelectedLesson(null)}
            />
          ) : (
            <>
              {activeTab === 'overview' && (
                <TeacherOverview
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onSelectLesson={(lesson) => setSelectedLesson(lesson)}
                />
              )}

              {activeTab === 'lessons' && (
                <TeacherLessonManagement
                  onSelectLesson={(lesson) => setSelectedLesson(lesson)}
                />
              )}

              {activeTab === 'chat' && (
                <TeacherChat currentUser={currentUser} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
