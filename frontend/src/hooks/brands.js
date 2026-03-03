import { useState, useEffect } from 'react';
import api from '../config/axiosConfig';

export function useFetchBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await api.get('/brands');
      const data = Array.isArray(response.data) ? response.data : [];
      setBrands(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching brands:', err);
      setBrands([]);
      setError(err.message || 'Lỗi khi tải thương hiệu');
    } finally {
      setLoading(false);
    }
  };

  const createBrand = async (data) => {
    const response = await api.post('/brands', data);
    await fetchBrands();
    return response.data;
  };

  const updateBrand = async (id, data) => {
    const response = await api.put(`/brands/${id}`, data);
    await fetchBrands();
    return response.data;
  };

  const deleteBrand = async (id) => {
    await api.delete(`/brands/${id}`);
    await fetchBrands();
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return { brands, loading, error, fetchBrands, createBrand, updateBrand, deleteBrand };
}
