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

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, fetchProducts };
}
