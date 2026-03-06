import { useState, useEffect, useCallback } from 'react';
import loyaltyService from '../services/loyaltyService';

/**
 * useGifts – Lấy danh sách quà tặng loyalty từ backend.
 * @returns {{ gifts, loading, error, refetch, setGifts }}
 */
export const useGifts = () => {
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchGifts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await loyaltyService.getAllGifts();
            setGifts(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error('Error fetching gifts:', err);
            setError(err.response?.data?.message || err.message || 'Lỗi khi tải quà tặng');
            setGifts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGifts();
    }, [fetchGifts]);

    return { gifts, setGifts, loading, error, refetch: fetchGifts };
};
