import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Share2, Search } from 'lucide-react';
import SchoolService from './SchoolService';
import toast from 'react-hot-toast';

const SchoolAssignModal = ({ isOpen, onClose, lesson, onSuccess }) => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);
  const [assignedTeacherIds, setAssignedTeacherIds] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && lesson) {
      fetchTeachersAndAssignments();
    } else {
      setSelectedTeacherIds([]);
      setSearch('');
    }
  }, [isOpen, lesson]);

  const fetchTeachersAndAssignments = async () => {
    try {
      setLoading(true);
      const [teachersRes, assignmentsRes] = await Promise.all([
        SchoolService.getTeachers(1, 100),
        SchoolService.getLessonAssignments(lesson.id)
      ]);

      if (teachersRes.success) {
        setTeachers(teachersRes.data || []);
      }
      if (assignmentsRes.success) {
        const alreadyAssigned = (assignmentsRes.data || []).map(a => a.teacherId);
        setAssignedTeacherIds(alreadyAssigned);
      }
    } catch (err) {
      toast.error('Không thể tải danh sách Giáo viên.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTeacher = (teacherId) => {
    if (assignedTeacherIds.includes(teacherId)) return;

    if (selectedTeacherIds.includes(teacherId)) {
      setSelectedTeacherIds(selectedTeacherIds.filter(id => id !== teacherId));
    } else {
      setSelectedTeacherIds([...selectedTeacherIds, teacherId]);
    }
  };

  const handleSelectAll = () => {
    const unassignedTeachers = teachers.filter(t => !assignedTeacherIds.includes(t.id));
    if (selectedTeacherIds.length === unassignedTeachers.length) {
      setSelectedTeacherIds([]);
    } else {
      setSelectedTeacherIds(unassignedTeachers.map(t => t.id));
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (selectedTeacherIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 giáo viên.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await SchoolService.assignLessonToTeachers(lesson.id, selectedTeacherIds);
      if (res.success) {
        toast.success(res.message || 'Cấp quyền bài giảng cho giáo viên thành công!');
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Phân bổ học liệu thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !lesson) return null;

  const filteredTeachers = teachers.filter(t => 
    t.name?.toLowerCase().includes(search.toLowerCase()) || 
    t.email?.toLowerCase().includes(search.toLowerCase()) ||
    t.phone?.includes(search)
  );

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-dialog" 
        style={{ maxWidth: '620px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          {/* HEADER */}
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(212, 175, 55, 0.2)', color: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Share2 size={20} />
              </div>
              <div>
                <h5 className="modal-title">Phân bổ Bài giảng cho Giáo viên</h5>
                <span style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '12px' }}>Bài giảng: {lesson.title}</span>
              </div>
            </div>
            <button className="btn-close" onClick={onClose} title="Đóng">
              <X size={20} />
            </button>
          </div>

          {/* BODY */}
          <div className="modal-body">
            {/* Search and Select All */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <span className="input-group-text">
                  <Search size={16} />
                </span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Tìm tên, email Giáo viên..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <button 
                type="button" 
                className="btn btn-sm btn-outline-secondary"
                onClick={handleSelectAll}
                style={{ flexShrink: 0 }}
              >
                Chọn tất cả ({selectedTeacherIds.length})
              </button>
            </div>

            {/* List Teachers */}
            <div style={{ maxHeight: '320px', overflowY: 'auto', border: '1px solid var(--school-border)', borderRadius: '12px' }}>
              {loading ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>Đang tải danh sách Giáo viên...</div>
              ) : filteredTeachers.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>Không tìm thấy Giáo viên nào.</div>
              ) : (
                <div className="list-group">
                  {filteredTeachers.map((t) => {
                    const isAlreadyAssigned = assignedTeacherIds.includes(t.id);
                    const isSelected = selectedTeacherIds.includes(t.id);

                    return (
                      <div 
                        key={t.id} 
                        className="list-group-item"
                        style={{ 
                          cursor: isAlreadyAssigned ? 'not-allowed' : 'pointer',
                          background: isAlreadyAssigned ? '#F9FAFB' : isSelected ? 'rgba(59, 24, 95, 0.04)' : '#FFFFFF'
                        }}
                        onClick={() => handleToggleTeacher(t.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <input 
                            type="checkbox" 
                            className="form-check-input"
                            checked={isAlreadyAssigned || isSelected}
                            disabled={isAlreadyAssigned}
                            onChange={() => {}}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: '#230C3B', fontSize: '14px' }}>{t.name}</div>
                            <div style={{ fontSize: '12px', color: '#6B7280' }}>{t.email} • {t.phone}</div>
                          </div>
                        </div>

                        {isAlreadyAssigned && (
                          <span className="badge" style={{ background: '#E5E7EB', color: '#4B5563' }}>
                            Đã được cấp
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>
              Đã chọn: <strong style={{ color: '#3B185F' }}>{selectedTeacherIds.length}</strong> Giáo viên
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={submitting}>
                Hủy
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleSubmit}
                disabled={submitting || selectedTeacherIds.length === 0}
              >
                {submitting ? 'Đang cấp quyền...' : 'Xác nhận Cấp quyền'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SchoolAssignModal;
