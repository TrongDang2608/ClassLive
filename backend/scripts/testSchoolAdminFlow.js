const axios = require('axios');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

let db;
try {
  const serviceAccount = require('../firebaseServiceAccount.json');
  initializeApp({ credential: cert(serviceAccount) });
  db = getFirestore();
} catch (e) {
  db = getFirestore();
}

const BASE_URL = 'http://localhost:5000/api';

async function runSchoolAdminTests() {
  console.log('====================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG SCHOOL ADMIN BACKEND API');
  console.log('====================================================\n');

  try {
    // 1. Đăng nhập bước 1 (Username + Password)
    console.log('1. Đăng nhập School Admin 1 (schooladmin1 / password123)...');
    const step1Res = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'schooladmin1',
      password: 'password123'
    });
    console.log('-> Đăng nhập mật khẩu OK:', step1Res.data);
    const userId = step1Res.data.userId;
    // 2. Lấy mã OTP vừa sinh từ Firestore (Mô phỏng người dùng nhận qua SMS/Email)
    console.log('\n2. Lấy mã OTP xác thực...');
    const otpDoc = await db.collection('otps').doc(userId).get();
    const accessCode = otpDoc.data()?.code;
    console.log('-> Mã OTP được cấp:', accessCode);

    // 3. Xác thực OTP & Lấy JWT Token
    console.log('\n3. Xác thực OTP...');
    const otpRes = await axios.post(`${BASE_URL}/auth/validateAccessCode`, {
      userId,
      accessCode
    });
    const token = otpRes.data.token;
    console.log('-> Xác thực OTP thành công! JWT Token:', token.substring(0, 20) + '...');

    // Axios client kèm Header Authorization
    const client = axios.create({
      baseURL: BASE_URL,
      headers: { Authorization: `Bearer ${token}` }
    });

    // 4. Lấy Profile School Admin
    console.log('\n4. Test GET /api/school/profile...');
    const profileRes = await client.get('/school/profile');
    console.log('-> Profile:', profileRes.data.data);

    // 5. Lấy Thống kê Dashboard
    console.log('\n5. Test GET /api/school/dashboard-stats...');
    const statsRes = await client.get('/school/dashboard-stats');
    console.log('-> Stats:', statsRes.data.data);

    // 6. Lấy bài giảng được cấp
    console.log('\n6. Test GET /api/school/lessons...');
    const lessonsRes = await client.get('/school/lessons');
    console.log('-> Tổng bài giảng nhận được:', lessonsRes.data.data.length);
    const lesson = lessonsRes.data.data[0];

    if (lesson) {
      console.log(`\n7. Test GET /api/school/lessons/${lesson.id}...`);
      const detailRes = await client.get(`/school/lessons/${lesson.id}`);
      console.log('-> Bài giảng chi tiết:', detailRes.data.data.title);
    }

    // 8. Lấy danh sách Giáo viên
    console.log('\n8. Test GET /api/school/teachers...');
    const teachersRes = await client.get('/school/teachers');
    console.log('-> Số Giáo viên hiện tại:', teachersRes.data.data.length);

    // 9. Tạo Giáo viên mới
    console.log('\n9. Test POST /api/school/teachers...');
    const createTeacherRes = await client.post('/school/teachers', {
      name: 'Thầy Hoàng Văn Cường',
      email: `cuong.hoang.${Date.now()}@chuvanan.edu.vn`,
      phone: '+84909000111'
    });
    const newTeacherId = createTeacherRes.data.data.id;
    console.log('-> Đã tạo Giáo viên mới thành công (ID:', newTeacherId, ')');

    // 10. Cấp quyền bài giảng cho Giáo viên mới
    if (lesson) {
      console.log(`\n10. Test POST /api/school/lessons/${lesson.id}/assign...`);
      const assignRes = await client.post(`/school/lessons/${lesson.id}/assign`, {
        teacherIds: [newTeacherId]
      });
      console.log('-> Phân bổ bài giảng:', assignRes.data.message);

      console.log(`\n11. Test GET /api/school/lessons/${lesson.id}/assignments...`);
      const getAssignRes = await client.get(`/school/lessons/${lesson.id}/assignments`);
      console.log('-> Danh sách phân bổ:', getAssignRes.data.data);

      const targetAssignment = getAssignRes.data.data.find(a => a.teacherId === newTeacherId);
      if (targetAssignment) {
        console.log(`\n12. Test DELETE /api/school/assignments/${targetAssignment.assignmentId}...`);
        const revokeRes = await client.delete(`/school/assignments/${targetAssignment.assignmentId}`);
        console.log('-> Thu hồi quyền bài giảng:', revokeRes.data.message);
      }
    }

    // 13. Xóa Giáo viên mới
    console.log(`\n13. Test DELETE /api/school/teachers/${newTeacherId}...`);
    const deleteTeacherRes = await client.delete(`/school/teachers/${newTeacherId}`);
    console.log('-> Xóa Giáo viên:', deleteTeacherRes.data.message);

    // 14. Danh bạ Chat
    console.log('\n14. Test GET /api/school/chat-contacts...');
    const chatContactsRes = await client.get('/school/chat-contacts');
    console.log('-> Danh bạ Chat hội thoại:', chatContactsRes.data.data);

    console.log('\n====================================================');
    console.log('🎉 TẤT CẢ 14 KIỂM THỬ SCHOOL ADMIN API ĐÃ THÀNH CÔNG!');
    console.log('====================================================\n');

  } catch (error) {
    console.error('❌ Lỗi khi chạy kiểm thử API:', error.response ? error.response.data : error.message);
  }
}

runSchoolAdminTests();
