import React, { useState, useEffect } from 'react';
import { X, Users, Trash2, Loader2, School, ShieldAlert, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import TenantService from './TenantService';
import './tenant.css';

const TenantAssignmentListModal = ({ isOpen, onClose, lesson, onRevokeSuccess }) => {
  const [assignments, setAssignments] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [revokingId, setRevokingId] = useState(null);

  useEffect(() => {
    if (isOpen && lesson) {
      fetchAssignments();
    }
  }, [isOpen, lesson]);

  const fetchAssignments = async () => {
    setFetching(true);
    try {
      const res = await TenantService.getLessonAssignments(lesson.id);
      setAssignments(res.data || []);
    } catch (error) {
      toast.error('Không thể lấy danh sách quyền đã cấp.');
    } finally {
      setFetching(false);
    }
  };

  if (!isOpen || !lesson) return null;

  const handleRevoke = async (assignmentId, schoolAdminName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn thu hồi quyền truy cập bài giảng của "${schoolAdminName}" không?`)) {
      return;
    }

    setRevokingId(assignmentId);
    try {
      await TenantService.revokeAssignment(assignmentId);
      toast.success('Thu hồi quyền truy cập thành công!');
      setAssignments(prev => prev.filter(item => item.id !== assignmentId));
      if (onRevokeSuccess) onRevokeSuccess();
    } catch (error) {
      console.error('Lỗi thu hồi quyền:', error);
      toast.error(error.response?.data?.error || 'Thu hồi quyền thất bại.');
    } finally {
      setRevokingId(null);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  return (
    <div className="tenant-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="tenant-modal-card animate-slide-right" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
        <div className="tenant-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="tenant-stat-icon gold" style={{ width: '38px', height: '38px' }}>
              <Users size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', color: 'var(--tenant-primary)', margin: 0 }}>Danh Sách Đơn Vị Đã Cấp Quyền</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Bài học: {lesson.title}</span>
            </div>
          </div>
          <button className="btn-emerald-outline" style={{ padding: '6px', borderRadius: '50%' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="tenant-modal-body">
          {fetching ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <Loader2 size={26} className="animate-spin" color="var(--tenant-primary)" />
            </div>
          ) : assignments.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', background: 'var(--bg-warm)', borderRadius: 'var(--radius-sm)' }}>
              <ShieldAlert size={36} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                Bài giảng này chưa được cấp quyền cho School Admin nào.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {assignments.map(item => {
                const isRevoking = revokingId === item.id;
                return (
                  <div 
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      background: 'var(--white)',
                      border: '1px solid var(--tenant-border)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
                        {item.schoolAdmin?.name || 'School Admin'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <School size={12} color="var(--gold-dark)" /> {item.schoolAdmin?.schoolName || 'Trường học'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                          <Calendar size={12} /> Cấp ngày: {formatDate(item.assignedAt)}
                        </span>
                      </div>
                    </div>

                    <button 
                      type="button"
                      className="btn-emerald-outline"
                      style={{ color: '#d32f2f', borderColor: '#d32f2f10', background: '#d32f2f08', padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => handleRevoke(item.id, item.schoolAdmin?.name)}
                      disabled={isRevoking}
                      title="Thu hồi quyền truy cập"
                    >
                      {isRevoking ? <Loader2 size={14} className="animate-spin" /> : <><Trash2 size={13} /> Thu hồi</>}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="tenant-modal-footer">
          <button type="button" className="btn-emerald-outline" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenantAssignmentListModal;
