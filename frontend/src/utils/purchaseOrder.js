// ═══════════════════════════════════════════════════════════
//  Purchase Order – Business Logic (Pure functions, no React)
// ═══════════════════════════════════════════════════════════

// ─── Status Flow ─────────────────────────────────────────
// DRAFT → CONFIRMED (stock updated)
//       → CANCELLED (no stock change)
// CONFIRMED → (terminal – cannot go back)
// CANCELLED → (terminal – cannot go back)

export const PO_STATUS = {
  DRAFT: "DRAFT",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
};

export const PO_STATUS_CONFIG = {
  [PO_STATUS.DRAFT]: {
    label: "Phiếu tạm",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  [PO_STATUS.CONFIRMED]: {
    label: "Đã nhập hàng",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  [PO_STATUS.CANCELLED]: {
    label: "Đã hủy",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },
};

export const ALLOWED_TRANSITIONS = {
  [PO_STATUS.DRAFT]: [PO_STATUS.CONFIRMED, PO_STATUS.CANCELLED],
  [PO_STATUS.CONFIRMED]: [], // terminal
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
    if ((item.unit_price || 0) < 0) {
      errors.push(`Sản phẩm "${item.name}": đơn giá không được âm.`);
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

  if (!order.supplier_id) {
    errors.push("Vui lòng chọn nhà cung cấp trước khi xác nhận.");
  }

  if (!order.location_id) {
    errors.push("Vui lòng chọn vị trí nhập kho.");
  }

  if (!items || items.length === 0) {
    errors.push("Không thể xác nhận phiếu nhập rỗng.");
  }

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
    location_id: null,
    status: PO_STATUS.DRAFT,
    discount: 0,
    tax_percent: 0,
    shipping_fee: 0,
    paid_amount: 0,
    expiry_date: "",
    notes: "",
    created_by: 1, // TODO: get from auth context
    created_at: new Date().toISOString(),
    confirmed_at: null,
  };
}

// ─── Default Item Shape ──────────────────────────────────

export function createOrderItem(product) {
  return {
    _key: `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    product_id: product.id,
    sku: product.sku,
    name: product.name,
    unit: product.unit,
    quantity: 1,
    unit_price: product.purchase_price || 0,
    discount: 0,
    total: product.purchase_price || 0,
    expiry_date: "",
    batches: [], // [{ batch_code, expiry_date, quantity }]
  };
}

// ─── Formatters ──────────────────────────────────────────

export function formatVND(value) {
  if (value == null) return "0 ₫";
  return Number(value).toLocaleString("vi-VN") + " ₫";
}
