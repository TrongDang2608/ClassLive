import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Mail, Phone } from 'lucide-react';
import SchoolService from './SchoolService';
import toast from 'react-hot-toast';

const SchoolTeacherModal = ({ isOpen, onClose, teacher, onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (teacher) {
      setFormData({
        name: teacher.name || '',
        email: teacher.email || '',
        phone: teacher.phone || ''
      });
    } else {
      setFormData({ name: '', email: '', phone: '' });
    }
  }, [teacher, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.error('Vui lòng điền đầy đủ Họ tên, Email và Số điện thoại.');
      return;
    }

    try {
      setSubmitting(true);
      if (teacher) {
        // Edit Teacher
        const res = await SchoolService.updateTeacher(teacher.id, {
          name: formData.name,
          phone: formData.phone
        });
        if (res.success) {
          toast.success(res.message || 'Cập nhật Giáo viên thành công!');
          if (onSuccess) onSuccess();
          onClose();
        }
      } else {
        // Create Teacher
        const res = await SchoolService.createTeacher(formData);
        if (res.success) {
          toast.success(res.message || 'Tạo Giáo viên thành công & Đã gửi email thiết lập mật khẩu!');
          if (onSuccess) onSuccess();
          onClose();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Thao tác không thành công.');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-dialog" 
        style={{ maxWidth: '560px', margin: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          {/* HEADER */}
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(212, 175, 55, 0.2)', color: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={20} />
              </div>
              <div>
                <h5 className="modal-title">
                  {teacher ? 'Cập Nhật Thông Tin Giáo Viên' : 'Thêm Giáo Viên Mới'}
                </h5>
                <span style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '12px' }}>
                  {teacher ? `ID: ${teacher.id}` : 'Tự động gửi email kích hoạt tài khoản'}
                </span>
              </div>
            </div>
            <button className="btn-close" onClick={onClose} title="Đóng">
              <X size={20} />
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Name */}
              <div style={{ marginBottom: '18px' }}>
                <label className="form-label">
                  Họ và tên Giáo viên <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <User size={16} />
                  </span>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="VD: Thầy Nguyễn Văn An"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div style={{ marginBottom: '18px' }}>
                <label className="form-label">
                  Địa chỉ Email <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Mail size={16} />
                  </span>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="VD: gv.an@chuvanan.edu.vn"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!!teacher}
                    required
                  />
                </div>
                {teacher && <small style={{ color: '#6B7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>Không thể thay đổi email sau khi đã tạo tài khoản.</small>}
              </div>

              {/* Phone */}
              <div style={{ marginBottom: '18px' }}>
                <label className="form-label">
                  Số điện thoại <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Phone size={16} />
                  </span>
                  <input 
                    type="tel" 
                    className="form-control" 
                    placeholder="VD: +84901234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              {!teacher && (
                <div style={{ background: '#F8F6FA', border: '1px solid #E8E2EE', borderRadius: '12px', padding: '14px', marginTop: '14px' }}>
                  <small style={{ color: '#6B7280', fontSize: '13px', display: 'block', lineHeight: 1.5 }}>
                    💡 <strong>Lưu ý:</strong> Sau khi tạo, hệ thống sẽ tự động gửi đường link bảo mật đến Email của Giáo viên để tự thiết lập tên đăng nhập và mật khẩu cá nhân.
                  </small>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={onClose}
                disabled={submitting}
              >
                Hủy
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={submitting}
              >
                {submitting ? 'Đang lưu...' : teacher ? 'Cập nhật' : 'Tạo & Gửi Email'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SchoolTeacherModal;
