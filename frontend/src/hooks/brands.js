import { useState, useEffect } from 'react';
import api from '../config/axiosConfig';

export const useFetchBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBrands= async () => {
    setLoading(true);
    try {
      const response = await api.get('/brands');
      setBrands(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải thương hiệu');
      setBrands([]);
    } finally {
      setLoading(false);    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return { brands, setBrands, loading, error, fetchBrands };
};
