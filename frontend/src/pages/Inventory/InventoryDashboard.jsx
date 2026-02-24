import React from "react";
import { RefreshCw, Download, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useInventoryDashboard } from "../../hooks/useInventoryData";
import StatsCards from "../../components/inventory/StatsCards";
import ProductStockTable from "../../components/inventory/ProductStockTable";
import StockHealthOverview from "../../components/inventory/StockHealthOverview";
import BatchManagementPanel from "../../components/inventory/BatchManagementPanel";
import RecentActivities from "../../components/inventory/RecentActivities";

function InventoryDashboard() {
  const navigate = useNavigate();
  const {
    products,
    allProducts,
    batches,
    allBatches,
    stockMovements,
    categories,
    stats,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    stockFilter,
    setStockFilter,
    sortConfig,
    handleSort,
    batchTab,
    setBatchTab,
  } = useInventoryDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-slate-100"></div>
            <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin absolute inset-0"></div>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Đang tải dữ liệu kho...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-2">Lỗi tải dữ liệu</p>
          <p className="text-sm text-slate-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* ─── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tổng quan kho hàng
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Quản lý tồn kho, lô hàng & cảnh báo hạn sử dụng
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            <RefreshCw size={16} />
            Làm mới
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">
            <Download size={16} />
            Xuất báo cáo
          </button>
          <button
            onClick={() => navigate("/inventory/import/create")}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition"
          >
            <Plus size={16} />
            Nhập hàng mới
          </button>
        </div>
      </div>

      {/* ─── Stats Cards ─────────────────────────────────────── */}
      <StatsCards stats={stats} />

      {/* ─── Main Content Grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Product Stock Table - takes 2 columns */}
        <div className="xl:col-span-2">
          <ProductStockTable
            products={products}
            categories={categories}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            stockFilter={stockFilter}
            setStockFilter={setStockFilter}
            sortConfig={sortConfig}
            handleSort={handleSort}
          />
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <StockHealthOverview products={allProducts} />
          <RecentActivities stockMovements={stockMovements} />
        </div>
      </div>

      {/* ─── Batch Management ────────────────────────────────── */}
      <BatchManagementPanel
        batches={batchTab === "all" ? allBatches : batches}
        batchTab={batchTab}
        setBatchTab={setBatchTab}
      />
    </div>
  );
}

export default InventoryDashboard;
