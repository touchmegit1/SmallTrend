import React, { useState, useMemo } from "react";
import { RefreshCw, Plus, Search, PackagePlus, ClipboardCheck, AlertTriangle, Truck, Layers, MinusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useInventoryDashboard } from "../../../hooks/inventory/dashboard/useInventoryData";
import { usePurchaseOrderList } from "../../../hooks/inventory/purchase/usePurchaseOrderList";
import { useAuth } from "../../../context/AuthContext";
import { MANAGER_ROLES, hasAnyRole } from "../../../utils/rolePermissions";
import { PO_STATUS_CONFIG, formatVND } from "../../../utils/purchaseOrder";
import StatsCards from "../../../components/inventory/dashboard/StatsCards";
import StockByProductChart from "../../../components/inventory/dashboard/StockByProductChart";

function InventoryDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isManager = hasAnyRole(user, MANAGER_ROLES);
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

  // Purchase orders
  const {
    filteredOrders,
    loading: poLoading,
    searchQuery: poSearch,
    setSearchQuery: setPoSearch,
  } = usePurchaseOrderList();
  const [poStatusFilter, setPoStatusFilter] = useState("ALL");

  const filteredPOs = useMemo(() => {
    let orders = filteredOrders;
    if (poStatusFilter !== "ALL") orders = orders.filter((o) => o.status === poStatusFilter);
    return orders.slice(0, 25);
  }, [filteredOrders, poStatusFilter]);

  // Low stock products (clickable to create PO)
  const lowStockProducts = useMemo(() => {
    return allProducts
      .filter((p) => Number(p.stock_quantity ?? 0) <= 10)
      .sort((a, b) => (Number(a.stock_quantity) || 0) - (Number(b.stock_quantity) || 0))
      .slice(0, 6);
  }, [allProducts]);

  const handleCreatePOForProduct = (product) => {
    navigate(`/inventory/purchase-orders/create?productId=${product.id}`);
  };

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
            onClick={() => globalThis.location.reload()}
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
            Quản lý tồn kho theo biến thể, lô hàng & cảnh báo hạn sử dụng
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/inventory/stock")}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            title="Xem tồn kho chi tiết"
          >
            <Layers size={16} />
            Tồn kho
          </button>
          <button
            onClick={() => navigate("/inventory/stock/process")}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            title="Trừ kho POS & điều chỉnh"
          >
            <MinusCircle size={16} />
            Xử lý kho
          </button>
          <button
            onClick={() => navigate("/inventory/purchase-orders")}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            title="Danh sách phiếu nhập"
          >
            <PackagePlus size={16} />
            Phiếu nhập
          </button>
          <button
            onClick={() => globalThis.location.reload()}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            <RefreshCw size={16} />
            Làm mới
          </button>

          <button
            onClick={() => navigate("/inventory/purchase-orders/create")}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition"
          >
            <Plus size={16} />
            Nhập hàng mới
          </button>
        </div>
      </div>

      {/* ─── Stats Cards ─────────────────────────────────────── */}
      <StatsCards
        stats={stats}
        allProducts={allProducts}
        allBatches={allBatches}
      />

      {/* ─── Stock By Product Chart ────────────────────────────── */}
      <StockByProductChart products={allProducts} />

      {/* ─── Low Stock + Purchase Orders ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Low stock alerts */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              Cần nhập hàng gấp
            </h2>
            <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-semibold">
              {lowStockProducts.length}
            </span>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Tất cả sản phẩm đều đủ hàng</p>
          ) : (
            <div className="space-y-2">
              {lowStockProducts.map((p) => {
                const qty = Number(p.stock_quantity ?? 0);
                return (
                  <div
                    key={p.id}
                    onClick={() => handleCreatePOForProduct(p)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg border cursor-pointer hover:shadow-sm transition-all group"
                    style={{
                      background: qty === 0 ? "rgb(254 242 242)" : "rgb(255 251 235)",
                      borderColor: qty === 0 ? "rgb(254 202 202)" : "rgb(253 230 138)",
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                      <p className="text-[11px] text-slate-400">{p.sku}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-sm font-bold ${qty === 0 ? "text-red-600" : "text-amber-600"}`}>
                        {qty === 0 ? "Hết" : qty.toLocaleString("vi-VN")}
                      </span>
                      <span className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-colors">
                        <Plus size={12} className="text-slate-400 group-hover:text-white" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Purchase Orders */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Truck size={16} className="text-indigo-500" />
              Phiếu nhập gần đây
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative w-36">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm mã phiếu..."
                  value={poSearch}
                  onChange={(e) => setPoSearch(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                />
              </div>
              <select
                value={poStatusFilter}
                onChange={(e) => setPoStatusFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white outline-none"
              >
                <option value="ALL">Tất cả</option>
                <option value="DRAFT">Phiếu tạm</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="CHECKING">Đang kiểm</option>
                <option value="RECEIVED">Đã nhập</option>
              </select>
            </div>
          </div>
          {filteredPOs.length === 0 ? (
            <div className="py-10 text-center">
              <PackagePlus size={32} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Chưa có phiếu nhập</p>
              <button
                onClick={() => navigate("/inventory/purchase-orders/create")}
                className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                + Tạo phiếu nhập mới
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/80 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase">Mã phiếu</th>
                    <th className="px-4 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase">Ngày</th>
                    <th className="px-4 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase">NCC</th>
                    <th className="px-4 py-2 text-right text-[11px] font-semibold text-slate-500 uppercase">Tổng</th>
                    <th className="px-4 py-2 text-center text-[11px] font-semibold text-slate-500 uppercase">TT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPOs.map((po) => {
                    const cfg = PO_STATUS_CONFIG[po.status] || PO_STATUS_CONFIG.DRAFT;
                    return (
                      <tr
                        key={po.id}
                        onClick={() => navigate(`/inventory/purchase-orders/${po.id}`)}
                        className="hover:bg-indigo-50/30 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-2 text-sm font-mono font-semibold text-indigo-600">
                          {po.order_number || po.orderNumber || "—"}
                        </td>
                        <td className="px-4 py-2 text-xs text-slate-500 whitespace-nowrap">
                          {po.created_at
                            ? new Date(po.created_at).toLocaleDateString("vi-VN")
                            : "—"}
                        </td>
                        <td className="px-4 py-2 text-xs text-slate-600 max-w-[120px] truncate">
                          {po.supplier_name || po.supplierName || "—"}
                        </td>
                        <td className="px-4 py-2 text-xs font-semibold text-slate-800 text-right">
                          {formatVND(po.total_amount ?? po.totalAmount ?? 0)}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${cfg.bg} ${cfg.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                            {cfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InventoryDashboard;
