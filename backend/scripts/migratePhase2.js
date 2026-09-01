require('dotenv').config();
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const bcrypt = require('bcrypt');
const path = require('path');

// Khởi tạo Firebase Admin
try {
  const serviceAccount = require('../firebaseServiceAccount.json');
  initializeApp({
    credential: cert(serviceAccount)
  });
  console.log('Firebase Admin initialized for Phase 2 Migration & Seeding.');
} catch (error) {
  console.error('Lỗi khi khởi tạo Firebase:', error.message);
  process.exit(1);
}

const db = getFirestore();

async function runMigrationAndSeed() {
  try {
    console.log('====================================================');
    console.log('1. ĐANG XÓA TOÀN BỘ DỮ LIỆU CŨ TRONG COLLECTION ASSIGNMENTS...');
    
    const assignmentsRef = db.collection('assignments');
    const assignSnapshot = await assignmentsRef.get();
    
    if (!assignSnapshot.empty) {
      const batch = db.batch();
      assignSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log(`-> Đã dọn sạch ${assignSnapshot.size} bản ghi assignment cũ.`);
    } else {
      console.log('-> Collection assignments hiện đang trống.');
    }

    console.log('\n2. KIỂM TRA & SEED DỮ LIỆU MẪU CHO TEST GIAI ĐOẠN 2...');

    const usersRef = db.collection('users');
    const lessonsRef = db.collection('lessons');

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);
    const adminPassword = await bcrypt.hash('admin123', salt);

    // 2.1 Seed Root Admin nếu chưa có
    let rootAdminSnapshot = await usersRef.where('username', '==', 'rootadmin').get();
    let rootAdminId;
    if (rootAdminSnapshot.empty) {
      const rootDoc = await usersRef.add({
        name: 'System Root Admin',
        username: 'rootadmin',
        password: adminPassword,
        email: 'admin@classlive.com',
        phone: '+84999999999',
        role: 'admin',
        organizationId: 'root',
        createdBy: 'system',
        createdAt: Date.now()
      });
      rootAdminId = rootDoc.id;
      console.log(`-> Đã tạo Root Admin: rootadmin / admin123 (ID: ${rootAdminId})`);
    } else {
      rootAdminId = rootAdminSnapshot.docs[0].id;
      console.log(`-> Root Admin đã tồn tại: rootadmin (ID: ${rootAdminId})`);
    }

    // 2.2 Seed Tenant Admin
    let tenantSnapshot = await usersRef.where('username', '==', 'tenantadmin').get();
    let tenantAdminId;
    if (tenantSnapshot.empty) {
      const tenantDoc = await usersRef.add({
        name: 'Tổ chức Giáo dục Alpha (Tenant Admin)',
        username: 'tenantadmin',
        password: defaultPassword,
        email: 'tenant@classlive.com',
        phone: '+84901112233',
        role: 'tenant_admin',
        organizationId: 'tenant-alpha-01',
        createdBy: rootAdminId,
        createdAt: Date.now()
      });
      tenantAdminId = tenantDoc.id;
      console.log(`-> Đã tạo Tenant Admin: tenantadmin / password123 (ID: ${tenantAdminId})`);
    } else {
      tenantAdminId = tenantSnapshot.docs[0].id;
      console.log(`-> Tenant Admin đã tồn tại: tenantadmin (ID: ${tenantAdminId})`);
    }

    // 2.3 Seed School Admin 1
    let school1Snapshot = await usersRef.where('username', '==', 'schooladmin1').get();
    let school1Id;
    if (school1Snapshot.empty) {
      const s1Doc = await usersRef.add({
        name: 'Thầy Trần Văn Hiệu (Hiệu Trưởng Chu Văn An)',
        username: 'schooladmin1',
        password: defaultPassword,
        email: 'school1@chuvanan.edu.vn',
        phone: '+84902223344',
        role: 'school_admin',
        schoolName: 'Trường THPT Chu Văn An',
        organizationId: 'school-cva-01',
        createdBy: rootAdminId,
        createdAt: Date.now()
      });
      school1Id = s1Doc.id;
      console.log(`-> Đã tạo School Admin 1: schooladmin1 / password123 (ID: ${school1Id})`);
    } else {
      school1Id = school1Snapshot.docs[0].id;
      console.log(`-> School Admin 1 đã tồn tại: schooladmin1 (ID: ${school1Id})`);
    }

    // 2.4 Seed School Admin 2
    let school2Snapshot = await usersRef.where('username', '==', 'schooladmin2').get();
    let school2Id;
    if (school2Snapshot.empty) {
      const s2Doc = await usersRef.add({
        name: 'Cô Lê Thị Nga (Hiệu Trưởng Lê Hồng Phong)',
        username: 'schooladmin2',
        password: defaultPassword,
        email: 'school2@lehongphong.edu.vn',
        phone: '+84903334455',
        role: 'school_admin',
        schoolName: 'Trường THPT Chuyên Lê Hồng Phong',
        organizationId: 'school-lhp-02',
        createdBy: rootAdminId,
        createdAt: Date.now()
      });
      school2Id = s2Doc.id;
      console.log(`-> Đã tạo School Admin 2: schooladmin2 / password123 (ID: ${school2Id})`);
    } else {
      school2Id = school2Snapshot.docs[0].id;
      console.log(`-> School Admin 2 đã tồn tại: schooladmin2 (ID: ${school2Id})`);
    }

    // 2.5 Seed Bài giảng mẫu cho Tenant Admin nếu chưa có
    const lessonSampleSnapshot = await lessonsRef.where('createdBy', '==', tenantAdminId).get();
    let sampleLessonId;
    if (lessonSampleSnapshot.empty) {
      const lessonDoc = await lessonsRef.add({
        title: 'Chương 1: Mệnh đề & Tập hợp Toán 10',
        description: 'Tài liệu chuẩn kiến thức kỹ năng môn Toán lớp 10 theo chương trình mới.',
        subject: 'Toán Học',
        grade: 'Lớp 10',
        content: '<h2>Nội dung bài học</h2><p>1. Mệnh đề toán học</p><p>2. Tập hợp và các phép toán trên tập hợp</p>',
        files: [],
        createdBy: tenantAdminId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      sampleLessonId = lessonDoc.id;
      console.log(`-> Đã tạo bài giảng mẫu: "${lessonDoc.id}"`);
    } else {
      sampleLessonId = lessonSampleSnapshot.docs[0].id;
      console.log(`-> Đã có bài giảng mẫu: "${sampleLessonId}"`);
    }

    console.log('\n====================================================');
    console.log('✅ MIGRATION & SEED PHASE 2 HOÀN TẤT THÀNH CÔNG!');
    console.log('Thông tin tài khoản để kiểm thử:');
    console.log('1. Tenant Admin:  username: "tenantadmin"  | password: "password123"');
    console.log('2. School Admin 1: username: "schooladmin1" | password: "password123"');
    console.log('3. School Admin 2: username: "schooladmin2" | password: "password123"');
    console.log(`4. Sample Lesson ID: "${sampleLessonId}"`);
    console.log('====================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi chạy migration Phase 2:', error);
    process.exit(1);
  }
}

runMigrationAndSeed();
