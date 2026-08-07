require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const http = require('http');
const { Server } = require('socket.io');

// Khởi tạo Firebase Admin (Tương thích với phiên bản mới firebase-admin v14+)
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
  process.exit(1); // Dừng server nếu không kết nối được database
}

// Khởi tạo Express
const app = express();
app.use(cors());
app.use(express.json());

// Khởi tạo Server & Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Routes
const authRoutes = require('./routes/authRoutes');
const instructorRoutes = require('./routes/instructorRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/instructor', instructorRoutes);

// Route kiểm tra
app.get('/', (req, res) => {
  res.send('ClassLive Backend is running!');
});

// Error Handling Middleware (Phải nằm cuối cùng)
const globalErrorHandler = require('./middlewares/errorHandler');
app.use(globalErrorHandler);

// Chạy server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
