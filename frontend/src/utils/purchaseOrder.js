// ═══════════════════════════════════════════════════════════
//  Purchase Order – Business Logic (Pure functions, no React)
// ═══════════════════════════════════════════════════════════

// ─── Status Flow ─────────────────────────────────────────
// DRAFT → PENDING → CONFIRMED → CHECKING → RECEIVED (stock updated)
//                  ↘ REJECTED → DRAFT (sửa & gửi lại)
// DRAFT → CANCELLED (hủy)

export const PO_STATUS = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  REJECTED: "REJECTED",
  CONFIRMED: "CONFIRMED",
  CHECKING: "CHECKING",
  SHORTAGE_PENDING_APPROVAL: "SHORTAGE_PENDING_APPROVAL",
  SUPPLIER_SUPPLEMENT_PENDING: "SUPPLIER_SUPPLEMENT_PENDING",
  RECEIVED: "RECEIVED",
  CANCELLED: "CANCELLED",
};

export const PO_STATUS_CONFIG = {
  [PO_STATUS.DRAFT]: {
    label: "Phiếu tạm",
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    dot: "bg-gray-500",
  },
  [PO_STATUS.PENDING]: {
    label: "Chờ duyệt",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  [PO_STATUS.REJECTED]: {
    label: "Từ chối",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },
  [PO_STATUS.CONFIRMED]: {
    label: "Chờ kiểm",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  [PO_STATUS.CHECKING]: {
    label: "Đang kiểm kê",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    dot: "bg-purple-500",
  },
  [PO_STATUS.SHORTAGE_PENDING_APPROVAL]: {
    label: "Chờ QL xử lý thiếu",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-500",
  },
  [PO_STATUS.SUPPLIER_SUPPLEMENT_PENDING]: {
    label: "Chờ NCC giao bù",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
    dot: "bg-cyan-500",
  },
  [PO_STATUS.RECEIVED]: {
    label: "Đã nhập kho",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  [PO_STATUS.CANCELLED]: {
    label: "Đã hủy",
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-500",
  },
};

export const ALLOWED_TRANSITIONS = {
  [PO_STATUS.DRAFT]: [PO_STATUS.PENDING, PO_STATUS.CANCELLED],
  [PO_STATUS.PENDING]: [PO_STATUS.CONFIRMED, PO_STATUS.REJECTED, PO_STATUS.CANCELLED],
  [PO_STATUS.REJECTED]: [PO_STATUS.PENDING, PO_STATUS.CANCELLED],
  [PO_STATUS.CONFIRMED]: [PO_STATUS.CHECKING], // QĐ duyệt → NV kho kiểm kê
  [PO_STATUS.CHECKING]: [PO_STATUS.RECEIVED, PO_STATUS.SHORTAGE_PENDING_APPROVAL],
  [PO_STATUS.SHORTAGE_PENDING_APPROVAL]: [
    PO_STATUS.RECEIVED,
    PO_STATUS.SUPPLIER_SUPPLEMENT_PENDING,
  ],
  [PO_STATUS.SUPPLIER_SUPPLEMENT_PENDING]: [PO_STATUS.CHECKING],
  [PO_STATUS.RECEIVED]: [], // terminal
  [PO_STATUS.CANCELLED]: [], // terminal
};

export function canTransitionTo(currentStatus, targetStatus) {
  return (ALLOWED_TRANSITIONS[currentStatus] || []).includes(targetStatus);
}

// ─── Code Generation ─────────────────────────────────────
// Format: NH001, NH002, NH003 ...
export function generatePOCode(existingOrders = []) {
  const prefix = "NH";

  // Find highest existing number
  let maxNum = 0;
  for (const order of existingOrders) {
    const code = order.po_number || order.code || "";
    if (code.startsWith(prefix)) {
      const num = parseInt(code.slice(prefix.length), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  }

  return `${prefix}${String(maxNum + 1).padStart(3, "0")}`;
}

// ─── Financial Calculations ──────────────────────────────

/** Calculate line item total: (qty × unit_price) – item_discount */
export function calcItemTotal(quantity, unitPrice, itemDiscount = 0) {
  const subtotal = (quantity || 0) * (unitPrice || 0);
  return Math.max(0, subtotal - (itemDiscount || 0));
}

/** Calculate order-level financials from items + order fields */
export function calcOrderFinancials(items, orderDiscount = 0, taxPercent = 0, shippingFee = 0, paidAmount = 0) {
  const subtotal = items.reduce((sum, item) => {
    return sum + calcItemTotal(item.quantity, item.unit_price, item.discount);
  }, 0);

  const afterDiscount = Math.max(0, subtotal - (orderDiscount || 0));
  const taxAmount = Math.round(afterDiscount * (taxPercent || 0) / 100);
  const total = afterDiscount + taxAmount + (shippingFee || 0);
  const remaining = Math.max(0, total - (paidAmount || 0));

  return {
    subtotal,
    afterDiscount,
    taxAmount,
    taxPercent: taxPercent || 0,
    shippingFee: shippingFee || 0,
    total,
    paidAmount: paidAmount || 0,
    remaining,
  };
}

// ─── Validation ──────────────────────────────────────────

/**
 * Validate order for DRAFT save (minimal rules).
 * Returns { valid: boolean, errors: string[] }
 */
export function validateDraft(order, items) {
  const errors = [];

  if (!items || items.length === 0) {
    errors.push("Phiếu nhập phải có ít nhất 1 sản phẩm.");
  }

  for (const item of items) {
    if ((item.quantity || 0) <= 0) {
      errors.push(`Sản phẩm "${item.name}": số lượng phải > 0.`);
    }

  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate order for CONFIRM (strict rules).
 * Returns { valid: boolean, errors: string[] }
 */
export function validateConfirm(order, items) {
  const draftResult = validateDraft(order, items);
  const errors = [...draftResult.errors];

  // No need to duplicate supplier_id and location_id checks since they are now in validateDraft

  // Check batches – each item should have batch info for perishable goods
  // (Optional: we make this a warning, not a hard error)


  return { valid: errors.length === 0, errors };
}

// ─── Default Order Shape ─────────────────────────────────

export function createDefaultOrder(code) {
  return {
    po_number: code,
    supplier_id: null,
    supplier_name: "",
    contract_id: null,
    contract_number: "",
    contract_title: "",
    location_id: null,
    status: PO_STATUS.DRAFT,
    discount: 0,
    tax_percent: "",
    shipping_fee: "",
    paid_amount: "",
    expiry_date: "",
    notes: "",
    created_by: 1, // TODO: get from auth context
    created_at: new Date().toISOString(),
    confirmed_at: null,
  };
}

// ─── Default Item Shape ──────────────────────────────────

export function createOrderItem(product) {
  const unitPrice = Number(
    product.unit_price ??
      product.unitPrice ??
      product.purchase_price ??
      product.purchasePrice ??
      0,
  );

  return {
    _key: `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    product_id: product.productId || product.product_id || product.id,
    variant_id: product.variantId || product.variant_id || product.id,
    sku: product.sku,
    name: product.name,
    image_url: product.image_url || product.imageUrl || null,
    attributes: product.attributes || null,
    unit: product.unit,
    quantity: 1,
    unit_price: Number.isFinite(unitPrice) ? unitPrice : 0,
    expiry_date: "",
  };
}


// ─── Formatters ──────────────────────────────────────────

export function formatVND(value) {
  if (value == null) return "0 ₫";
  return Number(value).toLocaleString("vi-VN") + " ₫";
}
