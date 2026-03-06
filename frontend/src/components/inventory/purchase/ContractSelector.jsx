import React, { useState } from "react";
import { FileText, X, ChevronDown } from "lucide-react";

export default function ContractSelector({
  contracts,
  selectedContractId,
  onSelect,
  onClear,
  disabled,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedContract = contracts.find((c) => c.id === selectedContractId);

  const getStatusLabel = (status) => {
    const map = {
      DRAFT: "Nháp",
      PENDING_APPROVAL: "Chờ duyệt",
      ACTIVE: "Đang hiệu lực",
      SUSPENDED: "Tạm dừng",
      EXPIRED: "Hết hạn",
      CANCELLED: "Đã hủy",
      COMPLETED: "Hoàn thành",
    };
    return map[status] || status;
  };

  const getStatusColor = (status) => {
    const map = {
      ACTIVE: "bg-emerald-50 text-emerald-700",
      DRAFT: "bg-gray-50 text-gray-600",
      PENDING_APPROVAL: "bg-amber-50 text-amber-700",
      EXPIRED: "bg-red-50 text-red-600",
      CANCELLED: "bg-slate-50 text-slate-500",
      COMPLETED: "bg-blue-50 text-blue-700",
    };
    return map[status] || "bg-gray-50 text-gray-600";
  };

  if (disabled && selectedContract) {
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Hợp đồng
        </label>
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
          <FileText size={14} className="text-indigo-500" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">
              {selectedContract.contractNumber}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {selectedContract.title}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (contracts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
        Hợp đồng liên kết
      </label>

      {selectedContract ? (
        <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg">
          <FileText size={14} className="text-indigo-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-indigo-700 truncate">
              {selectedContract.contractNumber}
            </p>
            <p className="text-xs text-indigo-400 truncate">
              {selectedContract.title}
            </p>
          </div>
          {!disabled && (
            <button
              onClick={onClear}
              className="p-1 rounded-md hover:bg-indigo-100 text-indigo-400 transition"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg hover:border-slate-300 text-sm text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <span className="flex items-center gap-2">
              <FileText size={14} />
              Chọn hợp đồng (tùy chọn)
            </span>
            <ChevronDown
              size={14}
              className={`transition ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isOpen && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-auto">
              {contracts.map((contract) => (
                <button
                  key={contract.id}
                  onClick={() => {
                    onSelect(contract);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-slate-50 text-left transition border-b border-slate-100 last:border-b-0"
                >
                  <FileText
                    size={14}
                    className="text-slate-400 mt-0.5 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {contract.contractNumber}
                      </p>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getStatusColor(contract.status)}`}
                      >
                        {getStatusLabel(contract.status)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {contract.title}
                    </p>
                    {contract.totalValue && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        Giá trị:{" "}
                        {Number(contract.totalValue).toLocaleString("vi-VN")} ₫
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
