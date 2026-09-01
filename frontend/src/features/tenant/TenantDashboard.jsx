import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Building2, 
  ShieldCheck,
  Bell
} from 'lucide-react';
import toast from 'react-hot-toast';
import TenantService from './TenantService';
import TenantOverview from './TenantOverview';
import TenantLessonManagement from './TenantLessonManagement';
import TenantChat from './TenantChat';
import TenantLessonModal from './TenantLessonModal';
import './tenant.css';

const TenantDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // State mở Modal Tạo Bài Giảng Nhanh từ Overview
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await TenantService.getProfile();
      if (res.success) {
        setProfile(res.data);
      }
    } catch (error) {
      console.error('Lỗi lấy profile Tenant Admin:', error);
      toast.error('Không thể nạp thông tin tài khoản.');
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
    { id: 'lessons', label: 'Quản Lý Học Liệu', icon: BookOpen },
    { id: 'chat', label: 'Trao Đổi & Hỗ Trợ', icon: MessageSquare }
  ];

  const currentUser = {
    id: profile?.id,
    name: profile?.name || 'Tenant Admin',
    role: 'tenant_admin'
  };

  return (
    <div className="tenant-layout">
      {/* SIDEBAR THU GỌN BÊN TRÁI */}
      <aside className={`tenant-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          {!isSidebarCollapsed && (
            <div className="brand-badge">
              <div className="logo">Class<span>Live</span></div>
              <span className="role-pill-tenant">TENANT</span>
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
        <nav className="sidebar-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item-tenant ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                title={isSidebarCollapsed ? item.label : ''}
              >
                <Icon size={20} />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer / Profile Brief */}
        <div className="sidebar-footer">
          {!isSidebarCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'var(--gold)', color: '#1B4D3E',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '14px', flexShrink: 0
                }}>
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : 'T'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {profile?.name || 'Tenant Admin'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {profile?.email || 'tenant@classlive.com'}
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
      <main className={`tenant-main ${isSidebarCollapsed ? 'expanded' : ''}`}>
        {/* Topbar Header */}
        <header className="tenant-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Building2 size={22} color="var(--tenant-primary)" />
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gold-dark)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Hệ Thống Quản Lý Giáo Dục Đơn Vị
              </span>
              <h2 style={{ fontSize: '16px', color: 'var(--text)', margin: 0, fontWeight: 600 }}>
                {profile?.name || 'Tổ chức Giáo dục Partners'}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--tenant-primary-glow)', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--tenant-border)' }}>
              <ShieldCheck size={16} color="var(--tenant-primary)" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tenant-primary)' }}>Xác thực Partner</span>
            </div>

            <button 
              type="button" 
              className="btn-emerald"
              style={{ padding: '8px 16px', fontSize: '13px' }}
              onClick={handleLogout}
            >
              <LogOut size={15} /> Đăng Xuất
            </button>
          </div>
        </header>

        {/* Dynamic Tab Content */}
        <div className="tenant-content">
          {activeTab === 'overview' && (
            <TenantOverview 
              onNavigateTab={(tab) => setActiveTab(tab)} 
              onCreateLesson={() => setIsCreateModalOpen(true)}
            />
          )}

          {activeTab === 'lessons' && (
            <TenantLessonManagement />
          )}

          {activeTab === 'chat' && (
            <TenantChat currentUser={currentUser} />
          )}
        </div>
      </main>

      {/* Modal Tạo bài giảng từ Overview */}
      <TenantLessonModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        lesson={null}
        onSuccess={() => {
          setActiveTab('lessons');
        }}
      />
    </div>
  );
};

export default TenantDashboard;
