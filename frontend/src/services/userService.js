import api from '../config/axiosConfig';

const normalizePagination = (params = {}) => {
  const next = { ...params };
  if (next.size !== undefined && next.size !== null) {
    const parsedSize = Number(next.size);
    if (Number.isFinite(parsedSize)) {
      next.size = Math.min(100, Math.max(1, parsedSize));
    }
  }
  if (next.page !== undefined && next.page !== null) {
    const parsedPage = Number(next.page);
    if (Number.isFinite(parsedPage)) {
      next.page = Math.max(0, parsedPage);
    }
  }
  return next;
};

export const userService = {
  async getAll(params = {}) {
    const res = await api.get('/users', { params: normalizePagination(params) });
    return res.data;
  },
  async create(payload) {
    const res = await api.post('/users', payload);
    return res.data;
  },
  async getById(id) {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },
  async update(id, payload) {
    const res = await api.put(`/users/${id}`, payload);
    return res.data;
  },
  async updateStatus(id, status) {
    const res = await api.patch(`/users/${id}/status`, { status });
    return res.data;
  },
  async remove(id) {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
  async getMyProfile() {
    const res = await api.get('/users/me');
    return res.data;
  },
  async changeMyPassword(payload) {
    const res = await api.patch('/users/me/password', payload);
    return res.data;
  },
  async uploadAvatar(userId, file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/users/${userId}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  async uploadMyAvatar(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
