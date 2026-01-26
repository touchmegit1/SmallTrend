import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Tự động gắn token vào mọi request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Xử lý token hết hạn và auto refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Nếu token hết hạn (401) và chưa retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');

                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                // Gọi API refresh token
                const { data } = await axios.post('http://localhost:8088/api/auth/refresh', {
                    refreshToken
                });

                // Lưu access token mới
                localStorage.setItem('token', data.token);

                // Retry request ban đầu với token mới
                originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
                return api(originalRequest);

            } catch (refreshError) {
                // Refresh token thất bại -> logout
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
