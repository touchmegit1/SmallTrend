import { PO_STATUS_CONFIG, formatVND } from "../../../utils/purchaseOrder";

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

export default function SummaryPanel({
  order,
  items,
  suppliers = [],
  locations = [],
  updateOrder,
  isEditable = true,
  allowMetaEdit = false,
  checkingFinancials = null,
}) {
  const statusCfg = PO_STATUS_CONFIG[order.status] || PO_STATUS_CONFIG.DRAFT;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto bg-white">
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

      <div className="flex-1 overflow-auto">
        {allowMetaEdit && (
          <>
            <div className="px-5 py-4 border-b border-slate-100">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Nhà cung cấp
              </label>
              <select
                value={order.supplier_id || ""}
                onChange={(e) => {
                  const value = e.target.value
                    ? Number.parseInt(e.target.value, 10)
                    : null;
                  const supplier = suppliers.find((s) => s.id === value);
                  updateOrder("supplier_id", value);
                  updateOrder("supplier_name", supplier?.name || "");
                }}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Chọn nhà cung cấp...</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="px-5 py-4 border-b border-slate-100">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Vị trí nhập kho
              </label>
              <select
                value={order.location_id || ""}
                onChange={(e) =>
                  updateOrder(
                    "location_id",
                    e.target.value ? Number.parseInt(e.target.value, 10) : null,
                  )
                }
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Chọn vị trí...</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.location_name} ({loc.location_code})
                  </option>
                ))}
              </select>
            </div>

            <div className="px-5 py-4 border-b border-slate-100">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Thuế VAT (%)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={order.tax_percent ?? ""}
                onChange={(e) =>
                  updateOrder(
                    "tax_percent",
                    e.target.value === "" ? "" : toNumber(e.target.value),
                  )
                }
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Nhập % VAT"
              />
            </div>

            <div className="px-5 py-4 border-b border-slate-100">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Phí vận chuyển
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={order.shipping_fee ?? ""}
                onChange={(e) =>
                  updateOrder(
                    "shipping_fee",
                    e.target.value === "" ? "" : toNumber(e.target.value),
                  )
                }
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Nhập phí vận chuyển"
              />
            </div>

            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Tạm tính</span>
                  <span className="font-semibold text-slate-800">
                    {formatVND(checkingFinancials?.subtotal || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Tiền VAT</span>
                  <span className="font-semibold text-slate-800">
                    {formatVND(checkingFinancials?.taxAmount || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-700 font-semibold">Tổng cộng</span>
                  <span className="font-bold text-indigo-600">
                    {formatVND(checkingFinancials?.total || 0)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="px-5 py-4">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Ghi chú
          </label>
          <textarea
            value={order.notes || ""}
            onChange={(e) => updateOrder("notes", e.target.value)}
            placeholder="Ghi chú cho phiếu nhập..."
            rows={3}
            disabled={!isEditable && !allowMetaEdit}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition disabled:bg-slate-50 disabled:text-slate-500"
          />
        </div>
      </div>
    </div>
  );
}
