import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ShieldCheck, Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthService from './AuthService';
import './auth.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập địa chỉ Email.');
      return;
    }

    setLoading(true);
    try {
      const res = await AuthService.forgotPassword(email);
      setIsSubmitted(true);
      toast.success(res.message || 'Đã gửi email khôi phục mật khẩu!');
    } catch (err) {
      const errorMsg = 
        err.response?.data?.error || 
        err.response?.data?.message || 
        err.message || 
        'Không thể gửi email khôi phục. Vui lòng thử lại sau.';
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
          <p>Hệ thống khôi phục mật khẩu an toàn và bảo mật cao dành cho toàn bộ người dùng và quản trị viên.</p>
        </div>
        <div className="login-features">
          <div className="login-feature-item">
            <div className="login-feature-icon">
              <ShieldCheck size={20} strokeWidth={2} />
            </div>
            Bảo mật hai lớp chuẩn quốc tế
          </div>
          <div className="login-feature-item">
            <div className="login-feature-icon">
              <KeyRound size={20} strokeWidth={2} />
            </div>
            Khôi phục truy cập nhanh chóng
          </div>
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

          <h2>Quên mật khẩu</h2>
          <p className="subtitle">
            {isSubmitted 
              ? 'Kiểm tra hộp thư email của bạn để tiếp tục đặt lại mật khẩu.' 
              : 'Nhập địa chỉ Email đã đăng ký để nhận liên kết khôi phục.'}
          </p>

          {isSubmitted ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(217, 119, 6, 0.1)', color: '#d97706', marginBottom: '16px' }}>
                <CheckCircle2 size={48} />
              </div>
              <p style={{ color: 'var(--text)', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
                Liên kết đặt lại mật khẩu đã được gửi tới <strong>{email}</strong>.<br/>
                Vui lòng kiểm tra hộp thư đến (hoặc thư mục Spam).
              </p>
              <button 
                type="button" 
                onClick={() => setIsSubmitted(false)} 
                className="btn btn-gold" 
                style={{ width: '100%' }}
              >
                Gửi lại Email khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Địa chỉ Email</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="ví dụ: user@classlive.edu.vn" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ paddingLeft: '40px' }}
                  />
                  <Mail 
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
                    <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> Đang gửi yêu cầu...
                  </span>
                ) : 'Gửi Liên Kết Đặt Lại'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
