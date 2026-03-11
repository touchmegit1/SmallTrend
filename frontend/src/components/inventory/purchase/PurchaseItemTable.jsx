import React, { memo } from "react";
import { Trash2, Package, Plus, Minus } from "lucide-react";

const PurchaseItemRow = memo(function PurchaseItemRow({
  item,
  index,
  isEditable,
  onUpdate,
  onRemove,
}) {
  const handleQtyChange = (delta) => {
    const newQty = Math.max(1, (item.quantity || 0) + delta);
    onUpdate(item._key, "quantity", newQty);
  };

  return (
    <tr
      className={`group transition-colors border-b border-slate-100 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/40"} hover:bg-indigo-50/30`}
    >
      {/* STT */}
      <td className="px-4 py-3.5 text-center">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
          {index + 1}
        </span>
      </td>

      {/* Product */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center shrink-0 border border-indigo-100">
            <Package size={15} className="text-indigo-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate leading-tight">
              {item.name}
            </p>
            <p className="text-[11px] font-mono text-indigo-500 mt-0.5">
              {item.sku}
            </p>
          </div>
        </div>
      </td>

      {/* Unit */}
      <td className="px-4 py-3.5 text-center">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 text-xs font-medium text-slate-600">
          {item.unit}
        </span>
      </td>

      {/* Quantity */}
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-center gap-1">
          {isEditable && (
            <button
              onClick={() => handleQtyChange(-1)}
              disabled={item.quantity <= 1}
              className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <Minus size={12} />
            </button>
          )}
          <input
            type="number"
            value={item.quantity}
            onChange={(e) =>
              onUpdate(item._key, "quantity", parseInt(e.target.value) || 0)
            }
            disabled={!isEditable}
            min="1"
            className="w-16 px-2 py-1.5 text-sm text-center font-semibold border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:bg-slate-50 disabled:text-slate-400"
          />
          {isEditable && (
            <button
              onClick={() => handleQtyChange(1)}
              className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all"
            >
              <Plus size={12} />
            </button>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5 text-center">
        {isEditable && (
          <button
            onClick={() => onRemove(item._key)}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
            title="Xóa sản phẩm"
          >
            <Trash2 size={15} />
          </button>
        )}
      </td>
    </tr>
  );
});

export default function PurchaseItemTable({
  items,
  isEditable,
  onUpdate,
  onRemove,
  onOpenBatch,
}) {
  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
        <div className="relative mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center border border-indigo-100">
            <Package size={28} className="text-indigo-300" />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
            <Plus size={11} className="text-white" />
          </div>
        </div>
        <p className="text-slate-600 font-semibold mb-1">
          Chưa có sản phẩm nào
        </p>
        <p className="text-xs text-slate-400 max-w-xs">
          Sử dụng thanh tìm kiếm phía trên để thêm sản phẩm vào phiếu nhập hàng
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 w-14">
              #
            </th>
            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Sản phẩm
            </th>
            <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 w-24">
              ĐVT
            </th>
            <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 w-40">
              Số lượng
            </th>
            <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 w-16"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <PurchaseItemRow
              key={item._key}
              item={item}
              index={index}
              isEditable={isEditable}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
