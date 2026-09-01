import React, { useState, useEffect } from 'react';
import SchoolService from './SchoolService';
import { BookOpen, Users, Share2, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const SchoolOverview = () => {
  const [stats, setStats] = useState({ totalLessons: 0, totalTeachers: 0, totalTeacherAssignments: 0 });
  const [recentLessons, setRecentLessons] = useState([]);
  const [recentTeachers, setRecentTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Biểu đồ xu hướng thực tế từ Firestore backend
  const chartData = stats.trendData || [];

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const [statsRes, lessonsRes, teachersRes] = await Promise.all([
        SchoolService.getDashboardStats(),
        SchoolService.getAssignedLessons(1, 5),
        SchoolService.getTeachers(1, 5)
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (lessonsRes.success) setRecentLessons(lessonsRes.data || []);
      if (teachersRes.success) setRecentTeachers(teachersRes.data || []);
    } catch (err) {
      toast.error('Không thể tải dữ liệu Tổng quan.');
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid rgba(59, 24, 95, 0.2)', borderTopColor: '#3B185F', borderRadius: '50%', animation: 'pulse 1s infinite linear' }} />
        <span style={{ color: '#6B7280', fontSize: '14px' }}>Đang tải dữ liệu tổng quan...</span>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* 3 STAT CARDS */}
      <div className="stat-cards-grid-school">
        <div className="stat-card-school">
          <div className="stat-icon-wrapper-school">
            <BookOpen size={26} />
          </div>
          <div className="stat-info-school">
            <div className="value">{stats.totalLessons}</div>
            <div className="label">Bài giảng nhận từ Tenant</div>
          </div>
        </div>

        <div className="stat-card-school">
          <div className="stat-icon-wrapper-school">
            <Users size={26} />
          </div>
          <div className="stat-info-school">
            <div className="value">{stats.totalTeachers}</div>
            <div className="label">Giáo viên thuộc trường</div>
          </div>
        </div>

        <div className="stat-card-school">
          <div className="stat-icon-wrapper-school">
            <Share2 size={26} />
          </div>
          <div className="stat-info-school">
            <div className="value">{stats.totalTeacherAssignments}</div>
            <div className="label">Lượt phân bổ học liệu</div>
          </div>
        </div>
      </div>

      {/* CHART SECTION */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '16px', color: '#230C3B', margin: '0 0 4px 0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} style={{ color: '#3B185F' }} /> Thống Kê Xu Hướng Phân Bổ Học Liệu
            </h3>
            <p style={{ color: '#6B7280', margin: 0, fontSize: '13px' }}>
              Số lượng bài giảng được cấp từ cấp Sở/Hệ thống & lượt phân bổ xuống Giáo viên
            </p>
          </div>
          <span style={{ background: 'rgba(59, 24, 95, 0.08)', color: '#3B185F', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, border: '1px solid rgba(59, 24, 95, 0.15)' }}>
            Năm học 2026 - 2027
          </span>
        </div>
        <div className="card-body" style={{ padding: '24px 20px 10px 10px' }}>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLessons" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B185F" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#3B185F" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAssign" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EBF5" />
                <XAxis dataKey="month" stroke="#6B7280" fontSize={12} tickLine={false} />
                <YAxis stroke="#6B7280" fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #E8E2EE' }} />
                <Area type="monotone" dataKey="lessons" name="Bài giảng nhận được" stroke="#3B185F" strokeWidth={3} fillOpacity={1} fill="url(#colorLessons)" />
                <Area type="monotone" dataKey="assignments" name="Lượt phân bổ cho GV" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorAssign)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2 PANELS: RECENT LESSONS & TEACHERS */}
      <div className="row g-4">
        {/* RECENT LESSONS */}
        <div className="col-md-6">
          <div className="card" style={{ height: '100%', marginBottom: 0 }}>
            <div className="card-header">
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#230C3B', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} style={{ color: '#3B185F' }} /> Bài giảng Mới nhận gần đây
              </h4>
            </div>
            <div style={{ padding: 0 }}>
              {recentLessons.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
                  Chưa có bài giảng nào được cấp từ Tenant Admin.
                </div>
              ) : (
                <div className="list-group">
                  {recentLessons.map((item) => (
                    <div key={item.id} className="list-group-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 24, 95, 0.08)', color: '#3B185F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {item.subject ? item.subject.charAt(0) : 'B'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#230C3B', fontSize: '14px' }}>{item.title}</div>
                          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                            {item.subject || 'Chưa phân loại'} • {item.grade || 'Lớp học'}
                          </div>
                        </div>
                      </div>
                      <span style={{ background: 'rgba(59, 24, 95, 0.08)', color: '#3B185F', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                        Đã cấp
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RECENT TEACHERS */}
        <div className="col-md-6">
          <div className="card" style={{ height: '100%', marginBottom: 0 }}>
            <div className="card-header">
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#230C3B', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} style={{ color: '#3B185F' }} /> Giáo viên mới cập nhật
              </h4>
            </div>
            <div style={{ padding: 0 }}>
              {recentTeachers.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
                  Chưa có Giáo viên nào trong danh sách.
                </div>
              ) : (
                <div className="list-group">
                  {recentTeachers.map((t) => (
                    <div key={t.id} className="list-group-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #3B185F 0%, #5A2A8C 100%)', color: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {t.name ? t.name.charAt(0) : 'G'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#230C3B', fontSize: '14px' }}>{t.name}</div>
                          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>{t.email}</div>
                        </div>
                      </div>
                      <span style={{ background: 'rgba(46, 125, 50, 0.1)', color: '#2E7D32', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={12} /> Hoạt động
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolOverview;
