import api from '../config/axiosConfig';

const login = async (username, password) => {
    try {
        const response = await api.post('/api/auth/login', { username, password });
        if (response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
            localStorage.setItem('token', response.data.token);
            // Lưu refresh token
            if (response.data.refreshToken) {
                localStorage.setItem('refreshToken', response.data.refreshToken);
            }
        }
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

const logout = async () => {
    try {
        // Gọi API logout để revoke token trên server
        await api.post('/api/auth/logout');
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Xóa toàn bộ dữ liệu local
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
    }
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

const authService = {
    login,
    logout,
    getCurrentUser,
};

export default authService;
