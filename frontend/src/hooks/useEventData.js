import { useState, useEffect, useCallback } from 'react';
import eventService from '../services/eventService';

/**
 * useDiscountedVariants – Lấy danh sách sản phẩm đang được áp dụng coupon.
 * @returns {{ variants, loading, error, refetch }}
 */
export const useDiscountedVariants = () => {
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchVariants = useCallback(async () => {
        setLoading(true);
        try {
            const data = await eventService.getVariantsWithCoupon();
            setVariants(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error('Error fetching discounted variants:', err);
            setError(err.response?.data?.message || err.message || 'Lỗi khi tải sản phẩm khuyến mãi');
            setVariants([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVariants();
    }, [fetchVariants]);

    return { variants, loading, error, refetch: fetchVariants };
};

/**
 * useAllVariants – Lấy toàn bộ sản phẩm (không phân biệt có coupon hay không).
 * @returns {{ variants, loading, error, refetch }}
 */
export const useAllVariants = () => {
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchVariants = useCallback(async () => {
        setLoading(true);
        try {
            const data = await eventService.getAllVariants();
            setVariants(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error('Error fetching all variants:', err);
            setError(err.response?.data?.message || err.message || 'Lỗi khi tải sản phẩm');
            setVariants([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVariants();
    }, [fetchVariants]);

    return { variants, loading, error, refetch: fetchVariants };
};

/**
 * useActiveCampaigns – Lấy danh sách campaign đang ACTIVE.
 * @returns {{ campaigns, loading, error, refetch }}
 */
export const useActiveCampaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCampaigns = useCallback(async () => {
        setLoading(true);
        try {
            const data = await eventService.getActiveCampaigns();
            setCampaigns(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error('Error fetching active campaigns:', err);
            setError(err.response?.data?.message || err.message || 'Lỗi khi tải sự kiện hoạt động');
            setCampaigns([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    return { campaigns, loading, error, refetch: fetchCampaigns };
};
