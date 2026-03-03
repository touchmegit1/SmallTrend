import React from "react";
import { ArrowLeft, Clock, User } from "lucide-react";
import { IC_STATUS_CONFIG } from "../../../utils/inventoryCount";

export default function InventoryCountHeader({ session, onBack }) {
  const statusCfg = IC_STATUS_CONFIG[session?.status] || IC_STATUS_CONFIG.DRAFT;

  return (
    <div className="bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between shrink-0">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-500"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              {session?.code || "Kiểm kho"}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
              {statusCfg.label}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-0.5">
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock size={11} />
              {session?.created_at
                ? new Date(session.created_at).toLocaleDateString("vi-VN")
                : "---"}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <User size={11} />
              Người tạo: {session?.created_by || "---"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
