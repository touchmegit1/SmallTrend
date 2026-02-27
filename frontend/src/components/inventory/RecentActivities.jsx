import React from "react";
import { ArrowDownRight, ArrowUpRight, Repeat, Settings } from "lucide-react";
import {
  formatDateTime,
  formatNumber,
  MOVEMENT_CONFIG,
} from "../../utils/inventory";

const MOVEMENT_ICONS = {
  IN: ArrowDownRight,
  OUT: ArrowUpRight,
  TRANSFER: Repeat,
  ADJUSTMENT: Settings,
  ADJUST: Settings,
};

export default function RecentActivities({ stockMovements }) {
  const recentMovements = [...stockMovements]
    .sort(
      (a, b) =>
        new Date(b.created_at || b.createdAt) -
        new Date(a.created_at || a.createdAt),
    )
    .slice(0, 8);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">
          Hoạt động gần đây
        </h2>
        <span className="text-xs text-slate-400">
          {stockMovements.length} giao dịch
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {recentMovements.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-400 text-sm">
            Chưa có hoạt động nào
          </div>
        ) : (
          recentMovements.map((movement, index) => {
            const cfg =
              MOVEMENT_CONFIG[movement.type] || MOVEMENT_CONFIG.TRANSFER;
            const Icon = MOVEMENT_ICONS[movement.type] || Repeat;
            const refCode =
              movement.reference_code || movement.referenceCode || "";
            const productName =
              movement.product_name || movement.productName || "";
            const createdAt = movement.created_at || movement.createdAt;
            return (
              <div
                key={`${movement.type}-${refCode}-${index}`}
                className="px-5 py-3 flex items-center gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${cfg.bg}`}>
                  <Icon size={16} className={cfg.text} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}
                    >
                      {cfg.label}
                    </span>
                    {refCode && (
                      <span className="text-xs text-slate-400 font-mono">
                        {refCode}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {productName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {movement.type === "OUT" ? "-" : "+"}
                    {formatNumber(movement.quantity)}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {formatDateTime(createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
