import { useState, useEffect, useCallback } from 'react';
import customerTierService from '../services/customerTierService';

/**
 * useCustomerTiers – Lấy danh sách hạng thành viên từ backend.
 * @returns {{ tiers, loading, error, refetch }}
 */
export const useCustomerTiers = () => {
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTiers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await customerTierService.getAllTiers();
            setTiers(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error('Error fetching customer tiers:', err);
            setError(err.response?.data?.message || err.message || 'Lỗi khi tải hạng thành viên');
            setTiers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTiers();
    }, [fetchTiers]);

    return { tiers, loading, error, refetch: fetchTiers };
};
