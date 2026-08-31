import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Bell,
  UserCog, Building2, Shield,
  Settings, LogOut, ChevronLeft, ChevronRight, Plus
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Toaster } from 'react-hot-toast';
import AuthService from '../auth/AuthService';
import AdminService from './AdminService';
import AdminUserManagement from './AdminUserManagement';
import '../auth/auth.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [stats, setStats] = useState({ total: 0, byRole: [] });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Lấy tất cả users để đếm theo role
        const res = await AdminService.getUsers(null, 1, 100);
        if (res.success) {
          const users = res.data;
          const roleCounts = {};
          users.forEach(u => {
            roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
          });

          const ROLE_COLORS = {
            admin: '#e74c3c',
            tenant_admin: '#d4af37',
            school_admin: '#2980b9',
            teacher: '#2c3e50'
          };

          const ROLE_LABELS = {
            admin: 'Admin',
            tenant_admin: 'Tenant Admin',
            school_admin: 'School Admin',
            teacher: 'Teacher'
          };

          const byRole = Object.entries(roleCounts).map(([role, count]) => ({
            name: ROLE_LABELS[role] || role,
            value: count,
            color: ROLE_COLORS[role] || '#999'
          }));

          setStats({ total: users.length, byRole });
        }
      } catch (err) {
        console.error('Không thể lấy thống kê:', err);
      }
    };
    fetchStats();
  }, [activeTab]);

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
      return <AdminUserManagement />;
    }

    // Mặc định: Dashboard tổng quan
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }} className="animate-slide-right">
          <div>
            <h1 style={{ fontSize: '32px', color: 'var(--primary)' }}>Tổng Quan Quản Trị</h1>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Xin chào, Root Admin. Quản lý toàn bộ tài khoản hệ thống tại đây.
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }} className="animate-slide-right">
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gold-glow)', color: 'var(--gold-dark)' }}>
                <Users size={22} />
              </div>
            </div>
            <div style={{ fontSize: '32px', color: 'var(--primary)', marginBottom: '4px', fontWeight: '700' }}>{stats.total}</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Tổng Tài Khoản</div>
          </div>

          {stats.byRole.map((item, idx) => (
            <div key={idx} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${item.color}15`, color: item.color }}>
                  {item.name === 'Admin' ? <Shield size={22} /> :
                   item.name === 'Tenant Admin' ? <Building2 size={22} /> :
                   item.name === 'School Admin' ? <UserCog size={22} /> :
                   <Users size={22} />}
                </div>
              </div>
              <div style={{ fontSize: '32px', color: 'var(--primary)', marginBottom: '4px', fontWeight: '700' }}>{item.value}</div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{item.name}</div>
            </div>
          ))}
        </div>

        {/* Bar Chart */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }} className="animate-slide-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--primary)', fontWeight: '700', margin: 0 }}>Phân Bố Tài Khoản Theo Vai Trò</h3>
            <button onClick={() => setActiveTab('users')} className="btn btn-gold" style={{ padding: '8px 16px', fontSize: '13px' }}>
              <Plus size={14} style={{ marginRight: '4px' }} /> Quản lý
            </button>
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            {stats.byRole.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byRole} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 13 }} />
                  <YAxis allowDecimals={false} tick={{ fill: 'var(--text-secondary)', fontSize: 13 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--white)', border: '1px solid var(--border)',
                      borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="value" name="Số lượng" radius={[6, 6, 0, 0]} barSize={60}>
                    {stats.byRole.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                Chưa có dữ liệu. Hãy tạo tài khoản đầu tiên!
              </div>
            )}
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

      {/* Sidebar */}
      <aside className="sidebar" style={{ position: 'relative', background: 'var(--white)', borderRight: '1px solid var(--border)', padding: isSidebarOpen ? '32px 24px' : '32px 12px', display: 'flex', flexDirection: 'column', transition: 'padding 0.3s' }}>

        {/* Toggle button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{ position: 'absolute', top: '40px', right: '-12px', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--white)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', zIndex: 10 }}
        >
          {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Logo */}
        <div className="logo" style={{ fontSize: isSidebarOpen ? '28px' : '14px', marginBottom: '48px', color: 'var(--primary)', fontWeight: '700', textAlign: 'center', cursor: 'pointer' }} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <>Class<span style={{ color: 'var(--gold)' }}>Live</span></> : 'CL'}
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <a onClick={() => setActiveTab('dashboard')} style={getSidebarItemStyle('dashboard')}
             onMouseEnter={e => { if(activeTab !== 'dashboard') e.currentTarget.style.background = 'var(--bg)' }}
             onMouseLeave={e => { if(activeTab !== 'dashboard') e.currentTarget.style.background = 'transparent' }}>
            <LayoutDashboard size={18} /> {isSidebarOpen && 'Tổng quan'}
          </a>
          <a onClick={() => setActiveTab('users')} style={getSidebarItemStyle('users')}
             onMouseEnter={e => { if(activeTab !== 'users') e.currentTarget.style.background = 'var(--bg)' }}
             onMouseLeave={e => { if(activeTab !== 'users') e.currentTarget.style.background = 'transparent' }}>
            <Users size={18} /> {isSidebarOpen && 'Quản lý Tài Khoản'}
          </a>
        </nav>

        {/* Profile */}
        <div style={{ position: 'relative', paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          {showProfileMenu && isSidebarOpen && (
            <div className="animate-fade-in" style={{ position: 'absolute', bottom: '100%', left: 0, width: '100%', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '12px', padding: '8px', marginBottom: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', zIndex: 10 }}>
              <a onClick={handleLogout} className="sidebar-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: '#D32F2F', cursor: 'pointer', transition: 'all 0.2s' }}
                 onMouseEnter={e => e.currentTarget.style.background = 'rgba(211, 47, 47, 0.08)'}
                 onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
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
              A
            </div>
            {isSidebarOpen && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  Root Admin
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Quản trị viên</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ padding: '48px', overflowY: 'auto', background: 'var(--bg)' }}>
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
