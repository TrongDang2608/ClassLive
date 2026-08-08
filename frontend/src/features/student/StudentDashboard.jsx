import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, User, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import AuthService from '../auth/AuthService';
import StudentService from './StudentService';
import MyLessons from './MyLessons';
import LessonViewer from './LessonViewer';
import StudentProfile from './StudentProfile';
import ChatLayout from '../chat/ChatLayout';
import '../auth/auth.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons' or 'profile'
  const [activeLesson, setActiveLesson] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [profile, setProfile] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    // Lấy thông tin user để hiển thị trên sidebar
    const loadProfile = async () => {
      try {
        const res = await StudentService.getProfile();
        if (res.success) {
          setProfile(res.data);
        }
      } catch (err) {
        console.error('Không thể tải profile', err);
      }
    };
    loadProfile();
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
    if (activeTab === 'profile') {
      return <StudentProfile />;
    }
    
    if (activeTab === 'lessons') {
      if (activeLesson) {
        return (
          <LessonViewer 
            assignment={activeLesson} 
            onBack={() => setActiveLesson(null)} 
            onCompleteSuccess={() => {
              // Có thể reload lại activeLesson hoặc quay ra MyLessons
              setActiveLesson(null);
            }}
          />
        );
      }
      return <MyLessons onSelectLesson={(lesson) => setActiveLesson(lesson)} />;
    }

    if (activeTab === 'chat') {
      return <ChatLayout currentUser={{ id: profile?.id, role: 'student', name: profile?.name, email: profile?.email }} />;
    }
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
          <a onClick={() => { setActiveTab('lessons'); setActiveLesson(null); }} style={getSidebarItemStyle('lessons')} onMouseEnter={e => { if(activeTab !== 'lessons') e.currentTarget.style.background = 'var(--bg)' }} onMouseLeave={e => { if(activeTab !== 'lessons') e.currentTarget.style.background = 'transparent' }}>
            <BookOpen size={18} /> {isSidebarOpen && 'Khóa Học Của Tôi'}
          </a>
          <a onClick={() => { setActiveTab('chat'); setActiveLesson(null); }} style={getSidebarItemStyle('chat')} onMouseEnter={e => { if(activeTab !== 'chat') e.currentTarget.style.background = 'var(--bg)' }} onMouseLeave={e => { if(activeTab !== 'chat') e.currentTarget.style.background = 'transparent' }}>
            <User size={18} /> {isSidebarOpen && 'Liên Hệ Giảng Viên'}
          </a>
        </nav>
        
        <div style={{ position: 'relative', paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          {showProfileMenu && isSidebarOpen && (
            <div className="animate-fade-in" style={{ position: 'absolute', bottom: '100%', left: 0, width: '100%', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '12px', padding: '8px', marginBottom: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', zIndex: 10 }}>
              <a onClick={() => { setActiveTab('profile'); setActiveLesson(null); setShowProfileMenu(false); }} className="sidebar-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--text)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-warm)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <User size={18} color="var(--text-secondary)" /> Hồ Sơ Cá Nhân
              </a>
              <div style={{ height: '1px', background: 'var(--border-light)', margin: '4px 0' }}></div>
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
            <div style={{ minWidth: '40px', height: '40px', borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600', color: 'var(--white)' }}>
              {profile?.name ? profile.name.charAt(0).toUpperCase() : 'H'}
            </div>
            {isSidebarOpen && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {profile?.name || 'Đang tải...'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Học Viên</div>
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

export default StudentDashboard;
