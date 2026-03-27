import { useState, useEffect } from 'react';
import api from '../config/axiosConfig';

/**
 * Hook quản lý danh sách thương hiệu và các thao tác CRUD cơ bản.
 */
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
      console.error('[Brands Hook] Error fetching brands:', err);
      console.error('[Brands Hook] Error status:', err?.response?.status);
      console.error('[Brands Hook] Error data:', err?.response?.data);
      setBrands([]);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        setError('Phiên đăng nhập hết hạn. Vui lòng đăng xuất và đăng nhập lại.');
      } else {
        setError(err.message || 'Lỗi khi tải thương hiệu');
      }
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
