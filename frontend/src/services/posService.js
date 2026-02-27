import api from '../config/axiosConfig';

const posService = {
  // Get all products for POS
  async getAllProducts() {
    const response = await api.get('/pos/product');
    return response.data;
  },

  // Search products by name or barcode
  async searchProducts(searchTerm) {
    const response = await api.get('/pos/product', {
      params: { search: searchTerm }
    });
    return response.data;
  },

  // Get product by barcode (for QR scanner)
  async getProductByBarcode(barcode) {
    const response = await api.get('/pos/product', {
      params: { barcode }
    });
    return response.data;
  }
};

export default posService;
