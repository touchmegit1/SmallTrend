import { useState, useEffect } from 'react';
import api from '../config/axiosConfig';

export function useFetchCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      const data = Array.isArray(response.data) ? response.data : [];
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
      setError(err.message || 'Lỗi khi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (data) => {
    const response = await api.post('/categories', data);
    await fetchCategories();
    return response.data;
  };

  const updateCategory = async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    await fetchCategories();
    return response.data;
  };

  const deleteCategory = async (id) => {
    await api.delete(`/categories/${id}`);
    await fetchCategories();
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, error, fetchCategories, createCategory, updateCategory, deleteCategory };
}
