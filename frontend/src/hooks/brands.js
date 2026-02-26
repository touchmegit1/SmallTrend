import { useState, useEffect } from 'react';
import api from '../config/axiosConfig';

export const useFetchBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await api.get('product/brands');
      const data = Array.isArray(response.data) ? response.data : (response.data?.content || []);
      setBrands(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải thương hiệu');
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const createBrand = async (data) => {
    const response = await api.post('product/brands', data);
    setBrands(prev => [...prev, response.data]);
    return response.data;
  };

  const updateBrand = async (id, data) => {
    const response = await api.put(`product/brands/${id}`, data);
    setBrands(prev => prev.map(brand => 
      brand.id === id ? response.data : brand
    ));
    return response.data;
  };

  const deleteBrand = async (id) => {
    await api.delete(`product/brands/${id}`);
    setBrands(prev => prev.filter(brand => brand.id !== id));
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return { 
    brands, 
    setBrands, 
    loading, 
    error, 
    fetchBrands,
    createBrand,
    updateBrand,
    deleteBrand
  };
};
