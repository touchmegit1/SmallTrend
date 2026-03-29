import api from '../config/axiosConfig';

const clearAuthData = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
};

const persistAuthData = (payload) => {
    if (!payload) return;

    const currentUser = getCurrentUser() || {};
    const nextUser = {
        ...currentUser,
        ...payload,
    };

    if (payload.token) {
        localStorage.setItem('token', payload.token);
    }

    const refreshToken = payload.refreshToken || nextUser.refreshToken;
    if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
        nextUser.refreshToken = refreshToken;
    }

    localStorage.setItem('user', JSON.stringify(nextUser));
};

const login = async (username, password) => {
    try {
        const response = await api.post('/auth/login', { username, password });
        persistAuthData(response.data);
        return response.data;
    } catch (error) {
        // Extract error message from backend response
        const errorMessage = error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            'Đăng nhập thất bại';
        throw new Error(errorMessage);
    }
};

const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        persistAuthData(response.data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

const logout = async (callApi = true) => {
    try {
        if (callApi) {
            await api.post('/auth/logout');
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        clearAuthData();
    }
};

const getCurrentUser = () => {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        return null;
    }
};

const getToken = () => {
    return localStorage.getItem('token');
};

const getRefreshToken = () => {
    const directRefreshToken = localStorage.getItem('refreshToken');
    if (directRefreshToken) {
        return directRefreshToken;
    }

    const user = getCurrentUser();
    return user?.refreshToken || null;
};

const saveAuthSession = (authPayload = {}) => {
    persistAuthData(authPayload);
    return getCurrentUser();
};

const validateToken = async () => {
    try {
        await api.get('/auth/validate');
        return true;
    } catch (error) {
        return false;
    }
};

const getMe = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

const requestPasswordOtp = async (email) => {
    try {
        const response = await api.post('/auth/forgot-password/otp', { email });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message
            || error.response?.data?.error
            || error.message
            || 'Khong the gui OTP';
        throw new Error(errorMessage);
    }
};

const resetPasswordWithOtp = async (payload) => {
    try {
        const response = await api.post('/auth/forgot-password/reset', payload);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message
            || error.response?.data?.error
            || error.message
            || 'Khong the dat lai mat khau';
        throw new Error(errorMessage);
    }
};

const updateStoredUser = (updates = {}) => {
    const currentUser = getCurrentUser() || {};
    const nextUser = { ...currentUser, ...updates };
    localStorage.setItem('user', JSON.stringify(nextUser));
    return nextUser;
};

const authService = {
    login,
    register,
    logout,
    clearAuthData,
    saveAuthSession,
    getCurrentUser,
    getToken,
    getRefreshToken,
    validateToken,
    getMe,
    updateStoredUser,
    requestPasswordOtp,
    resetPasswordWithOtp
};

export default authService;

