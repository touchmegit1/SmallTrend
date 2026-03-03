import React from "react";
import {
  MapPin,
  TrendingDown,
  TrendingUp,
  Scale,
  StickyNote,
} from "lucide-react";
import { IC_STATUS, formatVNDCount } from "../../../utils/inventoryCount";

export default function CountSummaryPanel({
  session,
  stats,
  locations,
  updateSession,
}) {
  const isEditable =
    session?.status === IC_STATUS.DRAFT ||
    session?.status === IC_STATUS.COUNTING;

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto">
      {/* ─── Location Selection ────────────────────── */}
      <div className="p-4 border-b border-slate-100">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          <MapPin size={12} />
          Vị trí kiểm kho
        </label>
        {isEditable ? (
          <select
            value={session?.location_id || ""}
            onChange={(e) =>
              updateSession({ location_id: parseInt(e.target.value) || null })
            }
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">— Chọn vị trí —</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.location_name}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm text-slate-700 font-medium">
            {locations.find((l) => l.id === session?.location_id)
              ?.location_name || "Chưa chọn"}
          </p>
        )}
      </div>

      {/* ─── Counting Summary ─────────────────────── */}
      <div className="p-4 border-b border-slate-100">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Tổng kết kiểm kho
        </h3>
        <div className="space-y-2.5">
          {/* Matched */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale size={14} className="text-emerald-500" />
              <span className="text-sm text-slate-600">Khớp</span>
            </div>
            <span className="text-sm font-bold text-emerald-600 tabular-nums">
              {stats.matched}
            </span>
          </div>

          {/* Shortage */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown size={14} className="text-red-500" />
              <span className="text-sm text-slate-600">Thiếu</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-red-600 tabular-nums">
                {stats.shortage}
              </span>
              <div className="text-[11px] text-red-400">
                −{formatVNDCount(stats.totalShortageValue)}
              </div>
            </div>
          </div>

          {/* Overage */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-blue-500" />
              <span className="text-sm text-slate-600">Dư</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-blue-600 tabular-nums">
                {stats.overage}
              </span>
              <div className="text-[11px] text-blue-400">
                +{formatVNDCount(stats.totalOverageValue)}
              </div>
            </div>
          </div>
        </div>

        {/* Net difference */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">
            Giá trị lệch ròng
          </span>
          <span
            className={`text-base font-bold tabular-nums ${
              stats.totalDifferenceValue < 0
                ? "text-red-600"
                : stats.totalDifferenceValue > 0
                  ? "text-blue-600"
                  : "text-emerald-600"
            }`}
          >
            {stats.totalDifferenceValue > 0 && "+"}
            {formatVNDCount(stats.totalDifferenceValue)}
          </span>
        </div>
      </div>

      {/* ─── Notes ────────────────────────────────── */}
      <div className="p-4 flex-1">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          <StickyNote size={12} />
          Ghi chú
        </label>
        {isEditable ? (
          <textarea
            value={session?.notes || ""}
            onChange={(e) => updateSession({ notes: e.target.value })}
            rows={4}
            placeholder="Nhập ghi chú cho phiên kiểm kho..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-slate-50"
          />
        ) : (
          <p className="text-sm text-slate-600">
            {session?.notes || "Không có ghi chú"}
          </p>
        )}
      </div>
    </div>
  );
}
