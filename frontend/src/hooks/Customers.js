import { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosConfig';

export const useFetchCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/customers');
      setCustomers(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải khách hàng');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return { customers, setCustomers, loading, error };
};
