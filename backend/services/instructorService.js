const userRepository = require('../repositories/userRepository');

class InstructorService {
  // 1. Lấy số liệu thống kê Dashboard
  async getDashboardStats(instructorId) {
    const lessonRepository = require('../repositories/lessonRepository');
    
    // Tổng số học viên
    const totalStudents = await userRepository.countAll('student');
    
    // Số bài giảng đang mở của giảng viên này
    const activeLessons = await lessonRepository.countLessonsByInstructor(instructorId);
    
    // Tính tỉ lệ đạt chuẩn (Tỉ lệ hoàn thành các bài tập đã giao)
    const lessons = await lessonRepository.findLessonsByInstructor(instructorId, 1, 1000);
    let totalAssigned = 0;
    let totalCompleted = 0;
    
    for (const lesson of lessons) {
      const snapshot = await lessonRepository.assignmentsCollection.where('lessonId', '==', lesson.id).get();
      snapshot.forEach(doc => {
        totalAssigned++;
        if (doc.data().status === 'completed') {
          totalCompleted++;
        }
      });
    }
    
    const passRate = totalAssigned === 0 ? 0 : Math.round((totalCompleted / totalAssigned) * 100);

    // Dữ liệu biểu đồ (Thống kê trạng thái bài tập)
    const chartData = [
      { name: 'Đã hoàn thành', value: totalCompleted, color: '#D4AF37' },
      { name: 'Đang làm/Chờ', value: totalAssigned - totalCompleted, color: '#f3e5f5' }
    ];

    // Lấy top 5 học viên mới nhất thay cho Học Viên Xuất Sắc mock
    const allStudents = await userRepository.findAll('student', 1, 5);
    const recentStudents = allStudents.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone
    }));

    // Bỏ hẳn các số liệu mock (như pendingRequests)
    return {
      totalStudents,
      activeLessons,
      passRate,
      chartData,
      recentStudents
    };
  }
}

module.exports = new InstructorService();
