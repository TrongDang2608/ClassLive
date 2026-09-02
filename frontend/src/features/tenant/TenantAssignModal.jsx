import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, CheckSquare, Square, Search, Loader2, School } from 'lucide-react';
import toast from 'react-hot-toast';
import TenantService from './TenantService';
import './tenant.css';

const TenantAssignModal = ({ isOpen, onClose, lesson, onSuccess }) => {
  const [schoolAdmins, setSchoolAdmins] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && lesson) {
      fetchSchoolAdmins();
      setSelectedIds([]);
      setSearchTerm('');
    }
  }, [isOpen, lesson]);

  const fetchSchoolAdmins = async () => {
    setFetching(true);
    try {
      const data = await TenantService.getSchoolAdmins();
      setSchoolAdmins(data || []);
      const assignedIds = lesson.assignedSchoolIds || [];
      setSelectedIds(assignedIds);
    } catch (error) {
      console.error('Lỗi lấy danh sách trường:', error);
      toast.error('Không thể lấy danh sách Trường học.');
    } finally {
      setFetching(false);
    }
  };

  const filteredAdmins = schoolAdmins.filter(admin => {
    const term = searchTerm.toLowerCase();
    return (
      (admin.name && admin.name.toLowerCase().includes(term)) ||
      (admin.schoolName && admin.schoolName.toLowerCase().includes(term)) ||
      (admin.email && admin.email.toLowerCase().includes(term))
    );
  });

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredAdmins.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAdmins.map(a => a.id));
    }
  };

  const handleAssign = async () => {
    if (selectedIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 School Admin!');
      return;
    }

    setSubmitting(true);
    try {
      const res = await TenantService.assignLessonToSchools(lesson.id, selectedIds);
      toast.success(res.message || `Cấp quyền bài giảng thành công cho ${selectedIds.length} đơn vị!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Lỗi cấp quyền:', error);
      toast.error(error.response?.data?.error || 'Cấp quyền thất bại. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !lesson) return null;

  return createPortal(
    <div className="tenant-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="tenant-modal-card" style={{ maxWidth: '620px', margin: 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="tenant-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="tenant-stat-icon" style={{ width: '38px', height: '38px' }}>
              <Send size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', color: 'var(--tenant-primary)', margin: 0, fontWeight: 700 }}>Cấp Quyền Học Liệu</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Dành cho School Admin (Trường học)</span>
            </div>
          </div>
          <button className="btn-close-circle" onClick={onClose} title="Đóng">
            <X size={18} />
          </button>
        </div>

        <div className="tenant-modal-body">
          {/* Thông tin Bài giảng đang giao */}
          <div style={{ padding: '12px 16px', background: 'var(--tenant-primary-subtle)', borderRadius: 'var(--radius-sm)', marginBottom: '16px', border: '1px solid var(--tenant-border)' }}>
            <span style={{ fontSize: '12px', color: 'var(--tenant-primary)', fontWeight: 600 }}>Bài giảng chọn cấp quyền:</span>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>{lesson.title}</div>
          </div>

          {/* Ô tìm kiếm */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-warm)', border: '1px solid var(--tenant-border)', borderRadius: 'var(--radius-sm)', padding: '8px 14px', marginBottom: '16px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Tìm theo tên School Admin hoặc tên Trường..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px' }}
            />
          </div>

          {/* Header Chọn tất cả */}
          {filteredAdmins.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--tenant-border)' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Danh sách School Admin ({filteredAdmins.length})
              </span>
              <button 
                type="button" 
                onClick={handleSelectAll}
                style={{ background: 'none', border: 'none', color: 'var(--tenant-primary)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {selectedIds.length === filteredAdmins.length ? <CheckSquare size={16} /> : <Square size={16} />}
                Chọn tất cả
              </button>
            </div>
          )}

          {/* List School Admin */}
          {fetching ? (
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <Loader2 size={24} className="animate-spin" color="var(--tenant-primary)" />
            </div>
          ) : filteredAdmins.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>
              Không tìm thấy School Admin nào.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
              {filteredAdmins.map(admin => {
                const isSelected = selectedIds.includes(admin.id);
                return (
                  <div 
                    key={admin.id}
                    onClick={() => handleToggleSelect(admin.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '1px solid var(--tenant-primary)' : '1px solid var(--tenant-border)',
                      background: isSelected ? 'var(--tenant-primary-subtle)' : 'var(--white)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ color: isSelected ? 'var(--tenant-primary)' : 'var(--text-muted)' }}>
                      {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                        {admin.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <School size={12} color="var(--gold-dark)" /> {admin.schoolName || 'Chưa cập nhật tên trường'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="tenant-modal-footer">
          <button type="button" className="btn-emerald-outline" onClick={onClose} disabled={submitting}>
            Hủy
          </button>
          <button type="button" className="btn-emerald" onClick={handleAssign} disabled={submitting || selectedIds.length === 0}>
            {submitting ? <Loader2 size={16} className="animate-spin" /> : `Cấp quyền (${selectedIds.length})`}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TenantAssignModal;
