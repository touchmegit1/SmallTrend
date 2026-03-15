import React, { memo } from "react";
import { Trash2, Package } from "lucide-react";

const PurchaseItemRow = memo(function PurchaseItemRow({
  item,
  index,
  isEditable,
  onUpdate,
  onRemove,
}) {
  return (
    <tr className="group hover:bg-slate-50/80 transition-colors border-b border-slate-100">
      <td className="px-3 py-3 text-center text-sm text-slate-400 w-12">
        {index + 1}
      </td>

      <td className="px-3 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
          <p className="text-xs font-mono text-indigo-500">{item.sku}</p>
        </div>
      </td>

      <td className="px-3 py-3 text-sm text-slate-500 text-center w-20">
        {item.unit}
      </td>

      <td className="px-3 py-3 w-32">
        <input
          type="number"
          value={item.quantity}
          onChange={(e) =>
            onUpdate(item._key, "quantity", parseInt(e.target.value) || 0)
          }
          disabled={!isEditable}
          min="1"
          className="w-full px-2.5 py-1.5 text-sm text-right border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:bg-slate-50 disabled:text-slate-400"
        />
      </td>

      <td className="px-3 py-3 w-24">
        <div className="flex items-center justify-center gap-1">
          {isEditable && (
            <button
              onClick={() => onRemove(item._key)}
              className="p-1.5 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              title="Xóa"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
});

export default function PurchaseItemTable({
  items,
  isEditable,
  onUpdate,
  onRemove,
}) {
  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-slate-100 p-4 rounded-2xl mb-4">
          <Package size={40} className="text-slate-300" />
        </div>
        <p className="text-slate-500 font-medium mb-1">
          Chưa có sản phẩm nào trong phiếu nhập
        </p>
        <p className="text-xs text-slate-400">
          Tìm kiếm và click vào sản phẩm ở thanh tìm kiếm phía trên để thêm
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
          <tr>
            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 w-12">
              STT
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sản phẩm
            </th>
            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 w-20">
              ĐVT
            </th>
            <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 w-32">
              Số lượng
            </th>
            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 w-24">
              Thao tác
            </th>
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
