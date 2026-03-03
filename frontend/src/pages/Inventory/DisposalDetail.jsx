import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDisposalVoucher } from "../../hooks/useDisposalVoucher";
import {
  DV_STATUS,
  DV_STATUS_CONFIG,
  REASON_TYPE,
  REASON_CONFIG,
} from "../../utils/disposalVoucher";
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  formatNumber,
  BATCH_STATUS_CONFIG,
  classifyBatch,
} from "../../utils/inventory";

export default function DisposalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    voucher,
    items,
    locations,
    expiredBatches,
    loading,
    saving,
    error,
    isEditable,
    totals,
    updateVoucher,
    addItem,
    removeItem,
    updateItemQty,
    saveDraft,
    confirmVoucher,
    cancelVoucher,
  } = useDisposalVoucher(id || null);

  const [batchSearch, setBatchSearch] = useState("");

  // Filter expired batches not already added and by search
  const availableBatches = useMemo(() => {
    const addedBatchIds = new Set(items.map((i) => i.batch_id));
    let result = expiredBatches.filter((b) => !addedBatchIds.has(b.id));
    if (batchSearch) {
      const term = batchSearch.toLowerCase();
      result = result.filter(
        (b) =>
          b.product_name.toLowerCase().includes(term) ||
          b.batch_code.toLowerCase().includes(term),
      );
    }
    return result;
  }, [expiredBatches, items, batchSearch]);

  const handleSaveDraft = async () => {
    try {
      const saved = await saveDraft();
      alert("Đã lưu nháp thành công!");
      if (!id) navigate(`/inventory/disposal/${saved.id}`, { replace: true });
    } catch {
      alert("Lỗi khi lưu nháp!");
    }
  };

  const handleConfirm = async () => {
    const success = await confirmVoucher();
    if (success) {
      alert("Đã xác nhận phiếu xử lý! Tồn kho đã được trừ.");
    }
  };

  const handleCancel = async () => {
    const success = await cancelVoucher();
    if (success) navigate("/inventory/disposal");
  };

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
          Lỗi: {error}
        </div>
      </div>
    );
  }

  const statusCfg = DV_STATUS_CONFIG[voucher.status] || DV_STATUS_CONFIG.DRAFT;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/inventory/disposal")}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-600"
          >
            ← Quay lại
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {id ? "Chi tiết phiếu xử lý" : "Tạo phiếu xử lý"}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusCfg.badgeBg} ${statusCfg.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1 font-mono">
              {voucher.code || "Đang tạo..."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Expired batches picker (only in edit mode) */}
          {isEditable && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-red-50">
                <h2 className="text-sm font-semibold text-red-800">
                  Lô hàng hết hạn có thể xử lý ({expiredBatches.length} lô)
                </h2>
              </div>

              {expiredBatches.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 text-sm">
                    Không có lô hàng hết hạn
                  </p>
                </div>
              ) : (
                <>
                  <div className="px-4 pt-3">
                    <input
                      type="text"
                      value={batchSearch}
                      onChange={(e) => setBatchSearch(e.target.value)}
                      placeholder="Tìm theo tên sản phẩm hoặc mã lô..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 text-xs text-gray-500 uppercase sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left">Sản phẩm</th>
                          <th className="px-4 py-2 text-left">Mã lô</th>
                          <th className="px-4 py-2 text-right">Tồn kho</th>
                          <th className="px-4 py-2 text-left">Hạn SD</th>
                          <th className="px-4 py-2 text-center">Thêm</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {availableBatches.map((b) => {
                          const batchStatus = classifyBatch(b.expiry_date);
                          const bCfg = BATCH_STATUS_CONFIG[batchStatus];
                          return (
                            <tr
                              key={b.id}
                              className="hover:bg-red-50/50 transition-colors"
                            >
                              <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                {b.product_name}
                              </td>
                              <td className="px-4 py-2 text-sm font-mono text-gray-600">
                                {b.batch_code}
                              </td>
                              <td className="px-4 py-2 text-sm text-right font-medium">
                                {formatNumber(b.quantity)} {b.unit}
                              </td>
                              <td className="px-4 py-2">
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${bCfg.badgeBg} ${bCfg.text}`}
                                >
                                  {formatDate(b.expiry_date)}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-center">
                                <button
                                  onClick={() => addItem(b)}
                                  className="px-3 py-1 bg-red-600 text-white rounded-md text-xs font-medium hover:bg-red-700 transition-colors"
                                >
                                  Thêm
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {availableBatches.length === 0 &&
                          expiredBatches.length > 0 && (
                            <tr>
                              <td
                                colSpan="5"
                                className="px-4 py-6 text-center text-sm text-gray-500"
                              >
                                Tất cả lô đã được thêm vào phiếu
                              </td>
                            </tr>
                          )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Items in voucher */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">
                Danh sách sản phẩm xử lý ({items.length})
              </h2>
            </div>

            {items.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-gray-500 text-sm">Chưa có sản phẩm nào</p>
                {isEditable && (
                  <p className="text-gray-400 text-xs mt-1">
                    Thêm sản phẩm hết hạn từ danh sách phía trên
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Sản phẩm</th>
                      <th className="px-4 py-3 text-left">Mã lô</th>
                      <th className="px-4 py-3 text-left">Hạn SD</th>
                      <th className="px-4 py-3 text-right">SL xử lý</th>
                      <th className="px-4 py-3 text-right">Đơn giá</th>
                      <th className="px-4 py-3 text-right">Thành tiền</th>
                      {isEditable && (
                        <th className="px-4 py-3 text-center">Xóa</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item, idx) => (
                      <tr
                        key={item.batch_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {item.product_name}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-600">
                          {item.batch_code}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                            {formatDate(item.expiry_date)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isEditable ? (
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItemQty(item.batch_id, e.target.value)
                              }
                              className="w-20 text-right px-2 py-1 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-red-500 outline-none"
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {formatNumber(item.quantity)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600">
                          {formatCurrency(item.unit_cost)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                          {formatCurrency(item.total_cost)}
                        </td>
                        {isEditable && (
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => removeItem(item.batch_id)}
                              className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                              title="Xóa"
                            >
                              Xóa
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-semibold">
                    <tr>
                      <td
                        colSpan={isEditable ? 4 : 4}
                        className="px-4 py-3 text-sm text-gray-700 text-right"
                      >
                        Tổng cộng
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">
                        {formatNumber(totals.totalQty)}
                      </td>
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3 text-sm text-right text-red-600">
                        {formatCurrency(totals.totalValue)}
                      </td>
                      {isEditable && <td />}
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right: Info Panel */}
        <div className="space-y-6">
          {/* Voucher Info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800">
              Thông tin phiếu
            </h3>

            {/* Code */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Mã phiếu
              </label>
              <p className="font-mono text-sm font-semibold text-red-600">
                {voucher.code}
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Kho
              </label>
              {isEditable ? (
                <select
                  value={voucher.location_id || ""}
                  onChange={(e) =>
                    updateVoucher("location_id", Number(e.target.value) || null)
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="">-- Chọn kho --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.location_name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-gray-700">
                  {locations.find((l) => l.id === voucher.location_id)
                    ?.location_name || "—"}
                </p>
              )}
            </div>

            {/* Reason type */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Lý do xử lý
              </label>
              {isEditable ? (
                <select
                  value={voucher.reason_type || REASON_TYPE.EXPIRED}
                  onChange={(e) => updateVoucher("reason_type", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                >
                  {Object.entries(REASON_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-gray-700">
                  {REASON_CONFIG[voucher.reason_type]?.label ||
                    voucher.reason_type}
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Ghi chú
              </label>
              {isEditable ? (
                <textarea
                  value={voucher.notes}
                  onChange={(e) => updateVoucher("notes", e.target.value)}
                  rows={3}
                  placeholder="Ghi chú thêm..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
                />
              ) : (
                <p className="text-sm text-gray-700">{voucher.notes || "—"}</p>
              )}
            </div>

            {/* Timestamps */}
            <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Ngày tạo</span>
                <span>{formatDateTime(voucher.created_at)}</span>
              </div>
              {voucher.confirmed_at && (
                <div className="flex justify-between">
                  <span>Ngày xác nhận</span>
                  <span>{formatDateTime(voucher.confirmed_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-red-50 rounded-xl border border-red-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-red-800">
              Tóm tắt xử lý
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-red-700">Số sản phẩm</span>
                <span className="font-semibold text-red-900">
                  {totals.totalItems}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-700">Tổng số lượng</span>
                <span className="font-semibold text-red-900">
                  {formatNumber(totals.totalQty)}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-red-200">
                <span className="text-red-700 font-medium">
                  Tổng giá trị thiệt hại
                </span>
                <span className="font-bold text-red-900 text-lg">
                  {formatCurrency(totals.totalValue)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {isEditable && (
            <div className="space-y-3">
              <button
                onClick={handleSaveDraft}
                disabled={saving}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : "Lưu nháp"}
              </button>
              <button
                onClick={handleConfirm}
                disabled={saving || items.length === 0}
                className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Đang xử lý..." : "Xác nhận & Trừ kho"}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="w-full px-4 py-2.5 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm disabled:opacity-50"
              >
                Hủy phiếu
              </button>
            </div>
          )}

          {voucher.status === DV_STATUS.CONFIRMED && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-sm text-emerald-800 font-medium">
                Phiếu đã được xác nhận. Tồn kho đã trừ.
              </p>
            </div>
          )}

          {voucher.status === DV_STATUS.CANCELLED && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-sm text-gray-600 font-medium">
                Phiếu đã bị hủy.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
