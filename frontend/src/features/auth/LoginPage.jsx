import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, MonitorPlay, Clock, Loader2 } from 'lucide-react';
import AuthService from './AuthService';
import './auth.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await AuthService.login(username, password);
      // Backend trả về userId và maskedPhone
      navigate('/otp', { 
        state: { 
          userId: response.userId,
          maskedPhone: response.maskedPhone 
        } 
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-left">
        <div className="login-brand">
          <div className="gold-line"></div>
          <div className="logo">Class<span>Live</span></div>
          <p>Nền tảng quản lý giáo dục trực tuyến tinh gọn, hiện đại. Kết nối tri thức, nâng tầm trải nghiệm học tập.</p>
        </div>
        <div className="login-features">
          <div className="login-feature-item">
            <div className="login-feature-icon">
              <MonitorPlay size={20} strokeWidth={2} />
            </div>
            Trải nghiệm học tập mượt mà
          </div>
          <div className="login-feature-item">
            <div className="login-feature-icon">
              <BookOpen size={20} strokeWidth={2} />
            </div>
            Tài liệu số hóa chuẩn mực
          </div>
          <div className="login-feature-item">
            <div className="login-feature-icon">
              <Clock size={20} strokeWidth={2} />
            </div>
            Quản lý thời gian hiệu quả
          </div>
        </div>
      </div>
      
      <div className="login-right">
        <div className="login-form-card animate-slide-right">
          <h2>Đăng nhập hệ thống</h2>
          <p className="subtitle">Vui lòng nhập thông tin để truy cập</p>
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Tên đăng nhập hoặc Email</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ví dụ: student@email.com" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && <p style={{ color: 'var(--primary)', fontSize: '13px', marginBottom: '16px', fontWeight: '500' }}>{error}</p>}
            
            <button type="submit" className="btn btn-gold" style={{ width: '100%' }} disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : 'Đăng Nhập'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
