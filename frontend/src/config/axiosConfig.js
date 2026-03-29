import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD
    ? '/api'
    : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api');

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Xử lý isAuthEndpoint.
const isAuthEndpoint = (url = '') => {
    return url.includes('/auth/login')
        || url.includes('/auth/logout')
        || url.includes('/auth/refresh')
        || url.includes('/auth/validate')
        || url.includes('/auth/me');
};

// Xử lý clearAndRedirect.
const clearAndRedirect = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
};

let isRefreshing = false;
let pendingRequests = [];

const queuePendingRequest = (resolve, reject) => {
    pendingRequests.push({ resolve, reject });
};

const flushPendingRequests = (error, token = null) => {
    pendingRequests.forEach((item) => {
        if (error) {
            item.reject(error);
            return;
        }
        item.resolve(token);
    });
    pendingRequests = [];
};

const refreshAccessToken = async () => {
    let storedUser = {};
    try {
        storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
        storedUser = {};
    }

    const refreshToken = localStorage.getItem('refreshToken')
        || storedUser?.refreshToken;

    if (!refreshToken) {
        throw new Error('Missing refresh token');
    }

    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken }, {
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const authPayload = response?.data || {};
    const nextToken = authPayload.token;
    if (!nextToken) {
        throw new Error('Refresh response missing access token');
    }

    const currentUser = storedUser;
    const mergedUser = {
        ...currentUser,
        ...authPayload,
    };

    localStorage.setItem('token', nextToken);
    if (authPayload.refreshToken) {
        localStorage.setItem('refreshToken', authPayload.refreshToken);
        mergedUser.refreshToken = authPayload.refreshToken;
    }
    localStorage.setItem('user', JSON.stringify(mergedUser));

    return nextToken;
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
        const originalRequest = error.config || {};
        const requestUrl = originalRequest.url || '';
        const status = error.response?.status;

        if (status === 401 && !isAuthEndpoint(requestUrl)) {
            if (originalRequest._retry) {
                clearAndRedirect();
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    queuePendingRequest(resolve, reject);
                }).then((token) => {
                    originalRequest.headers = {
                        ...(originalRequest.headers || {}),
                        Authorization: `Bearer ${token}`,
                    };
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const newToken = await refreshAccessToken();
                flushPendingRequests(null, newToken);

                originalRequest.headers = {
                    ...(originalRequest.headers || {}),
                    Authorization: `Bearer ${newToken}`,
                };

                return api(originalRequest);
            } catch (refreshError) {
                flushPendingRequests(refreshError, null);
                clearAndRedirect();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
