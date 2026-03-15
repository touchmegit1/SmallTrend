import {
  Save,
  CheckCircle,
  Loader2,
  Trash2,
  ClipboardCheck,
  PackageCheck,
  Eye,
  ShieldCheck,
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
  layout = "panel",
  footerHint = "",
}) {
  const { user } = useAuth();
  const userRole = (user?.role || "").toUpperCase();
  const isManagerOrAdmin = [
    "MANAGER",
    "ROLE_MANAGER",
    "ADMIN",
    "ROLE_ADMIN",
  ].includes(userRole);
  const isInventoryStaff = ["INVENTORY_STAFF", "ROLE_INVENTORY_STAFF"].includes(
    userRole,
  );
  const canCheckAndReceive = isManagerOrAdmin || isInventoryStaff;

  const isDraft = status === PO_STATUS.DRAFT || status === PO_STATUS.REJECTED;
  const isPending = status === PO_STATUS.PENDING;
  const isConfirmed = status === PO_STATUS.CONFIRMED;
  const isChecking = status === PO_STATUS.CHECKING;
  const isProcessed =
    status === PO_STATUS.RECEIVED || status === PO_STATUS.CANCELLED;

  const renderActionGroup = () => {
    if (isDraft) {
      return (
        <>
          <button
            onClick={onSaveDraft}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Lưu nháp
          </button>
          <button
            onClick={onSubmitForApproval}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCircle size={16} />
            )}
            Gửi yêu cầu duyệt
          </button>
          {isEditMode && (
            <button
              onClick={onDelete}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Trash2 size={15} />
              Xóa
            </button>
          )}
        </>
      );
    }

    if (isPending && isManagerOrAdmin) {
      return (
        <>
          <button
            onClick={onReject}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Eye size={16} />
            Từ chối
          </button>
          <button
            onClick={onConfirm}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ShieldCheck size={16} />
            )}
            Duyệt phiếu nhập
          </button>
        </>
      );
    }

    if (isConfirmed && canCheckAndReceive) {
      return (
        <button
          onClick={onStartChecking}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ClipboardCheck size={16} />
          )}
          Bắt đầu kiểm kê
        </button>
      );
    }

    if (isChecking && canCheckAndReceive) {
      return (
        <button
          onClick={onReceiveGoods}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-2xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <PackageCheck size={16} />
          )}
          Xác nhận nhập kho
        </button>
      );
    }

    if (isProcessed) {
      return (
        <div className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-100 rounded-lg border border-slate-200">
          <CheckCircle size={15} />
          Phiếu đã xử lý xong
        </div>
      );
    }

    return null;
  };

  if (layout === "inline") {
    return (
      <div className="border-t border-slate-200 bg-white px-5 py-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-slate-400">{footerHint}</p>
          <div className="flex items-center gap-2.5 flex-wrap">{renderActionGroup()}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-slate-200 px-4 py-3 bg-slate-50/60">
      <div className="flex flex-col gap-2">{renderActionGroup()}</div>
    </div>
  );
}
