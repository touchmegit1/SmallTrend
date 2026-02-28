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
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredRecords = importRecords.filter((record) => {
    const poNumber = (record.po_number || record.poNumber || "").toLowerCase();
    const supplierName = (record.supplier_name || record.supplierName || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return poNumber.includes(query) || supplierName.includes(query);
  });

  return { suppliers, filteredRecords, loading, searchQuery, setSearchQuery };
}
