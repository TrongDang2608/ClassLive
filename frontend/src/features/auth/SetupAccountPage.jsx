import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserCheck, ShieldCheck, Zap, Loader2, XCircle } from 'lucide-react';
import axiosClient from '../../utils/axiosClient';
import toast from 'react-hot-toast';
import './auth.css';

const SetupAccountPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSetup = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await axiosClient.post('/auth/setup-account', {
        token,
        newUsername: username,
        newPassword: password
      });

      toast.success('Thiết lập tài khoản thành công! Vui lòng đăng nhập.', { duration: 4000 });
      // Redirect to login page
      navigate('/');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Thiết lập thất bại. Token có thể đã hết hạn.');
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
          <p>Chào mừng bạn đến với hệ thống! Hãy thiết lập thông tin cá nhân để bắt đầu trải nghiệm học tập đỉnh cao.</p>
        </div>
        <div className="login-features">
          <div className="login-feature-item">
            <div className="login-feature-icon">
              <UserCheck size={20} strokeWidth={2} />
            </div>
            Cá nhân hóa tài khoản
          </div>
          <div className="login-feature-item">
            <div className="login-feature-icon">
              <ShieldCheck size={20} strokeWidth={2} />
            </div>
            Bảo mật thông tin tối đa
          </div>
          <div className="login-feature-item">
            <div className="login-feature-icon">
              <Zap size={20} strokeWidth={2} />
            </div>
            Kích hoạt ngay lập tức
          </div>
        </div>
      </div>
      
      <div className="login-right">
        <div className="login-form-card animate-slide-right">
          <h2>Thiết lập Tài khoản</h2>
          <p className="subtitle">Tạo tên đăng nhập và mật khẩu của riêng bạn</p>
          
          {errorMsg && (
            <div style={{ padding: '12px', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <XCircle size={18} />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSetup}>
            <div className="form-group">
              <label>Tên đăng nhập (Username)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ví dụ: nguyenvan_a" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu mới</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Xác nhận Mật khẩu</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="btn btn-gold" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : 'Hoàn Tất Thiết Lập'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetupAccountPage;
