import React, { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePurchaseOrderList } from "../../hooks/usePurchaseOrderList";
import PurchaseOrderRecordsTable from "../../components/inventory/PurchaseOrderRecordsTable";
import { PO_STATUS_CONFIG } from "../../utils/purchaseOrder";

function PurchaseOrderList() {
  const navigate = useNavigate();
  const { suppliers, filteredOrders, loading, searchQuery, setSearchQuery } =
    usePurchaseOrderList();
  const [statusFilter, setStatusFilter] = useState("ALL");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const displayedOrders = statusFilter === "ALL" 
    ? filteredOrders 
    : filteredOrders.filter(o => o.status === statusFilter);

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 flex-1">
              <h1 className="text-xl font-semibold text-gray-800">Nhập hàng</h1>
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Theo mã phiếu nhập"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={() => navigate("/inventory/purchase-orders/create")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nhập hàng
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                statusFilter === "ALL"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setStatusFilter("PENDING")}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                statusFilter === "PENDING"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
              }`}
            >
              Chờ duyệt ({filteredOrders.filter(o => o.status === "PENDING").length})
            </button>
            <button
              onClick={() => setStatusFilter("DRAFT")}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                statusFilter === "DRAFT"
                  ? "bg-gray-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Phiếu tạm ({filteredOrders.filter(o => o.status === "DRAFT").length})
            </button>
            <button
              onClick={() => setStatusFilter("CONFIRMED")}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                statusFilter === "CONFIRMED"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              Đã xác nhận ({filteredOrders.filter(o => o.status === "CONFIRMED").length})
            </button>
            <button
              onClick={() => setStatusFilter("REJECTED")}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                statusFilter === "REJECTED"
                  ? "bg-red-600 text-white"
                  : "bg-red-50 text-red-700 hover:bg-red-100"
              }`}
            >
              Từ chối ({filteredOrders.filter(o => o.status === "REJECTED").length})
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mã nhập hàng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Thời gian
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mã NCC
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nhà cung cấp
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Cần trả NCC
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <PurchaseOrderRecordsTable
                records={displayedOrders}
                suppliers={suppliers}
              />
            </tbody>
          </table>
        </div>

        <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị <span className="font-medium">{displayedOrders.length}</span> dòng
          </div>
        </div>
      </div>
    </div>
  );
}

export default PurchaseOrderList;
