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

    // Tra cứu người dùng theo mã vai trò.
    getUsersByRole: async (roleId) => {
        const response = await api.get(`/crm/tickets/lookup/users-by-role/${roleId}`);
        return response.data;
    },

    // Tra cứu biến thể sản phẩm theo SKU.
    getVariantBySku: async (sku) => {
        const response = await api.get('/crm/tickets/lookup/variant-by-sku', { params: { sku } });
        return response.data;
    },

    // Tra cứu biến thể sản phẩm theo SKU hoặc tên.
    searchVariants: async (keyword) => {
        const response = await api.get('/crm/tickets/lookup/search-variants', { params: { keyword } });
        return response.data;
    },
};

export default ticketService;
