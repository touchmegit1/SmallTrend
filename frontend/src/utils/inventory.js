// ─── Date Helpers ────────────────────────────────────────────
export const TODAY = new Date();

export function daysUntilExpiry(expiryDate) {
  if (!expiryDate) return Infinity;
  return Math.ceil((new Date(expiryDate) - TODAY) / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Currency Helpers ────────────────────────────────────────
export function formatCurrency(value) {
  if (value == null) return "0 ₫";
  return value.toLocaleString("vi-VN") + " ₫";
}

export function formatNumber(value) {
  if (value == null) return "0";
  return value.toLocaleString("vi-VN");
}

// ─── Batch Status Classification ─────────────────────────────
// EXPIRED: expiry_date < today
// EXPIRING_CRITICAL: 0–7 days left
// EXPIRING_WARNING: 8–30 days left
// EXPIRING_NOTICE: 31–60 days left
// SAFE: >60 days or no expiry date

export const BATCH_STATUS = {
  EXPIRED: "EXPIRED",
  EXPIRING_CRITICAL: "EXPIRING_CRITICAL",
  EXPIRING_WARNING: "EXPIRING_WARNING",
  EXPIRING_NOTICE: "EXPIRING_NOTICE",
  SAFE: "SAFE",
};

export function classifyBatch(expiryDate) {
  const days = daysUntilExpiry(expiryDate);
  if (days < 0) return BATCH_STATUS.EXPIRED;
  if (days <= 7) return BATCH_STATUS.EXPIRING_CRITICAL;
  if (days <= 30) return BATCH_STATUS.EXPIRING_WARNING;
  if (days <= 60) return BATCH_STATUS.EXPIRING_NOTICE;
  return BATCH_STATUS.SAFE;
}

export const BATCH_STATUS_CONFIG = {
  [BATCH_STATUS.EXPIRED]: {
    label: "Đã hết hạn",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
    badgeBg: "bg-red-100",
  },
  [BATCH_STATUS.EXPIRING_CRITICAL]: {
    label: "Sắp hết hạn (≤7 ngày)",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-500",
    badgeBg: "bg-orange-100",
  },
  [BATCH_STATUS.EXPIRING_WARNING]: {
    label: "Cảnh báo (≤30 ngày)",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    badgeBg: "bg-amber-100",
  },
  [BATCH_STATUS.EXPIRING_NOTICE]: {
    label: "Lưu ý (≤60 ngày)",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    dot: "bg-yellow-500",
    badgeBg: "bg-yellow-100",
  },
  [BATCH_STATUS.SAFE]: {
    label: "An toàn",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    badgeBg: "bg-emerald-100",
  },
};

// ─── Stock Status Classification ─────────────────────────────
// Uses dynamic min_stock per product (fallback 50)

export const STOCK_STATUS = {
  OUT_OF_STOCK: "OUT_OF_STOCK",
  CRITICAL: "CRITICAL",     // < 50% of min_stock
  LOW: "LOW",               // < min_stock
  ADEQUATE: "ADEQUATE",     // min_stock – 2× min_stock
  HEALTHY: "HEALTHY",       // > 2× min_stock
};

export function classifyStock(currentQty, minStock = 50) {
  if (currentQty <= 0) return STOCK_STATUS.OUT_OF_STOCK;
  if (currentQty < minStock * 0.5) return STOCK_STATUS.CRITICAL;
  if (currentQty < minStock) return STOCK_STATUS.LOW;
  if (currentQty <= minStock * 2) return STOCK_STATUS.ADEQUATE;
  return STOCK_STATUS.HEALTHY;
}

export const STOCK_STATUS_CONFIG = {
  [STOCK_STATUS.OUT_OF_STOCK]: {
    label: "Hết hàng",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
    badgeBg: "bg-red-100",
  },
  [STOCK_STATUS.CRITICAL]: {
    label: "Nguy hiểm",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-500",
    badgeBg: "bg-orange-100",
  },
  [STOCK_STATUS.LOW]: {
    label: "Sắp hết",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    badgeBg: "bg-amber-100",
  },
  [STOCK_STATUS.ADEQUATE]: {
    label: "Đủ hàng",
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    dot: "bg-sky-500",
    badgeBg: "bg-sky-100",
  },
  [STOCK_STATUS.HEALTHY]: {
    label: "Dồi dào",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    badgeBg: "bg-emerald-100",
  },
};

// ─── Movement Types ──────────────────────────────────────────
export const MOVEMENT_CONFIG = {
  IN: { label: "Nhập kho", bg: "bg-emerald-100", text: "text-emerald-700", icon: "↓" },
  OUT: { label: "Xuất kho", bg: "bg-red-100", text: "text-red-700", icon: "↑" },
  TRANSFER: { label: "Chuyển kho", bg: "bg-blue-100", text: "text-blue-700", icon: "⇄" },
  ADJUSTMENT: { label: "Điều chỉnh", bg: "bg-purple-100", text: "text-purple-700", icon: "±" },
  DISPOSAL: { label: "Xử lý hủy", bg: "bg-orange-100", text: "text-orange-700", icon: "🗑" },
};

// ─── Sorting Helpers ─────────────────────────────────────────
export function sortBy(arr, key, direction = "asc") {
  return [...arr].sort((a, b) => {
    let aVal = a[key];
    let bVal = b[key];
    if (typeof aVal === "string") aVal = aVal.toLowerCase();
    if (typeof bVal === "string") bVal = bVal.toLowerCase();
    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
}
