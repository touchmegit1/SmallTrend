import React, { useState, useRef, useEffect } from "react";
import { MapPin, Truck, ChevronDown, X, Search } from "lucide-react";
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
}) {
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const supplierRef = useRef(null);

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
    <div className="w-[380px] bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-hidden">
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
            <Truck size={13} /> Nhà cung cấp
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
                <button
                  onClick={clearSupplier}
                  className="p-1 hover:bg-indigo-100 rounded transition-colors shrink-0"
                >
                  <X size={14} className="text-indigo-500" />
                </button>
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
                    className="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
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
            <MapPin size={13} /> Vị trí nhập kho
          </label>
          <select
            value={order.location_id || ""}
            onChange={(e) =>
              updateOrder(
                "location_id",
                e.target.value ? parseInt(e.target.value) : null,
              )
            }
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
          >
            <option value="">Chọn vị trí...</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.location_name} ({loc.location_code})
              </option>
            ))}
          </select>
        </div>

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
              <input
                type="number"
                value={order.discount || 0}
                onChange={(e) =>
                  updateOrder("discount", parseFloat(e.target.value) || 0)
                }
                min="0"
                className="w-28 px-2 py-1 text-right text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
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
                  className="w-16 px-2 py-1 text-right text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <span className="text-xs text-slate-400">
                  = {formatVND(financials.taxAmount)}
                </span>
              </div>
            </div>

            {/* Shipping */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Phí vận chuyển</span>
              <input
                type="number"
                value={order.shipping_fee || 0}
                onChange={(e) =>
                  updateOrder("shipping_fee", parseFloat(e.target.value) || 0)
                }
                min="0"
                className="w-28 px-2 py-1 text-right text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
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
              <input
                type="number"
                value={order.paid_amount || 0}
                onChange={(e) =>
                  updateOrder("paid_amount", parseFloat(e.target.value) || 0)
                }
                min="0"
                className="w-28 px-2 py-1 text-right text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
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
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition"
          />
        </div>
      </div>
    </div>
  );
}
