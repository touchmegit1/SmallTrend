import api from '../config/axiosConfig';

const cloudinaryUploadService = {
  uploadImage: async (file, folder = 'crm') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },
};

export default cloudinaryUploadService;
