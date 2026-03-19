import api from '../config/axiosConfig';

const toIsoDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const withAssignmentDateRange = (params = {}) => {
    if (params.startDate && params.endDate) {
        return params;
    }

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
        ...params,
        startDate: params.startDate || toIsoDate(startDate),
        endDate: params.endDate || toIsoDate(endDate),
    };
};

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
        const res = await api.get('/shifts/assignments', { params: withAssignmentDateRange(params) });
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
    async markPayrollPaid(params = {}) {
        const res = await api.post('/shifts/payroll/mark-paid', null, { params });
        return res.data;
    },
    async getWorkforceDashboard(params = {}) {
        const res = await api.get('/shifts/workforce/dashboard', { params });
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
