import api from '../config/axiosConfig';

const ticketService = {
    getAllTickets: async () => {
        const response = await api.get('/crm/tickets');
        return response.data;
    },

    getTicketById: async (id) => {
        const response = await api.get(`/crm/tickets/${id}`);
        return response.data;
    },

    createTicket: async (data) => {
        const response = await api.post('/crm/tickets', data);
        return response.data;
    },

    updateTicket: async (id, data) => {
        const response = await api.put(`/crm/tickets/${id}`, data);
        return response.data;
    },

    deleteTicket: async (id) => {
        const response = await api.delete(`/crm/tickets/${id}`);
        return response.data;
    },

    // Lookup: users by role ID
    getUsersByRole: async (roleId) => {
        const response = await api.get(`/crm/tickets/lookup/users-by-role/${roleId}`);
        return response.data;
    },

    // Lookup: product variant by SKU
    getVariantBySku: async (sku) => {
        const response = await api.get('/crm/tickets/lookup/variant-by-sku', { params: { sku } });
        return response.data;
    },
};

export default ticketService;
