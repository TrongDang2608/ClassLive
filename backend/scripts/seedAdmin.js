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
  console.log('Firebase Admin initialized for seeding.');
} catch (error) {
  console.error('Lỗi khi khởi tạo Firebase:', error.message);
  process.exit(1);
}

const db = getFirestore();

async function clearAndSeedDatabase() {
  try {
    console.log('Đang dọn dẹp Database (Xóa tất cả người dùng cũ)...');
    
    // Lấy tất cả user hiện có
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();
    
    if (!snapshot.empty) {
      // Dùng batch để xóa nhanh
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`Đã xóa thành công ${snapshot.size} người dùng cũ.`);
    } else {
      console.log('Database trống, không có người dùng cũ để xóa.');
    }

    console.log('Đang khởi tạo tài khoản Root Admin...');
    
    // Tạo hash password 'admin123'
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    const rootAdminData = {
      name: 'System Root Admin',
      username: 'rootadmin',
      password: hashedPassword,
      email: 'admin@classlive.com',
      phone: '+84999999999',
      role: 'admin',          // ROLE cao nhất trong hệ thống mới
      createdBy: 'system',    // Không ai tạo ra root
      organizationId: 'root', // Nằm ở gốc của cấu trúc
      createdAt: Date.now()
    };
    
    const newAdminRef = await usersRef.add(rootAdminData);
    console.log('==============================================');
    console.log('SEED THÀNH CÔNG! THÔNG TIN TÀI KHOẢN ADMIN:');
    console.log(`- ID: ${newAdminRef.id}`);
    console.log(`- Username: rootadmin`);
    console.log(`- Password: admin123`);
    console.log('==============================================');
    
    process.exit(0);
  } catch (error) {
    console.error('Lỗi trong quá trình Seed:', error);
    process.exit(1);
  }
}

clearAndSeedDatabase();
