import { useState, useEffect, useMemo, useCallback } from "react";
import {
  getProducts,
  getStockMovements,
  getProductBatches,
  getCategories,
  getBrands,
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
        const [productsData, movementsData, batchesData, categoriesData, brandsData] =
          await Promise.all([
            getProducts(),
            getStockMovements(),
            getProductBatches(),
            getCategories(),
            getBrands(),
          ]);
        setProducts(productsData);
        setStockMovements(movementsData);
        setBatches(batchesData);
        setCategories(categoriesData);
        setBrands(brandsData);
      } catch (err) {
        console.error("Error fetching inventory data:", err);
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
      const product = products.find((p) => p.id === b.product_id);
      const status = classifyBatch(b.expiry_date);
      const days = daysUntilExpiry(b.expiry_date);
      return {
        ...b,
        productName: product?.name || "N/A",
        productSku: product?.sku || "N/A",
        status,
        daysRemaining: b.expiry_date ? days : null,
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

  // ─── Stats ─────────────────────────────────────────────────
  const stats = useMemo(() => {
    const productCount = products.length;
    const totalStockUnits = products.reduce((s, p) => s + (p.stock_quantity || 0), 0);
    const totalInventoryValue = enrichedProducts.reduce((s, p) => s + p.inventoryValue, 0);

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

    const expiredBatches = enrichedBatches.filter(
      (b) => b.status === BATCH_STATUS.EXPIRED
    ).length;
    const expiringBatches = enrichedBatches.filter(
      (b) =>
        b.status === BATCH_STATUS.EXPIRING_CRITICAL ||
        b.status === BATCH_STATUS.EXPIRING_WARNING
    ).length;

    return {
      productCount,
      totalStockUnits,
      totalInventoryValue,
      outOfStock,
      criticalStock,
      lowStock,
      healthyStock,
      expiredBatches,
      expiringBatches,
      needsAttention: outOfStock + criticalStock + expiredBatches,
    };
  }, [products, enrichedProducts, enrichedBatches]);

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
