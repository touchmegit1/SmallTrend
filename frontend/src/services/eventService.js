import api from '../config/axiosConfig';

const eventService = {
    // ======= CAMPAIGNS =======
    getAllCampaigns: async () => {
        const response = await api.get('/crm/campaigns');
        return response.data;
    },

    getActiveCampaigns: async () => {
        const response = await api.get('/crm/campaigns/active');
        return response.data;
    },

    createCampaign: async (data) => {
        const response = await api.post('/crm/campaigns', data);
        return response.data;
    },

    updateCampaign: async (id, data) => {
        const response = await api.put(`/crm/campaigns/${id}`, data);
        return response.data;
    },

    deleteCampaign: async (id) => {
        const response = await api.delete(`/crm/campaigns/${id}`);
        return response.data;
    },

    // ======= COUPONS =======
    getAllCoupons: async () => {
        const response = await api.get('/crm/coupons');
        return response.data;
    },

    createCoupon: async (data) => {
        const response = await api.post('/crm/coupons', data);
        return response.data;
    },

    updateCoupon: async (id, data) => {
        const response = await api.put(`/crm/coupons/${id}`, data);
        return response.data;
    },

    deleteCoupon: async (id) => {
        const response = await api.delete(`/crm/coupons/${id}`);
        return response.data;
    },

    // ======= PRODUCT VARIANTS =======
    getAllVariants: async () => {
        const response = await api.get('/pos/product');
        return response.data;
    },
};

export default eventService;
