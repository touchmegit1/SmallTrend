import React from "react";
import { Save, CheckCircle, Loader2, Trash2 } from "lucide-react";
import { PO_STATUS } from "../../../utils/purchaseOrder";

export default function ActionButtons({
  status,
  saving,
  isEditMode,
  onSaveDraft,
  onConfirm,
  onDelete,
}) {
  const isDraft = status === PO_STATUS.DRAFT;

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
            Lưu phiếu tạm
          </button>
        )}

        {/* Confirm */}
        {isDraft && (
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
            Xác nhận & Nhập kho
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
            Xóa phiếu nháp
          </button>
        )}

        {!isDraft && (
          <div className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-slate-400 rounded-xl shadow-sm">
            <CheckCircle size={18} />
            Phiếu đã xử lý xong
          </div>
        )}
      </div>
    </div>
  );
}
