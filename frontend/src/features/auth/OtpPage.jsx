import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import AuthService from './AuthService';
import './auth.css';

const OtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, maskedPhone } = location.state || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!userId) {
      navigate('/login');
    }
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [userId, navigate]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    // Allow only last character if multiple typed (e.g. fast typing)
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous on backspace if current is empty
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      const nextIndex = pastedData.length < 6 ? pastedData.length : 5;
      inputRefs.current[nextIndex].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Vui lòng nhập đủ 6 số.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await AuthService.validateOtp(userId, code);
      // Save token and refreshToken (in real app, use Context or Redux for better state management)
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('role', response.role);
      
      // Navigate based on role
      if (response.role === 'admin') {
        navigate('/admin');
      } else if (response.role === 'tenant_admin') {
        navigate('/tenant');
      } else if (response.role === 'school_admin') {
        navigate('/school-admin');
      } else if (response.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Mã xác thực không hợp lệ.');
      // Clear inputs on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
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
          <p>Xác thực hai bước giúp bảo vệ tài khoản của bạn an toàn tuyệt đối. Vui lòng kiểm tra điện thoại.</p>
        </div>
      </div>
      
      <div className="login-right">
        <div className="login-form-card animate-slide-right" style={{ textAlign: 'center' }}>
          <h2>Xác thực danh tính</h2>
          <p className="subtitle">
            Mã 6 chữ số đã được gửi đến số điện thoại <br/>
            <strong style={{ color: 'var(--text)', marginTop: '8px', display: 'block' }}>{maskedPhone || '+84 ******XXX'}</strong>
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="otp-inputs" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  className={`otp-input-box ${digit ? 'filled' : ''}`}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  maxLength={1}
                />
              ))}
            </div>
            
            {error && <p style={{ color: 'var(--primary)', fontSize: '13px', marginBottom: '16px', fontWeight: '500' }}>{error}</p>}
            
            <button type="submit" className="btn btn-gold" style={{ width: '100%' }} disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : 'Xác Nhận'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OtpPage;
