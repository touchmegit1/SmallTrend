import api from '../config/axiosConfig';

export const userService = {
  async getAll() {
    const res = await api.get('/users');
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
};
