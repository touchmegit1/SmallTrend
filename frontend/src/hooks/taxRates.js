import { useState, useEffect } from 'react';
import api from '../config/axiosConfig';

export function useFetchTaxRates() {
    const [taxRates, setTaxRates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTaxRates = async () => {
        try {
            setLoading(true);
            const response = await api.get('/tax-rates');
            const data = Array.isArray(response.data) ? response.data : [];
            setTaxRates(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching tax rates:', err);
            setTaxRates([]);
            setError(err.message || 'Lỗi khi tải thuế suất');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTaxRates();
    }, []);

    return { taxRates, loading, error, fetchTaxRates };
}
