import React from "react";
import { useNavigate } from "react-router-dom";
import { useDisposalList } from "../../hooks/useDisposalList";
import {
  DV_STATUS,
  DV_STATUS_CONFIG,
  REASON_CONFIG,
} from "../../utils/disposalVoucher";
import { formatDateTime, formatCurrency } from "../../utils/inventory";

export default function DisposalList() {
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
  } = useDisposalList();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          Lỗi: {error}
        </div>
      </div>
    );
  }

  const statusTabs = [
    { key: "ALL", label: "Tất cả" },
    { key: DV_STATUS.DRAFT, label: "Nháp" },
    { key: DV_STATUS.CONFIRMED, label: "Đã xác nhận" },
    { key: DV_STATUS.CANCELLED, label: "Đã hủy" },
  ];

  const SortIcon = ({ field }) => (
    <span className="ml-1 text-xs">
      {sortField === field ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
    </span>
  );

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
                  ? "bg-indigo-100 text-indigo-700"
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
                  onClick={() => toggleSort("created_at")}
                >
                  Ngày tạo <SortIcon field="created_at" />
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
                  <td colSpan="9" className="px-4 py-12 text-center">
                    <p className="text-gray-500 text-sm">
                      Chưa có phiếu xử lý nào
                    </p>
                  </td>
                </tr>
              ) : (
                vouchers.map((v) => {
                  const statusCfg =
                    DV_STATUS_CONFIG[v.status] || DV_STATUS_CONFIG.DRAFT;
                  const reasonCfg = REASON_CONFIG[v.reason_type] || {
                    label: v.reason_type,
                  };

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
                      <td className="px-4 py-3 text-sm">{reasonCfg.label}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {locationMap[v.location_id] || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">
                        {v.total_items || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">
                        {v.total_quantity || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                        {formatCurrency(v.total_value || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDateTime(v.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.badgeBg} ${statusCfg.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}
                          />
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {v.status === DV_STATUS.DRAFT && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelVoucher(v.id);
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-500">
              Hiển thị {vouchers.length} / {allVouchers.length} phiếu
            </p>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded text-sm ${
                    page === p
                      ? "bg-red-600 text-white"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
