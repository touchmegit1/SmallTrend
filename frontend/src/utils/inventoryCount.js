// ═══════════════════════════════════════════════════════════
//  Inventory Count – Business Logic (Pure functions, no React)
// ═══════════════════════════════════════════════════════════

// ─── Status Flow ─────────────────────────────────────────
// DRAFT → COUNTING → CONFIRMED (stock adjusted)
//                   → CANCELLED
// COUNTING → CONFIRMED / CANCELLED
// CONFIRMED, CANCELLED → (terminal)

export const IC_STATUS = {
  DRAFT: "DRAFT",
  COUNTING: "COUNTING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
};

export const IC_STATUS_CONFIG = {
  [IC_STATUS.DRAFT]: {
    label: "Phiếu tạm",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
  [IC_STATUS.COUNTING]: {
    label: "Đang kiểm",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  [IC_STATUS.CONFIRMED]: {
    label: "Đã xác nhận",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  [IC_STATUS.CANCELLED]: {
    label: "Đã hủy",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },
};

export const ALLOWED_IC_TRANSITIONS = {
  [IC_STATUS.DRAFT]: [IC_STATUS.COUNTING, IC_STATUS.CANCELLED],
  [IC_STATUS.COUNTING]: [IC_STATUS.CONFIRMED, IC_STATUS.CANCELLED],
  [IC_STATUS.CONFIRMED]: [],
  [IC_STATUS.CANCELLED]: [],
};

export function canICTransitionTo(currentStatus, targetStatus) {
  return (ALLOWED_IC_TRANSITIONS[currentStatus] || []).includes(targetStatus);
}

// ─── Difference Reasons ──────────────────────────────────

export const DIFFERENCE_REASONS = [
  { value: "DAMAGE", label: "Hàng hư hỏng / hết hạn" },
  { value: "THEFT", label: "Nghi ngờ thất thoát" },
  { value: "COUNTING_ERROR", label: "Lỗi nhập liệu trước đó" },
  { value: "SHRINKAGE", label: "Hao hụt tự nhiên" },
  { value: "MISPLACED", label: "Đặt sai vị trí" },
  { value: "RETURN_NOT_LOGGED", label: "Trả hàng chưa ghi nhận" },
  { value: "OTHER", label: "Lý do khác" },
];

// ─── Code Generation ─────────────────────────────────────
// Format: IC-XXX
export function generateICCode(existingCounts = []) {
  const prefix = "IC-";

  let maxNum = 0;
  for (const count of existingCounts) {
    const code = count.code || "";
    if (code.startsWith(prefix)) {
      const num = parseInt(code.slice(prefix.length), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  }

  return `${prefix}${String(maxNum + 1).padStart(3, "0")}`;
}

// ─── Item Classification ─────────────────────────────────

export const COUNT_ITEM_STATUS = {
  UNCHECKED: "UNCHECKED",
  MATCHED: "MATCHED",
  SHORTAGE: "SHORTAGE",
  OVERAGE: "OVERAGE",
};

export function classifyCountItem(item) {
  if (item.actual_quantity === null || item.actual_quantity === undefined) {
    return COUNT_ITEM_STATUS.UNCHECKED;
  }
  const diff = item.actual_quantity - item.system_quantity;
  if (diff === 0) return COUNT_ITEM_STATUS.MATCHED;
  if (diff < 0) return COUNT_ITEM_STATUS.SHORTAGE;
  return COUNT_ITEM_STATUS.OVERAGE;
}

export const COUNT_ITEM_COLORS = {
  [COUNT_ITEM_STATUS.UNCHECKED]: {
    bg: "bg-slate-50",
    text: "text-slate-400",
    badge: "bg-slate-100 text-slate-600",
  },
  [COUNT_ITEM_STATUS.MATCHED]: {
    bg: "bg-emerald-50/40",
    text: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700",
  },
  [COUNT_ITEM_STATUS.SHORTAGE]: {
    bg: "bg-red-50/40",
    text: "text-red-600",
    badge: "bg-red-100 text-red-700",
  },
  [COUNT_ITEM_STATUS.OVERAGE]: {
    bg: "bg-blue-50/40",
    text: "text-blue-600",
    badge: "bg-blue-100 text-blue-700",
  },
};

// ─── Statistics ───────────────────────────────────────────

export function calcCountStats(items) {
  let total = items.length;
  let counted = 0;
  let matched = 0;
  let shortage = 0;
  let overage = 0;
  let unchecked = 0;
  let totalShortageValue = 0;
  let totalOverageValue = 0;

  for (const item of items) {
    const status = classifyCountItem(item);
    switch (status) {
      case COUNT_ITEM_STATUS.MATCHED:
        matched++;
        counted++;
        break;
      case COUNT_ITEM_STATUS.SHORTAGE:
        shortage++;
        counted++;
        totalShortageValue += Math.abs(item.difference_value || 0);
        break;
      case COUNT_ITEM_STATUS.OVERAGE:
        overage++;
        counted++;
        totalOverageValue += Math.abs(item.difference_value || 0);
        break;
      default:
        unchecked++;
    }
  }

  const progress = total > 0 ? Math.round((counted / total) * 100) : 0;

  return {
    total,
    counted,
    matched,
    shortage,
    overage,
    unchecked,
    progress,
    totalShortageValue,
    totalOverageValue,
    totalDifferenceValue: totalOverageValue - totalShortageValue,
  };
}

// ─── Validation ──────────────────────────────────────────

export function validateDraftCount(countSession, items) {
  const errors = [];
  if (!items || items.length === 0) {
    errors.push("Phiên kiểm kho phải có ít nhất 1 sản phẩm.");
  }
  return { valid: errors.length === 0, errors };
}

export function validateConfirmCount(countSession, items) {
  const draftResult = validateDraftCount(countSession, items);
  const errors = [...draftResult.errors];

  if (!countSession.location_id) {
    errors.push("Vui lòng chọn vị trí / kho trước khi xác nhận.");
  }

  const countedItems = items.filter(
    (i) => i.actual_quantity !== null && i.actual_quantity !== undefined
  );
  if (countedItems.length === 0) {
    errors.push("Chưa có sản phẩm nào được kiểm kê.");
  }

  // Check if items with differences have reasons
  const itemsMissingReason = items.filter((i) => {
    if (i.actual_quantity === null || i.actual_quantity === undefined) return false;
    const diff = i.actual_quantity - i.system_quantity;
    return diff !== 0 && !i.reason;
  });

  if (itemsMissingReason.length > 0) {
    const names = itemsMissingReason.map((i) => `"${i.name}"`).join(", ");
    errors.push(`Cần nhập lý do cho các sản phẩm có lệch: ${names}`);
  }

  // Check negative actual quantities
  const negativeItems = items.filter(
    (i) => i.actual_quantity !== null && i.actual_quantity < 0
  );
  if (negativeItems.length > 0) {
    errors.push("Số lượng thực tế không được âm.");
  }

  return { valid: errors.length === 0, errors };
}

// ─── Default Session Shape ───────────────────────────────

export function createDefaultCountSession(code) {
  return {
    code,
    location_id: null,
    status: IC_STATUS.DRAFT,
    notes: "",
    created_by: 1, // TODO: get from auth
    confirmed_by: null,
    created_at: new Date().toISOString(),
    confirmed_at: null,
  };
}

// ─── Create Count Item From Product ──────────────────────

export function createCountItem(product) {
  return {
    _key: `ci_${product.id}_${Date.now()}`,
    product_id: product.id,
    sku: product.sku,
    name: product.name,
    unit: product.unit,
    purchase_price: product.purchase_price || 0,
    system_quantity: product.stock_quantity || 0,
    actual_quantity: null,
    difference_quantity: 0,
    difference_value: 0,
    reason: "",
  };
}

// ─── Formatters ──────────────────────────────────────────

export function formatVNDCount(value) {
  if (value == null) return "0 ₫";
  return Number(value).toLocaleString("vi-VN") + " ₫";
}
