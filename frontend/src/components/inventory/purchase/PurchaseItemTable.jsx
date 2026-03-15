import React, { memo } from "react";
import { Box, Trash2 } from "lucide-react";

const PurchaseItemRow = memo(function PurchaseItemRow({
  item,
  index,
  isEditable,
  onUpdate,
  onRemove,
}) {
  return (
    <tr className="group hover:bg-slate-50/70 transition-colors border-b border-slate-100">
      <td className="px-6 py-3 text-left text-xs font-semibold text-slate-400 w-14">
        {index + 1}
      </td>

      <td className="px-6 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
            <Box size={14} />
          </div>
          <div className="min-w-0">
            <p className="text-sm leading-tight font-semibold text-slate-900 truncate">
              {item.name}
            </p>
            <p className="text-xs text-indigo-500 truncate">{item.sku}</p>
          </div>
        </div>
      </td>

      <td className="px-6 py-3 text-sm text-slate-600 text-center w-32">
        <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100">{item.unit}</span>
      </td>

      <td className="px-6 py-3 w-40 text-center">
        <input
          type="number"
          value={item.quantity}
          onChange={(e) =>
            onUpdate(item._key, "quantity", Number.parseInt(e.target.value, 10) || 0)
          }
          disabled={!isEditable}
          min="1"
          className="w-[68px] px-2 py-1.5 text-sm text-center font-semibold border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:bg-slate-50 disabled:text-slate-400"
        />
      </td>

      {isEditable && (
        <td className="px-6 py-3 w-28 text-center">
          <button
            onClick={() => onRemove(item._key)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Xóa"
          >
            <Trash2 size={14} />
          </button>
        </td>
      )}
    </tr>
  );
});

export default function PurchaseItemTable({
  items,
  isEditable,
  onUpdate,
  onRemove,
  totalQty = 0,
}) {
  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-center bg-white">
        <div className="relative mb-5">
          <div className="bg-indigo-50 p-6 rounded-3xl">
            <Box size={52} className="text-indigo-300" />
          </div>
          {isEditable && (
            <div className="absolute -right-2 -top-2 w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">
              +
            </div>
          )}
        </div>
        <p className="text-xl leading-tight font-semibold text-slate-700 mb-2">
          Chưa có sản phẩm nào
        </p>
        <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
          Sử dụng thanh tìm kiếm phía trên để thêm sản phẩm vào
          <br />
          phiếu nhập hàng
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-white">
      <table className="w-full">
        <thead className="bg-slate-50 border-y border-slate-200 sticky top-0 z-10">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-14">
              #
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sản phẩm
            </th>
            <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 w-32">
              ĐVT
            </th>
            <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 w-40">
              Số lượng
            </th>
            {isEditable && (
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 w-28">
                Thao tác
              </th>
            )}
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

      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/70">
        <div className="flex items-center gap-6 text-xs text-slate-600">
          <span className="inline-flex items-center gap-2">
            <Box size={16} className="text-slate-400" />
            {items.length} mặt hàng
          </span>
          <span className="w-px h-6 bg-slate-200" />
          <span>
            Tổng SL: <strong className="text-slate-800">{totalQty}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
