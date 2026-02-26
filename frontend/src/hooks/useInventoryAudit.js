import { useState, useEffect } from "react";
import { getProducts } from "../services/inventoryService";

export function useInventoryAudit() {
  const [products, setProducts] = useState([]);
  const [auditItems, setAuditItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsData = await getProducts();
        setProducts(productsData);
        
        const items = productsData.map((p, index) => ({
          id: p.id,
          stt: index + 1,
          code: p.sku,
          name: p.name,
          unit: p.unit,
          systemStock: p.stock_quantity || 0,
          actualStock: null,
          difference: 0,
          valueDifference: 0,
          price: p.purchase_price,
        }));
        setAuditItems(items);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleActualStockChange = (id, value) => {
    setAuditItems((items) =>
      items.map((item) => {
        if (item.id === id) {
          const actualStock = parseInt(value) || 0;
          const difference = actualStock - item.systemStock;
          const valueDifference = difference * item.price;
          return { ...item, actualStock, difference, valueDifference };
        }
        return item;
      })
    );
  };

  const getFilteredItems = () => {
    let filtered = auditItems;
    if (activeTab === "match") {
      filtered = filtered.filter((item) => item.actualStock !== null && item.difference === 0);
    } else if (activeTab === "mismatch") {
      filtered = filtered.filter((item) => item.actualStock !== null && item.difference !== 0);
    } else if (activeTab === "unchecked") {
      filtered = filtered.filter((item) => item.actualStock === null);
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  const stats = {
    allCount: auditItems.length,
    matchCount: auditItems.filter((item) => item.actualStock !== null && item.difference === 0).length,
    mismatchCount: auditItems.filter((item) => item.actualStock !== null && item.difference !== 0).length,
    uncheckedCount: auditItems.filter((item) => item.actualStock === null).length,
    totalActualStock: auditItems.reduce((sum, item) => sum + (item.actualStock || 0), 0),
  };

  return {
    loading,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    filteredItems: getFilteredItems(),
    handleActualStockChange,
    stats,
  };
}
