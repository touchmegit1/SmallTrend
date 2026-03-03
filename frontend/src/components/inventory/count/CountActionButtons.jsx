import React from "react";
import { Save, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { IC_STATUS } from "../../../utils/inventoryCount";

export default function CountActionButtons({
  status,
  saving,
  onSaveDraft,
  onConfirm,
  onCancel,
}) {
  const isTerminal =
    status === IC_STATUS.CONFIRMED || status === IC_STATUS.CANCELLED;

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

  return (
    <div className="p-4 border-t border-slate-200 bg-white shrink-0">
      <div className="flex flex-col gap-2">
        {/* Confirm */}
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
