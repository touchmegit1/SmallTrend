import { MapPin, Truck } from "lucide-react";
import { PO_STATUS, PO_STATUS_CONFIG, formatVND } from "../../../utils/purchaseOrder";
import CustomSelect from "../../common/CustomSelect";

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

export default function SummaryPanel({
  order,
  items,
  suppliers = [],
  locations = [],
  supplierQuery = "",
  onSupplierQueryChange,
  onSupplierSelect,
  onLocationChange,
  updateOrder,
  allowMetaEdit = false,
  lockMetaFields = false,
  checkingFinancials = null,
}) {
  const statusCfg = PO_STATUS_CONFIG[order.status] || PO_STATUS_CONFIG.DRAFT;
  const isChecking = order.status === PO_STATUS.CHECKING;
  const isReceived = order.status === PO_STATUS.RECEIVED;
  const isShortagePendingApproval =
    order.status === PO_STATUS.SHORTAGE_PENDING_APPROVAL;
  const isSupplierSupplementPending =
    order.status === PO_STATUS.SUPPLIER_SUPPLEMENT_PENDING;
  const showMetaInfo =
    allowMetaEdit ||
    isReceived ||
    isShortagePendingApproval ||
    isSupplierSupplementPending;
  const showPaymentInfo =
    isChecking || isReceived || isShortagePendingApproval || isSupplierSupplementPending;
  const shortageReason =
    order.shortage_reason || order.shortageReason || "";
  const managerDecisionNote =
    order.manager_decision_note || order.managerDecisionNote || "";
  const showShortageReason =
    (isShortagePendingApproval || isSupplierSupplementPending) &&
    String(shortageReason).trim() !== "";
  const showManagerDecisionNote =
    (isSupplierSupplementPending || isReceived) &&
    String(managerDecisionNote).trim() !== "";

  const selectedSupplier = suppliers.find(
    (s) => String(s.id) === String(order.supplier_id),
  );
  const selectedLocation = locations.find(
    (loc) => String(loc.id) === String(order.location_id),
  );

  const locationCapacity = toNumber(selectedLocation?.capacity);
  const locationCurrentStock = toNumber(selectedLocation?.total_products);
  const locationUsagePercent =
    locationCapacity > 0 ? Math.round((locationCurrentStock / locationCapacity) * 100) : 0;
  const isLocationFull = locationCapacity > 0 && locationCurrentStock >= locationCapacity;
  const isLocationNearFull =
    locationCapacity > 0 && !isLocationFull && locationUsagePercent >= 80;

  const totalAmount = checkingFinancials?.total ?? 0;

  const locationCapacityWarning = isLocationFull
    ? {
        title: "Kho đã đầy",
        message:
          "Kho đã đạt sức chứa cấu hình, nhưng bạn vẫn có thể nhập kho nếu cần.",
        containerClass: "mt-2 rounded-lg border border-red-200 bg-red-50 p-2.5",
        titleClass: "text-sm font-semibold text-red-800",
        messageClass: "mt-0.5 text-xs text-red-700",
        metaClass: "mt-1 text-xs text-red-600",
      }
    : isLocationNearFull
      ? {
          title: "Kho sắp đầy",
          message:
            "Kho đang gần đầy. Vui lòng kiểm tra lại dung lượng trống trước khi nhập hàng.",
          containerClass: "mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5",
          titleClass: "text-sm font-semibold text-amber-800",
          messageClass: "mt-0.5 text-xs text-amber-700",
          metaClass: "mt-1 text-xs text-amber-600",
        }
      : null;

  const locationCapacityMeta =
    locationCapacity > 0
      ? `${locationCurrentStock}/${locationCapacity} (${locationUsagePercent}%)`
      : "";

  const discountAmount = toNumber(order.discount);
  const hasDiscount =
    order.discount !== "" &&
    order.discount !== null &&
    order.discount !== undefined &&
    discountAmount !== 0;

  const shippingAmount = toNumber(order.shipping_fee);
  const hasShippingFee =
    order.shipping_fee !== "" &&
    order.shipping_fee !== null &&
    order.shipping_fee !== undefined &&
    shippingAmount !== 0;

  const paidAmount = toNumber(order.paid_amount);
  const hasPaidAmount =
    order.paid_amount !== "" &&
    order.paid_amount !== null &&
    order.paid_amount !== undefined &&
    paidAmount !== 0;

  const vatPercent = toNumber(order.tax_percent);
  const hasVatPercent =
    order.tax_percent !== "" &&
    order.tax_percent !== null &&
    order.tax_percent !== undefined &&
    vatPercent !== 0;

  const taxAmount = toNumber(checkingFinancials?.taxAmount);
  const hasTaxAmount = taxAmount !== 0;

  const remainingAmount = Math.max(0, totalAmount - paidAmount);

  const vatDisplay = hasVatPercent
    ? hasTaxAmount
      ? `${vatPercent}% (${formatVND(taxAmount)})`
      : `${vatPercent}%`
    : hasTaxAmount
      ? formatVND(taxAmount)
      : "";
  const vatAmountDisplay = hasTaxAmount ? formatVND(taxAmount) : "";
  const vatPercentDisplay = hasVatPercent ? `${vatPercent}%` : "";

  return (
    <div className="flex flex-col bg-white">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
        <div className="space-y-2.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Mã phiếu</span>
            <span className="font-mono text-lg font-semibold text-indigo-600">
              {order.po_number || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Trạng thái</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${statusCfg.bg} ${statusCfg.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}></span>
              {statusCfg.label}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Sản phẩm</span>
            <span className="text-xl font-semibold text-slate-900">{items.length} mặt hàng</span>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto">
        {showMetaInfo && (
          <>
            <div className="px-6 py-3.5 border-b border-slate-200">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Truck size={14} className="text-slate-400" />
                Nhà cung cấp <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={supplierQuery}
                onChange={(value) => {
                  onSupplierQueryChange?.(value);
                  onSupplierSelect?.(value);
                }}
                options={[
                  { value: "", label: "Chọn nhà cung cấp..." },
                  ...suppliers.map((supplier) => ({
                    value: supplier.name,
                    label: supplier.name,
                  })),
                ]}
                disabled={lockMetaFields}
              />
            </div>

            <div className="px-6 py-3.5 border-b border-slate-200">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <MapPin size={14} className="text-slate-400" />
                Vị trí nhập kho <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={order.location_id || ""}
                onChange={(value) => onLocationChange?.(value)}
                options={[
                  { value: "", label: "Chọn vị trí..." },
                  ...locations.map((loc) => ({
                    value: loc.id,
                    label: `${loc.location_name} (${loc.location_code})`,
                  })),
                ]}
                disabled={lockMetaFields}
              />
              {locationCapacityWarning && locationCapacityMeta && (
                <div role="alert" aria-live="polite" className={locationCapacityWarning.containerClass}>
                  <p className={locationCapacityWarning.titleClass}>{locationCapacityWarning.title}</p>
                  <p className={locationCapacityWarning.messageClass}>{locationCapacityWarning.message}</p>
                  <p className={locationCapacityWarning.metaClass}>Mức sử dụng hiện tại: {locationCapacityMeta}</p>
                </div>
              )}
            </div>

            {isReceived && (
              <div className="px-6 py-3.5 border-b border-slate-200">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Truck size={14} className="text-slate-400" />
                  Thông tin phiếu nhập
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Nhà cung cấp</span>
                    <span className="font-medium text-slate-800 text-right break-all">
                      {selectedSupplier?.name || order.supplier_name || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Vị trí nhập kho</span>
                    <span className="font-medium text-slate-800 text-right break-all">
                      {selectedLocation
                        ? `${selectedLocation.location_name} (${selectedLocation.location_code})`
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Thuế VAT</span>
                    <span className="font-medium text-slate-800">{vatPercentDisplay}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Phí vận chuyển</span>
                    <span className="font-medium text-slate-800">
                      {hasShippingFee ? formatVND(shippingAmount) : ""}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {showShortageReason && (
              <div className="px-6 py-3.5 border-b border-slate-200 bg-orange-50/60">
                <h3 className="text-xs font-bold text-orange-700 uppercase tracking-wide mb-2">
                  Lý do thiếu hàng
                </h3>
                <p className="text-sm leading-relaxed text-orange-900 whitespace-pre-wrap">
                  {shortageReason}
                </p>
              </div>
            )}

            {showManagerDecisionNote && (
              <div className="px-6 py-3.5 border-b border-slate-200 bg-cyan-50/60">
                <h3 className="text-xs font-bold text-cyan-700 uppercase tracking-wide mb-2">
                  Ghi chú quyết định của quản lý
                </h3>
                <p className="text-sm leading-relaxed text-cyan-900 whitespace-pre-wrap">
                  {managerDecisionNote}
                </p>
              </div>
            )}

            {showPaymentInfo && (
              <div className="px-6 py-3.5 border-b border-slate-200">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Truck size={14} className="text-slate-400" />
                  Thông tin thanh toán
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Tiền hàng</span>
                    <span className="font-semibold text-slate-800">
                      {formatVND(checkingFinancials?.subtotal ?? 0)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Giảm giá</span>
                    {isChecking ? (
                      <div className="relative inline-block">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={hasDiscount ? discountAmount / 1000 : ""}
                          onChange={(e) =>
                            updateOrder(
                              "discount",
                              e.target.value === "" ? "" : toNumber(e.target.value) * 1000,
                            )
                          }
                          className="w-24 px-2 py-1 pr-9 text-right text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        {hasDiscount && (
                          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-indigo-300">
                            .000
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="font-medium text-slate-800">
                        {hasDiscount ? formatVND(discountAmount) : ""}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">VAT (%)</span>
                    {isChecking ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={hasVatPercent ? vatPercent : ""}
                          onChange={(e) =>
                            updateOrder(
                              "tax_percent",
                              e.target.value === "" ? "" : toNumber(e.target.value),
                            )
                          }
                          className="w-16 px-2 py-1 text-right text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <span className="text-slate-400">=</span>
                        <span className="text-xs font-medium text-slate-600 min-w-[58px] text-right">
                          {vatAmountDisplay}
                        </span>
                      </div>
                    ) : (
                      <span className="font-medium text-slate-800">{vatDisplay}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Phí vận chuyển</span>
                    {isChecking ? (
                      <div className="relative inline-block">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={hasShippingFee ? shippingAmount / 1000 : ""}
                          onChange={(e) =>
                            updateOrder(
                              "shipping_fee",
                              e.target.value === "" ? "" : toNumber(e.target.value) * 1000,
                            )
                          }
                          className="w-24 px-2 py-1 pr-9 text-right text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        {hasShippingFee && (
                          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-indigo-300">
                            .000
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="font-medium text-slate-800">
                        {hasShippingFee ? formatVND(shippingAmount) : ""}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-base font-semibold text-slate-800">Tổng cộng</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      {formatVND(totalAmount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Đã thanh toán</span>
                    <span className="font-medium text-slate-800">
                      {hasPaidAmount ? formatVND(paidAmount) : ""}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-600">Còn phải trả</span>
                    <span className="font-semibold text-red-600">{formatVND(remainingAmount)}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div className="px-6 py-3.5 border-t border-slate-100">
          <label
            htmlFor="receipt-note"
            className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5"
          >
            Ghi chú
          </label>
          <textarea
            id="receipt-note"
            value={order.notes || ""}
            onChange={(e) => updateOrder("notes", e.target.value)}
            placeholder="Ghi chú cho phiếu nhập..."
            rows={4}
            disabled={!allowMetaEdit}
            className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition disabled:bg-slate-50 disabled:text-slate-500"
          />
        </div>
      </div>
    </div>
  );
}
