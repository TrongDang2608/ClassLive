import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Square, Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import LessonService from './LessonService';
import InstructorService from './InstructorService'; // Để gọi API lấy danh sách học sinh
import './instructor.css';

const AssignLessonModal = ({ isOpen, onClose, lesson }) => {
  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isOpen && lesson) {
      fetchStudents();
      setSelectedIds([]); // Reset selection when modal opens
    }
  }, [isOpen, lesson]);

  const fetchStudents = async () => {
    setFetching(true);
    try {
      // Dùng InstructorService để fetch students bằng role 'student'
      const res = await InstructorService.getUsers('student', 1, 100); 
      setStudents(res.data || []);
    } catch (error) {
      toast.error('Không thể tải danh sách học sinh.');
    } finally {
      setFetching(false);
    }
  };

  const handleToggleSelect = (studentId) => {
    if (selectedIds.includes(studentId)) {
      setSelectedIds(selectedIds.filter(id => id !== studentId));
    } else {
      setSelectedIds([...selectedIds, studentId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map(s => s.id));
    }
  };

  const handleAssign = async () => {
    if (selectedIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 học sinh!');
      return;
    }

    setLoading(true);
    try {
      await LessonService.assignLesson(lesson.id, selectedIds);
      toast.success(`Đã giao bài thành công cho ${selectedIds.length} học sinh!`);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Giao bài thất bại.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content animate-slide-up" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2 className="modal-title">
            <Send size={22} strokeWidth={2} style={{ color: 'var(--primary)' }} />
            Giao Bài Tập
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto', padding: '24px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Bạn đang giao bài: <strong style={{ color: 'var(--text)' }}>{lesson?.title}</strong>
          </p>

          {fetching ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
              <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              Không có học sinh nào trong hệ thống.
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 500 }}>Danh sách Học sinh</span>
                <button 
                  type="button"
                  onClick={handleSelectAll}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500 }}
                >
                  {selectedIds.length === students.length ? <CheckSquare size={16} /> : <Square size={16} />}
                  Chọn tất cả
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {students.map(student => (
                  <div 
                    key={student.id} 
                    onClick={() => handleToggleSelect(student.id)}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', 
                      borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease',
                      border: selectedIds.includes(student.id) ? '1px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: selectedIds.includes(student.id) ? 'rgba(88, 28, 44, 0.05)' : 'transparent'
                    }}
                  >
                    <div style={{ color: selectedIds.includes(student.id) ? 'var(--primary)' : 'var(--text-secondary)' }}>
                      {selectedIds.includes(student.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--text)', fontSize: '14px' }}>{student.name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{student.phone} - {student.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', padding: '16px 24px' }}>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>Hủy</button>
          <button type="button" className="btn btn-gold" onClick={handleAssign} disabled={loading || selectedIds.length === 0 || fetching}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : `Giao bài (${selectedIds.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignLessonModal;
