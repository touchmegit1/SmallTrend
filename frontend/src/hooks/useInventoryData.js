import { useState, useEffect, useMemo, useCallback } from "react";
import {
  getDashboardProducts,
  getProductBatches,
  getCategories,
  getBrands,
  getDashboardSummary,
  getDashboardBatches,
  getRecentActivities,
  reseedStock,
} from "../services/inventoryService";
import {
  classifyBatch,
  classifyStock,
  daysUntilExpiry,
  BATCH_STATUS,
  STOCK_STATUS,
  sortBy,
} from "../utils/inventory";

export function useInventoryDashboard() {
  // ─── Raw Data ──────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [batches, setBatches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── UI State ──────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [batchTab, setBatchTab] = useState("all"); // all | expired | expiring | safe

  // ─── Fetch ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to reseed stock data if missing (one-time fix)
        try {
          await reseedStock();
        } catch (e) {
          console.warn("⚠️ Reseed stock skipped:", e.message);
        }

        const [productsData, batchesData, categoriesData, brandsData, summaryData, activitiesData] =
          await Promise.all([
            getDashboardProducts(),
            getDashboardBatches(),
            getCategories(),
            getBrands(),
            getDashboardSummary(),
            getRecentActivities().catch(() => []),
          ]);

        setProducts(productsData);
        setBatches(batchesData);
        setCategories(categoriesData);
        setBrands(brandsData);
        setDashboardSummary(summaryData);
        setStockMovements(activitiesData);
      } catch (err) {
        console.error("❌ Error fetching inventory data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ─── Enriched Products (with status) ───────────────────────
  const enrichedProducts = useMemo(() => {
    return products.map((p) => {
      const stockStatus = classifyStock(p.stock_quantity || 0, p.min_stock || 50);
      const category = categories.find((c) => c.id === p.category_id);
      const brand = brands.find((b) => b.id === p.brand_id);
      const productBatches = batches.filter((b) => b.product_id === p.id);
      const inventoryValue = (p.stock_quantity || 0) * (p.purchase_price || 0);
      return {
        ...p,
        stockStatus,
        categoryName: category?.name || "—",
        brandName: brand?.name || "—",
        productBatches,
        inventoryValue,
      };
    });
  }, [products, categories, brands, batches]);

  // ─── Enriched Batches ──────────────────────────────────────
  const enrichedBatches = useMemo(() => {
    return batches.map((b) => {
      // Use productName from API response (BatchStatusResponse includes it)
      const productName = b.productName || b.product_name || "N/A";
      const expiryDate = b.expiry_date || b.expiryDate;
      const receivedDate = b.received_date || b.receivedDate;
      const batchCode = b.batchCode || b.batch_code || "N/A";
      const status = classifyBatch(expiryDate);
      const days = b.days_until_expiry ?? b.daysUntilExpiry ?? daysUntilExpiry(expiryDate);
      return {
        ...b,
        id: b.id || b.batchId,
        productName,
        productSku: batchCode,
        batch_code: batchCode,
        status,
        expiry_date: expiryDate,
        received_date: receivedDate,
        location_name: b.locationName || b.location_name || b.locationCode || b.location_code || null,
        quantity: b.quantity ?? 0,
        daysRemaining: expiryDate ? days : null,
      };
    });
  }, [batches, products]);

  // ─── Filtered + Sorted Products ────────────────────────────
  const filteredProducts = useMemo(() => {
    let list = enrichedProducts;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.brandName.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      list = list.filter((p) => String(p.category_id) === categoryFilter);
    }

    // Stock status filter
    if (stockFilter !== "all") {
      list = list.filter((p) => p.stockStatus === stockFilter);
    }

    // Sort
    list = sortBy(list, sortConfig.key, sortConfig.direction);

    return list;
  }, [enrichedProducts, searchQuery, categoryFilter, stockFilter, sortConfig]);

  // ─── Filtered Batches ──────────────────────────────────────
  const filteredBatches = useMemo(() => {
    let list = enrichedBatches;
    if (batchTab === "expired") {
      list = list.filter((b) => b.status === BATCH_STATUS.EXPIRED);
    } else if (batchTab === "expiring") {
      list = list.filter(
        (b) =>
          b.status === BATCH_STATUS.EXPIRING_CRITICAL ||
          b.status === BATCH_STATUS.EXPIRING_WARNING ||
          b.status === BATCH_STATUS.EXPIRING_NOTICE
      );
    } else if (batchTab === "safe") {
      list = list.filter((b) => b.status === BATCH_STATUS.SAFE);
    }
    return list;
  }, [enrichedBatches, batchTab]);

  // ─── Stats (from backend API) ──────────────────────────────
  const stats = useMemo(() => {
    if (!dashboardSummary) {
      return {
        productCount: 0,
        totalStockUnits: 0,
        totalInventoryValue: 0,
        outOfStock: 0,
        criticalStock: 0,
        lowStock: 0,
        healthyStock: 0,
        expiredBatches: 0,
        expiringBatches: 0,
        needsAttention: 0,
      };
    }

    // Calculate local stats for UI filters
    const totalStockUnits = products.reduce((s, p) => s + (p.stock_quantity || 0), 0);
    const outOfStock = enrichedProducts.filter(
      (p) => p.stockStatus === STOCK_STATUS.OUT_OF_STOCK
    ).length;
    const criticalStock = enrichedProducts.filter(
      (p) => p.stockStatus === STOCK_STATUS.CRITICAL
    ).length;
    const lowStock = enrichedProducts.filter(
      (p) => p.stockStatus === STOCK_STATUS.LOW
    ).length;
    const healthyStock = enrichedProducts.filter(
      (p) =>
        p.stockStatus === STOCK_STATUS.ADEQUATE ||
        p.stockStatus === STOCK_STATUS.HEALTHY
    ).length;

    return {
      productCount: dashboardSummary.totalProducts,
      totalStockUnits,
      totalInventoryValue: dashboardSummary.totalInventoryValue,
      outOfStock,
      criticalStock,
      lowStock,
      healthyStock,
      expiredBatches: dashboardSummary.expiredBatchCount,
      expiringBatches: dashboardSummary.expiringSoonCount,
      needsAttention: dashboardSummary.needActionCount,
    };
  }, [dashboardSummary, products, enrichedProducts]);

  // ─── Sort Handler ──────────────────────────────────────────
  const handleSort = useCallback(
    (key) => {
      setSortConfig((prev) => ({
        key,
        direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
      }));
    },
    []
  );

  return {
    // Data
    products: filteredProducts,
    allProducts: enrichedProducts,
    batches: filteredBatches,
    allBatches: enrichedBatches,
    stockMovements,
    categories,
    brands,
    stats,

    // State
    loading,
    error,
    searchQuery,
    categoryFilter,
    stockFilter,
    sortConfig,
    batchTab,

    // Actions
    setSearchQuery,
    setCategoryFilter,
    setStockFilter,
    handleSort,
    setBatchTab,
  };
}
