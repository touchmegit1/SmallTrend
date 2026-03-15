import api from '../config/axiosConfig';

const adService = {
    /** Lấy toàn bộ ads (admin) */
    getAll: async () => {
        const res = await api.get('/crm/ads');
        return res.data;
    },

    /** Lấy 2 ads đang active để hiển thị trang chủ */
    getActive: async () => {
        const res = await api.get('/crm/ads/active');
        return res.data; // { LEFT: {...}, RIGHT: {...} }
    },

    /** Báo cáo thống kê hợp đồng */
    getStats: async () => {
        const res = await api.get('/crm/ads/stats');
        return res.data;
    },

    /** Tạo quảng cáo mới */
    create: async (data) => {
        const res = await api.post('/crm/ads', data);
        return res.data;
    },

    /** Cập nhật quảng cáo */
    update: async (id, data) => {
        const res = await api.put(`/crm/ads/${id}`, data);
        return res.data;
    },

    /** Bật / tắt hiển thị */
    toggle: async (id) => {
        const res = await api.patch(`/crm/ads/${id}/toggle`);
        return res.data;
    },

    /** Xoá */
    delete: async (id) => {
        await api.delete(`/crm/ads/${id}`);
    },
};

export default adService;
