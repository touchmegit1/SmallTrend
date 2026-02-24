import React from "react";
import {
  Package,
  AlertTriangle,
  AlertOctagon,
  TrendingUp,
  Clock,
  DollarSign,
} from "lucide-react";
import { formatCurrency, formatNumber } from "../../utils/inventory";

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  iconBg,
  iconColor,
  accent,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
          <p
            className={`text-2xl font-bold tracking-tight ${accent || "text-slate-900"}`}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1.5 truncate">{subtitle}</p>
          )}
        </div>
        <div
          className={`p-2.5 rounded-xl ${iconBg} group-hover:scale-105 transition-transform`}
        >
          <Icon size={22} className={iconColor} />
        </div>
      </div>
    </div>
  );
}

export default function StatsCards({ stats }) {
  const cards = [
    {
      icon: Package,
      label: "Tổng sản phẩm",
      value: formatNumber(stats.productCount),
      subtitle: `${formatNumber(stats.totalStockUnits)} đơn vị tồn kho`,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: DollarSign,
      label: "Giá trị tồn kho",
      value: formatCurrency(stats.totalInventoryValue),
      subtitle: "Tính theo giá nhập",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      icon: AlertTriangle,
      label: "Sắp hết hàng",
      value: stats.criticalStock + stats.lowStock,
      subtitle: `${stats.outOfStock} đã hết hàng`,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      accent:
        stats.criticalStock + stats.lowStock > 0 ? "text-amber-600" : undefined,
    },
    {
      icon: AlertOctagon,
      label: "Cần xử lý ngay",
      value: stats.needsAttention,
      subtitle: `${stats.expiredBatches} lô hết hạn · ${stats.expiringBatches} sắp hết`,
      iconBg: stats.needsAttention > 0 ? "bg-red-50" : "bg-slate-50",
      iconColor: stats.needsAttention > 0 ? "text-red-600" : "text-slate-400",
      accent: stats.needsAttention > 0 ? "text-red-600" : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
