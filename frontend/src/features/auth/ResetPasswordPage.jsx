import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldAlert, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthService from './AuthService';
import './auth.css';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Đường dẫn không hợp lệ hoặc thiếu mã xác thực token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Mã xác thực token không tồn tại. Vui lòng yêu cầu link mới.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Xác nhận mật khẩu không trùng khớp.');
      return;
    }

    setLoading(true);
    try {
      const res = await AuthService.resetPassword(token, newPassword);
      setIsSuccess(true);
      toast.success(res.message || 'Đặt lại mật khẩu thành công!');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Không thể đặt lại mật khẩu. Token có thể đã hết hạn.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container animate-fade-in">
      {/* Left Panel */}
      <div className="login-left">
        <div className="login-brand">
          <div className="gold-line"></div>
          <div className="logo">Class<span>Live</span></div>
          <p>Thiết lập mật khẩu mới vững chắc để bảo vệ thông tin học tập và dữ liệu cá nhân của bạn.</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="login-right">
        <div className="login-form-card animate-slide-right">
          <Link 
            to="/login" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              color: 'var(--text-secondary)', 
              fontSize: '14px', 
              textDecoration: 'none', 
              marginBottom: '20px',
              fontWeight: '500'
            }}
          >
            <ArrowLeft size={16} /> Quay lại Đăng nhập
          </Link>

          <h2>Đặt lại mật khẩu</h2>
          <p className="subtitle">Nhập mật khẩu mới cho tài khoản của bạn</p>

          {!token ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginBottom: '16px' }}>
                <ShieldAlert size={48} />
              </div>
              <p style={{ color: 'var(--text)', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
                Đường dẫn liên kết đặt lại mật khẩu không hợp lệ hoặc đã bị thiếu token.
              </p>
              <Link to="/forgot-password" className="btn btn-gold" style={{ display: 'inline-block', textDecoration: 'none' }}>
                Yêu cầu Link mới
              </Link>
            </div>
          ) : isSuccess ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', marginBottom: '16px' }}>
                <CheckCircle2 size={48} />
              </div>
              <p style={{ color: 'var(--text)', fontSize: '15px', lineHeight: '1.6', marginBottom: '16px' }}>
                Mật khẩu của bạn đã được cập nhật thành công!<br/>
                Đang chuyển hướng về trang đăng nhập...
              </p>
              <Loader2 size={24} className="animate-spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--gold)', margin: '0 auto' }} />
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Mật khẩu mới</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    className="form-input" 
                    placeholder="Tối thiểu 6 ký tự" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{ paddingLeft: '40px', paddingRight: '40px' }}
                  />
                  <Lock 
                    size={18} 
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Xác nhận mật khẩu mới</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    className="form-input" 
                    placeholder="Nhập lại mật khẩu mới" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ paddingLeft: '40px' }}
                  />
                  <Lock 
                    size={18} 
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-gold" 
                style={{ width: '100%', marginTop: '12px' }} 
                disabled={loading}
              >
                {loading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> Đang xử lý...
                  </span>
                ) : 'Xác Nhận Đổi Mật Khẩu'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
