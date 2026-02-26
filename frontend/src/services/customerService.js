import api from '../config/axiosConfig';

const customerService = {
  getAllCustomers: async () => {
    const response = await api.get('/crm/customers');
    return response.data;
  },

  getCustomerById: async (id) => {
    const response = await api.get(`/crm/customers/${id}`);
    return response.data;
  },

  createCustomer: async (name, phone) => {
    const response = await api.post('/crm/customers', { name, phone });
    return response.data;
  },

  updateCustomer: async (id, name, phone) => {
    const response = await api.put(`/crm/customers/${id}`, {
      name,
      phone,
    });
    return response.data;
  },

  deleteCustomer: async (id) => {
    const response = await api.delete(`/crm/customers/${id}`);
    return response.data;
  },
};

export default customerService;
