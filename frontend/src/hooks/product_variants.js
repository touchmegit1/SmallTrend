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
      const response = await axios.get(`/products/${productId}/variants`);
      // Map Java camelCase to JavaScript snake_case for frontend compatibility
      const mappedVariants = response.data.map(v => ({
        id: v.id,
        name: v.name,
        unit_id: v.unitId,
        unit_name: v.unitName,
        unit_value: v.unitValue,
        sku: v.sku,
        barcode: v.barcode || v.pluCode || '',
        plu_code: v.pluCode,
        sell_price: v.sellPrice || 0,
        cost_price: v.costPrice || 0,
        stock_quantity: v.stockQuantity || 0,
        image_url: v.imageUrl || v.image_url || null,
        is_active: v.isActive !== false,
        created_at: v.createdAt || v.created_at,
        attributes: v.attributes || {},
        unit_conversions: v.unitConversions || v.unit_conversions || []
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

export const useFetchUnits = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/products/units');
      setUnits(response.data || []);
    } catch (err) {
      console.error('Error fetching units:', err);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  return { units, loading, fetchUnits };
};
