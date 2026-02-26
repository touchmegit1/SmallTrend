import React, { memo, useRef, useCallback } from "react";
import { AlertCircle, Package, ChevronRight } from "lucide-react";
import {
  classifyCountItem,
  COUNT_ITEM_COLORS,
  COUNT_ITEM_STATUS,
  formatVNDCount,
} from "../../../utils/inventoryCount";

// ─── Single row (memoized for performance) ─────────────
const InventoryCountRow = memo(function InventoryCountRow({
  item,
  index,
  isEditable,
  onActualChange,
  onOpenReason,
}) {
  const inputRef = useRef(null);
  const status = classifyCountItem(item);
  const colors = COUNT_ITEM_COLORS[status];
  const hasDifference =
    item.actual_quantity !== null && item.difference_quantity !== 0;
  const needsReason = hasDifference && !item.reason;

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === "Tab") {
        // Move to next row's input
        const nextRow = document.querySelector(
          `[data-count-row="${index + 1}"] input[type="number"]`,
        );
        if (nextRow) {
          e.preventDefault();
          nextRow.focus();
          nextRow.select();
        }
      }
    },
    [index],
  );

  return (
    <tr
      data-count-row={index}
      className={`border-b border-slate-100 hover:bg-slate-50/80 transition-colors ${colors.bg}`}
    >
      {/* # */}
      <td className="px-3 py-2.5 text-xs text-slate-400 text-center w-10">
        {index + 1}
      </td>

      {/* Product Info */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <Package size={14} className="text-slate-400" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-900 truncate">
              {item.name}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {item.sku}
            </div>
          </div>
        </div>
      </td>

      {/* Unit */}
      <td className="px-3 py-2.5 text-xs text-slate-500 text-center w-16">
        {item.unit}
      </td>

      {/* System Qty */}
      <td className="px-3 py-2.5 text-sm text-slate-700 text-right w-24 font-mono">
        {item.system_quantity}
      </td>

      {/* Actual Qty (editable) */}
      <td className="px-3 py-2.5 w-28">
        {isEditable ? (
          <input
            ref={inputRef}
            type="number"
            min={0}
            value={item.actual_quantity === null ? "" : item.actual_quantity}
            onChange={(e) => onActualChange(item.product_id, e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="—"
            className={`w-full px-2.5 py-1.5 text-sm text-right font-mono border rounded-lg transition focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              status === COUNT_ITEM_STATUS.UNCHECKED
                ? "border-slate-200 bg-white"
                : status === COUNT_ITEM_STATUS.MATCHED
                  ? "border-emerald-200 bg-emerald-50"
                  : status === COUNT_ITEM_STATUS.SHORTAGE
                    ? "border-red-200 bg-red-50"
                    : "border-blue-200 bg-blue-50"
            }`}
          />
        ) : (
          <span className="block text-sm text-right font-mono text-slate-700">
            {item.actual_quantity ?? "—"}
          </span>
        )}
      </td>

      {/* Difference */}
      <td className="px-3 py-2.5 w-24 text-right">
        <span className={`text-sm font-bold font-mono ${colors.text}`}>
          {item.actual_quantity !== null
            ? (item.difference_quantity > 0 ? "+" : "") +
              item.difference_quantity
            : "—"}
        </span>
      </td>

      {/* Difference Value */}
      <td className="px-3 py-2.5 w-32 text-right">
        <span className={`text-xs font-medium ${colors.text}`}>
          {item.actual_quantity !== null
            ? formatVNDCount(item.difference_value)
            : "—"}
        </span>
      </td>

      {/* Reason */}
      <td className="px-3 py-2.5 w-36">
        {hasDifference ? (
          <button
            onClick={() => onOpenReason(item.product_id)}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition w-full ${
              needsReason
                ? "bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 animate-pulse"
                : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            {needsReason && <AlertCircle size={12} />}
            <span className="truncate flex-1 text-left">
              {item.reason || "Chọn lý do..."}
            </span>
            <ChevronRight size={12} className="shrink-0" />
          </button>
        ) : (
          <span className="text-xs text-slate-300">—</span>
        )}
      </td>
    </tr>
  );
});

// ─── Table ─────────────────────────────────────────────
export default function InventoryCountTable({
  items,
  isEditable,
  onActualChange,
  onOpenReason,
}) {
  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-16">
        <Package size={48} className="text-slate-200 mb-3" />
        <p className="text-sm text-slate-400 font-medium">
          Không tìm thấy sản phẩm nào
        </p>
        <p className="text-xs text-slate-300 mt-1">
          Thử thay đổi bộ lọc hoặc tìm kiếm khác
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full">
        <thead className="bg-slate-50/80 sticky top-0 z-10">
          <tr className="border-b border-slate-200">
            <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center w-10">
              #
            </th>
            <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-left">
              Sản phẩm
            </th>
            <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center w-16">
              ĐVT
            </th>
            <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right w-24">
              Tồn kho
            </th>
            <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right w-28">
              Thực tế
            </th>
            <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right w-24">
              Chênh lệch
            </th>
            <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right w-32">
              Giá trị lệch
            </th>
            <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-left w-36">
              Lý do
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <InventoryCountRow
              key={item._key || item.product_id}
              item={item}
              index={idx}
              isEditable={isEditable}
              onActualChange={onActualChange}
              onOpenReason={onOpenReason}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
