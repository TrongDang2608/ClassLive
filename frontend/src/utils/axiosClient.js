import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Gắn Access Token vào header
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Danh sách các public route không xử lý auto-refresh / redirect khi 401
const PUBLIC_AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/validateAccessCode',
  '/auth/setup-account',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/refresh'
];

// Response Interceptor: Xử lý 401 và tự động gọi Refresh Token cho các API protected
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';

    // Bỏ qua các API xác thực public (Login, OTP, Reset Password) -> để catch(err) ở UI tự xử lý
    const isPublicAuthRoute = PUBLIC_AUTH_ENDPOINTS.some(endpoint => requestUrl.includes(endpoint));

    // Nếu lỗi 401 trên các API protected (cần Access Token)
    if (error.response?.status === 401 && !originalRequest._retry && !isPublicAuthRoute) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axiosClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // Không có refresh token -> xóa dữ liệu cũ
        localStorage.clear();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        // Gọi API lấy Access Token mới
        const { data } = await axios.post('http://localhost:5000/api/auth/refresh', {
          refreshToken: refreshToken
        });

        const newToken = data.token;
        localStorage.setItem('token', newToken);

        axiosClient.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
        originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
        
        processQueue(null, newToken);
        return axiosClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        // Refresh token cũng lỗi/hết hạn -> xóa sạch và chuyển hướng đăng nhập
        localStorage.clear();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
