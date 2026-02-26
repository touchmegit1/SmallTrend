import { useState, useEffect } from 'react';
import api from '../config/axiosConfig';

export const useFetchCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/crm/customers');
      const data = Array.isArray(response.data) ? response.data : [];
      setCustomers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.response?.data?.message || err.message || 'Lỗi khi tải khách hàng');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return { customers, setCustomers, loading, error, refetch: fetchCustomers };
};
