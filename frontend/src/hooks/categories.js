import { useState, useEffect } from 'react';
import api from '../config/axiosConfig';

/**
 * Custom Hook React dùng để quản lý toàn bộ các thao tác (Fetch, Create, Update, Delete) với Danh mục (Categories).
 */
export function useFetchCategories() {
  // --- Các state quản lý dữ liệu và trạng thái UI ---
  const [categories, setCategories] = useState([]); // Lưu trữ danh sách danh mục
  const [loading, setLoading] = useState(true);     // Cờ hiển thị trạng thái đang tải (Loading spinner / Text)
  const [error, setError] = useState(null);         // Lưu trữ thông báo lỗi để hiển thị nếu có sự cố

  // --- Hàm Load Danh sách ---
  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Gọi API GET về backend để lấy danh mục
      const response = await api.get('/categories');

      // Đảm bảo dữ liệu nhận được luôn là Array, tránh các lỗi map() ở component giao diện
      const data = Array.isArray(response.data) ? response.data : [];
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]); // Format lại rỗng nếu lỗi
      setError(err.message || 'Lỗi khi tải danh mục');
    } finally {
      // Dù call thành công hay lỗi thì cũng phải tắt Trạng thái Loading
      setLoading(false);
    }
  };

  // --- Hàm Tạo mới ---
  const createCategory = async (data) => {
    const response = await api.post('/categories', data);
    await fetchCategories(); // Sau khi lưu, tự động fetch data lại để UI cập nhật realtime List
    return response.data;
  };

  // --- Hàm Cập nhật (Sửa) ---
  const updateCategory = async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    await fetchCategories(); // Lấy lại List mới cập nhật
    return response.data;
  };

  // --- Hàm Xoá ---
  const deleteCategory = async (id) => {
    await api.delete(`/categories/${id}`);
    await fetchCategories(); // Lấy lại List sau khi xoá
  };

  // Auto fetch categories khi Hook được mount lần đầu
  useEffect(() => {
    fetchCategories();
  }, []);

  // Trả về state và function để các Component (Ví dụ: CategoryAndBrand.jsx) có thể tái sử dụng
  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
}
