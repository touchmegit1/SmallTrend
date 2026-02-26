// ─── Disposal Voucher Status ─────────────────────────────────
export const DV_STATUS = {
  DRAFT: "DRAFT",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
};

export const DV_STATUS_CONFIG = {
  [DV_STATUS.DRAFT]: {
    label: "Nháp",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    badgeBg: "bg-amber-100",
  },
  [DV_STATUS.CONFIRMED]: {
    label: "Đã xác nhận",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    badgeBg: "bg-emerald-100",
  },
  [DV_STATUS.CANCELLED]: {
    label: "Đã hủy",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
    badgeBg: "bg-red-100",
  },
};

// ─── Reason Types ────────────────────────────────────────────
export const REASON_TYPE = {
  EXPIRED: "EXPIRED",
  DAMAGED: "DAMAGED",
  LOST: "LOST",
};

export const REASON_CONFIG = {
  [REASON_TYPE.EXPIRED]: { label: "Hết hạn sử dụng" },
  [REASON_TYPE.DAMAGED]: { label: "Hư hỏng" },
  [REASON_TYPE.LOST]: { label: "Thất thoát" },
};

// ─── Allowed Transitions ─────────────────────────────────────
export const DV_TRANSITIONS = {
  [DV_STATUS.DRAFT]: [DV_STATUS.CONFIRMED, DV_STATUS.CANCELLED],
  [DV_STATUS.CONFIRMED]: [],
  [DV_STATUS.CANCELLED]: [],
};

export function canTransition(from, to) {
  return (DV_TRANSITIONS[from] || []).includes(to);
}

// ─── Code Generation ─────────────────────────────────────────
// Format: EXP-YYYY-XXXX
export function generateDVCode(existingVouchers = []) {
  const year = new Date().getFullYear();
  const prefix = `EXP-${year}-`;

  let maxNum = 0;
  for (const v of existingVouchers) {
    const code = v.code || "";
    if (code.startsWith(prefix)) {
      const num = parseInt(code.slice(prefix.length), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  }

  return `${prefix}${String(maxNum + 1).padStart(4, "0")}`;
}

// ─── Validation ──────────────────────────────────────────────
export function validateForConfirm(voucher, items, batches) {
  const errors = [];

  if (!items || items.length === 0) {
    errors.push("Phiếu xử lý phải có ít nhất 1 sản phẩm.");
  }

  if (!voucher.reason_type) {
    errors.push("Vui lòng chọn lý do xử lý.");
  }

  if (!voucher.location_id) {
    errors.push("Vui lòng chọn kho.");
  }

  // Check each item: quantity must not exceed batch stock
  for (const item of items) {
    const batch = batches.find((b) => b.id === item.batch_id);
    if (!batch) {
      errors.push(`Lô hàng #${item.batch_id} không tồn tại.`);
      continue;
    }
    if (item.quantity <= 0) {
      errors.push(`Số lượng xử lý cho "${item.product_name}" phải > 0.`);
    }
    if (item.quantity > batch.quantity) {
      errors.push(
        `"${item.product_name}" – SL xử lý (${item.quantity}) vượt tồn kho lô (${batch.quantity}).`
      );
    }
  }

  return errors;
}

// ─── Default Shapes ──────────────────────────────────────────
export const DEFAULT_VOUCHER = {
  code: "",
  location_id: null,
  reason_type: REASON_TYPE.EXPIRED,
  created_by: 1,
  confirmed_by: null,
  status: DV_STATUS.DRAFT,
  notes: "",
  total_items: 0,
  total_quantity: 0,
  total_value: 0,
  created_at: null,
  confirmed_at: null,
};

export const DEFAULT_VOUCHER_ITEM = {
  disposal_voucher_id: null,
  batch_id: null,
  product_id: null,
  product_name: "",
  batch_code: "",
  quantity: 0,
  unit_cost: 0,
  total_cost: 0,
  expiry_date: null,
};
