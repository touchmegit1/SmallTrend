import { useState, useEffect } from 'react';
import eventService from '../services/eventService';

export const useCampaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const data = await eventService.getAllCampaigns();
            setCampaigns(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error('Error fetching campaigns:', err);
            setError(err.response?.data?.message || err.message || 'Lỗi khi tải sự kiện');
            setCampaigns([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    return { campaigns, setCampaigns, loading, error, refetch: fetchCampaigns };
};
