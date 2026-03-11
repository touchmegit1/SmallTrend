import api from '../config/axiosConfig';

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
        const response = await api.post('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.url;
    } catch (error) {
        console.error('Lỗi upload ảnh:', error);
        throw error;
    }
};
