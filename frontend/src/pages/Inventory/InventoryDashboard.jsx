import React from "react";
import StatsCards from "../../components/inventory/StatsCards";
import ProductsTable from "../../components/inventory/ProductsTable";
import LowStockTable from "../../components/inventory/LowStockTable";
import ExpiringBatchesTable from "../../components/inventory/ExpiringBatchesTable";
import RecentActivities from "../../components/inventory/RecentActivities";
import { useInventoryData } from "../../hooks/useInventoryData";

function InventoryDashboard() {
  const { products, stockMovements, batches, loading, totalProducts, lowStockCount, expiringCount } = useInventoryData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Tổng quan kho hàng</h1>
        <p className="text-sm text-gray-500 mt-1">Theo dõi tồn kho và hoạt động nhập xuất</p>
      </div>

      <StatsCards expiringCount={expiringCount} totalProducts={totalProducts} lowStockCount={lowStockCount} />
      <ProductsTable products={products} />
      <LowStockTable products={products} />
      <ExpiringBatchesTable batches={batches} products={products} />
      <RecentActivities stockMovements={stockMovements} />
    </div>
  );
}

export default InventoryDashboard;
