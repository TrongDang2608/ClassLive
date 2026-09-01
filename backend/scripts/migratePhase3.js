require('dotenv').config();
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const bcrypt = require('bcrypt');

// Khởi tạo Firebase Admin
let db;
try {
  const serviceAccount = require('../firebaseServiceAccount.json');
  initializeApp({
    credential: cert(serviceAccount)
  });
  db = getFirestore();
  console.log('Firebase Admin initialized for Phase 3 Migration & Seeding.');
} catch (error) {
  console.error('Error initializing Firebase:', error.message);
  process.exit(1);
}

async function migrateAndSeedPhase3() {
  try {
    console.log('====================================================');
    console.log('1. BẮT ĐẦU MIGRATION & SEED DATA CHO PHASE 3 (SCHOOL ADMIN & TEACHERS)...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Tìm hoặc tạo Tenant Admin
    let tenantAdminId = null;
    const tenantSnap = await db.collection('users').where('username', '==', 'tenantadmin').limit(1).get();
    if (tenantSnap.empty) {
      const docRef = await db.collection('users').add({
        name: 'Sở Giáo Dục / Hệ Thống Anh Ngữ',
        username: 'tenantadmin',
        password: hashedPassword,
        email: 'tenant@classlive.edu.vn',
        phone: '+84988776655',
        role: 'tenant_admin',
        isSetup: true,
        createdAt: Date.now()
      });
      tenantAdminId = docRef.id;
      console.log(`-> Đã tạo Tenant Admin: tenantadmin / password123 (ID: ${tenantAdminId})`);
    } else {
      tenantAdminId = tenantSnap.docs[0].id;
      console.log(`-> Đã có Tenant Admin: tenantadmin (ID: ${tenantAdminId})`);
    }

    // 2. Tìm hoặc tạo School Admin 1
    let school1Id = null;
    const school1Snap = await db.collection('users').where('username', '==', 'schooladmin1').limit(1).get();
    if (school1Snap.empty) {
      const docRef = await db.collection('users').add({
        name: 'Trường THPT Chu Văn An',
        username: 'schooladmin1',
        password: hashedPassword,
        email: 'school1@chuvanan.edu.vn',
        phone: '+84911223344',
        role: 'school_admin',
        schoolName: 'Trường THPT Chu Văn An',
        organizationId: 'org_chuvanan_01',
        isSetup: true,
        createdAt: Date.now()
      });
      school1Id = docRef.id;
      console.log(`-> Đã tạo School Admin 1: schooladmin1 / password123 (ID: ${school1Id})`);
    } else {
      school1Id = school1Snap.docs[0].id;
      console.log(`-> Đã có School Admin 1: schooladmin1 (ID: ${school1Id})`);
    }

    // 3. Tìm hoặc tạo School Admin 2
    let school2Id = null;
    const school2Snap = await db.collection('users').where('username', '==', 'schooladmin2').limit(1).get();
    if (school2Snap.empty) {
      const docRef = await db.collection('users').add({
        name: 'Trường THPT Lê Hồng Phong',
        username: 'schooladmin2',
        password: hashedPassword,
        email: 'school2@lehongphong.edu.vn',
        phone: '+84922334455',
        role: 'school_admin',
        schoolName: 'Trường THPT Lê Hồng Phong',
        organizationId: 'org_lehongphong_02',
        isSetup: true,
        createdAt: Date.now()
      });
      school2Id = docRef.id;
      console.log(`-> Đã tạo School Admin 2: schooladmin2 / password123 (ID: ${school2Id})`);
    } else {
      school2Id = school2Snap.docs[0].id;
      console.log(`-> Đã có School Admin 2: schooladmin2 (ID: ${school2Id})`);
    }

    // 4. Tìm hoặc tạo Bài giảng mẫu
    let sampleLessonId = null;
    const lessonSnap = await db.collection('lessons').limit(1).get();
    if (lessonSnap.empty) {
      const docRef = await db.collection('lessons').add({
        title: 'Toán 10: Hàm Số Bậc Nhất & Bậc Hai Chuẩn Sở',
        description: 'Bộ giáo trình chuẩn hóa toàn diện toán lớp 10 học kỳ 1 theo chương trình GDPT mới.',
        subject: 'Toán Học',
        grade: 'Lớp 10',
        creatorId: tenantAdminId,
        files: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      sampleLessonId = docRef.id;
      console.log(`-> Đã tạo bài giảng mẫu: "${sampleLessonId}"`);
    } else {
      sampleLessonId = lessonSnap.docs[0].id;
      console.log(`-> Đã có bài giảng mẫu: "${sampleLessonId}"`);
    }

    // 5. Cấp quyền bài giảng từ Tenant Admin -> School Admin 1 (Collection assignments)
    const existingAssignSnap = await db.collection('assignments')
      .where('lessonId', '==', sampleLessonId)
      .where('schoolAdminId', '==', school1Id)
      .limit(1)
      .get();

    if (existingAssignSnap.empty) {
      await db.collection('assignments').add({
        lessonId: sampleLessonId,
        tenantAdminId: tenantAdminId,
        schoolAdminId: school1Id,
        assignedAt: Date.now()
      });
      console.log(`-> Đã phân bổ bài giảng [${sampleLessonId}] cho School Admin 1 [${school1Id}]`);
    } else {
      console.log(`-> Phân bổ Tenant -> School 1 đã tồn tại.`);
    }

    // 6. Tạo Giáo viên mẫu cho School Admin 1
    let teacher1Id = null;
    const teacher1Snap = await db.collection('users').where('username', '==', 'teacher_an').limit(1).get();
    if (teacher1Snap.empty) {
      const docRef = await db.collection('users').add({
        name: 'Thầy Nguyễn Văn An',
        username: 'teacher_an',
        password: hashedPassword,
        email: 'an.nguyen@chuvanan.edu.vn',
        phone: '+84908111222',
        role: 'teacher',
        schoolName: 'Trường THPT Chu Văn An',
        organizationId: 'org_chuvanan_01',
        createdBy: school1Id,
        isSetup: true,
        createdAt: Date.now()
      });
      teacher1Id = docRef.id;
      console.log(`-> Đã tạo Giáo viên 1: teacher_an / password123 (ID: ${teacher1Id})`);
    } else {
      teacher1Id = teacher1Snap.docs[0].id;
      console.log(`-> Đã có Giáo viên 1: teacher_an (ID: ${teacher1Id})`);
    }

    let teacher2Id = null;
    const teacher2Snap = await db.collection('users').where('username', '==', 'teacher_binh').limit(1).get();
    if (teacher2Snap.empty) {
      const docRef = await db.collection('users').add({
        name: 'Cô Trần Thị Bình',
        username: 'teacher_binh',
        password: hashedPassword,
        email: 'binh.tran@chuvanan.edu.vn',
        phone: '+84908333444',
        role: 'teacher',
        schoolName: 'Trường THPT Chu Văn An',
        organizationId: 'org_chuvanan_01',
        createdBy: school1Id,
        isSetup: true,
        createdAt: Date.now()
      });
      teacher2Id = docRef.id;
      console.log(`-> Đã tạo Giáo viên 2: teacher_binh / password123 (ID: ${teacher2Id})`);
    } else {
      teacher2Id = teacher2Snap.docs[0].id;
      console.log(`-> Đã có Giáo viên 2: teacher_binh (ID: ${teacher2Id})`);
    }

    // 7. Cấp quyền bài giảng từ School Admin 1 -> Giáo viên 1 (Collection teacher_assignments)
    const existingTeacherAssignSnap = await db.collection('teacher_assignments')
      .where('lessonId', '==', sampleLessonId)
      .where('teacherId', '==', teacher1Id)
      .limit(1)
      .get();

    if (existingTeacherAssignSnap.empty) {
      await db.collection('teacher_assignments').add({
        lessonId: sampleLessonId,
        schoolAdminId: school1Id,
        teacherId: teacher1Id,
        assignedAt: Date.now()
      });
      console.log(`-> Đã phân bổ bài giảng [${sampleLessonId}] cho Giáo viên 1 [${teacher1Id}]`);
    } else {
      console.log(`-> Phân bổ School 1 -> Giáo viên 1 đã tồn tại.`);
    }

    console.log('\n====================================================');
    console.log('✅ MIGRATION & SEED PHASE 3 HOÀN TẤT THÀNH CÔNG!');
    console.log('Thông tin tài khoản kiểm thử Phase 3:');
    console.log('1. School Admin 1: username: "schooladmin1" | password: "password123"');
    console.log('2. School Admin 2: username: "schooladmin2" | password: "password123"');
    console.log('3. Giáo viên 1:    username: "teacher_an"   | password: "password123"');
    console.log('4. Giáo viên 2:    username: "teacher_binh" | password: "password123"');
    console.log('====================================================\n');

  } catch (error) {
    console.error('Lỗi khi chạy Migration Phase 3:', error);
  } finally {
    process.exit(0);
  }
}

migrateAndSeedPhase3();
