import React from "react";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { formatVND } from "../../../utils/purchaseOrder";

export default function GoodsReceiptTable({
  items,
  receiptItems,
  onUpdateReceiptItem,
}) {
  const getReceiptItem = (itemId) => {
    return receiptItems.find((ri) => ri.itemId === itemId) || {};
  };

  const getDifference = (item) => {
    const ri = getReceiptItem(item.id);
    const received = ri.receivedQuantity ?? item.quantity;
    return received - item.quantity;
  };

  const getDiffClass = (diff) => {
    if (diff === 0) return "text-emerald-600 bg-emerald-50";
    if (diff < 0) return "text-red-600 bg-red-50";
    return "text-amber-600 bg-amber-50";
  };

  const getDiffIcon = (diff) => {
    if (diff === 0)
      return <CheckCircle size={14} className="text-emerald-500" />;
    if (diff < 0) return <XCircle size={14} className="text-red-500" />;
    return <AlertTriangle size={14} className="text-amber-500" />;
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-purple-50 border-b border-purple-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
          <h3 className="text-sm font-semibold text-purple-800">
            Kiểm kê hàng hóa — Nhập số lượng thực nhận
          </h3>
        </div>
      </div>

      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200 sticky top-[49px] z-10">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase w-8">
              #
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
              Sản phẩm
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase w-24">
              SL hợp đồng
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase w-32">
              SL thực nhận
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase w-24">
              Chênh lệch
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase w-40">
              Ghi chú
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item, idx) => {
            const ri = getReceiptItem(item.id);
            const diff = getDifference(item);
            const diffClass = getDiffClass(diff);

            return (
              <tr
                key={item.id || item._key || idx}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-slate-400">{idx + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {item.imageUrl || item.image_url ? (
                      <img
                        src={item.imageUrl || item.image_url}
                        alt={item.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <span className="text-xs text-slate-400">📦</span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {item.sku} •{" "}
                        {formatVND(item.unit_price || item.unitCost)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm font-semibold text-slate-700">
                    {item.quantity}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="number"
                    min="0"
                    value={ri.receivedQuantity ?? item.quantity}
                    onChange={(e) =>
                      onUpdateReceiptItem(
                        item.id,
                        "receivedQuantity",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="w-20 text-center px-2 py-1.5 text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${diffClass}`}
                  >
                    {getDiffIcon(diff)}
                    {diff > 0 ? `+${diff}` : diff}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    placeholder="Ghi chú..."
                    value={ri.notes || ""}
                    onChange={(e) =>
                      onUpdateReceiptItem(item.id, "notes", e.target.value)
                    }
                    className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Tổng:{" "}
            <span className="font-semibold text-slate-800">{items.length}</span>{" "}
            sản phẩm
          </span>
          <div className="flex items-center gap-4">
            <span className="text-slate-500">
              Đúng:{" "}
              <span className="font-semibold text-emerald-600">
                {items.filter((item) => getDifference(item) === 0).length}
              </span>
            </span>
            <span className="text-slate-500">
              Thiếu:{" "}
              <span className="font-semibold text-red-600">
                {items.filter((item) => getDifference(item) < 0).length}
              </span>
            </span>
            <span className="text-slate-500">
              Thừa:{" "}
              <span className="font-semibold text-amber-600">
                {items.filter((item) => getDifference(item) > 0).length}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
