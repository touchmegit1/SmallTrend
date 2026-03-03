import { useState, useEffect } from "react";
import { getSuppliers, getPurchaseOrders } from "../services/inventoryService";

export function useImportList() {
  const [suppliers, setSuppliers] = useState([]);
  const [importRecords, setImportRecords] = useState([]);
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
        setImportRecords(ordersData);
      } catch (error) {
        console.error("Error loading import list:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredRecords = importRecords.filter((record) => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;
    const poNumber = (record.order_number || "").toLowerCase();
    const supplierName = (record.supplier_name || "").toLowerCase();
    return poNumber.includes(query) || supplierName.includes(query);
  });

  return { suppliers, filteredRecords, loading, searchQuery, setSearchQuery };
}
