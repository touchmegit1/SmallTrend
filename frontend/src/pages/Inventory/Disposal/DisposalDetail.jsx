import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  Save,
  CheckCircle,
  Loader2,
  XCircle,
  ShieldCheck,
  Eye,
  Clock,
  Package,
  AlertTriangle,
} from "lucide-react";
import { useDisposalVoucher } from "../../../hooks/useDisposalVoucher";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../components/ui/Toast";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import RejectionModal from "../../../components/ui/RejectionModal";
import CustomSelect from "../../../components/common/CustomSelect";
import { DV_STATUS, DV_STATUS_CONFIG } from "../../../utils/disposalVoucher";
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  formatNumber,
  BATCH_STATUS_CONFIG,
  classifyBatch,
} from "../../../utils/inventory";

export default function DisposalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "warning",
  });

  const openConfirm = (title, message, onConfirm, variant = "warning") => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: async () => {
        await onConfirm();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
      variant,
    });
  };

  const {
    voucher,
    items,
    locations,
    expiredBatches,
    loadingBatches,
    loading,
    saving,
    error,
    isEditable,
    totals,
    updateVoucher,
    changeLocation,
    addItem,
    removeItem,
    updateItemQty,
    submitVoucher,
    approveVoucher,
    rejectVoucher,
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

  // ─── Role checks (matching purchase order pattern) ──────
  const userRole = (user?.role || "").toUpperCase();
  const isManagerOrAdmin = [
    "MANAGER",
    "ROLE_MANAGER",
    "ADMIN",
    "ROLE_ADMIN",
  ].includes(userRole);

  // ─── Handlers ───────────────────────────────────────────
  const handleSubmit = async () => {
    const result = await submitVoucher();
    if (result) {
      toast.success("Đã gửi phiếu đi chờ duyệt!");
      if (!id) navigate(`/inventory/disposal/${result.id || voucher.id}`, { replace: true });
    }
  };

  const handleApprove = async () => {
    const success = await approveVoucher();
    if (success) {
      toast.success("Đã duyệt phiếu xử lý! Tồn kho đã được trừ.");
    }
  };

  const handleRejectClick = () => {
    setShowRejectionModal(true);
  };

  const handleRejectSubmit = async (reason) => {
    const result = await rejectVoucher(reason);
    if (result) {
      toast.success("Đã từ chối phiếu xử lý!");
      setShowRejectionModal(false);
    }
  };

  // ─── Loading state (matching purchase order pattern) ────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-slate-100"></div>
            <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin absolute inset-0"></div>
          </div>
          <p className="text-sm text-slate-500 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  // ─── Error state (matching purchase order pattern) ──────
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-2">Lỗi tải dữ liệu</p>
          <p className="text-sm text-slate-500 mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const statusCfg = DV_STATUS_CONFIG[voucher.status] || DV_STATUS_CONFIG.DRAFT;
  const isPending = voucher.status === DV_STATUS.PENDING;
  const isConfirmed = voucher.status === DV_STATUS.CONFIRMED;
  const isRejected = voucher.status === DV_STATUS.REJECTED;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* ─── Header (matching purchase order pattern) ─────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/inventory/disposal")}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-500"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                {id ? "Chi tiết phiếu xử lý" : "Tạo phiếu xử lý"}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${statusCfg.badgeBg} ${statusCfg.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              {voucher.code || "Đang tạo..."}
            </p>
          </div>
        </div>

        {/* Info strip */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {voucher.created_at
              ? new Date(voucher.created_at).toLocaleDateString("vi-VN")
              : "---"}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-xs font-medium text-slate-600">
            {items.length} sản phẩm
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Expired batches picker (only in edit mode) */}
          {isEditable && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-red-50">
                <h2 className="text-sm font-semibold text-red-800">
                  Lô hàng hết hạn có thể xử lý
                  {voucher.location_id ? ` (${expiredBatches.length} lô)` : ""}
                </h2>
              </div>

              {!voucher.location_id ? (
                <div className="p-8 text-center">
                  <p className="text-slate-500 text-sm">
                    Vui lòng chọn kho để xem danh sách lô hết hạn
                  </p>
                </div>
              ) : loadingBatches ? (
                <div className="p-8 flex flex-col items-center gap-2">
                  <Loader2 size={20} className="animate-spin text-red-500" />
                  <p className="text-slate-500 text-sm">
                    Đang tải lô hết hạn...
                  </p>
                </div>
              ) : expiredBatches.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-slate-500 text-sm">
                    Không có lô hàng hết hạn tại kho này
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
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 text-xs text-slate-500 uppercase sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left">Sản phẩm</th>
                          <th className="px-4 py-2 text-left">Mã lô</th>
                          <th className="px-4 py-2 text-right">Tồn kho</th>
                          <th className="px-4 py-2 text-left">Hạn SD</th>
                          <th className="px-4 py-2 text-center">Thêm</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {availableBatches.map((b) => {
                          const batchStatus = classifyBatch(b.expiry_date);
                          const bCfg = BATCH_STATUS_CONFIG[batchStatus];
                          return (
                            <tr
                              key={b.id}
                              className="hover:bg-red-50/50 transition-colors"
                            >
                              <td className="px-4 py-2 text-sm font-medium text-slate-900">
                                {b.product_name}
                              </td>
                              <td className="px-4 py-2 text-sm font-mono text-slate-600">
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
                                className="px-4 py-6 text-center text-sm text-slate-500"
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
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">
                Danh sách sản phẩm xử lý ({items.length})
              </h2>
            </div>

            {items.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-slate-500 text-sm">Chưa có sản phẩm nào</p>
                {isEditable && (
                  <p className="text-slate-400 text-xs mt-1">
                    Thêm sản phẩm hết hạn từ danh sách phía trên
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
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
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => (
                      <tr
                        key={item.batch_id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {item.product_name}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-slate-600">
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
                              className="w-20 text-right px-2 py-1 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-red-500 outline-none"
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {formatNumber(item.quantity)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-slate-600">
                          {formatCurrency(item.unit_cost)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-slate-900">
                          {formatCurrency(item.total_cost)}
                        </td>
                        {isEditable && (
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => removeItem(item.batch_id)}
                              className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                              title="Xóa"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-semibold">
                    <tr>
                      <td
                        colSpan={isEditable ? 4 : 4}
                        className="px-4 py-3 text-sm text-slate-700 text-right"
                      >
                        Tổng cộng
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-slate-900">
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

            {/* ─── Action Footer (matching purchase order pattern) ── */}
            <div className="px-6 py-4 border-t border-slate-200 bg-white">
              <div className="flex items-center justify-between gap-3">
                {/* Left: Status context message */}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  {isEditable && (
                    <>
                      <Package size={14} className="text-slate-400" />
                      <span>
                        {items.length > 0
                          ? `${items.length} sản phẩm · Tổng SL: ${totals.totalQty}`
                          : "Thêm sản phẩm để bắt đầu"}
                      </span>
                    </>
                  )}
                  {isPending && (
                    <>
                      <Eye size={14} className="text-amber-500" />
                      <span>Phiếu đang chờ duyệt</span>
                    </>
                  )}
                  {isConfirmed && (
                    <>
                      <ShieldCheck size={14} className="text-emerald-500" />
                      <span>Đã duyệt · Tồn kho đã bị trừ</span>
                    </>
                  )}
                  {isRejected && !isEditable && (
                    <>
                      <XCircle size={14} className="text-red-500" />
                      <span>Phiếu đã bị từ chối</span>
                    </>
                  )}
                </div>

                {/* Right: Action buttons */}
                <div className="flex items-center gap-2.5">
                  {/* DRAFT/REJECTED → Submit */}
                  {isEditable && (
                    <>

                      <button
                        onClick={() =>
                          openConfirm(
                            "Gửi duyệt phiếu xử lý",
                            "Gửi phiếu này cho quản lý để chờ duyệt?",
                            handleSubmit,
                            "info",
                          )
                        }
                        disabled={saving || items.length === 0}
                        className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-indigo-200"
                      >
                        {saving ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <CheckCircle size={15} />
                        )}
                        Gửi duyệt quản lý
                      </button>
                    </>
                  )}

                  {/* PENDING → Manager Approve / Reject */}
                  {isPending && isManagerOrAdmin && (
                    <>
                      <button
                        onClick={handleRejectClick}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <XCircle size={14} />
                        Từ chối
                      </button>
                      <button
                        onClick={() =>
                          openConfirm(
                            "Duyệt phiếu xử lý",
                            "Xác nhận duyệt phiếu xử lý? Tồn kho sẽ bị trừ ngay lập tức và không thể hoàn tác!",
                            handleApprove,
                            "warning",
                          )
                        }
                        disabled={saving}
                        className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-emerald-200"
                      >
                        {saving ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <CheckCircle size={15} />
                        )}
                        Duyệt & Trừ kho
                      </button>
                    </>
                  )}

                  {/* CONFIRMED → Done indicator */}
                  {isConfirmed && (
                    <div className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-400 bg-slate-100 rounded-xl">
                      <CheckCircle size={14} />
                      Đã xử lý xong
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Info Panel */}
        <div className="space-y-6">
          {/* Voucher Info */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">
              Thông tin phiếu
            </h3>

            {/* Code */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Mã phiếu
              </label>
              <p className="font-mono text-sm font-semibold text-red-600">
                {voucher.code}
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Kho <span className="text-red-500">*</span>
              </label>
              {isEditable ? (
                <CustomSelect
                  value={voucher.location_id || ""}
                  onChange={(val) => changeLocation(val ? Number(val) : null)}
                  options={[
                    { value: "", label: "-- Chọn kho --" },
                    ...locations.map((loc) => ({
                      value: loc.id,
                      label: loc.location_name,
                    })),
                  ]}
                />
              ) : (
                <p className="text-sm text-slate-700">
                  {locations.find((l) => l.id === voucher.location_id)
                    ?.location_name || "—"}
                </p>
              )}
            </div>

            {/* Reason type — fixed to EXPIRED */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Lý do xử lý
              </label>
              <p className="text-sm text-slate-700 font-medium">
                Hết hạn sử dụng
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Ghi chú
              </label>
              {isEditable ? (
                <textarea
                  value={voucher.notes}
                  onChange={(e) => updateVoucher("notes", e.target.value)}
                  rows={3}
                  placeholder="Ghi chú thêm..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
                />
              ) : (
                <p className="text-sm text-slate-700">{voucher.notes || "—"}</p>
              )}
            </div>

            {/* Timestamps */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
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

          {/* Status indicators */}
          {isConfirmed && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                <p className="text-sm text-emerald-800 font-medium">
                  Phiếu đã được xác nhận. Tồn kho đã bị trừ.
                </p>
              </div>
            </div>
          )}

          {isRejected && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-600" />
                <p className="text-sm text-red-600 font-medium">
                  Phiếu đã bị từ chối.
                </p>
              </div>
              {voucher.rejection_reason && (
                <div className="bg-white/60 p-3 rounded-lg border border-red-100">
                  <span className="block text-xs font-semibold text-red-800 mb-1">
                    Lý do:
                  </span>
                  <p className="text-sm text-red-700">
                    {voucher.rejection_reason}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Modals (matching purchase order pattern) ──────── */}
      <RejectionModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        onSubmit={handleRejectSubmit}
        isLoading={saving}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        variant={confirmModal.variant}
        loading={saving}
      />
    </div>
  );
}
