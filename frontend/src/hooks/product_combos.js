import { useState, useEffect, useCallback } from 'react';
import axios from '../config/axiosConfig';

export const useProductCombos = () => {
    const [combos, setCombos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCombos = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/product-combos');
            setCombos(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi khi tải danh sách combo');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCombos();
    }, [fetchCombos]);

    const createCombo = async (data) => {
        try {
            const response = await axios.post('/product-combos', data);
            await fetchCombos();
            return response.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Có lỗi khi tạo combo');
        }
    };

    const updateCombo = async (id, data) => {
        try {
            const response = await axios.put(`/product-combos/${id}`, data);
            await fetchCombos();
            return response.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Có lỗi khi cập nhật combo');
        }
    };

    const deleteCombo = async (id) => {
        try {
            await axios.delete(`/product-combos/${id}`);
            await fetchCombos();
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Có lỗi khi xóa combo');
        }
    };

    const toggleComboStatus = async (id) => {
        try {
            await axios.put(`/product-combos/${id}/toggle-status`);
            await fetchCombos();
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Có lỗi khi cập nhật trạng thái');
        }
    };

    return {
        combos,
        loading,
        error,
        fetchCombos,
        createCombo,
        updateCombo,
        deleteCombo,
        toggleComboStatus
    };
};
