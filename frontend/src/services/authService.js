import api from '../config/axiosConfig';

const clearAuthData = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
};

const login = async (username, password) => {
    try {
        const response = await api.post('/auth/login', { username, password });
        if (response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
            localStorage.setItem('token', response.data.token);
        }
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
        if (response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
            localStorage.setItem('token', response.data.token);
        }
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
        const response = await api.post('/auth/forgot-password/request-otp', { email });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message
            || error.response?.data?.error
            || error.message
            || 'Không thể gửi OTP';
        throw new Error(errorMessage);
    }
};

const resetPasswordWithOtp = async ({ email, otp, newPassword, confirmPassword }) => {
    try {
        const response = await api.post('/auth/forgot-password/reset', {
            email,
            otp,
            newPassword,
            confirmPassword,
        });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message
            || error.response?.data?.error
            || error.message
            || 'Không thể đặt lại mật khẩu';
        throw new Error(errorMessage);
    }
};

const updateStoredUser = (updates = {}) => {
    const currentUser = getCurrentUser() || {};
    const sanitizedUpdates = Object.fromEntries(
        Object.entries(updates).filter(([, value]) => value !== undefined && value !== null && value !== '')
    );
    const nextUser = { ...currentUser, ...sanitizedUpdates };
    localStorage.setItem('user', JSON.stringify(nextUser));
    return nextUser;
};

const authService = {
    login,
    register,
    logout,
    clearAuthData,
    getCurrentUser,
    getToken,
    validateToken,
    getMe,
    updateStoredUser,
    requestPasswordOtp,
    resetPasswordWithOtp
};

export default authService;

