import api from '../config/axiosConfig';

const posService = {
  // Get all products for POS
  async getAllProducts() {
    const response = await api.get('/products/variants');
    return response.data;
  },

  // Search products by name or barcode
  async searchProducts(searchTerm) {
    const response = await api.get('/products/variants', {
      params: { search: searchTerm }
    });
    return response.data;
  },

  // Get product by barcode (for QR scanner)
  async getProductByBarcode(barcode) {
    const response = await api.get('/products/variants', {
      params: { barcode }
    });
    return response.data;
  }
};

export default posService;
