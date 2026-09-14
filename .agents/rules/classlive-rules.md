---
trigger: always_on
---

# CLASSLIVE - QUY TẮC PHÁT TRIỂN & KIẾN TRÚC HỆ THỐNG (CLEAN ARCHITECTURE)

Tài liệu này là **kim chỉ nam bắt buộc** cho toàn bộ quy trình phát triển, mở rộng tính năng và sửa lỗi (debugging) trong dự án ClassLive.

---

## 🏛️ 1. KIẾN TRÚC PHÂN TẦNG CHUẨN (LAYERED ARCHITECTURE)

Hệ thống tuân thủ nghiêm ngặt nguyên lý **Single Responsibility Principle (SRP)**. Dòng chảy dữ liệu từ ngoài vào trong:

```text
HTTP Request 
   │
   ▼
[1. Routes] ──────► Định tuyến URL, gắn Middleware (verifyToken, restrictTo)
   │
   ▼
[2. Controller] ──► Nhận Request, khởi tạo DTO, gọi dto.validate(), chuyển cho Service
   │
   ▼
[3. DTO] ─────────► Lọc trường rác (Whitelisting), kiểm tra định dạng, ném AppError(..., 400)
   │
   ▼
[4. Service] ─────► Xử lý Nghiệp vụ Logic (Business Logic), kiểm tra trùng lặp/điều kiện, ném AppError
   │
   ▼
[5. Repository] ──► Tương tác trực tiếp Firebase Firestore (NoSQL), thực hiện CRUD
   │
   ▼
[6. Model] ───────► Định nghĩa Class Blueprint, toSafeObject() loại bỏ password, toFirestore()
   │
   ▼
Response JSON ◄─── Controller trả về { success: true, data: ..., message: ... }
```

---

## 📂 2. PHÂN CHIA TRÁCH NHIỆM TỪNG THƯ MỤC & FILE

| Thư mục (`backend/`) | Trách nhiệm chính (Single Responsibility) | Những gì ĐƯỢC LÀM | Những gì TUYỆT ĐỐI CẤM |
| :--- | :--- | :--- | :--- |
| **`routes/`** | Khai báo API Endpoints, ánh xạ URL vào Controller, phân quyền Middleware. | Gắn `verifyToken`, `restrictTo('admin', ...)`. | ❌ Không viết code logic xử lý dữ liệu tại Route. |
| **`controllers/`** | Tiếp nhận HTTP Request (`req.body`, `req.params`, `req.query`), gọi DTO validate, trả về Response JSON. | Bọc 100% bằng `catchAsync`, gọi `service`, trả đúng HTTP Code (200, 201). | ❌ Không gọi trực tiếp Repository.<br>❌ Không viết `try/catch` thừa thãi.<br>❌ Không viết business logic. |
| **`dtos/`** | Người gác cổng dữ liệu (Data Transfer Object), validate dữ liệu đầu vào. | Khởi tạo thuộc tính từ `data`, ném `AppError(..., 400)`. | ❌ Không truy vấn Database.<br>❌ Không phụ thuộc vào `req` hay `res`. |
| **`services/`** | Trái tim nghiệp vụ (Business Logic), xử lý luồng tính toán, mã hóa mật khẩu, gửi email. | Gọi Repository, ném `AppError(..., statusCode)`. | ❌ Không đụng vào `req`, `res`, `next` của Express.<br>❌ Không ném `new Error()` chung chung làm sập 500. |
| **`repositories/`** | Tầng giao tiếp dữ liệu (Data Access), làm việc với Firestore SDK. | `getFirestore()`, `collection()`, `doc()`, map kết quả sang Model Instance. | ❌ Không chứa logic nghiệp vụ phân quyền.<br>❌ Không trả về `res`. |
| **`models/`** | Thực thể dữ liệu (Domain Entity), khuôn mẫu cho Firestore Document. | `toSafeObject()` (xóa password), `isExpired()`, `toFirestore()`. | ❌ Không gọi API hay gọi Database. |
| **`middlewares/`** | Bộ lọc xác thực Token JWT, kiểm tra Role phân quyền. | `verifyToken`, `restrictTo`, chuyển tiếp qua `next()`. | ❌ Không can thiệp sửa đổi dữ liệu payload của DTO. |
| **`utils/`** | Công cụ tái sử dụng: `AppError.js`, `catchAsync.js`. | Định nghĩa chuẩn Error và Async wrapper. | ❌ Không chứa code nghiệp vụ đặc thù. |

---

## 🛠️ 3. KHUÔN MẪU VIẾT TÍNH NĂNG MỚI (NEW FEATURE TEMPLATE)

Khi tạo bất kỳ chức năng mới nào, **bắt buộc tuân thủ 5 bước theo thứ tự**:

### Bước 1: Khai báo Model (nếu là Entity mới)
```javascript
// backend/models/X.js
class X {
  constructor(id, data = {}) {
    this.id = id;
    this.name = data.name || '';
    this.createdAt = data.createdAt || Date.now();
  }
  toSafeObject() {
    const { password, ...safe } = this;
    return safe;
  }
  toFirestore() { return { ...this }; }
}
```

### Bước 2: Khai báo DTO (`backend/dtos/xDto.js`)
```javascript
const AppError = require('../utils/AppError');
class CreateXDto {
  constructor(data) {
    this.name = data.name;
  }
  validate() {
    if (!this.name || typeof this.name !== 'string') {
      throw new AppError('Tên là bắt buộc.', 400);
    }
  }
}
```

### Bước 3: Viết Repository (`backend/repositories/xRepository.js`)
```javascript
const { getFirestore } = require('../config/firebase');
const X = require('../models/X');
class XRepository {
  async findById(id) {
    const doc = await getFirestore().collection('xs').doc(id).get();
    return doc.exists ? new X(doc.id, doc.data()) : null;
  }
}
```

### Bước 4: Viết Service (`backend/services/xService.js`)
```javascript
const xRepository = require('../repositories/xRepository');
const AppError = require('../utils/AppError');
class XService {
  async getDetail(id) {
    const item = await xRepository.findById(id);
    if (!item) throw new AppError('Không tìm thấy bản ghi.', 404);
    return item.toSafeObject();
  }
}
```

### Bước 5: Viết Controller & Route (`backend/controllers/xController.js` & `backend/routes/xRoutes.js`)
```javascript
// Controller:
const xService = require('../services/xService');
const catchAsync = require('../utils/catchAsync');
class XController {
  getDetail = catchAsync(async (req, res) => {
    const result = await xService.getDetail(req.params.id);
    res.status(200).json({ success: true, data: result });
  });
}
// Route:
router.get('/:id', verifyToken, xController.getDetail);
```

---

## 🔍 4. MA TRẬN ĐỊNH VỊ VÀ SỬA LỖI (DEBUGGING GUIDE)

Khi hệ thống phát sinh lỗi hoặc bug, tra cứu bảng sau để **sửa đúng file - đúng tầng**:

| Triệu chứng / Loại lỗi | Tầng phát sinh lỗi | File cần sửa | Cách khắc phục chuẩn |
| :--- | :--- | :--- | :--- |
| Client gửi thiếu trường, sai định dạng mà server không báo lỗi 400 | **DTO** | `backend/dtos/*Dto.js` | Bổ sung hàm `validate()` và ném `throw new AppError(message, 400)`. |
| Server trả về mã `500 Internal Server Error` không rõ nguyên nhân | **Service** | `backend/services/*Service.js` | Thay `throw new Error(...)` bằng `throw new AppError(..., 400/404/403)`. |
| Sai logic kiểm tra quyền, tính toán số liệu sai, không gửi email | **Service** | `backend/services/*Service.js` | Sửa logic nghiệp vụ trong Service. |
| Query DB không ra kết quả, lỗi cấu trúc Firestore Document | **Repository** | `backend/repositories/*Repo.js`| Sửa câu lệnh query Firestore, kiểm tra lại tên collection và field. |
| Lỗi rò rỉ mật khẩu `password` ra ngoài JSON Client | **Model / Service** | `backend/models/*.js` | Sử dụng phương thức `toSafeObject()` trước khi trả response. |
| Token hết hạn hoặc User bị chặn không truy cập được Route | **Middleware** | `backend/middlewares/authMiddleware.js` | Kiểm tra lại logic giải mã JWT hoặc phân quyền `restrictTo`. |
| Lỗi giao diện, không hiển thị Toast báo lỗi từ server | **Frontend** | `frontend/src/features/*` | Đảm bảo `catch (error)` gọi `toast.error(error.response?.data?.error || '...')`. |

---

## ⛔ 5. NHỮNG ĐIỀU TUYỆT ĐỐI CẤM (AI & DEVELOPER MUST NOT)
1. ❌ **KHÔNG** bypass Service để Controller gọi thẳng Repository.
2. ❌ **KHÔNG** viết logic truy vấn Firestore trong Controller hay Service.
3. ❌ **KHÔNG** dùng `res.status(500)` thủ công, luôn dùng `AppError` và `catchAsync`.
4. ❌ **KHÔNG** hardcode `JWT_SECRET`, password hay credentials trong code.
5. ❌ **KHÔNG** tự ý đổi Framework (Express) hay Database (Firestore).

---

## 6. Clean Code Rules
- **Single Responsibility**: Controller xử lý HTTP, Service xử lý logic, Repo xử lý Data.
- **KISS & DRY**: Tái sử dụng Repo và Service. Tránh code lặp lại.
- **Tái sử dụng class error**: Luôn dùng `AppError(message, statusCode)`.

## 7. API & DTO Rules
- **Endpoint**: Chuẩn REST, dùng danh từ số nhiều (`/api/lessons`, `/api/auth`).
- **Response Format**: Thành công trả về `{ success: true, data: ... }` hoặc JSON Object trực tiếp. Thất bại trả về `{ success: false, error: "message" }`.
- **DTO**: Phải khai báo `class` trong folder `dtos`, nhận `data` vào constructor, có hàm `validate()`. DTO kiểm tra đầu vào, ném lỗi ra ngoài cho Controller hứng.

## 8. Database Rules
- **Tech**: Firebase Firestore. NoSQL Document Database.
- **Tương tác**: KHÔNG DÙNG ORM. Dùng Firebase Admin SDK (`getFirestore()`).
- **Collections hiện có**: `users`, `lessons`, `messages`, `otps`.
- **Primary Key**: Tự động sinh bởi Firestore (ID).
- **Quy tắc thay đổi DB**: Cập nhật hàm trong `Repository`, không tác động thẳng từ Service.

## 9. Error Handling Rules
- Tất cả route được bọc bằng `catchAsync`.
- Dùng class `AppError` để ném lỗi có chủ đích (Operational Error).
- Tránh dùng `res.status(500)` rải rác, hãy `throw new AppError("Message", statusCode)`. Global Middleware `errorHandler.js` sẽ tự động hứng và trả về đúng format.

## 10. Authentication / Authorization Rules
- Authentication sử dụng **JWT (JSON Web Tokens)**.
- Passwords được băm bằng `bcrypt`.
- Middleware `protect` kiểm tra token trong header `Authorization: Bearer <token>`.
- Middleware `restrictTo('instructor', 'student')` kiểm tra phân quyền. 
- Phải gắn token vào Axios Interceptor phía Frontend.

## 11. Debugging Workflow
- Tái hiện lỗi trên IDE/Browser.
- Mở Terminal/Console theo dõi log.
- Lần ngược từ Controller -> DTO -> Service -> Repo.
- Khắc phục lỗi tại đúng layer sinh ra nó (ví dụ: lỗi lưu sai định dạng data thì sửa ở Repo, lỗi logic kinh doanh sửa ở Service).

## 12. Refactoring Rules
- Phân biệt rõ Bug Fix (sửa lỗi nhỏ) và Structural Refactor.
- Chỉ Refactor khi có lý do chính đáng và KHÔNG làm thay đổi hành vi hiện tại (Behavior).
- Không được phép thay đổi kiến trúc (Architecture Change) trừ khi có sự xác nhận của người dùng.

## 13. Dependency / Impact Analysis
Trước khi sửa 1 logic, hãy:
- Grep (Tìm kiếm) file sử dụng hàm đó.
- Đánh giá: Sửa hàm `findAll` trong Repo có làm chết API `getDashboardStats` không? 
- Chỉ sửa khi chắc chắn 100% Impact.

## 14. Change Decision Matrix
| Vấn đề gặp phải | Layer ưu tiên sửa | Layer thứ cấp (Secondary) |
| --- | --- | --- |
| Lỗi dữ liệu đầu vào | DTO | Controller |
| Sai logic tính toán/nghiệp vụ | Service | DTO |
| Câu lệnh query NoSQL sai | Repository | Firestore Console |
| Lỗi hiển thị UI, báo lỗi trên Form | Frontend Component | Frontend API Client |
| Xác thực / Phân quyền | Middleware | Controller |

## 15. AI Working Protocol
**Before Coding - AI MUST:**
- Đọc kỹ `SKILL.md` này.
- Xác định layer, file và luồng dependency.
- Quyết định thay đổi tối thiểu.

**While Coding - AI MUST:**
- Tuân thủ DTO/Controller/Service/Repo boundaries.
- Không tự ý đẻ file nếu có thể tái sử dụng.
- Không lặp code.

**After Coding - AI MUST:**
- Kiểm tra tính tương thích.
- Báo cáo rõ ràng: Sửa file nào, ở đâu, tại sao.

## 16. AI MUST NOT
- KHÔNG tự ý đổi framework (VD: Đề xuất chuyển từ Express sang NestJS).
- KHÔNG tự ý chuyển từ NoSQL (Firestore) sang SQL (PostgreSQL).
- KHÔNG bypass Service để Controller chọc thẳng vào Repository.
- KHÔNG để Business Logic hay Query Logic vào Controller.
- KHÔNG sửa các file/tính năng không liên quan đến Task.
- KHÔNG hard-code Mật khẩu hay JWT_SECRET trong code.
- KHÔNG tạo DTO trùng lặp chức năng.

## 17. Project-Specific Knowledge
- **Lưu trữ file**: File tải lên hiện được lưu tại `backend/uploads/` bằng `multer`. Frontend đọc qua route static.
- **Quy trình Add User**: Instructor add User mới KHÔNG truyền password và username. User sẽ tự thiết lập qua link gửi tới email (xem `SetupAccountPage.jsx`). Không được mở lại trường username cho Instructor nhập.
- **Login Flow**: Nhập Username/Pass -> Nhận UserID/MaskedPhone -> Gửi OTP -> Xác thực OTP -> Cấp JWT Token. Đây là Multi-step Login. Đừng đập đi luồng OTP.

## 18. AI Quick Reference (Checklist)
- [ ] Read `SKILL.md`
- [ ] Identify module & layer
- [ ] Read affected files & trace dependencies
- [ ] Determine minimum changes
- [ ] Follow Boundaries (Controller/Service/Repo)
- [ ] Write Code
- [ ] Report changes & side effects
