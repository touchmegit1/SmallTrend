import { useState, useEffect } from 'react';
import api from '../config/axiosConfig';

export const useFetchCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('product/categories');
      const data = Array.isArray(response.data) ? response.data : (response.data?.content || []);
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải danh mục');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (data) => {
    const response = await api.post('product/categories', data);
    setCategories(prev => [...prev, response.data]);
    return response.data;
  };

  const updateCategory = async (id, data) => {
    const response = await api.put(`product/categories/${id}`, data);
    setCategories(prev => prev.map(cat => 
      cat.id === id ? response.data : cat
    ));
    return response.data;
  };

  const deleteCategory = async (id) => {
    await api.delete(`product/categories/${id}`);
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { 
    categories, 
    setCategories, 
    loading, 
    error, 
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
};
