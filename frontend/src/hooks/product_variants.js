import { useState, useEffect } from 'react';
import api from '../config/axiosConfig';

export const useFetchVariants = (productId) => {
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!productId) return;

        const fetchVariants = async () => {
            setLoading(true);
            try {
                const response = await api.get(
                    `/product/product_variants?product_id=${productId}`
                );
                setVariants(response.data);
            } catch (err) {
                setError("Lỗi khi tải biến thể");
            } finally {
                setLoading(false);
            }
        };

        fetchVariants();
    }, [productId]);

    return { variants, loading, error };
};
