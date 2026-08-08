const lessonRepository = require('../repositories/lessonRepository');
const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');

class StudentService {
  async getMyLessons(studentId) {
    const assignments = await lessonRepository.findAssignmentsByStudent(studentId);
    
    // Nạp chi tiết bài giảng vào từng assignment
    const populatedAssignments = await Promise.all(assignments.map(async (assignment) => {
      const lesson = await lessonRepository.findLessonById(assignment.lessonId);
      if (lesson) {
        // Loại bỏ createdAt và createdBy theo yêu cầu
        const { createdAt, createdBy, ...lessonDetails } = lesson;
        return {
          ...assignment,
          lesson: lessonDetails
        };
      }
      return null;
    }));

    // Lọc bỏ những bài giảng đã bị xóa (lesson === null)
    return populatedAssignments.filter(a => a !== null);
  }

  async markLessonAsDone(assignmentId, studentId) {
    const assignment = await lessonRepository.findAssignmentById(assignmentId);
    
    if (!assignment) {
      throw new AppError('Bài tập không tồn tại', 404);
    }
    
    if (assignment.studentId !== studentId) {
      throw new AppError('Bạn không có quyền cập nhật bài tập này', 403);
    }

    if (assignment.status === 'completed') {
      throw new AppError('Bài tập này đã được đánh dấu hoàn thành', 400);
    }

    await lessonRepository.updateAssignmentStatus(assignmentId, 'completed', Date.now());
  }

  async updateProfile(studentId, profileData) {
    // userRepository.update là hàm update db
    await userRepository.update(studentId, profileData);
  }

  async getProfile(studentId) {
    const user = await userRepository.findById(studentId);
    if (!user) {
      throw new AppError('Học viên không tồn tại', 404);
    }
    // Trả về dữ liệu public (ẩn password nếu có)
    const { password, ...publicProfile } = user;
    return publicProfile;
  }

  async getDashboardStats(studentId) {
    const assignments = await lessonRepository.findAssignmentsByStudent(studentId);
    
    const totalLessons = assignments.length;
    let completedLessons = 0;
    
    assignments.forEach(assign => {
      if (assign.status === 'completed') {
        completedLessons++;
      }
    });
    
    const pendingLessons = totalLessons - completedLessons;
    const progress = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
    
    // Dữ liệu cho biểu đồ tiến độ học tập
    const chartData = [
      { name: 'Đã hoàn thành', value: completedLessons, color: '#D4AF37' },
      { name: 'Chưa hoàn thành', value: pendingLessons, color: '#f3e5f5' }
    ];
    
    return {
      totalLessons,
      completedLessons,
      pendingLessons,
      progress,
      chartData
    };
  }
}

module.exports = new StudentService();
