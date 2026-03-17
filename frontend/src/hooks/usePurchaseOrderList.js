import { useState, useEffect } from "react";
import { getSuppliers, getPurchaseOrders } from "../services/inventoryService";

export function usePurchaseOrderList() {
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersData, ordersData] = await Promise.all([
          getSuppliers(),
          getPurchaseOrders(),
        ]);
        setSuppliers(suppliersData);
        setPurchaseOrders(ordersData);
      } catch (error) {
        console.error("Error loading purchase orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredOrders = purchaseOrders
    .filter((record) => {
      const query = searchQuery.toLowerCase();
      if (!query) return true;
      const poNumber = (record.order_number || "").toLowerCase();
      const supplierName = (record.supplier_name || "").toLowerCase();
      return poNumber.includes(query) || supplierName.includes(query);
    })
    .sort((a, b) => {
      const aNumber = a.order_number || "";
      const bNumber = b.order_number || "";
      return bNumber.localeCompare(aNumber, undefined, { numeric: true });
    });

  return { suppliers, filteredOrders, loading, searchQuery, setSearchQuery };
}
