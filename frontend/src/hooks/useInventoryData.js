import { useState, useEffect } from "react";
import { getProducts, getStockMovements, getProductBatches } from "../services/inventoryService";

export function useInventoryData() {
  const [products, setProducts] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, movementsData, batchesData] = await Promise.all([
          getProducts(),
          getStockMovements(),
          getProductBatches(),
        ]);
        setProducts(productsData);
        setStockMovements(movementsData);
        setBatches(batchesData);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalProducts = products.reduce((sum, p) => sum + (p.stock_quantity || 0), 0);
  const lowStockCount = products.filter((p) => (p.stock_quantity || 0) < 100).length;
  const expiringCount = batches.filter((batch) => {
    if (!batch.expiry_date) return false;
    const daysUntilExpiry = Math.ceil((new Date(batch.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  }).length;

  return { products, stockMovements, batches, loading, totalProducts, lowStockCount, expiringCount };
}
