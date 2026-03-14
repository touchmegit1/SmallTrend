import { useState, useEffect } from 'react';
import api from '../config/axiosConfig';

export function useFetchSuppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/suppliers');

            const data = Array.isArray(response.data) ? response.data : [];
            setSuppliers(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching suppliers:', err);
            setSuppliers([]);
            setError(err.message || 'Lỗi khi tải nhà cung cấp');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const createSupplier = async (supplierData) => {
        try {
            const response = await api.post('/suppliers', supplierData);
            setSuppliers(prev => [...prev, response.data]);
            return { success: true, data: response.data };
        } catch (err) {
            console.error('Error creating supplier:', err);
            return { success: false, error: err.response?.data?.message || err.message };
        }
    };

    const updateSupplier = async (id, supplierData) => {
        try {
            const response = await api.put(`/suppliers/${id}`, supplierData);
            setSuppliers(prev => prev.map(s => s.id === id ? response.data : s));
            return { success: true, data: response.data };
        } catch (err) {
            console.error('Error updating supplier:', err);
            return { success: false, error: err.response?.data?.message || err.message };
        }
    };

    const deleteSupplier = async (id) => {
        try {
            await api.delete(`/suppliers/${id}`);
            setSuppliers(prev => prev.filter(s => s.id !== id));
            return { success: true };
        } catch (err) {
            console.error('Error deleting supplier:', err);
            return { success: false, error: err.response?.data?.message || err.message };
        }
    };

    return { suppliers, loading, error, fetchSuppliers, createSupplier, updateSupplier, deleteSupplier };
}
