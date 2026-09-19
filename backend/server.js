require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { initRedis } = require('./config/redis');
const { initWorkers } = require('./workers');
const { setupBullBoard } = require('./config/bullBoard');
const { initMinio } = require('./config/minio');

// Khởi tạo Firebase Admin
let db;
try {
  const serviceAccount = require('./firebaseServiceAccount.json');
  initializeApp({
    credential: cert(serviceAccount)
  });
  db = getFirestore();
  console.log('Firebase Admin & Firestore initialized successfully.');
} catch (error) {
  console.error('Error initializing Firebase:', error.message);
  process.exit(1);
}

// Khởi tạo kết nối Redis (Non-blocking & Graceful Fallback)
initRedis();

// Khởi tạo kết nối MinIO S3 & Tự động tạo Buckets
initMinio();

// Khởi động các Background Workers
initWorkers();

// Khởi tạo Express
const app = express();
app.use(cors());
app.use(express.json());

// Phục vụ các file trong thư mục uploads tĩnh
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount Bull-Board Dashboard để giám sát hàng đợi
app.use('/admin/queues', setupBullBoard());

// Khởi tạo Server & Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Gọi handler xử lý sự kiện Socket
require('./socket/chatHandler')(io);

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const schoolRoutes = require('./routes/schoolRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/school', schoolRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/chat', chatRoutes);

// Route kiểm tra
app.get('/', (req, res) => {
  res.send('ClassLive Backend is running with Redis Caching Layer & BullMQ Background Workers!');
});

// Error Handling Middleware (Phải nằm cuối cùng)
const globalErrorHandler = require('./middlewares/errorHandler');
app.use(globalErrorHandler);

// Chạy server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`📊 Bull-Board Queue Dashboard sẵn sàng tại: http://localhost:${PORT}/admin/queues`);
});
