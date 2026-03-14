import api from '../config/axiosConfig';

const API_BASE = '/products'; // backend controller is usually /api/products, interceptor adds /api

// Tạo giá mới cho variant (giá cũ sẽ chuyển INACTIVE)
export const createVariantPrice = async (variantId, priceData) => {
  const response = await api.post(`${API_BASE}/variants/${variantId}/prices`, priceData);
  return response.data;
};

// Lấy lịch sử giá của variant
export const getVariantPriceHistory = async (variantId) => {
  const response = await api.get(`${API_BASE}/variants/${variantId}/prices`);
  return response.data;
};

// Lấy giá ACTIVE hiện tại của variant
export const getActiveVariantPrice = async (variantId) => {
  const response = await api.get(`${API_BASE}/variants/${variantId}/prices/active`);
  return response.data;
};

// Toggle trạng thái active/inactive của một bản ghi giá
export const toggleVariantPriceStatus = async (priceId) => {
  const response = await api.put(`${API_BASE}/prices/${priceId}/toggle-status`);
  return response.data;
};
