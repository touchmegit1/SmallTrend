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
    async getAssignment(id) {
        const res = await api.get(`/shifts/assignments/${id}`);
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
    async getAttendance(params = {}) {
        const res = await api.get('/shifts/attendance', { params });
        return res.data;
    },
    async upsertAttendance(payload) {
        const res = await api.post('/shifts/attendance', payload);
        return res.data;
    },
    async getPayrollSummary(params = {}) {
        const res = await api.get('/shifts/payroll/summary', { params });
        return res.data;
    },
    async clockIn(payload) {
        // Clock in automatically when user logs in
        const res = await api.post('/shifts/clock-in', {
            userId: payload.userId,
            clockInTime: payload.clockInTime,
            location: payload.location || 'Office'
        });
        return res.data;
    },
    async clockOut(payload) {
        const res = await api.post('/shifts/clock-out', {
            userId: payload.userId,
            clockOutTime: payload.clockOutTime,
            location: payload.location || 'Office'
        });
        return res.data;
    },
    async executeSwap(payload) {
        const res = await api.post('/shifts/swap/execute', payload);
        return res.data;
    },
};
