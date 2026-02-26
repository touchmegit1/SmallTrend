import React from "react";
import { Search, CheckCheck } from "lucide-react";

export default function CountFilterBar({
  searchTerm,
  setSearchTerm,
  activeTab,
  setActiveTab,
  stats,
  isEditable,
  onMarkAllMatched,
}) {
  const tabs = [
    { key: "all", label: "Tất cả", count: stats.total },
    { key: "matched", label: "Khớp", count: stats.matched },
    { key: "shortage", label: "Thiếu", count: stats.shortage },
    { key: "overage", label: "Dư", count: stats.overage },
    { key: "unchecked", label: "Chưa kiểm", count: stats.unchecked },
  ];

  return (
    <div className="bg-white border-b border-slate-200 px-5 py-2.5 shrink-0">
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã SKU hoặc tên sản phẩm..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 transition placeholder:text-slate-400"
          />
        </div>

        {/* Quick match button */}
        {isEditable && stats.unchecked > 0 && (
          <button
            onClick={onMarkAllMatched}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition border border-indigo-100"
          >
            <CheckCheck size={14} />
            Khớp tất cả chưa kiểm
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mt-2.5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === tab.key
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>
    </div>
  );
}
