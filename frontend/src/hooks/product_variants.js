import { useState, useEffect } from 'react';
import axios from '../config/axiosConfig';

export const useFetchVariants = (productId) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVariants = async () => {
    if (!productId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/products/${productId}/variants`);
      // Map Java camelCase to JavaScript snake_case for frontend compatibility
      const mappedVariants = response.data.map(v => ({
        id: v.id,
        sku: v.sku,
        barcode: v.barcode,
        sell_price: v.sellPrice,
        cost_price: v.costPrice,
        stock_quantity: v.stockQuantity,
        attributes: v.attributes || {},
        is_active: v.isActive
      }));
      setVariants(mappedVariants);
      setError(null);
    } catch (err) {
      setError(err.message);
      setVariants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  return { variants, loading, error, fetchVariants };
};
