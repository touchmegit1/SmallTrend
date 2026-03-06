import { useState, useEffect, useCallback } from 'react';
import ticketService from '../services/ticketService';

/**
 * useTickets – Lấy danh sách ticket khiếu nại từ backend.
 * @returns {{ tickets, loading, error, refetch }}
 */
export const useTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const data = await ticketService.getAllTickets();
            setTickets(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error('Error fetching tickets:', err);
            setError(err.response?.data?.message || err.message || 'Không thể tải danh sách ticket');
            setTickets([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    return { tickets, setTickets, loading, error, refetch: fetchTickets };
};
