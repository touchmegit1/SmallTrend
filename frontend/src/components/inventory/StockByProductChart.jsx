import React, { useMemo } from "react";
import { BarChart3 } from "lucide-react";

function StockByProductChart({ products }) {
  // Sort by stock_quantity descending and take top 10
  const chartData = useMemo(() => {
    if (!products || products.length === 0) return [];
    return [...products]
      .sort((a, b) => (b.stock_quantity || 0) - (a.stock_quantity || 0))
      .slice(0, 10);
  }, [products]);

  const maxStock = useMemo(() => {
    if (chartData.length === 0) return 1;
    return Math.max(...chartData.map((p) => p.stock_quantity || 0), 1);
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-indigo-600" />
          <h2 className="text-lg font-semibold text-slate-900">
            Tồn kho theo sản phẩm
          </h2>
        </div>
        <p className="text-sm text-slate-500 text-center py-8">
          Không có dữ liệu sản phẩm
        </p>
      </div>
    );
  }

  // Color palette for gradient bars
  const barColors = [
    { from: "#6366f1", to: "#818cf8" }, // indigo
    { from: "#8b5cf6", to: "#a78bfa" }, // violet
    { from: "#3b82f6", to: "#60a5fa" }, // blue
    { from: "#06b6d4", to: "#22d3ee" }, // cyan
    { from: "#10b981", to: "#34d399" }, // emerald
    { from: "#f59e0b", to: "#fbbf24" }, // amber
    { from: "#ef4444", to: "#f87171" }, // red
    { from: "#ec4899", to: "#f472b6" }, // pink
    { from: "#14b8a6", to: "#2dd4bf" }, // teal
    { from: "#f97316", to: "#fb923c" }, // orange
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
            <BarChart3 size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Tồn kho theo sản phẩm
            </h2>
            <p className="text-xs text-slate-500">
              Top {chartData.length} sản phẩm có tồn kho cao nhất
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-3">
        {chartData.map((product, index) => {
          const qty = product.stock_quantity || 0;
          const percentage = (qty / maxStock) * 100;
          const color = barColors[index % barColors.length];

          return (
            <div key={product.id || index} className="group">
              <div className="flex items-center gap-3">
                {/* Rank */}
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-slate-500">
                    {index + 1}
                  </span>
                </div>

                {/* Product name */}
                <div className="w-36 flex-shrink-0">
                  <p
                    className="text-sm font-medium text-slate-700 truncate"
                    title={product.name}
                  >
                    {product.name}
                  </p>
                </div>

                {/* Bar */}
                <div className="flex-1 h-8 bg-slate-50 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full rounded-lg transition-all duration-700 ease-out relative overflow-hidden"
                    style={{
                      width: `${Math.max(percentage, 3)}%`,
                      background: `linear-gradient(90deg, ${color.from}, ${color.to})`,
                    }}
                  >
                    {/* Shimmer effect */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                      }}
                    />
                  </div>
                </div>

                {/* Value */}
                <div className="w-16 flex-shrink-0 text-right">
                  <span className="text-sm font-bold text-slate-800">
                    {qty.toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-400">Đơn vị: số lượng tồn kho</p>
        <p className="text-xs text-slate-400">
          Tổng: {products.length} sản phẩm
        </p>
      </div>
    </div>
  );
}

export default StockByProductChart;
