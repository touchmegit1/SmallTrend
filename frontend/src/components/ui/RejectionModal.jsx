import React, { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { useToast } from "../ui/Toast";

export default function RejectionModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) {
  const [reason, setReason] = useState("");
  const toast = useToast();

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast.warning("Vui lòng nhập lý do từ chối");
      return;
    }
    onSubmit(reason);
    setReason("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-slate-900">
              Từ chối phiếu nhập
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Lý do từ chối <span className="text-red-600">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ví dụ: Sai đơn giá mặt hàng Nescafe, Ghi thiếu mã lô..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            rows={4}
            disabled={isLoading}
          />
          <p className="text-xs text-slate-500 mt-2">
            Nhân viên sẽ nhìn thấy lý do này khi mở phiếu để sửa lại
          </p>
        </div>

        <div className="flex gap-3 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? "Đang xử lý..." : "Xác nhận từ chối"}
          </button>
        </div>
      </div>
    </div>
  );
}
