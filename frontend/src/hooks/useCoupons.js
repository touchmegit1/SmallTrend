import { useState, useEffect } from 'react';
import eventService from '../services/eventService';

export const useCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const data = await eventService.getAllCoupons();
            setCoupons(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error('Error fetching coupons:', err);
            setError(err.response?.data?.message || err.message || 'Lỗi khi tải coupon');
            setCoupons([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    return { coupons, setCoupons, loading, error, refetch: fetchCoupons };
};
