import { useState, useEffect } from 'react';
import eventService from '../services/eventService';

export const useVouchers = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const data = await eventService.getAllVouchers();
            setVouchers(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error('Error fetching vouchers:', err);
            setError(err.response?.data?.message || err.message || 'Lỗi khi tải voucher');
            setVouchers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    return { vouchers, setVouchers, loading, error, refetch: fetchVouchers };
};
