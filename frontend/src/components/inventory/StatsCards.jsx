import React, { useState, useEffect } from "react";
import {
  Package,
  AlertOctagon,
  DollarSign,
  X,
  AlertTriangle,
  Clock,
  ShoppingCart,
  ChevronRight,
} from "lucide-react";
import {
  formatCurrency,
  formatNumber,
  formatDate,
  STOCK_STATUS,
  STOCK_STATUS_CONFIG,
  BATCH_STATUS,
  BATCH_STATUS_CONFIG,
} from "../../utils/inventory";

// ─── Backdrop ────────────────────────────────────────────────────
function Backdrop({ onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
      onClick={onClose}
    />
  );
}

// ─── Modal Shell ─────────────────────────────────────────────────
function Modal({
  title,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  onClose,
  children,
}) {
  // Đóng bằng Escape
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      <Backdrop onClose={onClose} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
            <div className={`p-2 rounded-xl ${iconBg}`}>
              <Icon size={20} className={iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-slate-800">{title}</h2>
              {subtitle && (
                <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            >
              <X size={18} />
            </button>
          </div>
          {/* Body */}
          <div className="overflow-y-auto flex-1 p-6">{children}</div>
        </div>
      </div>
    </>
  );
}

// ─── Badge ────────────────────────────────────────────────────────
function Badge({ label, badgeBg, text }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeBg} ${text}`}
    >
      {label}
    </span>
  );
}

// ─── Modal: Tổng sản phẩm ────────────────────────────────────────
function ProductsModal({ products, onClose }) {
  const [search, setSearch] = useState("");
  const filtered = products.filter(
    (p) =>
      (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Modal
      title="Danh sách sản phẩm"
      subtitle={`${products.length} sản phẩm đang quản lý trong kho`}
      icon={Package}
      iconBg="bg-blue-50"
      iconColor="text-blue-600"
      onClose={onClose}
    >
      <input
        type="text"
        placeholder="Tìm theo tên hoặc SKU…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      />
      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-8">
            Không tìm thấy sản phẩm nào
          </p>
        )}
        {filtered.map((p) => {
          const cfg =
            STOCK_STATUS_CONFIG[p.stockStatus] ||
            STOCK_STATUS_CONFIG[STOCK_STATUS.HEALTHY];
          return (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {p.name}
                </p>
                <p className="text-xs text-slate-400">
                  {p.sku} · {p.categoryName}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-slate-800">
                  {formatNumber(p.stock_quantity ?? 0)}
                </p>
                <p className="text-xs text-slate-400">đơn vị</p>
              </div>
              <Badge label={cfg.label} badgeBg={cfg.badgeBg} text={cfg.text} />
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

// ─── Modal: Giá trị tồn kho ──────────────────────────────────────
function InventoryValueModal({ products, totalValue, onClose }) {
  const sorted = [...products]
    .filter((p) => (p.inventoryValue ?? 0) > 0)
    .sort((a, b) => (b.inventoryValue ?? 0) - (a.inventoryValue ?? 0));
  const maxVal = sorted[0]?.inventoryValue ?? 1;

  return (
    <Modal
      title="Giá trị tồn kho theo sản phẩm"
      subtitle={`Tổng: ${formatCurrency(totalValue)} · Sắp xếp theo giá trị cao nhất`}
      icon={DollarSign}
      iconBg="bg-emerald-50"
      iconColor="text-emerald-600"
      onClose={onClose}
    >
      {sorted.length === 0 && (
        <p className="text-center text-sm text-slate-400 py-8">
          Chưa có dữ liệu giá trị tồn kho
        </p>
      )}
      <div className="space-y-3">
        {sorted.map((p, idx) => {
          const pct = Math.round(((p.inventoryValue ?? 0) / maxVal) * 100);
          return (
            <div key={p.id} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-bold text-slate-400 w-5 shrink-0">
                    #{idx + 1}
                  </span>
                  <p className="text-sm font-semibold text-slate-700 truncate">
                    {p.name}
                  </p>
                </div>
                <p className="text-sm font-bold text-emerald-700 shrink-0 ml-2">
                  {formatCurrency(p.inventoryValue ?? 0)}
                </p>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {formatNumber(p.stock_quantity ?? 0)} đơn vị ×{" "}
                {formatCurrency(p.purchase_price ?? 0)}
              </p>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

// ─── Modal: Cần xử lý ngay ───────────────────────────────────────
const URGENT_TABS = [
  { key: "low_stock", label: "Thiếu hàng", icon: ShoppingCart },
  { key: "expired", label: "Lô hết hạn", icon: AlertOctagon },
  { key: "expiring", label: "Lô sắp hết", icon: Clock },
];

function UrgentModal({ products, batches, onClose }) {
  const [tab, setTab] = useState("low_stock");

  const lowStockItems = products
    .filter(
      (p) =>
        p.stockStatus === STOCK_STATUS.OUT_OF_STOCK ||
        p.stockStatus === STOCK_STATUS.CRITICAL ||
        p.stockStatus === STOCK_STATUS.LOW,
    )
    .sort((a, b) => (a.stock_quantity ?? 0) - (b.stock_quantity ?? 0));

  const expiredBatches = batches.filter(
    (b) => b.status === BATCH_STATUS.EXPIRED,
  );

  const expiringBatches = batches
    .filter(
      (b) =>
        b.status === BATCH_STATUS.EXPIRING_CRITICAL ||
        b.status === BATCH_STATUS.EXPIRING_WARNING ||
        b.status === BATCH_STATUS.EXPIRING_NOTICE,
    )
    .sort((a, b) => (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999));

  const counts = {
    low_stock: lowStockItems.length,
    expired: expiredBatches.length,
    expiring: expiringBatches.length,
  };

  return (
    <Modal
      title="Cần xử lý ngay"
      subtitle="Các vấn đề cần chú ý trong kho hàng"
      icon={AlertOctagon}
      iconBg="bg-red-50"
      iconColor="text-red-600"
      onClose={onClose}
    >
      {/* Tab bar */}
      <div className="flex gap-1 mb-5 bg-slate-100 p-1 rounded-xl">
        {URGENT_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition ${
              tab === t.key
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <t.icon size={13} />
            {t.label}
            {counts[t.key] > 0 && (
              <span
                className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  tab === t.key
                    ? "bg-red-100 text-red-600"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {counts[t.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Thiếu hàng */}
      {tab === "low_stock" && (
        <div className="space-y-2">
          {lowStockItems.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-8">
              ✅ Không có sản phẩm thiếu hàng
            </p>
          )}
          {lowStockItems.map((p) => {
            const cfg = STOCK_STATUS_CONFIG[p.stockStatus];
            return (
              <div
                key={p.id}
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border ${cfg.border} ${cfg.bg}`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${cfg.text} truncate`}>
                    {p.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {p.sku} · Tối thiểu: {formatNumber(p.min_stock ?? 0)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${cfg.text}`}>
                    {formatNumber(p.stock_quantity ?? 0)}
                  </p>
                  <p className="text-xs text-slate-400">đơn vị còn</p>
                </div>
                <Badge
                  label={cfg.label}
                  badgeBg={cfg.badgeBg}
                  text={cfg.text}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Lô hết hạn */}
      {tab === "expired" && (
        <div className="space-y-2">
          {expiredBatches.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-8">
              ✅ Không có lô hàng hết hạn
            </p>
          )}
          {expiredBatches.map((b) => {
            const cfg = BATCH_STATUS_CONFIG[BATCH_STATUS.EXPIRED];
            return (
              <div
                key={b.id}
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border ${cfg.border} ${cfg.bg}`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${cfg.text} truncate`}>
                    {b.productName}
                  </p>
                  <p className="text-xs text-slate-500">
                    Lô: {b.batch_code} · HSD: {formatDate(b.expiry_date)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${cfg.text}`}>
                    {formatNumber(b.quantity)}
                  </p>
                  <p className="text-xs text-slate-400">đơn vị</p>
                </div>
                <Badge label="Hết hạn" badgeBg={cfg.badgeBg} text={cfg.text} />
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Lô sắp hết hạn */}
      {tab === "expiring" && (
        <div className="space-y-2">
          {expiringBatches.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-8">
              ✅ Không có lô hàng sắp hết hạn
            </p>
          )}
          {expiringBatches.map((b) => {
            const cfg =
              BATCH_STATUS_CONFIG[b.status] ||
              BATCH_STATUS_CONFIG[BATCH_STATUS.EXPIRING_NOTICE];
            return (
              <div
                key={b.id}
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border ${cfg.border} ${cfg.bg}`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${cfg.text} truncate`}>
                    {b.productName}
                  </p>
                  <p className="text-xs text-slate-500">
                    Lô: {b.batch_code} · HSD: {formatDate(b.expiry_date)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${cfg.text}`}>
                    {b.daysRemaining != null ? `${b.daysRemaining} ngày` : "—"}
                  </p>
                  <p className="text-xs text-slate-400">còn lại</p>
                </div>
                <Badge
                  label={cfg.label}
                  badgeBg={cfg.badgeBg}
                  text={cfg.text}
                />
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

// ─── StatCard (clickable) ─────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  subtitleLines,
  iconBg,
  iconColor,
  accent,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-200 hover:bg-indigo-50/20 transition-all group text-left w-full cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
          <p
            className={`text-2xl font-bold tracking-tight ${accent || "text-slate-900"}`}
          >
            {value}
          </p>
          {subtitleLines
            ? subtitleLines.map((line, i) => (
                <p key={i} className="text-xs text-slate-400 mt-1 truncate">
                  {line}
                </p>
              ))
            : subtitle && (
                <p className="text-xs text-slate-400 mt-1.5 truncate">
                  {subtitle}
                </p>
              )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div
            className={`p-2.5 rounded-xl ${iconBg} group-hover:scale-105 transition-transform`}
          >
            <Icon size={22} className={iconColor} />
          </div>
          <span className="flex items-center gap-0.5 text-[10px] text-slate-400 group-hover:text-indigo-500 transition-colors">
            Chi tiết <ChevronRight size={10} />
          </span>
        </div>
      </div>
    </button>
  );
}

// ─── StatsCards (main export) ─────────────────────────────────────
export default function StatsCards({
  stats,
  allProducts = [],
  allBatches = [],
}) {
  const [activeModal, setActiveModal] = useState(null); // null | "products" | "value" | "urgent"

  const lowStockTotal = (stats.criticalStock ?? 0) + (stats.lowStock ?? 0);
  const totalNeedsAttention = (stats.needsAttention ?? 0) + lowStockTotal;
  const hasIssue = totalNeedsAttention > 0;

  const cards = [
    {
      id: "products",
      icon: Package,
      label: "Tổng sản phẩm",
      value: `${formatNumber(stats.productCount)} loại`,
      subtitle: `${formatNumber(stats.totalStockUnits)} đơn vị tồn kho`,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      id: "value",
      icon: DollarSign,
      label: "Giá trị tồn kho",
      value: formatCurrency(stats.totalInventoryValue),
      subtitle: "Tính theo giá nhập",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      id: "urgent",
      icon: AlertOctagon,
      label: "Cần xử lý ngay",
      value: totalNeedsAttention,
      subtitleLines: [
        `${stats.expiredBatches ?? 0} lô hết hạn · ${stats.expiringBatches ?? 0} lô sắp hết`,
        `${lowStockTotal} sắp hết hàng · ${stats.outOfStock ?? 0} đã hết hàng`,
      ],
      iconBg: hasIssue ? "bg-red-50" : "bg-slate-50",
      iconColor: hasIssue ? "text-red-600" : "text-slate-400",
      accent: hasIssue ? "text-red-600" : undefined,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {cards.map((card) => (
          <StatCard
            key={card.id}
            {...card}
            onClick={() => setActiveModal(card.id)}
          />
        ))}
      </div>

      {/* Modals */}
      {activeModal === "products" && (
        <ProductsModal
          products={allProducts}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === "value" && (
        <InventoryValueModal
          products={allProducts}
          totalValue={stats.totalInventoryValue}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === "urgent" && (
        <UrgentModal
          products={allProducts}
          batches={allBatches}
          onClose={() => setActiveModal(null)}
        />
      )}
    </>
  );
}
