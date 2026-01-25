import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để thêm token vào header của mọi request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`; // Đảm bảo đúng format Bearer
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
