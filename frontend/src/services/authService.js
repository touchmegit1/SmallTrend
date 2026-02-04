import api from '../config/axiosConfig';

const login = async (username, password) => {
    try {
        const response = await api.post('/auth/login', { username, password });
        if (response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

const logout = async () => {
    try {
        await api.post('/auth/logout');
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
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

const authService = {
    login,
    logout,
    getCurrentUser,
    getToken,
    validateToken
};

export default authService;

