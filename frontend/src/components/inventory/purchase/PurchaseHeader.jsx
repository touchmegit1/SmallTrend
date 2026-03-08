import React from "react";
import { ArrowLeft, Clock, User } from "lucide-react";
import { PO_STATUS_CONFIG } from "../../../utils/purchaseOrder";

export default function PurchaseHeader({ order, onBack }) {
  const statusCfg = PO_STATUS_CONFIG[order.status] || PO_STATUS_CONFIG.DRAFT;

  return (
    <div className="bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between shrink-0">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-500"
          title="Quay lại"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Nhập hàng
            </h1>
            <span className="font-mono text-sm font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
              {order.po_number || "—"}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${statusCfg.bg} ${statusCfg.text}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}
              ></span>
              {statusCfg.label}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-0.5">
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock size={11} />
              {order.created_at
                ? new Date(order.created_at).toLocaleDateString("vi-VN")
                : "---"}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <User size={11} />
              Người tạo: {order.created_by || "Admin"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
