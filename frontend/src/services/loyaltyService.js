import api from '../config/axiosConfig';

const loyaltyService = {
    // Look up customer by phone
    getCustomerByPhone: async (phone) => {
        const response = await api.get(`/crm/customers/phone/${phone}`);
        return response.data;
    },

    // Get all active loyalty gifts
    getAllGifts: async () => {
        const response = await api.get('/crm/loyalty-gifts');
        return response.data;
    },

    // Add a new gift to the store
    createGift: async (data) => {
        const response = await api.post('/crm/loyalty-gifts', data);
        return response.data;
    },

    // Remove a gift from the store
    deleteGift: async (id) => {
        const response = await api.delete(`/crm/loyalty-gifts/${id}`);
        return response.data;
    },

    // Redeem a gift for a customer
    redeemGift: async (customerId, giftId) => {
        const response = await api.post('/crm/loyalty-gifts/redeem', {
            customerId,
            giftId
        });
        return response.data;
    }
};

export default loyaltyService;
