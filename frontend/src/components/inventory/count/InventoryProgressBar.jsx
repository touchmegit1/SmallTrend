import React from "react";

export default function InventoryProgressBar({ stats }) {
  const { progress, total, counted, matched, shortage, overage, unchecked } =
    stats;

  const segments = [
    { value: matched, color: "bg-emerald-500", label: "Khớp" },
    { value: shortage, color: "bg-red-500", label: "Thiếu" },
    { value: overage, color: "bg-blue-500", label: "Dư" },
  ];

  return (
    <div className="bg-white border-b border-slate-200 px-5 py-3 shrink-0">
      {/* Progress info */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-700">
          Tiến độ: {counted}/{total} sản phẩm
        </span>
        <span className="text-xs font-bold text-indigo-600">{progress}%</span>
      </div>

      {/* Multi-segment progress bar */}
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
        {total > 0 &&
          segments.map((seg) =>
            seg.value > 0 ? (
              <div
                key={seg.label}
                className={`${seg.color} transition-all duration-500 ease-out`}
                style={{ width: `${(seg.value / total) * 100}%` }}
              />
            ) : null,
          )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-2">
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Khớp: {matched}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Thiếu: {shortage}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Dư: {overage}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="w-2 h-2 rounded-full bg-slate-300" />
          Chưa kiểm: {unchecked}
        </span>
      </div>
    </div>
  );
}
