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

    // Tìm kiếm theo tên hoặc SKU (local filter)
    const searchVariants = (keyword) => {
        if (!keyword) return variants;
        const kw = keyword.toLowerCase().trim();
        return variants.filter(
            (v) =>
                v.name?.toLowerCase().includes(kw) ||
                v.sku?.toLowerCase().includes(kw)
        );
    };

    return { variants, loading, error, refetch: fetchVariants, searchVariants };
};
