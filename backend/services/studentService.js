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
    // Loại bỏ password
    const { password, ...safeUser } = user;
    return safeUser;
  }
}

module.exports = new StudentService();
