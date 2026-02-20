import React from "react";
import { Package, AlertTriangle, Clock } from "lucide-react";

function StatsCards({ expiringCount, totalProducts, lowStockCount }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Sắp hết hạn</span>
          <Clock className="w-5 h-5 text-yellow-600" />
        </div>
        <div className="text-2xl font-semibold text-gray-900">{expiringCount}</div>
        <div className="text-xs text-gray-500 mt-1">Trong 30 ngày tới</div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Tổng số lượng</span>
          <Package className="w-5 h-5 text-green-600" />
        </div>
        <div className="text-2xl font-semibold text-gray-900">{totalProducts.toLocaleString()}</div>
        <div className="text-xs text-gray-500 mt-1">Sản phẩm trong kho</div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Sắp hết hàng</span>
          <AlertTriangle className="w-5 h-5 text-orange-600" />
        </div>
        <div className="text-2xl font-semibold text-gray-900">{lowStockCount}</div>
        <div className="text-xs text-gray-500 mt-1">Dưới 100 sản phẩm</div>
      </div>
    </div>
  );
}

export default StatsCards;
