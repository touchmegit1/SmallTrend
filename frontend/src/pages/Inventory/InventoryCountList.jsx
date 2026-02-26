import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  ClipboardList,
  Eye,
  Pencil,
  XCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { useInventoryCountList } from "../../hooks/useInventoryCountList";
import {
  IC_STATUS,
  IC_STATUS_CONFIG,
  formatVNDCount,
} from "../../utils/inventoryCount";

function InventoryCountList() {
  const navigate = useNavigate();
  const {
    loading,
    error,
    vouchers,
    allVouchers,
    locationMap,
    statusCounts,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    sortField,
    sortDir,
    toggleSort,
    page,
    setPage,
    totalPages,
    cancelVoucher,
  } = useInventoryCountList();

  // ─── Loading ─────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-slate-100" />
            <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin absolute inset-0" />
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Đang tải danh sách kiểm kho...
          </p>
        </div>
      </div>
    );
  }

  // ─── Error ───────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-2">Lỗi tải dữ liệu</p>
          <p className="text-sm text-slate-500 mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const statusTabs = [
    { key: "ALL", label: "Tất cả" },
    { key: IC_STATUS.DRAFT, label: "Phiếu tạm" },
    { key: IC_STATUS.COUNTING, label: "Đang kiểm" },
    { key: IC_STATUS.CONFIRMED, label: "Đã xác nhận" },
    { key: IC_STATUS.CANCELLED, label: "Đã hủy" },
  ];

  const SortIcon = ({ field }) => (
    <button
      onClick={() => toggleSort(field)}
      className={`ml-1 p-0.5 rounded transition ${
        sortField === field
          ? "text-indigo-600"
          : "text-slate-300 hover:text-slate-500"
      }`}
    >
      <ArrowUpDown size={12} />
    </button>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* ─── Header ──────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/inventory")}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-500"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ClipboardList size={20} className="text-indigo-600" />
                Phiếu kiểm kho
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Quản lý tất cả phiếu kiểm kho
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/inventory-counts/create")}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition shadow-sm"
          >
            <Plus size={16} />
            Tạo phiếu mới
          </button>
        </div>
      </div>

      {/* ─── Filters ─────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shrink-0">
        <div className="flex items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex gap-1">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setStatusFilter(tab.key);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                  statusFilter === tab.key
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {tab.label} ({statusCounts[tab.key] || 0})
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo mã phiếu..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50"
            />
          </div>
        </div>
      </div>

      {/* ─── Table ───────────────────────────────────── */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {allVouchers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <ClipboardList size={56} className="text-slate-200 mb-4" />
            <h3 className="text-base font-semibold text-slate-600 mb-1">
              Chưa có phiếu kiểm kho nào
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Tạo phiếu kiểm kho đầu tiên để bắt đầu
            </p>
            <button
              onClick={() => navigate("/inventory-counts/create")}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus size={16} />
              Tạo phiếu mới
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Mã phiếu
                    <SortIcon field="code" />
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Vị trí
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Ngày tạo
                    <SortIcon field="created_at" />
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Người tạo
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Giá trị lệch
                    <SortIcon field="total_difference_value" />
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-32">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vouchers.map((v) => {
                  const sCfg =
                    IC_STATUS_CONFIG[v.status] || IC_STATUS_CONFIG.DRAFT;
                  const isDraft =
                    v.status === IC_STATUS.DRAFT ||
                    v.status === IC_STATUS.COUNTING;
                  const diffVal = v.total_difference_value || 0;

                  return (
                    <tr
                      key={v.id}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                      onClick={() => navigate(`/inventory-counts/${v.id}`)}
                    >
                      {/* Code */}
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-indigo-600 font-mono">
                          {v.code}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {locationMap[v.location_id] || (
                          <span className="text-slate-300 italic">
                            Chưa chọn
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full border ${sCfg.bg} ${sCfg.text} ${sCfg.border}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`}
                          />
                          {sCfg.label}
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {v.created_at
                          ? new Date(v.created_at).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "---"}
                      </td>

                      {/* Created By */}
                      <td className="px-4 py-3 text-sm text-slate-500">
                        User #{v.created_by || "---"}
                      </td>

                      {/* Difference Value */}
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`text-sm font-bold font-mono ${
                            diffVal < 0
                              ? "text-red-600"
                              : diffVal > 0
                                ? "text-blue-600"
                                : "text-slate-400"
                          }`}
                        >
                          {diffVal !== 0 ? formatVNDCount(diffVal) : "0 ₫"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center">
                        <div
                          className="flex items-center justify-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isDraft ? (
                            <>
                              <button
                                onClick={() =>
                                  navigate(`/inventory-counts/${v.id}`)
                                }
                                title="Tiếp tục kiểm"
                                className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 transition"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => cancelVoucher(v.id)}
                                title="Hủy phiếu"
                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"
                              >
                                <XCircle size={14} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() =>
                                navigate(`/inventory-counts/${v.id}`)
                              }
                              title="Xem chi tiết"
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition"
                            >
                              <Eye size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                <span className="text-xs text-slate-400">
                  Hiện {vouchers.length} / {allVouchers.length} phiếu
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg hover:bg-white text-slate-500 disabled:text-slate-300 disabled:cursor-not-allowed transition border border-transparent hover:border-slate-200"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 text-xs font-medium rounded-lg transition ${
                          page === p
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-500 hover:bg-white hover:border-slate-200 border border-transparent"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg hover:bg-white text-slate-500 disabled:text-slate-300 disabled:cursor-not-allowed transition border border-transparent hover:border-slate-200"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default InventoryCountList;
