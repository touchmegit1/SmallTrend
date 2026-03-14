/**
 * BulkUpdatePanel.jsx
 * Bulk actions panel for Price Setting.
 */
import React, { useState, useRef } from "react";
import {
    TrendingUp,
    FileSpreadsheet,
    X,
    ChevronDown,
    ChevronUp,
    CheckSquare,
    AlertTriangle,
} from "lucide-react";
import Button from "./button";
import { Input } from "./input";

export default function BulkUpdatePanel({
    selectedCount = 0,
    onIncreaseByPercent,
    onImportExcel,
}) {
    const [expanded, setExpanded] = useState(false);
    const [showInput, setShowInput] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const fileInputRef = useRef(null);

    const handleApply = () => {
        const val = parseFloat(inputValue);
        if (isNaN(val)) return;
        onIncreaseByPercent?.(val);
        setShowInput(false);
        setInputValue("");
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onImportExcel?.(file);
            e.target.value = "";
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Toggle Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
                        <CheckSquare className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-gray-900">Cap nhat hang loat</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {selectedCount > 0
                                ? `Da chon ${selectedCount} san pham`
                                : "Chon san pham trong bang de thao tac"}
                        </p>
                    </div>
                </div>
                {expanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
            </button>

            {/* Actions */}
            {expanded && (
                <div className="px-6 pb-5 pt-1 border-t border-gray-100">
                    {selectedCount === 0 && (
                        <div className="mb-4 bg-amber-50 text-amber-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm border border-amber-100">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            <span>Hay chon it nhat 1 san pham de thuc hien thao tac hang loat.</span>
                        </div>
                    )}

                    <div className="flex gap-3">
                        {/* Increase by % */}
                        <button
                            onClick={() => setShowInput(!showInput)}
                            disabled={selectedCount === 0}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${selectedCount === 0
                                ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                                : showInput
                                    ? "bg-blue-50 border-blue-300 ring-2 ring-blue-200"
                                    : "bg-blue-50 hover:bg-blue-100 border-blue-200"
                                }`}
                        >
                            <TrendingUp className={`w-5 h-5 ${selectedCount === 0 ? "text-gray-300" : "text-blue-600"}`} />
                            <div>
                                <p className={`text-sm font-semibold ${selectedCount === 0 ? "text-gray-400" : "text-gray-800"}`}>
                                    Tang gia theo %
                                </p>
                                <p className="text-[11px] text-gray-400 mt-0.5">Tang gia ban cho san pham da chon</p>
                            </div>
                        </button>

                        {/* Import Excel */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-purple-50 hover:bg-purple-100 border-purple-200 text-left transition-all"
                        >
                            <FileSpreadsheet className="w-5 h-5 text-purple-600" />
                            <div>
                                <p className="text-sm font-semibold text-gray-800">Import tu Excel</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">Nhap gia hang loat tu file .xlsx</p>
                            </div>
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>

                    {/* Input form */}
                    {showInput && (
                        <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-center gap-3">
                            <div className="flex-1 relative">
                                <Input
                                    type="number"
                                    step="0.1"
                                    placeholder="Nhap % tang gia (VD: 10)"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    className="h-11 pr-8 bg-white rounded-xl"
                                    onKeyDown={(e) => e.key === "Enter" && handleApply()}
                                    autoFocus
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">%</span>
                            </div>
                            <Button
                                onClick={handleApply}
                                disabled={!inputValue || selectedCount === 0}
                                className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm font-semibold whitespace-nowrap"
                            >
                                Ap dung
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => { setShowInput(false); setInputValue(""); }}
                                className="h-11 w-11 p-0 text-gray-400 hover:text-gray-600 rounded-xl"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
