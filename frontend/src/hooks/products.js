import { useState, useEffect } from 'react';
import api from '../config/axiosConfig';

export const useFetchProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/product/products');
      const data = Array.isArray(response.data) ? response.data : (response.data?.content || []);
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách sản phẩm');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, setProducts, loading, error, fetchProducts };
};
