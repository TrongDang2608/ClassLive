import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Send, TrendingUp, Plus, MessageSquare, ArrowRight, Loader2, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import TenantService from './TenantService';
import './tenant.css';

const TenantOverview = ({ onNavigateTab, onCreateLesson }) => {
  const [stats, setStats] = useState({
    totalLessons: 0,
    totalAssignedSchools: 0,
    totalAssignments: 0
  });
  const [recentLessons, setRecentLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock trend data for Line Chart
  const trendData = [
    { month: 'T1', lessons: 2, assignments: 5 },
    { month: 'T2', lessons: 4, assignments: 8 },
    { month: 'T3', lessons: 7, assignments: 14 },
    { month: 'T4', lessons: 9, assignments: 20 },
    { month: 'T5', lessons: 12, assignments: 28 },
    { month: 'T6', lessons: 15, assignments: 35 },
    { month: 'T7', lessons: 18, assignments: 42 },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, lessonsRes] = await Promise.all([
        TenantService.getDashboardStats(),
        TenantService.getLessons(1, 5)
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      }
      if (lessonsRes.success) {
        setRecentLessons(lessonsRes.data || []);
      }
    } catch (error) {
      console.error('Lỗi lấy dữ liệu tổng quan:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '12px 16px',
          border: '1px solid var(--tenant-border)',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
        }}>
          <p style={{ margin: '0 0 6px', fontWeight: 600, color: 'var(--text)', fontSize: '13px' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '3px 0', fontSize: '12px', color: entry.color, fontWeight: 500 }}>
              {entry.name}: <strong>{entry.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-fade-in">
      {/* Title & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: 'var(--tenant-primary)', margin: '0 0 6px 0', fontWeight: 700 }}>
            Tổng Quan Trung Tâm Học Liệu
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>
            Theo dõi phân bổ tài liệu và mức độ tương tác giữa tổ chức và các trường học.
          </p>
        </div>

        <button className="btn-emerald" onClick={onCreateLesson}>
          <Plus size={16} /> Soạn Bài Giảng Mới
        </button>
      </div>

      {/* 3 Widgets Thống kê số lượng */}
      <div className="tenant-stats-grid">
        <div className="tenant-stat-card">
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
              Tổng Số Học Liệu
            </span>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--tenant-primary)' }}>
              {loading ? <Loader2 size={24} className="animate-spin" /> : stats.totalLessons}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--success)', marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={12} /> Đã số hóa và lưu trữ
            </span>
          </div>
          <div className="tenant-stat-icon">
            <BookOpen size={24} />
          </div>
        </div>

        <div className="tenant-stat-card">
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
              Trường Học Tiếp Nhận
            </span>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--gold-dark)' }}>
              {loading ? <Loader2 size={24} className="animate-spin" /> : stats.totalAssignedSchools}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
              School Admin đang hoạt động
            </span>
          </div>
          <div className="tenant-stat-icon gold">
            <Users size={24} />
          </div>
        </div>

        <div className="tenant-stat-card">
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
              Lượt Phân Bổ Quyền
            </span>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--success)' }}>
              {loading ? <Loader2 size={24} className="animate-spin" /> : stats.totalAssignments}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
              Bài giảng đã chuyển giao
            </span>
          </div>
          <div className="tenant-stat-icon success">
            <Send size={24} />
          </div>
        </div>
      </div>

      {/* Biểu đồ Đường Xu Hướng (Recharts Line Chart) */}
      <div className="tenant-card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', color: 'var(--tenant-primary)', margin: '0 0 4px 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} /> Xu Hướng Cung Cấp & Chuyển Giao Học Liệu
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              Thống kê số lượng bài giảng được tạo mới và lượt cấp quyền cho các trường học theo tháng
            </p>
          </div>
        </div>

        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--tenant-border)" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="var(--text-muted)" 
                fontSize={12} 
                tickLine={false}
              />
              <YAxis 
                stroke="var(--text-muted)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} 
              />
              <Line 
                type="monotone" 
                name="Bài giảng tạo mới" 
                dataKey="lessons" 
                stroke="#1B4D3E" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#1B4D3E' }}
                activeDot={{ r: 7 }}
              />
              <Line 
                type="monotone" 
                name="Lượt phân bổ cho trường" 
                dataKey="assignments" 
                stroke="#D4AF37" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#D4AF37' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bài giảng gần đây & Thao tác nhanh */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Recent Lessons */}
        <div className="tenant-card" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', color: 'var(--tenant-primary)', margin: 0, fontWeight: 600 }}>
              Bài Giảng Gần Đây
            </h3>
            <button 
              type="button" 
              onClick={() => onNavigateTab('lessons')} 
              style={{ background: 'none', border: 'none', color: 'var(--tenant-primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Xem tất cả <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <Loader2 size={24} className="animate-spin" color="var(--tenant-primary)" />
            </div>
          ) : recentLessons.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
              Chưa có bài giảng nào được tạo.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentLessons.map(lesson => (
                <div 
                  key={lesson.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--tenant-border)',
                    background: 'var(--bg-warm)'
                  }}
                >
                  <div style={{ maxWidth: '70%' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lesson.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span className="tag-emerald" style={{ padding: '1px 6px', fontSize: '10px' }}>{lesson.subject}</span>
                      <span>{formatDate(lesson.createdAt)}</span>
                    </div>
                  </div>
                  <button 
                    className="btn-emerald-outline" 
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                    onClick={() => onNavigateTab('lessons')}
                  >
                    Quản lý
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Communication Box */}
        <div className="tenant-card" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '16px', color: 'var(--tenant-primary)', margin: '0 0 8px 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} /> Trao Đổi Với Trường Học
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Kết nối trực tiếp qua kênh Chat thời gian thực với các Ban giám hiệu (School Admin) đã được bàn giao bài giảng để hỗ trợ sư phạm và phản hồi học liệu.
            </p>
          </div>

          <div style={{ background: 'var(--tenant-primary-subtle)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--tenant-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tenant-primary)', display: 'block' }}>Kênh Chat Trực Tiếp</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Hỗ trợ tức thời qua Socket.io</span>
              </div>
              <button className="btn-emerald" onClick={() => onNavigateTab('chat')}>
                Mở Chat <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantOverview;
