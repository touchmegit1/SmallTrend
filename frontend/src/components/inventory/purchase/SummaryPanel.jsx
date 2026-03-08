import React, { useState, useRef, useEffect } from "react";
import {
  MapPin,
  Truck,
  ChevronDown,
  X,
  Search,
  AlertTriangle,
} from "lucide-react";
import { PO_STATUS_CONFIG, formatVND } from "../../../utils/purchaseOrder";

export default function SummaryPanel({
  order,
  items,
  financials,
  suppliers,
  filteredSuppliers,
  locations,
  supplierQuery,
  setSupplierQuery,
  selectSupplier,
  clearSupplier,
  updateOrder,
  isEditable = true,
}) {
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const supplierRef = useRef(null);

  // Capacity warning state
  const [capacityWarning, setCapacityWarning] = useState(null);
  // { locationId, locationName, capacity, current, incoming, projected }

  // Close supplier dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (supplierRef.current && !supplierRef.current.contains(e.target)) {
        setShowSupplierDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const statusCfg = PO_STATUS_CONFIG[order.status] || PO_STATUS_CONFIG.DRAFT;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto bg-white">
      {/* ─── Order Info Header ─────────────────────────────── */}
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-indigo-50/30">
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Mã phiếu</span>
            <span className="font-mono font-bold text-indigo-600">
              {order.po_number}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Trạng thái</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full ${statusCfg.bg} ${statusCfg.text}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}
              ></span>
              {statusCfg.label}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Sản phẩm</span>
            <span className="font-semibold text-slate-900">
              {items.length} mặt hàng
            </span>
          </div>
        </div>
      </div>

      {/* ─── Scrollable Content ────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        {/* Supplier Selector */}
        <div className="px-5 py-4 border-b border-slate-100">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <Truck size={13} /> Nhà cung cấp{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="relative" ref={supplierRef}>
            {order.supplier_id ? (
              <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {order.supplier_name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {suppliers.find((s) => s.id === order.supplier_id)?.phone ||
                      ""}
                  </p>
                </div>
                {isEditable && (
                  <button
                    onClick={clearSupplier}
                    className="p-1 hover:bg-indigo-100 rounded transition-colors shrink-0"
                  >
                    <X size={14} className="text-indigo-500" />
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={supplierQuery}
                    onChange={(e) => {
                      setSupplierQuery(e.target.value);
                      setShowSupplierDropdown(true);
                    }}
                    onFocus={() => setShowSupplierDropdown(true)}
                    placeholder="Tìm nhà cung cấp..."
                    disabled={!isEditable}
                    className="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                {showSupplierDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-20 max-h-48 overflow-auto">
                    {filteredSuppliers.length === 0 ? (
                      <div className="px-3 py-4 text-center text-sm text-slate-400">
                        Không tìm thấy
                      </div>
                    ) : (
                      filteredSuppliers.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            selectSupplier(s);
                            setShowSupplierDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 transition-colors border-b border-slate-50 last:border-b-0"
                        >
                          <p className="text-sm font-medium text-slate-900">
                            {s.name}
                          </p>
                          <p className="text-xs text-slate-400">{s.phone}</p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Location Selector */}
        <div className="px-5 py-4 border-b border-slate-100">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <MapPin size={13} /> Vị trí nhập kho{" "}
            <span className="text-red-500">*</span>
          </label>
          <select
            value={order.location_id || ""}
            onChange={(e) => {
              const locId = e.target.value ? parseInt(e.target.value) : null;
              if (!locId) {
                updateOrder("location_id", null);
                return;
              }
              const loc = locations.find((l) => l.id === locId);
              const capacity = loc?.capacity || 0;
              if (capacity > 0) {
                const current = loc?.total_products || 0;
                const incoming = items.reduce(
                  (sum, item) => sum + (item.quantity || 0),
                  0,
                );
                const projected = current + incoming;
                if (projected > capacity) {
                  // Show warning first, don't select yet
                  setCapacityWarning({
                    locationId: locId,
                    locationName: loc.location_name,
                    capacity,
                    current,
                    incoming,
                    projected,
                  });
                  return;
                }
              }
              updateOrder("location_id", locId);
            }}
            disabled={!isEditable}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition disabled:bg-slate-50 disabled:text-slate-500"
          >
            <option value="">Chọn vị trí...</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.location_name} ({loc.location_code})
              </option>
            ))}
          </select>

          {/* Capacity warning inline indicator */}
          {(() => {
            const loc = locations.find((l) => l.id === order.location_id);
            if (!loc || !loc.capacity) return null;
            const current = loc.total_products || 0;
            const incoming = items.reduce(
              (sum, i) => sum + (i.quantity || 0),
              0,
            );
            const projected = current + incoming;
            const pct = Math.round((projected / loc.capacity) * 100);
            if (pct < 80) return null;
            return (
              <div
                className={`mt-2 flex items-start gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                  pct >= 100
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                <span>
                  {pct >= 100 ? "Vượt" : "Gần đầy"} sức chứa: dự kiến{" "}
                  <strong>
                    {projected}/{loc.capacity}
                  </strong>{" "}
                  ({pct}%)
                </span>
              </div>
            );
          })()}
        </div>

        {/* Capacity Warning Modal */}
        {capacityWarning && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="px-6 py-4 bg-amber-50 border-b border-amber-200 flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Cảnh báo vượt sức chứa
                  </h3>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Xem xét trước khi tiếp tục
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                <p className="text-sm text-slate-700 leading-relaxed">
                  Vị trí{" "}
                  <span className="font-bold text-slate-900">
                    {capacityWarning.locationName}
                  </span>{" "}
                  sẽ vượt quá sức chứa thiết kế.
                </p>

                <div className="mt-4 bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tồn kho hiện tại</span>
                    <span className="font-semibold text-slate-700">
                      {capacityWarning.current}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hàng sắp nhập</span>
                    <span className="font-semibold text-indigo-600">
                      +{capacityWarning.incoming}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2">
                    <span className="text-slate-600 font-medium">
                      Dự kiến sau nhập
                    </span>
                    <span className="font-bold text-red-600">
                      {capacityWarning.projected}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sức chứa tối đa</span>
                    <span className="font-semibold text-slate-700">
                      {capacityWarning.capacity}
                    </span>
                  </div>
                </div>

                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700">
                  ⚠️ Dự kiến:{" "}
                  <strong>
                    {capacityWarning.projected}/{capacityWarning.capacity}
                  </strong>{" "}
                  (+
                  {Math.round(
                    (capacityWarning.projected / capacityWarning.capacity - 1) *
                      100,
                  )}
                  % vượt mức)
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-5 flex gap-3">
                <button
                  onClick={() => setCapacityWarning(null)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm"
                >
                  Chọn vị trí khác
                </button>
                <button
                  onClick={() => {
                    updateOrder("location_id", capacityWarning.locationId);
                    setCapacityWarning(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors text-sm"
                >
                  Tiếp tục cất hàng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Financial Summary */}
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Thông tin thanh toán
          </h3>
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tiền hàng</span>
              <span className="font-medium text-slate-900">
                {formatVND(financials.subtotal)}
              </span>
            </div>

            {/* Order Discount */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Giảm giá</span>
              <div className="relative">
                <input
                  type="number"
                  value={order.discount ? order.discount / 1000 : ""}
                  onChange={(e) =>
                    updateOrder(
                      "discount",
                      (parseFloat(e.target.value) || 0) * 1000,
                    )
                  }
                  min="0"
                  step="any"
                  disabled={!isEditable}
                  className="w-28 px-2 py-1 pr-9 text-right text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none select-none">
                  .000
                </span>
              </div>
            </div>

            {/* Tax */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">VAT (%)</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={order.tax_percent || 0}
                  onChange={(e) =>
                    updateOrder("tax_percent", parseFloat(e.target.value) || 0)
                  }
                  min="0"
                  max="100"
                  disabled={!isEditable}
                  className="w-16 px-2 py-1 text-right text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                />
                <span className="text-xs text-slate-400">
                  = {formatVND(financials.taxAmount)}
                </span>
              </div>
            </div>

            {/* Shipping */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Phí vận chuyển</span>
              <div className="relative">
                <input
                  type="number"
                  value={order.shipping_fee ? order.shipping_fee / 1000 : ""}
                  onChange={(e) =>
                    updateOrder(
                      "shipping_fee",
                      (parseFloat(e.target.value) || 0) * 1000,
                    )
                  }
                  min="0"
                  step="any"
                  disabled={!isEditable}
                  className="w-28 px-2 py-1 pr-9 text-right text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none select-none">
                  .000
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-2.5">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-700">Tổng cộng</span>
                <span className="font-bold text-lg text-indigo-600">
                  {formatVND(financials.total)}
                </span>
              </div>
            </div>

            {/* Paid Amount */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Đã thanh toán</span>
              <div className="relative">
                <input
                  type="number"
                  value={order.paid_amount ? order.paid_amount / 1000 : ""}
                  onChange={(e) =>
                    updateOrder(
                      "paid_amount",
                      (parseFloat(e.target.value) || 0) * 1000,
                    )
                  }
                  min="0"
                  step="any"
                  disabled={!isEditable}
                  className="w-28 px-2 py-1 pr-9 text-right text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none select-none">
                  .000
                </span>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Còn phải trả</span>
              <span
                className={`font-bold ${
                  financials.remaining > 0 ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {formatVND(financials.remaining)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="px-5 py-4">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Ghi chú
          </label>
          <textarea
            value={order.notes || ""}
            onChange={(e) => updateOrder("notes", e.target.value)}
            placeholder="Ghi chú cho phiếu nhập..."
            rows={3}
            disabled={!isEditable}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition disabled:bg-slate-50 disabled:text-slate-500"
          />
        </div>
      </div>
    </div>
  );
}
