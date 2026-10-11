# 🎓 ClassLive - Paperless School & Lesson Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18+-68a063?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-v5.2-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-v19-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v8-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-ffca28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Redis](https://img.shields.io/badge/Redis-Cache-dc382d?logo=redis&logoColor=white)](https://redis.io/)
[![MinIO](https://img.shields.io/badge/MinIO-S3_Storage-c72c48?logo=minio&logoColor=white)](https://min.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-Job_Queue-ff4438)](https://docs.bullmq.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-v4.8-010101?logo=socket.io&logoColor=white)](https://socket.io/)

---

## 📖 About The Project

### 💡 The Problem
In many schools, universities, and training centers, teachers and staff spend too much time and money printing **paper handouts, books, and slides** for students. Every time a lesson changes, they have to print everything again from the start.

### 🚀 What ClassLive Does
**ClassLive** helps schools replace paper with digital lessons. It connects lesson creators, schools, and teachers in one simple website:

1. **Lesson Creators / Publishers (`Tenant Admin`):** People or companies who have many lessons (PDF books, slides, videos). They upload their lessons and choose which schools can see and use them.
2. **Schools (`School Admin`):** Schools receive digital lessons from creators. Instead of printing paper books, the school creates accounts for its teachers and gives lessons to each teacher.
3. **Teachers (`Teacher`):** Teachers log in to see their assigned lessons. They can open PDFs and play videos directly on screen to teach their class, with no paper needed.
4. **Super Admin (`System Admin`):** Manages high-level accounts (Tenant Admins, School Admins, and other Super Admins). *(Note: Teachers are managed by their own school admin)*.

---

## 🌟 Key Features

- **No More Paper:** Share lessons online from creators ➔ schools ➔ teachers.
- **4 Simple Roles:** Clear jobs for Super Admin, Tenant Admin, School Admin, and Teacher.
- **Fast File Uploads:** Upload big PDFs and videos straight to cloud storage (MinIO S3) without slowing down the website.
- **Fast Cache (Redis):** Opens pages and data very quickly. If Redis is turned off, the website still works normally.
- **Background Emails (BullMQ):** Sends login codes and invite emails in the background so you never have to wait.
- **Safe 2-Step Login:** Log in with your password and a 6-digit code sent to your email (also printed in the terminal for easy local testing).
- **Built-in Lesson Viewer:** Read PDFs and watch videos right in the browser with full-screen view for class.
- **Live Chat:** Send instant messages between schools and teachers with a typing indicator.

---

## ✨ How Each Role Works

### 🔒 2-Step Login (2FA)
- **Step 1 - Name & Password:** Log in with your username or email and password.
- **Step 2 - 6-Digit Code:** Enter the 6-digit code sent to your email to finish login.
- **Email Invite:** New users get an email link to set up their own password.
- **Safe Sessions:** Secure login tokens keep your account safe.

<!-- ================================================================= -->
<!-- 📸 SCREENSHOT PLACEHOLDER 1: 2-STEP LOGIN FLOW                    -->
<!-- GIAO DIỆN CẦN CHỤP:                                               -->
<!-- 1. Màn hình Đăng nhập (/login) với Username/Email & Mật khẩu      -->
<!-- 2. Màn hình Nhập mã xác thực OTP 6 số (/otp)                      -->
<!-- ================================================================= -->
![2-Step Login & Code](screenshots/auth_flow.png)

---

### 🛡️ Super Admin (`admin`)
- **Manage Admins:** Create, view, edit, and delete accounts for **Tenant Admins**, **School Admins**, and other **Super Admins**.
- **Role Focus:** Only manages institutions and schools. Does not manage teachers (each school manages its own teachers).
- **Search & Filter:** Find users fast by role, name, or email.
- **Send Invites:** Sends an email link so new admins can set their password.

<!-- ================================================================= -->
<!-- 📸 SCREENSHOT PLACEHOLDER 2: SUPER ADMIN USER LIST                -->
<!-- GIAO DIỆN CẦN CHỤP:                                               -->
<!-- 1. Bảng danh sách người dùng toàn hệ thống (/admin)                -->
<!-- 2. Modal Thêm người dùng mới (chọn vai trò, nhập email/sđt)        -->
<!-- ================================================================= -->
![Super Admin User List](screenshots/admin_dashboard.png)

---

### 🏢 Tenant Admin (`tenant_admin` - Lesson Creator)
- **Upload Lessons:** Upload PDFs, slides, and videos directly to cloud storage.
- **Share with Schools:** Choose which schools are allowed to see and teach each lesson.
- **Dashboard:** See total lessons, partner schools, and a 6-month growth chart.
- **Live Chat:** Chat with school admins in real-time.

<!-- ================================================================= -->
<!-- 📸 SCREENSHOT PLACEHOLDER 3: TENANT ADMIN DASHBOARD & LESSONS     -->
<!-- GIAO DIỆN CẦN CHỤP:                                               -->
<!-- 1. Dashboard Tenant kèm biểu đồ thống kê 6 tháng                   -->
<!-- 2. Modal Tạo/Sửa bài giảng kèm phần tải file đính kèm Direct S3   -->
<!-- 3. Modal Phân bổ bài giảng (Assign) cho các School Admin           -->
<!-- ================================================================= -->
![Tenant Admin Dashboard & Lessons](screenshots/tenant_dashboard.png)

---

### 🏫 School Admin (`school_admin` - School Manager)
- **Manage Teachers:** Add and manage teachers in your school. Automatically sends setup emails to new teachers.
- **View Received Lessons:** See all lessons received from Tenant Admins.
- **Give Lessons to Teachers:** Choose which teacher teaches which lesson with one click.
- **School Chat:** Chat with Tenant Admins and Teachers.

<!-- ================================================================= -->
<!-- 📸 SCREENSHOT PLACEHOLDER 4: SCHOOL ADMIN DASHBOARD & TEACHERS     -->
<!-- GIAO DIỆN CẦN CHỤP:                                               -->
<!-- 1. Màn hình Quản lý Giáo viên trong trường (/school-admin)         -->
<!-- 2. Modal Phân bổ bài giảng cho giáo viên phụ trách                 -->
<!-- ================================================================= -->
![School Admin Dashboard & Teachers](screenshots/school_dashboard.png)

---

### 👨‍🏫 Teacher (`teacher`)
- **My Lessons:** See all lessons given to you by your school.
- **Built-in Reader:** Read PDF slides and watch videos right in your browser—no downloads or printouts needed.
- **Full-Screen View:** Click one button to show lessons on a projector or TV for your class.
- **Chat:** Send quick messages to your school admin whenever you need help.

<!-- ================================================================= -->
<!-- 📸 SCREENSHOT PLACEHOLDER 5: TEACHER LESSON VIEWER                -->
<!-- GIAO DIỆN CẦN CHỤP:                                               -->
<!-- 1. Danh sách kho bài giảng được cấp của Giáo viên (/teacher)       -->
<!-- 2. Giao diện xem bài giảng chi tiết (PDF Viewer / Trình chiếu file)-->
<!-- ================================================================= -->
![Teacher Workspace & Viewer](screenshots/teacher_viewer.png)

---

### 💬 Live Chat & Background Jobs
- **Live Chat:** Fast messages between users. Shows `typing...` when someone is typing.
- **Job Dashboard:** Visit `http://localhost:5000/admin/queues` to see emails and codes sent in the background.

<!-- ================================================================= -->
<!-- 📸 SCREENSHOT PLACEHOLDER 6: LIVE CHAT & JOB DASHBOARD             -->
<!-- GIAO DIỆN CẦN CHỤP:                                               -->
<!-- 1. Cửa sổ Chat Real-time giữa 2 người dùng                         -->
<!-- 2. Giao diện Bull-Board Dashboard xem hàng đợi (/admin/queues)     -->
<!-- ================================================================= -->
![Live Chat & Job Dashboard](screenshots/chat_and_queue.png)

---

## 🛠️ Tech Stack

| Tool | What It Does |
| :--- | :--- |
| **React 19 & Vite 8** | Builds fast, clean web pages. |
| **Recharts & Lucide** | Draws simple charts and clean icons. |
| **Node.js & Express 5** | Runs the backend server and APIs. |
| **Firebase Firestore** | Saves users, lessons, and messages in the cloud. |
| **Redis** | Fast memory cache so pages load quickly. |
| **BullMQ** | Sends emails in the background without making users wait. |
| **MinIO S3** | Stores big PDFs and videos in cloud storage. |
| **Socket.io** | Powers instant live chat. |
| **JWT & Bcrypt** | Protects passwords and keeps logins safe. |
| **Nodemailer & Brevo** | Sends login codes and setup emails. |

---

## 🚀 How to Run on Your Computer

Follow these simple steps to run the project locally.

### 📋 What You Need First
- **Node.js**: version 18 or higher
- **npm**: version 9 or higher
- **Docker Desktop** *(Recommended to run Redis and MinIO with 1 command)*
- **Firebase Account**: A free Firebase project

---

### 1️⃣ Start Services (Redis & MinIO S3)

Start both Redis and MinIO together using Docker:

```bash
docker compose up -d
```

*(Or start them one by one):*
```bash
# Start Redis
docker run -d --name redis-classlive -p 6379:6379 redis:alpine

# Start MinIO S3 Storage
docker run -d --name minio-classlive \
  -p 9000:9000 -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"
```

> **MinIO Website:** Open `http://localhost:9001` (User: `minioadmin` / Pass: `minioadmin`).
> **Note:** If Redis or MinIO is not running, the website still runs and reads from Firebase.

---

### 2️⃣ Firebase Setup (Step-by-Step)

ClassLive uses **Google Firebase Firestore** to save data. Follow these 4 simple steps:

1. **Create a Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/) and sign in with Google.
   - Click **Add project**, type a name (like `ClassLive`), and click **Continue**.

2. **Turn on Firestore Database:**
   - In the left menu, click **Build** ➔ **Firestore Database**.
   - Click **Create database**.
   - Choose a location near you (like `asia-southeast1` or `us-central1`).
   - Choose **Start in test mode**, then click **Enable**.

3. **Download Your Key File:**
   - Click the gear icon (**Project settings** ⚙️) in the top-left menu.
   - Click the **Service accounts** tab.
   - Click **Generate new private key**, then click **Generate key**. A `.json` file will download to your computer.

4. **Put the File into Backend:**
   - Rename the downloaded file to: **`firebaseServiceAccount.json`**
   - Put it inside the **`backend/`** folder:
     ```text
     ClassLive/
     ├── backend/
     │   ├── firebaseServiceAccount.json   <-- Put it here!
     │   ├── server.js
     │   └── ...
     ```

---

### 3️⃣ Backend Setup

1. Open your terminal and go to the backend folder:
   ```bash
   cd backend
   npm install
   ```

2. **Check the `.env` file in `backend/`:**
   ```env
   # Security
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   FRONTEND_URL=http://localhost:5173

   # Email (Brevo)
   BREVO_SMTP_HOST=smtp-relay.brevo.com
   BREVO_SMTP_PORT=587
   BREVO_SMTP_USER=your_smtp_user
   BREVO_SMTP_PASS=your_smtp_password
   BREVO_SENDER_EMAIL=your_sender_email@domain.com

   # Redis
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   REDIS_PASSWORD=

   # MinIO
   MINIO_ENDPOINT=127.0.0.1
   MINIO_PORT=9000
   MINIO_USE_SSL=false
   MINIO_ACCESS_KEY=minioadmin
   MINIO_SECRET_KEY=minioadmin
   ```

3. **Start the Backend:**
   ```bash
   npm run dev
   ```
   - Server runs at: `http://localhost:5000`
   - Job Dashboard runs at: `http://localhost:5000/admin/queues`

---

### 4️⃣ Frontend Setup

1. Open another terminal and go to the frontend folder:
   ```bash
   cd frontend
   npm install
   ```

2. **Start the Frontend:**
   ```bash
   npm run dev
   ```
   - Open your browser at: `http://localhost:5173`

---

## 🧪 Testing the Website

1. **Open the App:** Go to `http://localhost:5173` in your browser.
2. **Log In:**
   - Enter your username or email and password.
   - For quick local testing, the 6-digit code is printed directly in your **Backend Terminal** (look for `🔑 [DEV TEST OTP]`), so you can copy and enter it on the `/otp` page right away without opening your email.
3. **Test with Two Windows:**
   - Open a regular browser window for one account and an Incognito window for another account.
   - Send live chat messages to see them appear right away without refreshing the page.
4. **Check Background Jobs:**
   - Go to `http://localhost:5000/admin/queues` to see emails sent in the background.

---

## 📂 Project Folders

```text
ClassLive/
├── backend/
│   ├── config/          # Settings for Redis, MinIO, and Bull-Board
│   ├── controllers/     # Route logic for Auth, Admin, Tenant, School, Teacher, Chat
│   ├── dtos/            # Data check rules
│   ├── middlewares/     # Login token and permission checks
│   ├── models/          # Data shapes
│   ├── queues/          # BullMQ queue setup
│   ├── repositories/    # Database queries
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic and file handling
│   ├── socket/          # Live chat handlers
│   ├── workers/         # Background email workers
│   └── server.js        # Backend main file
├── frontend/
│   └── src/
│       ├── features/
│       │   ├── admin/   # Super admin pages
│       │   ├── auth/    # Login and OTP pages
│       │   ├── chat/    # Live chat window
│       │   ├── school/  # School admin pages
│       │   ├── teacher/ # Teacher lesson viewer
│       │   └── tenant/  # Tenant admin pages
│       ├── App.jsx      # Page routes
│       └── main.jsx     # Frontend entry point
├── docker-compose.yml   # Starts Redis and MinIO with 1 command
├── DATABASE.md          # Database guide
├── REDIS_GUIDE.md       # Redis caching guide
└── TECH_STACK.md        # Tech stack guide
```

---

## 📄 License
This project is built for educational and portfolio demonstration purposes. All rights reserved.
