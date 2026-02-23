import api from '../config/axiosConfig';

export const shiftService = {
    async getShifts(params = {}) {
        const res = await api.get('/shifts', { params });
        return res.data;
    },
    async getShift(id) {
        const res = await api.get(`/shifts/${id}`);
        return res.data;
    },
    async createShift(payload) {
        const res = await api.post('/shifts', payload);
        return res.data;
    },
    async updateShift(id, payload) {
        const res = await api.put(`/shifts/${id}`, payload);
        return res.data;
    },
    async deleteShift(id) {
        const res = await api.delete(`/shifts/${id}`);
        return res.data;
    },
    async getAssignments(params = {}) {
        const res = await api.get('/shifts/assignments', { params });
        return res.data;
    },
    async createAssignment(payload) {
        const res = await api.post('/shifts/assignments', payload);
        return res.data;
    },
    async updateAssignment(id, payload) {
        const res = await api.put(`/shifts/assignments/${id}`, payload);
        return res.data;
    },
    async deleteAssignment(id) {
        const res = await api.delete(`/shifts/assignments/${id}`);
        return res.data;
    },
};
