import React, { useState } from "react";
import {
  Save,
  CheckCircle,
  XCircle,
  Loader2,
  Send,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { IC_STATUS } from "../../../utils/inventoryCount";

export default function CountActionButtons({
  status,
  saving,
  onSaveDraft,
  onConfirm,
  onSubmitForApproval,
  onApprove,
  onReject,
  onCancel,
}) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const isTerminal =
    status === IC_STATUS.CONFIRMED || status === IC_STATUS.CANCELLED;

  // ─── Terminal state ────────────────────────────
  if (isTerminal) {
    return (
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <p className="text-xs text-center text-slate-400 font-medium">
          Phiên kiểm kho đã{" "}
          {status === IC_STATUS.CONFIRMED ? "xác nhận" : "bị hủy"}.
        </p>
      </div>
    );
  }

  // ─── Rejected state (can re-edit) ──────────────
  if (status === IC_STATUS.REJECTED) {
    return (
      <div className="p-4 border-t border-slate-200 bg-white shrink-0">
        <div className="flex flex-col gap-2">
          <div className="text-center mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 rounded-full border border-red-200">
              <ThumbsDown size={12} />
              Phiếu đã bị từ chối
            </span>
          </div>
          <p className="text-xs text-center text-slate-500">
            Phiếu đã bị từ chối. Xem lý do ở phần trên.
          </p>
        </div>
      </div>
    );
  }

  // ─── Pending state (for Manager to approve/reject) ──
  if (status === IC_STATUS.PENDING) {
    return (
      <div className="p-4 border-t border-slate-200 bg-white shrink-0">
        <div className="flex flex-col gap-2">
          <div className="text-center mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-yellow-700 bg-yellow-50 rounded-full border border-yellow-200">
              <Send size={12} />
              Đang chờ Manager duyệt
            </span>
          </div>

          {/* Approve */}
          <button
            onClick={onApprove}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ThumbsUp size={16} />
            )}
            Duyệt phiếu kiểm kho
          </button>

          {/* Reject */}
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition disabled:opacity-50 border border-red-200"
          >
            <ThumbsDown size={16} />
            Từ chối
          </button>
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-fadeIn">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Từ chối phiếu kiểm kho
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Vui lòng nhập lý do từ chối phiếu kiểm kho này.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                placeholder="Nhập lý do từ chối..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none bg-slate-50 mb-4"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    if (onReject) onReject(rejectionReason);
                    setShowRejectModal(false);
                    setRejectionReason("");
                  }}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Xác nhận từ chối
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Draft / Counting state ────────────────────
  return (
    <div className="p-4 border-t border-slate-200 bg-white shrink-0">
      <div className="flex flex-col gap-2">
        {/* Submit for Approval */}
        <button
          onClick={onSubmitForApproval}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
          Gửi duyệt cho Manager
        </button>

        {/* Confirm directly (optional, for admin/manager) */}
        <button
          onClick={onConfirm}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <CheckCircle size={16} />
          )}
          Xác nhận & Cập nhật tồn kho
        </button>

        {/* Save Draft */}
        <button
          onClick={onSaveDraft}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition disabled:opacity-50 border border-indigo-200"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Lưu phiếu tạm
        </button>

        {/* Cancel */}
        <button
          onClick={onCancel}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <XCircle size={14} />
          Hủy phiên kiểm kho
        </button>
      </div>
    </div>
  );
}
