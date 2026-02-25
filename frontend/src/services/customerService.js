import api from '../config/axiosConfig';

const customerService = {
  // Get all customers
  async getAllCustomers() {
    const response = await api.get('/crm/customers');
    return response.data;
  },

  // Search customer by phone
  async searchByPhone(phone) {
    const response = await api.get('/crm/customers', {
      params: { phone }
    });
    return response.data;
  }
};

export default customerService;
