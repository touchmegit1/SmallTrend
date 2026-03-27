import api from '../config/axiosConfig';

const customerTierService = {
    getAllTiers: async () => {
        const response = await api.get('/crm/tiers');
        return response.data;
    },

    updateTier: async (id, payload) => {
        const response = await api.put(`/crm/tiers/${id}`, payload);
        return response.data;
    },
};

export default customerTierService;
