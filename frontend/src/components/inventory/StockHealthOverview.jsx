import React from "react";
import {
  STOCK_STATUS,
  STOCK_STATUS_CONFIG,
  formatNumber,
} from "../../utils/inventory";

export default function StockHealthOverview({ products }) {
  const statusGroups = Object.values(STOCK_STATUS).map((status) => {
    const items = products.filter((p) => p.stockStatus === status);
    const cfg = STOCK_STATUS_CONFIG[status];
    return { status, items, cfg, count: items.length };
  });

  const total = products.length || 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900">Sức khỏe tồn kho</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Phân bố trạng thái theo mức tối thiểu từng sản phẩm
        </p>
      </div>

      {/* ─── Health Bar ──────────────────────────────────────── */}
      <div className="px-5 py-4">
        <div className="flex rounded-full overflow-hidden h-3 bg-slate-100">
          {statusGroups.map(({ status, count, cfg }) =>
            count > 0 ? (
              <div
                key={status}
                className={`${cfg.dot} transition-all duration-500`}
                style={{ width: `${(count / total) * 100}%` }}
                title={`${cfg.label}: ${count} sản phẩm`}
              ></div>
            ) : null,
          )}
        </div>
      </div>

      {/* ─── Legend ───────────────────────────────────────────── */}
      <div className="px-5 pb-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
        {statusGroups.map(({ status, count, cfg }) => (
          <div
            key={status}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${cfg.bg} ${cfg.border} border`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${cfg.dot} shrink-0`}
            ></span>
            <div className="min-w-0">
              <p className={`text-xs font-semibold ${cfg.text}`}>{count}</p>
              <p className="text-[10px] text-slate-500 truncate">{cfg.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Critical Items List ─────────────────────────────── */}
      {statusGroups
        .filter(
          (g) =>
            g.status === STOCK_STATUS.OUT_OF_STOCK ||
            g.status === STOCK_STATUS.CRITICAL,
        )
        .some((g) => g.count > 0) && (
        <div className="border-t border-slate-100">
          <div className="px-5 py-3 bg-red-50/50">
            <p className="text-xs font-semibold text-red-700 uppercase mb-2">
              ⚠ Cần nhập hàng ngay
            </p>
            <div className="space-y-1.5">
              {products
                .filter(
                  (p) =>
                    p.stockStatus === STOCK_STATUS.OUT_OF_STOCK ||
                    p.stockStatus === STOCK_STATUS.CRITICAL,
                )
                .map((p) => {
                  const cfg = STOCK_STATUS_CONFIG[p.stockStatus];
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between text-xs bg-white rounded-lg px-3 py-2 border border-red-100"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.badgeBg} ${cfg.text}`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${cfg.dot}`}
                          ></span>
                          {cfg.label}
                        </span>
                        <span className="font-medium text-slate-900 truncate">
                          {p.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-slate-400 font-mono">
                          {p.sku}
                        </span>
                        <span className="font-bold text-red-600">
                          {formatNumber(p.stock_quantity || 0)} /{" "}
                          {formatNumber(p.min_stock || 50)}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
