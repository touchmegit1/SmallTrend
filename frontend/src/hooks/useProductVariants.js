import { useState, useEffect } from 'react';
import eventService from '../services/eventService';

export const useProductVariants = () => {
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchVariants = async () => {
        setLoading(true);
        try {
            const data = await eventService.getAllVariants();
            setVariants(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error('Error fetching product variants:', err);
            setError(err.response?.data?.message || err.message || 'Lỗi khi tải sản phẩm');
            setVariants([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVariants();
    }, []);

    return { variants, setVariants, loading, error, refetch: fetchVariants };
};
