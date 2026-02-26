import React from "react";
import { AlertTriangle, Clock, ShieldX, ShieldCheck } from "lucide-react";
import {
  formatDate,
  formatNumber,
  daysUntilExpiry,
  BATCH_STATUS,
  BATCH_STATUS_CONFIG,
} from "../../utils/inventory";

export default function BatchManagementPanel({
  batches,
  batchTab,
  setBatchTab,
}) {
  // ─── Tab Counts ──────────────────────────────────────────
  const counts = {
    all: batches.length,
    expired: batches.filter((b) => b.status === BATCH_STATUS.EXPIRED).length,
    expiring: batches.filter(
      (b) =>
        b.status === BATCH_STATUS.EXPIRING_CRITICAL ||
        b.status === BATCH_STATUS.EXPIRING_WARNING ||
        b.status === BATCH_STATUS.EXPIRING_NOTICE,
    ).length,
    safe: batches.filter((b) => b.status === BATCH_STATUS.SAFE).length,
  };

  // We need to filter here since parent already passes enrichedBatches
  // but batchTab filtering is in hook — we receive filteredBatches from parent
  const displayBatches = batches;

  const tabs = [
    { id: "all", label: "Tất cả", count: counts.all, icon: Clock },
    {
      id: "expired",
      label: "Hết hạn",
      count: counts.expired,
      icon: ShieldX,
      accent: counts.expired > 0 ? "text-red-600" : undefined,
    },
    {
      id: "expiring",
      label: "Sắp hết hạn",
      count: counts.expiring,
      icon: AlertTriangle,
      accent: counts.expiring > 0 ? "text-amber-600" : undefined,
    },
    { id: "safe", label: "An toàn", count: counts.safe, icon: ShieldCheck },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* ─── Header ──────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900">
            Quản lý lô hàng & hạn sử dụng
          </h2>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setBatchTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                batchTab === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <tab.icon size={14} className={tab.accent} />
              {tab.label}
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  batchTab === tab.id
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Table ───────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Mã lô
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Sản phẩm
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Số lượng
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ngày nhận
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Hạn sử dụng
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Tình trạng
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayBatches.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <Clock size={36} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-slate-500 text-sm font-medium">
                    Không có lô hàng nào trong nhóm này
                  </p>
                </td>
              </tr>
            ) : (
              displayBatches.map((batch) => {
                const cfg = BATCH_STATUS_CONFIG[batch.status];
                const days = batch.daysRemaining;
                return (
                  <tr
                    key={batch.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      batch.status === BATCH_STATUS.EXPIRED
                        ? "bg-red-50/30"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {batch.batch_code}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900 text-sm">
                          {batch.productName}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                          {batch.productSku}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {formatNumber(batch.quantity)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-sm">
                      {formatDate(batch.received_date)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {batch.expiry_date ? (
                        <span
                          className={
                            batch.status === BATCH_STATUS.EXPIRED
                              ? "text-red-600 font-medium"
                              : "text-slate-700"
                          }
                        >
                          {formatDate(batch.expiry_date)}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">
                          Không có HSD
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${cfg.badgeBg} ${cfg.text}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                        ></span>
                        {batch.status === BATCH_STATUS.EXPIRED
                          ? `Hết hạn ${Math.abs(days)} ngày`
                          : days !== null
                            ? `Còn ${days} ngày`
                            : "An toàn"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
