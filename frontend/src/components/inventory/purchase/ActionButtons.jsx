import React from "react";
import {
  Save,
  CheckCircle,
  Loader2,
  Trash2,
  ClipboardCheck,
  PackageCheck,
} from "lucide-react";
import { PO_STATUS } from "../../../utils/purchaseOrder";
import { useAuth } from "../../../context/AuthContext";

export default function ActionButtons({
  status,
  saving,
  isEditMode,
  onSaveDraft,
  onSubmitForApproval,
  onConfirm,
  onReject,
  onDelete,
  onStartChecking,
  onReceiveGoods,
}) {
  const { user } = useAuth();
  const userRole = user?.role || "";
  const isManagerOrAdmin = [
    "MANAGER",
    "ROLE_MANAGER",
    "ADMIN",
    "ROLE_ADMIN",
  ].includes(userRole);

  const isDraft = status === PO_STATUS.DRAFT || status === PO_STATUS.REJECTED;
  const isPending = status === PO_STATUS.PENDING;
  const isConfirmed = status === PO_STATUS.CONFIRMED;
  const isChecking = status === PO_STATUS.CHECKING;
  const isProcessed =
    status === PO_STATUS.RECEIVED || status === PO_STATUS.CANCELLED;

  return (
    <div className="border-t border-slate-200 px-5 py-4 bg-slate-50/50">
      <div className="flex flex-col gap-2.5">
        {/* Save Draft */}
        {isDraft && (
          <button
            onClick={onSaveDraft}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Lưu nháp
          </button>
        )}

        {/* Submit For Approval */}
        {isDraft && (
          <button
            onClick={onSubmitForApproval}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-indigo-200"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CheckCircle size={18} />
            )}
            Gửi yêu cầu duyệt
          </button>
        )}

        {/* Delete */}
        {isDraft && isEditMode && (
          <button
            onClick={onDelete}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Trash2 size={16} />
            Xóa hợp đồng nháp
          </button>
        )}

        {/* Manager Actions: Approve & Reject (PENDING → CONFIRMED) */}
        {isPending && isManagerOrAdmin && (
          <>
            <button
              onClick={onConfirm}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-emerald-200"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <CheckCircle size={18} />
              )}
              Duyệt hợp đồng
            </button>
            <button
              onClick={onReject}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Từ chối hợp đồng
            </button>
          </>
        )}

        {/* Warehouse Staff: Start Checking (CONFIRMED → CHECKING) */}
        {isConfirmed && (
          <button
            onClick={onStartChecking}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-purple-200"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ClipboardCheck size={18} />
            )}
            Bắt đầu kiểm kê
          </button>
        )}

        {/* Warehouse Staff: Confirm Receipt (CHECKING → RECEIVED) */}
        {isChecking && (
          <button
            onClick={onReceiveGoods}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-emerald-200"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <PackageCheck size={18} />
            )}
            Xác nhận nhập kho
          </button>
        )}

        {isProcessed && (
          <div className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-slate-400 rounded-xl shadow-sm">
            <CheckCircle size={18} />
            Phiếu đã xử lý xong
          </div>
        )}
      </div>
    </div>
  );
}
