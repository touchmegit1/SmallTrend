import React, { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import { DIFFERENCE_REASONS } from "../../../utils/inventoryCount";

export default function DifferenceReasonModal({ item, onSave, onClose }) {
  const [reason, setReason] = useState(item?.reason || "");
  const [customReason, setCustomReason] = useState("");

  useEffect(() => {
    if (item) {
      const preset = DIFFERENCE_REASONS.find((r) => r.value === item.reason);
      if (preset) {
        setReason(item.reason);
        setCustomReason("");
      } else if (item.reason) {
        setReason("OTHER");
        setCustomReason(item.reason);
      } else {
        setReason("");
        setCustomReason("");
      }
    }
  }, [item]);

  if (!item) return null;

  const diff = item.difference_quantity;
  const isShortage = diff < 0;

  const handleSave = () => {
    const finalReason =
      reason === "OTHER" ? customReason.trim() || "Lý do khác" : reason;
    onSave(item.product_id, finalReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div
          className={`px-5 py-4 flex items-center justify-between ${
            isShortage ? "bg-red-50" : "bg-blue-50"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle
              size={18}
              className={isShortage ? "text-red-500" : "text-blue-500"}
            />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Nhập lý do chênh lệch
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {item.name} ({item.sku})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/60 transition"
          >
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        {/* Difference summary */}
        <div className="px-5 py-3 border-b border-slate-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Tồn kho hệ thống</span>
            <span className="font-mono font-medium text-slate-700">
              {item.system_quantity}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-slate-500">Số lượng thực tế</span>
            <span className="font-mono font-medium text-slate-700">
              {item.actual_quantity}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-slate-500">Chênh lệch</span>
            <span
              className={`font-mono font-bold ${
                isShortage ? "text-red-600" : "text-blue-600"
              }`}
            >
              {diff > 0 ? `+${diff}` : diff}
            </span>
          </div>
        </div>

        {/* Reason selection */}
        <div className="px-5 py-4 space-y-2 max-h-56 overflow-y-auto">
          {DIFFERENCE_REASONS.map((r) => (
            <label
              key={r.value}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition ${
                reason === r.value
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-100 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="reason"
                value={r.value}
                checked={reason === r.value}
                onChange={() => setReason(r.value)}
                className="w-3.5 h-3.5 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700">{r.label}</span>
            </label>
          ))}
        </div>

        {/* Custom reason input */}
        {reason === "OTHER" && (
          <div className="px-5 pb-3">
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Nhập lý do cụ thể..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              autoFocus
            />
          </div>
        )}

        {/* Actions */}
        <div className="px-5 py-3 border-t border-slate-100 flex gap-2 justify-end bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={!reason}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Xác nhận lý do
          </button>
        </div>
      </div>
    </div>
  );
}
