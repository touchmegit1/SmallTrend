import { ArrowLeft, Clock, User } from "lucide-react";
import { PO_STATUS_CONFIG } from "../../../utils/purchaseOrder";

export default function PurchaseHeader({ order, onBack }) {
  const statusCfg = PO_STATUS_CONFIG[order.status] || PO_STATUS_CONFIG.DRAFT;

  return (
    <div className="bg-slate-50 border-b border-slate-200 px-8 py-5 shrink-0">
      <div className="max-w-[1600px]">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-white transition text-slate-500 border border-transparent hover:border-slate-200"
            title="Quay lại"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900">Nhập hàng</h1>
              <span className="font-mono text-base font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                {order.po_number || "—"}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full ${statusCfg.bg} ${statusCfg.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}></span>
                {statusCfg.label}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Clock size={13} />
                {order.created_at
                  ? new Date(order.created_at).toLocaleDateString("vi-VN")
                  : "---"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <User size={13} />
                Người tạo: {order.created_by || "Admin"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
