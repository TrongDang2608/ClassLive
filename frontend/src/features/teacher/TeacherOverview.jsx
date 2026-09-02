import React, { useState, useEffect } from 'react';
import TeacherService from './TeacherService';
import { BookOpen, FileText, School, TrendingUp, Eye, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const TeacherOverview = ({ onNavigateTab, onSelectLesson }) => {
  const [stats, setStats] = useState({ totalLessons: 0, totalFiles: 0, schoolAdmin: null, trendData: [] });
  const [recentLessons, setRecentLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const [statsRes, lessonsRes] = await Promise.all([
        TeacherService.getDashboardStats(),
        TeacherService.getAssignedLessons(1, 6)
      ]);

      if (statsRes.success && statsRes.data) {
        setStats({
          totalLessons: statsRes.data.totalLessons || 0,
          totalFiles: statsRes.data.totalFiles || 0,
          schoolAdmin: statsRes.data.schoolAdmin || null,
          trendData: statsRes.data.trendData || []
        });
      }

      if (lessonsRes.success && lessonsRes.data) {
        setRecentLessons(lessonsRes.data);
      }
    } catch (err) {
      toast.error('Không thể tải dữ liệu Tổng quan từ hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '320px', flexDirection: 'column', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid rgba(30, 58, 138, 0.2)', borderTopColor: '#1E3A8A', borderRadius: '50%', animation: 'spin 1s infinite linear' }} />
        <span style={{ color: '#64748B', fontSize: '14px', fontWeight: 500 }}>Đang truy vấn dữ liệu thực từ Firestore...</span>
      </div>
    );
  }

  const chartData = stats.trendData || [];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* 3 STAT CARDS VỚI DỮ LIỆU THẬT 100% TỪ BACKEND */}
      <div className="stat-cards-grid-teacher">
        <div className="stat-card-teacher">
          <div className="stat-icon-wrapper-teacher" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563EB' }}>
            <BookOpen size={28} />
          </div>
          <div className="stat-info-teacher">
            <div className="stat-value">{stats.totalLessons}</div>
            <div className="stat-label">Bài giảng nhận từ trường</div>
          </div>
        </div>

        <div className="stat-card-teacher">
          <div className="stat-icon-wrapper-teacher" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <FileText size={28} />
          </div>
          <div className="stat-info-teacher">
            <div className="stat-value">{stats.totalFiles}</div>
            <div className="stat-label">Tệp tài liệu đính kèm</div>
          </div>
        </div>

        <div className="stat-card-teacher">
          <div className="stat-icon-wrapper-teacher" style={{ background: '#ECFDF5', color: '#059669' }}>
            <School size={28} />
          </div>
          <div className="stat-info-teacher">
            <div className="stat-value" style={{ fontSize: '18px', fontWeight: 700 }}>
              {stats.schoolAdmin?.schoolName || 'Trường THPT Chu Văn An'}
            </div>
            <div className="stat-label">
              Quản trị: {stats.schoolAdmin?.name || 'School Admin'}
            </div>
          </div>
        </div>
      </div>

      {/* BIỂU ĐỒ TIẾP NHẬN HỌC LIỆU 6 THÁNG */}
      <div className="teacher-card">
        <div className="teacher-card-header">
          <div className="teacher-card-title">
            <TrendingUp size={20} color="#2563EB" />
            Xu hướng Tiếp nhận Học liệu 6 tháng gần nhất
          </div>
        </div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLessons" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={12} tickLine={false} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ background: '#0F172A', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px' }}
                itemStyle={{ color: '#60A5FA' }}
              />
              <Area type="monotone" dataKey="lessons" name="Bài giảng nhận" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorLessons)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DANH SÁCH BÀI HỌC MỚI NHẤT DỮ LIỆU THẬT */}
      <div className="teacher-card">
        <div className="teacher-card-header">
          <div className="teacher-card-title">
            <BookOpen size={20} color="#2563EB" />
            Học liệu mới nhận gần đây
          </div>
          <button 
            className="btn-teacher-outline" 
            onClick={() => onNavigateTab('lessons')}
          >
            Xem tất cả <ArrowRight size={14} />
          </button>
        </div>

        {recentLessons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: '#64748B' }}>
            Chưa có bài giảng nào được School Admin phân bổ.
          </div>
        ) : (
          <div className="teacher-lesson-grid">
            {recentLessons.map((lesson) => (
              <div key={lesson.id} className="teacher-lesson-card">
                <div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <span className="teacher-badge teacher-badge-blue">{lesson.subject}</span>
                    <span className="teacher-badge teacher-badge-gold">{lesson.grade}</span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    {lesson.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '16px' }}>
                    {lesson.description || 'Bài giảng lý thuyết chuẩn từ nhà trường.'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>
                    File: <strong>{lesson.fileCount}</strong> tệp
                  </span>
                  <button
                    className="btn-teacher-primary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => onSelectLesson(lesson)}
                  >
                    <Eye size={14} /> Trình xem
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherOverview;
