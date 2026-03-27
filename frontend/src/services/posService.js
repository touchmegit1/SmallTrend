import api from '../config/axiosConfig';

const posService = {
  // Lấy tất cả sản phẩm cho POS.
  async getAllProducts() {
    const response = await api.get('/products/variants');
    return response.data;
  },

  // Tìm sản phẩm theo tên hoặc mã vạch.
  async searchProducts(searchTerm) {
    const response = await api.get('/products/variants', {
      params: { search: searchTerm }
    });
    return response.data;
  },

  // Lấy sản phẩm theo mã vạch (cho máy quét QR).
  async getProductByBarcode(barcode) {
    const response = await api.get('/products/variants', {
      params: { barcode }
    });
    return response.data;
  }
};

export default posService;
