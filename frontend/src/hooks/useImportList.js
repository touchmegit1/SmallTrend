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
        setImportRecords(ordersData.reverse());
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredRecords = importRecords.filter(record => 
    record.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.supplier_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return { suppliers, filteredRecords, loading, searchQuery, setSearchQuery };
}
