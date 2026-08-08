import React, { useEffect, useState } from 'react';
import { BookOpen, Clock, CheckCircle2, User, ArrowRight, Eye, RefreshCw, Search, ArrowUpDown } from 'lucide-react';
import StudentService from './StudentService';
import toast from 'react-hot-toast';

const MyLessons = ({ onSelectLesson }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'completed'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const res = await StudentService.getLessons();
      if (res.success) {
        setAssignments(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách bài học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  let filteredAssignments = assignments.filter((item) => {
    const matchTab = item.status === activeTab;
    const matchSearch = item.lesson?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.lesson?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTab && matchSearch;
  });

  if (sortBy === 'newest') {
    filteredAssignments.sort((a, b) => (b.assignedAt || 0) - (a.assignedAt || 0));
  } else if (sortBy === 'oldest') {
    filteredAssignments.sort((a, b) => (a.assignedAt || 0) - (b.assignedAt || 0));
  } else if (sortBy === 'title_asc') {
    filteredAssignments.sort((a, b) => (a.lesson?.title || '').localeCompare(b.lesson?.title || ''));
  } else if (sortBy === 'title_desc') {
    filteredAssignments.sort((a, b) => (b.lesson?.title || '').localeCompare(a.lesson?.title || ''));
  }

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '32px', color: 'var(--primary)', fontWeight: '700' }}>Khóa Học Của Tôi</h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Xem các bài giảng được giao và tiến trình học tập của bạn.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 16px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Tìm tên khóa học..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '200px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 16px' }}>
            <ArrowUpDown size={16} color="var(--text-muted)" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', cursor: 'pointer', color: 'var(--text)' }}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="title_asc">Tên (A-Z)</option>
              <option value="title_desc">Tên (Z-A)</option>
            </select>
          </div>

          <button 
            onClick={fetchLessons} 
            className="btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1.5px solid var(--border)', background: 'var(--white)', padding: '10px 16px' }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Làm mới
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '32px' }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '8px 20px',
            borderRadius: '100px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: activeTab === 'pending' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'pending' ? 'var(--white)' : 'var(--text-secondary)'
          }}
        >
          Đang học ({assignments.filter(a => a.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          style={{
            padding: '8px 20px',
            borderRadius: '100px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: activeTab === 'completed' ? 'var(--gold)' : 'transparent',
            color: activeTab === 'completed' ? 'var(--white)' : 'var(--text-secondary)'
          }}
        >
          Đã hoàn thành ({assignments.filter(a => a.status === 'completed').length})
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', color: 'var(--text-secondary)' }}>
          Đang tải bài học...
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '12px', padding: '48px' }}>
          <BookOpen size={48} color="var(--border)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', color: 'var(--primary)', fontWeight: '600', marginBottom: '8px' }}>
            Không tìm thấy bài học nào
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center' }}>
            {activeTab === 'pending' 
              ? 'Tất cả bài học đã được hoàn thành. Chúc mừng bạn!' 
              : 'Bạn chưa hoàn thành bài giảng nào gần đây.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
          {filteredAssignments.map((item) => (
            <div
              key={item.id}
              className="lesson-card"
              style={{
                background: 'var(--white)',
                border: item.status === 'completed' ? '1.5px solid var(--gold-border)' : '1px solid var(--border)',
                borderRadius: '12px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={() => onSelectLesson(item)}
            >
              {/* Badge Trạng thái */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '100px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: item.status === 'completed' ? 'var(--gold-dark)' : 'var(--primary)',
                  background: item.status === 'completed' ? 'var(--gold-glow)' : 'var(--primary-glow)'
                }}>
                  {item.status === 'completed' ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                  {item.status === 'completed' ? 'Đã hoàn thành' : 'Đang học'}
                </span>
                
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Giao ngày: {new Date(item.assignedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>

              {/* Tiêu đề & Mô tả */}
              <h3 style={{ fontSize: '18px', color: 'var(--primary)', fontWeight: '700', marginBottom: '8px', lineHeight: '1.4' }}>
                {item.lesson?.title}
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                marginBottom: '24px',
                lineHeight: '1.6',
                display: '-webkit-box',
                WebkitLineClamp: '2',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                flex: 1
              }}>
                {item.lesson?.description || 'Không có mô tả cho bài giảng này.'}
              </p>

              {/* Footer Thẻ */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-light)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--bg-warm)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--primary)'
                  }}>
                    GV
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    Giảng viên
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--gold-dark)', fontWeight: '600', fontSize: '13px' }}>
                  Học ngay <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLessons;
