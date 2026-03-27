import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Xử lý isAuthEndpoint.
const isAuthEndpoint = (url = '') => {
    return url.includes('/auth/login')
        || url.includes('/auth/logout')
        || url.includes('/auth/validate')
        || url.includes('/auth/me');
};

// Xử lý clearAndRedirect.
const clearAndRedirect = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

// Interceptor request - thêm JWT token vào mọi request.
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

// Interceptor response - xử lý lỗi xác thực.
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const requestUrl = error.config?.url || '';
        const status = error.response?.status;

        // 401: token is definitively invalid/expired - clear immediately
        if (status === 401 && !isAuthEndpoint(requestUrl)) {
            clearAndRedirect();
            return Promise.reject(error);
        }

        // 403: could be expired token (backend returned 403 before fix was applied)
        // OR could be a legitimate permission error for a logged-in user.
        // Validate the token first to distinguish the two cases.
        if (status === 403 && !isAuthEndpoint(requestUrl)) {
            const token = localStorage.getItem('token');
            if (!token) {
                // No token at all - redirect to login
                clearAndRedirect();
                return Promise.reject(error);
            }
            try {
                // Quick validation call - if this fails, token is bad
                await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api'}/auth/validate`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                // Token is valid - this is a genuine permission error (user lacks role)
                // Do NOT redirect; let the component handle the 403 gracefully
            } catch {
                // Token is invalid or expired - clear and redirect
                clearAndRedirect();
            }
        }

        return Promise.reject(error);
    }
);

export default api;
