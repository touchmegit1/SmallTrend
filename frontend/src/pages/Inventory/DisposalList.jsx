import React from "react";
import { useNavigate } from "react-router-dom";
import { useDisposalList } from "../../hooks/useDisposalList";
import { formatCurrency } from "../../utils/inventory";

const STATUS_CONFIG = {
  DRAFT: { label: "Nháp", bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" },
  CONFIRMED: { label: "Đã xác nhận", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  CANCELLED: { label: "Đã hủy", bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" },
};

const REASON_CONFIG = {
  EXPIRED: { label: "Hết hạn" },
  DAMAGED: { label: "Hư hỏng" },
  LOST: { label: "Thất thoát" },
  OBSOLETE: { label: "Lỗi thời" },
  OTHER: { label: "Khác" },
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
    cancelVoucher,
  } = useDisposalList();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <div>
              <p className="font-semibold">Lỗi tải dữ liệu</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusTabs = [
    { key: "ALL", label: "Tất cả" },
    { key: "DRAFT", label: "Nháp" },
    { key: "CONFIRMED", label: "Đã xác nhận" },
    { key: "CANCELLED", label: "Đã hủy" },
  ];

  const SortIcon = ({ field }) => (
    <span className="ml-1 text-xs">
      {sortField === field ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
    </span>
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Phiếu xử lý hàng</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý phiếu xử lý hàng hết hạn, hư hỏng, thất thoát
          </p>
        </div>
        <button
          onClick={() => navigate("/inventory/disposal/create")}
          className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
        >
          Tạo phiếu xử lý
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setStatusFilter(tab.key);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                statusFilter === tab.key
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {statusCounts[tab.key] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          placeholder="Tìm theo mã phiếu, ghi chú, kho..."
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                  onClick={() => toggleSort("code")}
                >
                  Mã phiếu <SortIcon field="code" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Lý do
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Kho
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  SL sản phẩm
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Tổng SL
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Giá trị
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                  onClick={() => toggleSort("createdAt")}
                >
                  Ngày tạo <SortIcon field="createdAt" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vouchers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-gray-500 text-sm font-medium">Chưa có phiếu xử lý nào</p>
                      <button
                        onClick={() => navigate("/inventory/disposal/create")}
                        className="mt-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Tạo phiếu đầu tiên
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                vouchers.map((v) => {
                  const statusCfg = STATUS_CONFIG[v.status] || STATUS_CONFIG.DRAFT;
                  const reasonCfg = REASON_CONFIG[v.reasonType] || REASON_CONFIG.OTHER;

                  return (
                    <tr
                      key={v.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/inventory/disposal/${v.id}`)}
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-semibold text-red-600">
                          {v.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {reasonCfg.label}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {v.locationName || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">
                        {v.totalItems || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">
                        {v.totalQuantity || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                        {formatCurrency(v.totalValue || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(v.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.bg} ${statusCfg.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {v.status === "DRAFT" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm("Bạn có chắc muốn hủy phiếu này?")) {
                                cancelVoucher(v.id);
                              }
                            }}
                            className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                          >
                            Hủy
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Trước
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
