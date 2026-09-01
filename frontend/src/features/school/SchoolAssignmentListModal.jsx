import React, { useState, useEffect } from 'react';
import { X, UserCheck, Trash2 } from 'lucide-react';
import SchoolService from './SchoolService';
import toast from 'react-hot-toast';

const SchoolAssignmentListModal = ({ isOpen, onClose, lesson, onRevokeSuccess }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [revokingId, setRevokingId] = useState(null);

  useEffect(() => {
    if (isOpen && lesson) {
      fetchAssignments();
    }
  }, [isOpen, lesson]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await SchoolService.getLessonAssignments(lesson.id);
      if (res.success) {
        setAssignments(res.data || []);
      }
    } catch (err) {
      toast.error('Không thể tải danh sách Giáo viên đã được cấp.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (assignmentId, teacherName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn thu hồi quyền truy cập bài giảng của Giáo viên ${teacherName}?`)) {
      return;
    }

    try {
      setRevokingId(assignmentId);
      const res = await SchoolService.revokeTeacherAssignment(assignmentId);
      if (res.success) {
        toast.success(res.message || 'Đã thu hồi quyền thành công!');
        setAssignments(assignments.filter(a => a.assignmentId !== assignmentId));
        if (onRevokeSuccess) onRevokeSuccess();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Thu hồi quyền thất bại.');
    } finally {
      setRevokingId(null);
    }
  };

  if (!isOpen || !lesson) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-dialog" 
        style={{ maxWidth: '650px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          {/* HEADER */}
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(212, 175, 55, 0.2)', color: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <UserCheck size={20} />
              </div>
              <div>
                <h5 className="modal-title">Danh Sách Giáo Viên Đã Nhận Bài Giảng</h5>
                <span style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '12px' }}>Bài giảng: {lesson.title}</span>
              </div>
            </div>
            <button className="btn-close" onClick={onClose} title="Đóng">
              <X size={20} />
            </button>
          </div>

          {/* BODY */}
          <div className="modal-body" style={{ padding: 0 }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>Đang tải danh sách...</div>
            ) : assignments.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>Chưa có Giáo viên nào được cấp quyền truy cập bài giảng này.</div>
            ) : (
              <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th style={{ width: '38%' }}>Giáo viên</th>
                      <th style={{ width: '32%' }}>Liên hệ</th>
                      <th style={{ width: '15%' }}>Ngày cấp</th>
                      <th style={{ width: '15%', textAlign: 'right' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((item) => (
                      <tr key={item.assignmentId}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#230C3B', fontSize: '14px' }}>{item.teacherName}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>{item.teacherEmail}</div>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>{item.teacherPhone}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', color: '#6B7280' }}>{formatDate(item.assignedAt)}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRevoke(item.assignmentId, item.teacherName)}
                            disabled={revokingId === item.assignmentId}
                            title="Thu hồi quyền truy cập"
                          >
                            <Trash2 size={13} /> {revokingId === item.assignmentId ? '...' : 'Thu hồi'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ padding: '8px 24px' }}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolAssignmentListModal;
