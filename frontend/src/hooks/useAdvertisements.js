import { useState, useEffect } from 'react';
import api from '../config/axiosConfig';

export const useAdvertisements = () => {
  const [ads, setAds] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAds = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/advertisements/active');
        setAds(response.data || {});
        setError(null);
      } catch (err) {
        console.error('Failed to fetch advertisements:', err);
        setError(err.message);
        setAds({});
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  return { ads, loading, error };
};

export default useAdvertisements;
