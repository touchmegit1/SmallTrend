import React from "react";
import { ArrowLeft, Clock, User } from "lucide-react";
import { PO_STATUS_CONFIG } from "../../../utils/purchaseOrder";

export default function PurchaseHeader({ order, onBack }) {
  const statusCfg = PO_STATUS_CONFIG[order.status] || PO_STATUS_CONFIG.DRAFT;

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          title="Quay lại"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">Nhập hàng</h1>
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
          <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Clock size={12} />
              {new Date(order.created_at).toLocaleString("vi-VN")}
            </span>
            <span className="inline-flex items-center gap-1">
              <User size={12} />
              Người tạo: Admin
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
