import { AlertTriangle, CheckCircle, XCircle, Box } from "lucide-react";
import { formatVND } from "../../../utils/purchaseOrder";

export default function GoodsReceiptTable({
  items,
  receiptItems,
  onUpdateReceiptItem,
  isReadOnly = false,
  lockExpiryDate = false,
}) {
  const getItemIdentity = (item) => item.id ?? item._key;

  const getReceiptItem = (item) => {
    const identity = getItemIdentity(item);
    return receiptItems.find((ri) => ri.itemId === identity) || {};
  };

  const getOrderedCheckingQuantity = (item) =>
    Number(item.checking_quantity ?? item.quantity ?? 0);

  const getDifference = (item) => {
    const ri = getReceiptItem(item);
    const ordered = getOrderedCheckingQuantity(item);
    const received = Number(ri.receivedQuantity ?? ordered);
    return received - ordered;
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

  const getUnitCostValue = (ri, item) => {
    const unitCost = Number(ri.unitCost ?? item.unit_price ?? item.unitCost ?? 0);
    return Number.isFinite(unitCost) ? unitCost / 1000 : 0;
  };

  const parseUnitCostInput = (value) => {
    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return parsed * 1000;
  };

  return (
    <div className="flex-1 overflow-auto bg-white">
      <div className="sticky top-0 z-10 bg-purple-50 border-b border-purple-200 px-6 py-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold text-purple-800">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          {isReadOnly
            ? "Kết quả kiểm kê hàng hóa"
            : "Kiểm kê hàng hóa — Nhập số lượng thực nhận"}
        </div>
      </div>

      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200 sticky top-[46px] z-10">
          <tr>
            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-8">
              #
            </th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
              Sản phẩm
            </th>
            <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase w-40">
              Hạn SD
            </th>
            <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase w-36">
              Giá nhập
            </th>
            <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase w-32">
              SL đặt hàng
            </th>
            <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase w-36">
              SL thực nhận
            </th>
            <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase w-32">
              Chênh lệch
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item, idx) => {
            const ri = getReceiptItem(item);
            const diff = getDifference(item);
            const diffClass = getDiffClass(diff);
            const orderedCheckingQty = getOrderedCheckingQuantity(item);
            const unitCostValue = getUnitCostValue(ri, item);
            const hasUnitCost = unitCostValue !== 0;
            const displayUnit = item.checking_unit || item.unit || "";
            const receivedQuantity = Number(
              ri.receivedQuantity ?? orderedCheckingQty,
            );
            const receivedDiff = receivedQuantity - orderedCheckingQty;
            const receivedQtyClass =
              receivedDiff === 0
                ? "border-slate-300"
                : receivedDiff < 0
                  ? "border-red-300 bg-red-50 text-red-700"
                  : "border-amber-300 bg-amber-50 text-amber-700";
            const conversionFactor = Number(item.conversion_factor ?? 1);
            const originalQty = Number(item.quantity ?? 0);
            const showConversionHint = conversionFactor > 1 && originalQty > 0;
            const originalUnit = item.unit || "";
            const conversionHint = showConversionHint
              ? `${originalQty} ${originalUnit} = ${orderedCheckingQty} ${displayUnit}`
              : "";

            return (
              <tr
                key={item.id || item._key || idx}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-5 py-3 text-sm text-slate-400">{idx + 1}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                      <Box size={13} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 leading-tight truncate whitespace-nowrap">{item.name}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {item.sku} • {formatVND(item.unit_price ?? item.unitCost)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-center">
                  <input
                    type="date"
                    value={
                      ri.expiryDate ??
                      ri.expiry_date ??
                      item.expiry_date ??
                      item.expiryDate ??
                      ""
                    }
                    onChange={(e) =>
                      onUpdateReceiptItem(
                        getItemIdentity(item),
                        "expiryDate",
                        e.target.value,
                      )
                    }
                    disabled={isReadOnly || lockExpiryDate}
                    className="w-36 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </td>
                <td className="px-5 py-4 text-center">
                  <div className="relative inline-block">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={hasUnitCost ? unitCostValue : ""}
                      onChange={(e) =>
                        onUpdateReceiptItem(
                          getItemIdentity(item),
                          "unitCost",
                          parseUnitCostInput(e.target.value),
                        )
                      }
                      disabled={isReadOnly}
                      className="w-28 px-3 py-1.5 pr-11 text-right text-sm border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
                    />
                    {hasUnitCost && (
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-indigo-300">
                        .000
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-base font-semibold text-slate-700">
                      {orderedCheckingQty}
                    </span>
                    {displayUnit && (
                      <span className="mt-0.5 text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                        {displayUnit}
                      </span>
                    )}
                    {showConversionHint && (
                      <span className="mt-0.5 text-[10px] text-indigo-500">{conversionHint}</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-center">
                  <input
                    type="number"
                    min="0"
                    value={receivedQuantity}
                    onChange={(e) =>
                      onUpdateReceiptItem(
                        getItemIdentity(item),
                        "receivedQuantity",
                        Number.parseInt(e.target.value, 10) || 0,
                      )
                    }
                    disabled={isReadOnly}
                    className={`w-24 text-center px-2.5 py-1.5 text-sm font-semibold border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 ${receivedQtyClass}`}
                  />
                </td>
                <td className="px-5 py-4 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${diffClass}`}
                  >
                    {getDiffIcon(diff)}
                    {diff > 0 ? `+${diff}` : diff}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">
            Tổng: <span className="font-semibold text-slate-800">{items.length} sản phẩm</span>
          </span>
          <div className="flex items-center gap-6 text-base">
            <span className="text-slate-500">
              Đúng: <span className="font-semibold text-emerald-600">
                {items.filter((item) => getDifference(item) === 0).length}
              </span>
            </span>
            <span className="text-slate-500">
              Thiếu: <span className="font-semibold text-red-600">
                {items.filter((item) => getDifference(item) < 0).length}
              </span>
            </span>
            <span className="text-slate-500">
              Thừa: <span className="font-semibold text-amber-600">
                {items.filter((item) => getDifference(item) > 0).length}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
