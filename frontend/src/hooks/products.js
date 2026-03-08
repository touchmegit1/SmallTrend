import { useState, useEffect } from 'react';
import api from '../config/axiosConfig';

export function useFetchProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');

      const data = Array.isArray(response.data) ? response.data : [];
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
      setError(err.message || 'Lỗi khi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      // fetchProducts(); (Optional - handle after delete inside the component or here)
      return true;
    } catch (err) {
      console.error('Error deleting product:', err);
      // Backend có thể ném Exception "Sản phẩm đã tạo quá 2 phút", lấy message từ đây
      const errorMsg = err.response?.data?.message || err.response?.data || err.message || 'Lỗi khi xóa sản phẩm';
      throw new Error(errorMsg);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, fetchProducts, deleteProduct };
}
