import React from "react";
import { Plus, Search, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDisposalList } from "../../hooks/useDisposalList";
import { formatCurrency } from "../../utils/inventory";
import CustomSelect from "../../components/common/CustomSelect";

const STATUS_CONFIG = {
  DRAFT: {
    label: "Nháp",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    dot: "bg-yellow-400",
    border: "border-yellow-200",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-500",
    border: "border-green-200",
  },
  PENDING: {
    label: "Chờ duyệt",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
    border: "border-indigo-200",
  },
  REJECTED: {
    label: "Từ chối",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
    border: "border-red-200",
  },
};

const REASON_CONFIG = {
  EXPIRED: { label: "Hết hạn" },
};

const SortIcon = ({ field, sortField, sortDir }) => (
  <span className="ml-1 text-[10px]">
    {sortField === field ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
  </span>
);

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function DisposalList() {
  const navigate = useNavigate();
  const {
    loading,
    error,
    vouchers,
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
  } = useDisposalList();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 max-w-md w-full text-center">
          <p className="font-semibold text-lg mb-1">Lỗi tải dữ liệu</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => globalThis.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const statusOptions = [
    { value: "ALL", label: `Tất cả (${statusCounts["ALL"] || 0})` },
    { value: "DRAFT", label: `Nháp (${statusCounts["DRAFT"] || 0})` },
    { value: "PENDING", label: `Chờ duyệt (${statusCounts["PENDING"] || 0})` },
    {
      value: "CONFIRMED",
      label: `Đã xác nhận (${statusCounts["CONFIRMED"] || 0})`,
    },
    { value: "REJECTED", label: `Từ chối (${statusCounts["REJECTED"] || 0})` },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => navigate("/inventory")}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-500 shrink-0"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Trash2 size={20} className="text-red-600" />
                Xử lý hàng hóa
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Quản lý tất cả phiếu xử lý hàng hóa
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/inventory/disposal/create")}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium flex items-center gap-2 transition shadow-sm shrink-0"
          >
            <Plus size={16} />
            Tạo phiếu xử lý
          </button>
        </div>
      </div>

      {/* ── FILTER BAR ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1"></div>
          <div className="flex items-center gap-3">
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
                placeholder="Tìm theo mã phiếu, ghi chú..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-slate-50"
              />
            </div>
            <div className="w-52">
              <CustomSelect
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
                options={statusOptions}
                variant="status"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── TABLE ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {vouchers.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-16 gap-4">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
              <Trash2 size={36} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">
              Chưa có phiếu xử lý nào
            </p>
            <button
              onClick={() => navigate("/inventory/disposal/create")}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
            >
              Tạo phiếu đầu tiên
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/80 border-b border-slate-200">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                      onClick={() => toggleSort("code")}
                    >
                      Mã phiếu{" "}
                      <SortIcon
                        field="code"
                        sortField={sortField}
                        sortDir={sortDir}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Lý do
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Kho
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      SL sản phẩm
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Tổng SL
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Giá trị
                    </th>
                    <th
                      className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                      onClick={() => toggleSort("createdAt")}
                    >
                      Ngày tạo{" "}
                      <SortIcon
                        field="createdAt"
                        sortField={sortField}
                        sortDir={sortDir}
                      />
                    </th>
                    <th className="px-4 py-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vouchers.map((v) => {
                    const cfg = STATUS_CONFIG[v.status] || STATUS_CONFIG.DRAFT;
                    const reason = REASON_CONFIG[v.reasonType] || REASON_CONFIG.EXPIRED;
                    const derivedValue = (v.items || []).reduce(
                      (sum, item) =>
                        sum +
                        Number(
                          item.total_cost ?? item.totalCost ?? (item.unit_cost ?? item.unitCost ?? 0) * (item.quantity ?? 0)
                        ),
                      0
                    );
                    const displayedValue =
                      Number(v.totalValue ?? 0) > 0 ? Number(v.totalValue) : derivedValue;

                    return (
                      <tr
                        key={v.id}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/inventory/disposal/${v.id}`)}
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm font-semibold text-red-600">
                            {v.code}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {reason.label}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {v.locationName || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-slate-700">
                          {v.totalItems || 0}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-slate-700">
                          {v.totalQuantity || 0}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-slate-900">
                          {formatCurrency(displayedValue)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">
                          {formatDate(v.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                            />
                            {cfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Trang {page} / {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    ← Trước
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Sau →
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
