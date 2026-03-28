import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { STOCK_STATUS_CONFIG } from "../../../utils/inventory";

// ─── Màu sắc bar ─────────────────────────────────────────────────
const HIGH_COLORS = [
  { from: "#6366f1", to: "#818cf8" },
  { from: "#8b5cf6", to: "#a78bfa" },
  { from: "#3b82f6", to: "#60a5fa" },
  { from: "#06b6d4", to: "#22d3ee" },
  { from: "#10b981", to: "#34d399" },
  { from: "#0ea5e9", to: "#38bdf8" },
  { from: "#14b8a6", to: "#2dd4bf" },
  { from: "#6366f1", to: "#a5b4fc" },
  { from: "#8b5cf6", to: "#c4b5fd" },
  { from: "#22d3ee", to: "#67e8f9" },
];

const LOW_COLORS = [
  { from: "#ef4444", to: "#f87171" },
  { from: "#f97316", to: "#fb923c" },
  { from: "#f59e0b", to: "#fbbf24" },
  { from: "#dc2626", to: "#ef4444" },
  { from: "#ea580c", to: "#f97316" },
  { from: "#d97706", to: "#f59e0b" },
  { from: "#e11d48", to: "#f43f5e" },
  { from: "#c2410c", to: "#ea580c" },
  { from: "#b45309", to: "#d97706" },
  { from: "#be185d", to: "#db2777" },
];

// ─── Single Chart Panel ───────────────────────────────────────────
function StockPanel({
  title,
  subtitle,
  icon: Icon,
  iconGradient,
  data,
  colors,
  emptyMsg,
  maxStock,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shadow-sm"
          style={{ background: iconGradient }}
        >
          <Icon size={18} className="text-white" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>

      {/* Bars */}
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-10">
          <p className="text-sm text-slate-400">{emptyMsg}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {data.map((product, index) => {
            const qty = product.stock_quantity ?? 0;
            const pct = maxStock > 0 ? (qty / maxStock) * 100 : 0;
            const color = colors[index % colors.length];
            const cfg = STOCK_STATUS_CONFIG[product.stockStatus];

            return (
              <div key={product.id ?? index} className="group">
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-slate-500">
                      {index + 1}
                    </span>
                  </div>

                  {/* Name */}
                  <div className="w-32 flex-shrink-0">
                    <p
                      className="text-sm font-medium text-slate-700 truncate"
                      title={product.name}
                    >
                      {product.name}
                    </p>
                  </div>

                  {/* Bar */}
                  <div className="flex-1 h-7 bg-slate-50 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full rounded-lg transition-all duration-700 ease-out relative overflow-hidden"
                      style={{
                        width: `${Math.max(pct, 4)}%`,
                        background: `linear-gradient(90deg, ${color.from}, ${color.to})`,
                      }}
                    >
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Value + badge */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-bold text-slate-800 w-10 text-right">
                      {qty.toLocaleString("vi-VN")}
                    </span>
                    {cfg && (
                      <span
                        className={`hidden sm:inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${cfg.badgeBg} ${cfg.text}`}
                      >
                        {cfg.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-400">Đơn vị: số lượng tồn kho</p>
        <p className="text-xs text-slate-400">{data.length} biến thể</p>
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────
function StockByProductChart({ products }) {
  const { highStock, lowStock, maxHigh, maxLow } = useMemo(() => {
    if (!products || products.length === 0)
      return { highStock: [], lowStock: [], maxHigh: 1, maxLow: 1 };

    const sorted = [...products].sort(
      (a, b) => (a.stock_quantity ?? 0) - (b.stock_quantity ?? 0),
    );

    // Top 10 thấp nhất (tăng dần)
    const low = sorted.slice(0, 10);

    // Top 10 cao nhất (giảm dần)
    const high = sorted.slice(-10).reverse();

    return {
      highStock: high,
      lowStock: low,
      maxHigh: Math.max(...high.map((p) => p.stock_quantity ?? 0), 1),
      maxLow: Math.max(...low.map((p) => p.stock_quantity ?? 0), 1),
    };
  }, [products]);

  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-indigo-600" />
          <h2 className="text-lg font-semibold text-slate-900">
            Tồn kho theo biến thể
          </h2>
        </div>
        <p className="text-sm text-slate-500 text-center py-8">
          Không có dữ liệu biến thể
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Biểu đồ 1: Tồn kho cao */}
      <StockPanel
        title="Tồn kho cao"
        subtitle={`Top ${highStock.length} biến thể tồn kho dồi dào nhất`}
        icon={TrendingUp}
        iconGradient="linear-gradient(135deg, #6366f1, #8b5cf6)"
        data={highStock}
        colors={HIGH_COLORS}
        maxStock={maxHigh}
        emptyMsg="Không có biến thể tồn kho cao"
      />

      {/* Biểu đồ 2: Tồn kho thấp */}
      <StockPanel
        title="Tồn kho thấp"
        subtitle={`Top ${lowStock.length} biến thể cần nhập hàng sớm`}
        icon={TrendingDown}
        iconGradient="linear-gradient(135deg, #ef4444, #f97316)"
        data={lowStock}
        colors={LOW_COLORS}
        maxStock={maxLow}
        emptyMsg="Không có biến thể cần cảnh báo tồn kho"
      />
    </div>
  );
}

export default StockByProductChart;
