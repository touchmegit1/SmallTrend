import React, { memo } from "react";
import { Trash2, Layers, ChevronDown, Package } from "lucide-react";
import { formatVND } from "../../../utils/purchaseOrder";

const PurchaseItemRow = memo(function PurchaseItemRow({
  item,
  index,
  isEditable,
  onUpdate,
  onRemove,
  onOpenBatch,
}) {
  const hasBatches = item.batches && item.batches.length > 0;

  return (
    <>
      <tr className="group hover:bg-slate-50/80 transition-colors border-b border-slate-100">
        {/* STT */}
        <td className="px-3 py-3 text-center text-sm text-slate-400 w-12">
          {index + 1}
        </td>

        {/* SKU + Name */}
        <td className="px-3 py-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {item.name}
            </p>
            <p className="text-xs font-mono text-indigo-500">{item.sku}</p>
          </div>
        </td>

        {/* Unit */}
        <td className="px-3 py-3 text-sm text-slate-500 text-center w-20">
          {item.unit}
        </td>

        {/* Quantity */}
        <td className="px-3 py-3 w-28">
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

        {/* Unit Price */}
        <td className="px-3 py-3 w-32">
          <input
            type="number"
            value={item.unit_price}
            onChange={(e) =>
              onUpdate(item._key, "unit_price", parseFloat(e.target.value) || 0)
            }
            disabled={!isEditable}
            min="0"
            className="w-full px-2.5 py-1.5 text-sm text-right border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:bg-slate-50 disabled:text-slate-400"
          />
        </td>

        {/* Discount */}
        <td className="px-3 py-3 w-28">
          <input
            type="number"
            value={item.discount || 0}
            onChange={(e) =>
              onUpdate(item._key, "discount", parseFloat(e.target.value) || 0)
            }
            disabled={!isEditable}
            min="0"
            className="w-full px-2.5 py-1.5 text-sm text-right border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:bg-slate-50 disabled:text-slate-400"
          />
        </td>

        {/* Total */}
        <td className="px-3 py-3 text-right w-32">
          <span className="text-sm font-semibold text-slate-900">
            {formatVND(item.total)}
          </span>
        </td>

        {/* Actions */}
        <td className="px-3 py-3 w-24">
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => onOpenBatch(item._key)}
              className={`p-1.5 rounded-md transition-colors ${
                hasBatches
                  ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              }`}
              title="Quản lý lô hàng"
            >
              <Layers size={15} />
            </button>
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

      {/* Batch Summary (if has batches) */}
      {hasBatches && (
        <tr className="bg-indigo-50/30 border-b border-slate-100">
          <td></td>
          <td colSpan={7} className="px-3 py-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Layers size={12} className="text-indigo-500" />
              <span className="text-xs font-medium text-indigo-600">
                {item.batches.length} lô hàng:
              </span>
              {item.batches.map((b, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded text-xs border border-indigo-100"
                >
                  <span className="font-mono text-indigo-600">
                    {b.batch_code}
                  </span>
                  <span className="text-slate-400">×{b.quantity}</span>
                  {b.expiry_date && (
                    <span className="text-slate-400">
                      · HSD:{" "}
                      {new Date(b.expiry_date).toLocaleDateString("vi-VN")}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
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
            <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 w-28">
              Số lượng
            </th>
            <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 w-32">
              Đơn giá
            </th>
            <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 w-28">
              Giảm giá
            </th>
            <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 w-32">
              Thành tiền
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
              onOpenBatch={onOpenBatch}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
