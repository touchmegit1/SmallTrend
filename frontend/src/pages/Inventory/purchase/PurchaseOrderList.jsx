import React, { useState, useMemo } from "react";
import {
  Plus, Search, ArrowLeft, FileText, Clock, CheckCircle2, XCircle,
  PackageCheck, AlertTriangle, Layers, ChevronDown, ChevronUp,
  CalendarDays, Hash, User, Building2, ReceiptText
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePurchaseOrderList } from "../../../hooks/inventory/purchase/usePurchaseOrderList";
import { useAuth } from "../../../context/AuthContext";
import { MANAGER_ROLES, ADMIN_ROLES, INVENTORY_ROLES, hasAnyRole } from "../../../utils/rolePermissions";
import { PO_STATUS, PO_STATUS_CONFIG } from "../../../utils/purchaseOrder";

const PAGE_SIZE = 10;

const STATUS_TABS = [
  { key: 'ALL', label: 'Tất cả', icon: Layers, color: 'slate' },
  { key: 'DRAFT', label: 'Phiếu tạm', icon: FileText, color: 'gray', statuses: ['DRAFT'] },
  { key: 'PENDING', label: 'Chờ duyệt', icon: Clock, color: 'orange', statuses: ['PENDING'] },
  { key: 'RECEIVED', label: 'Đã nhập kho', icon: PackageCheck, color: 'green', statuses: ['RECEIVED'] },
  { key: 'REJECTED', label: 'Từ chối / Hoàn', icon: XCircle, color: 'red', statuses: ['REJECTED', 'CANCELLED'] },
];

function PurchaseOrderList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isManager = hasAnyRole(user, MANAGER_ROLES);
  const isAdmin = hasAnyRole(user, ADMIN_ROLES);
  const isInventoryStaff = hasAnyRole(user, INVENTORY_ROLES);
  const canCreate = isAdmin || isManager || isInventoryStaff;

  const { suppliers, filteredOrders, loading, searchQuery, setSearchQuery } = usePurchaseOrderList();

  const [activeTab, setActiveTab] = useState("ALL");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [page, setPage] = useState(1);

  const tabOrders = useMemo(() => {
    const tab = STATUS_TABS.find(t => t.key === activeTab);
    if (!tab || !tab.statuses) return filteredOrders;
    return filteredOrders.filter(o => tab.statuses.includes(o.status));
  }, [filteredOrders, activeTab]);

  const totalPages = Math.ceil(tabOrders.length / PAGE_SIZE);
  const paged = tabOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => ({
    total: filteredOrders.length,
    draft: filteredOrders.filter(o => o.status === 'DRAFT').length,
    pending: filteredOrders.filter(o => o.status === 'PENDING').length,
    received: filteredOrders.filter(o => o.status === 'RECEIVED').length,
    rejected: filteredOrders.filter(o => ['REJECTED', 'CANCELLED'].includes(o.status)).length,
  }), [filteredOrders]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
  const formatCurrency = (v) => Number(v || 0).toLocaleString('vi-VN') + 'đ';

  // Status badge
  const StatusBadge = ({ status }) => {
    const cfg = PO_STATUS_CONFIG[status] || PO_STATUS_CONFIG.DRAFT;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full ${cfg.bg} ${cfg.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
        {cfg.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <button onClick={() => navigate("/inventory")}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-500 shrink-0">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ReceiptText size={20} className="text-indigo-600" />
                Danh sách phiếu nhập hàng
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Quản lý các đợt nhập lô hàng · {stats.total} phiếu
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/inventory/stock")}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition flex items-center gap-2">
              <Layers size={14} /> Tồn kho
            </button>
            {canCreate && (
              <button onClick={() => navigate("/inventory/purchase-orders/create")}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2 transition shadow-sm">
                <Plus size={16} /> Yêu cầu nhập hàng
              </button>
            )}
          </div>
        </div>
      </div>

      {/* STATUS TABS */}
      <div className="bg-white border-b border-slate-200 px-6 py-2 shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto">
          {STATUS_TABS.map(tab => {
            const TabIcon = tab.icon;
            const count = tab.key === 'ALL' ? stats.total :
              tab.statuses.reduce((sum, s) => sum + (stats[s.toLowerCase()] || stats[s] || 0), 0);
            return (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); setPage(1); setExpandedOrderId(null); }}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition whitespace-nowrap ${activeTab === tab.key
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                <TabIcon size={15} />
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white border-b border-slate-100 px-6 py-2.5 shrink-0">
        <div className="relative w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Tìm theo mã phiếu, NCC..."
            value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50" />
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {tabOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 mt-10">
            <FileText className="w-16 h-16 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium text-sm">Không có phiếu nhập nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paged.map(order => {
              const isExpanded = expandedOrderId === order.id;
              const supplier = suppliers.find(s => s.id === order.supplier_id);
              return (
                <div key={order.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition">
                  {/* Order Row */}
                  <div className="flex items-center px-5 py-4 gap-4 cursor-pointer"
                    onClick={() => navigate(`/inventory/purchase-orders/${order.id}`)}>
                    <button onClick={(e) => { e.stopPropagation(); setExpandedOrderId(isExpanded ? null : order.id); }}
                      className="p-1 rounded-lg hover:bg-slate-100 transition shrink-0">
                      {isExpanded ? <ChevronUp size={18} className="text-indigo-500" /> : <ChevronDown size={18} className="text-slate-400" />}
                    </button>
                    <div className="min-w-0 flex-1 grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-2">
                        <span className="font-mono text-sm font-semibold text-indigo-600">{order.order_number || order.po_number || '—'}</span>
                      </div>
                      <div className="col-span-2 text-xs text-slate-500 flex items-center gap-1.5">
                        <CalendarDays size={12} />{formatDate(order.created_at)}
                      </div>
                      <div className="col-span-3 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate flex items-center gap-1.5">
                          <Building2 size={13} className="text-slate-400 shrink-0" />
                          {supplier?.name || order.supplier_name || '—'}
                        </p>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="text-sm font-bold text-slate-800">{formatCurrency(order.total_amount)}</span>
                      </div>
                      <div className="col-span-1 text-xs text-slate-500 text-center">
                        {order.itemCount || order.items?.length || '—'} SP
                      </div>
                      <div className="col-span-2 text-center">
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                  </div>

                  {/* Expanded: Contract Details (for RECEIVED orders) */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                        <div>
                          <p className="text-slate-400 mb-0.5">Mã NCC</p>
                          <p className="font-semibold text-slate-700">{order.supplier_id || '—'}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 mb-0.5">Hợp đồng</p>
                          <p className="font-semibold text-slate-700">{order.contract_id ? `#${order.contract_id}` : '—'}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 mb-0.5">Thuế</p>
                          <p className="font-semibold text-slate-700">{order.tax_percent || 0}%</p>
                        </div>
                        <div>
                          <p className="text-slate-400 mb-0.5">Phí vận chuyển</p>
                          <p className="font-semibold text-slate-700">{formatCurrency(order.shipping_fee)}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 mb-0.5">Đã thanh toán</p>
                          <p className="font-semibold text-emerald-700">{formatCurrency(order.paid_amount)}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 mb-0.5">Ngày tạo</p>
                          <p className="font-semibold text-slate-700">{formatDate(order.created_at)}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 mb-0.5">Ngày nhập kho</p>
                          <p className="font-semibold text-slate-700">{order.status === 'RECEIVED' ? formatDate(order.updated_at) : 'Chưa nhập'}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 mb-0.5">Người tạo</p>
                          <p className="font-semibold text-slate-700 flex items-center gap-1"><User size={12} />{order.created_by || '—'}</p>
                        </div>
                        {order.rejection_reason && (
                          <div className="col-span-2">
                            <p className="text-red-500 mb-0.5 flex items-center gap-1"><AlertTriangle size={12} />Lý do từ chối</p>
                            <p className="text-red-700 bg-red-50 p-2 rounded-lg">{order.rejection_reason}</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => navigate(`/inventory/purchase-orders/${order.id}`)}
                          className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                          Xem chi tiết
                        </button>
                        {order.status === 'RECEIVED' && (
                          <button onClick={() => navigate(`/inventory/stock`)}
                            className="px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 transition flex items-center gap-1.5">
                            <Layers size={12} /> Xem tồn kho
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 bg-white border border-slate-200 rounded-xl">
                <p className="text-xs text-slate-500">Hiển thị {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, tabOrders.length)} / {tabOrders.length} phiếu</p>
                <div className="flex items-center gap-1">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                    className="p-1.5 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"><ChevronDown size={16} className="rotate-90" /></button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2)).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition ${p === page ? 'bg-indigo-600 text-white' : 'border border-slate-300 hover:bg-white text-slate-600'}`}>{p}</button>
                  ))}
                  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                    className="p-1.5 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"><ChevronDown size={16} className="-rotate-90" /></button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PurchaseOrderList;
