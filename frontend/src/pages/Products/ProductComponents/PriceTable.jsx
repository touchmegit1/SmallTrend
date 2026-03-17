/**
 * PriceTable.jsx
 * Bảng hiển thị giá sản phẩm — đơn giản.
 *
 * Cột: ☑ | Product | SKU | Cost Price | Tax % | Selling Price | Profit | Action
 */
import React from "react";
import {
    Edit2,
    Save,
    X,
    RefreshCw,
    AlertTriangle,
    Clock,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Search,
    Percent,
    DollarSign,
    History
} from "lucide-react";
import Button from "./button";
import { Input } from "./input";
import { calculateProfit, formatCurrency } from "../../../utils/priceCalculation";

const DateInput = ({ dateValue, onChange, disabled = false }) => {
    const [focused, setFocused] = React.useState(false);
    const dateOnly = dateValue ? dateValue.split('T')[0] : '';

    const displayValue = focused ? dateOnly : (dateOnly ? (() => {
        const [y, m, d] = dateOnly.split('-');
        return `${d}/${m}/${y.slice(-2)}`;
    })() : '');

    return (
        <input
            type={focused ? "date" : "text"}
            value={displayValue}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            className="w-[85px] text-center text-[11px] font-semibold text-gray-700 bg-gray-50 hover:bg-white border rounded-md px-1 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer shadow-sm transition-all"
        />
    );
};

export default function PriceTable({
    variants,
    loading,
    readOnly = false,
    // Edit
    editingId,
    editPrice,
    savingId,
    onEditClick,
    onCancelEdit,
    onSavePrice,
    onEditPriceChange,
    // Selection
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    // Sort
    sortConfig,
    onSort,
    // Actions
    onCreatePriceModalOpen,
    onViewHistory,
    onEffectiveDateChange,
    onExpiryDateChange
}) {
    const allSelected = variants.length > 0 && selectedIds.length === variants.length;
    const someSelected = selectedIds.length > 0 && !allSelected;

    const getSortIcon = (key) => {
        if (sortConfig?.key !== key) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-300" />;
        return sortConfig.direction === "asc"
            ? <ArrowUp className="w-3.5 h-3.5 text-blue-500" />
            : <ArrowDown className="w-3.5 h-3.5 text-blue-500" />;
    };

    const SortHeader = ({ label, sortKey, align = "left", className = "" }) => (
        <th
            className={`px-2 py-2.5 font-semibold text-gray-600 text-[11px] uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100/80 transition-colors select-none ${align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"
                } ${className}`}
            onClick={() => onSort?.(sortKey)}
        >
            <div className={`flex items-center gap-1 ${align === "right" ? "justify-end" : ""}`}>
                <span>{label}</span>
                {getSortIcon(sortKey)}
            </div>
        </th>
    );

    return (
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-500/5 ring-1 ring-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 border-b-2 border-gray-200">
                        <tr>
                            <th className="px-2 py-2.5 w-8 text-center">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    ref={(el) => { if (el) el.indeterminate = someSelected; }}
                                    onChange={onToggleSelectAll}
                                    disabled={readOnly}
                                    className="w-3.5 h-3.5 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                                />
                            </th>
                            <SortHeader label="Sản phẩm" sortKey="name" />
                            <SortHeader label="SKU" sortKey="sku" className="w-[80px]" />
                            <SortHeader label="Giá nhập" sortKey="costPrice" align="right" className="w-[85px]" />
                            <th className="px-1 py-2.5 font-semibold text-gray-600 text-[11px] uppercase tracking-wider text-center whitespace-nowrap w-[50px]">
                                Thuế %
                            </th>
                            <SortHeader label="Giá bán" sortKey="activeSellingPrice" align="right" className="w-[85px]" />
                            <SortHeader label="Lợi nhuận" sortKey="profit" align="right" className="w-[85px]" />
                            <th className="px-1 py-2.5 font-semibold text-gray-600 text-[11px] uppercase tracking-wider text-center whitespace-nowrap w-[90px]">
                                Hiệu lực
                            </th>
                            <th className="px-1 py-2.5 font-semibold text-gray-600 text-[11px] uppercase tracking-wider text-center whitespace-nowrap w-[90px]">
                                Hết hiệu lực
                            </th>
                            <th className="px-2 py-2.5 font-semibold text-gray-600 text-[11px] uppercase tracking-wider text-center w-[85px] whitespace-nowrap shadow-[-5px_0_10px_-3px_rgba(0,0,0,0.03)] sticky right-0 bg-white">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/80">
                        {loading ? (
                            <tr>
                                <td colSpan="9" className="px-6 py-16 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-blue-600" />
                                        <span className="text-sm font-medium">Đang tải dữ liệu...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : variants.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="px-6 py-16 text-center text-gray-500 bg-gray-50/30">
                                    <div className="flex flex-col items-center gap-2">
                                        <Search className="w-10 h-10 text-gray-300" />
                                        <p className="font-medium">Không tìm thấy sản phẩm nào</p>
                                        <p className="text-xs text-gray-400">Thử thay đổi điều kiện tìm kiếm hoặc bộ lọc.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            variants.map((variant) => {
                                const isEditing = editingId === variant.id;
                                const isSelected = selectedIds.includes(variant.id);
                                const costPrice = Number(variant.costPrice) || 0;
                                const taxRate = Number(variant.activeTaxPercent) || Number(variant.taxRate) || 0;
                                const sellPrice = Number(variant.activeSellingPrice) || Number(variant.sellPrice) || 0;
                                // Giá bán cho khách = sellPrice
                                const profit = calculateProfit(costPrice, sellPrice);
                                const hasNegativeProfit = profit < 0;

                                return (
                                    <tr
                                        key={variant.id}
                                        className={`transition-colors group ${isSelected
                                            ? "bg-blue-50/60"
                                            : hasNegativeProfit
                                                ? "bg-red-50/30 hover:bg-red-50/50"
                                                : "hover:bg-blue-50/20"
                                            }`}
                                    >
                                        {/* Checkbox */}
                                        <td className="px-2 py-2 text-center">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => onToggleSelect(variant.id)}
                                                disabled={readOnly}
                                                className="w-3.5 h-3.5 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                                            />
                                        </td>

                                        {/* Product */}
                                        <td className="px-2 py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {variant.imageUrl ? (
                                                        <img src={variant.imageUrl} alt={variant.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-gray-400 font-medium text-[9px]">IMG</span>
                                                    )}
                                                </div>
                                                <div className="max-w-[180px] sm:max-w-[240px] xl:max-w-[300px]">
                                                    <p className="font-semibold text-gray-900 text-[13px] leading-tight whitespace-normal break-words" title={variant.name}>
                                                        {variant.name}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 mt-0.5 whitespace-normal break-words" title={variant.brandName || variant.categoryName || "Không phân loại"}>
                                                        {variant.brandName || variant.categoryName || "Không phân loại"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* SKU */}
                                        <td className="px-2 py-2">
                                            <span className="inline-block max-w-[140px] sm:max-w-[180px] font-mono text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 whitespace-normal break-all" title={variant.sku}>
                                                {variant.sku}
                                            </span>
                                        </td>

                                        {/* Cost Price — gray */}
                                        <td className="px-2 py-2 text-right">
                                            <span className="text-gray-500 font-semibold font-mono text-[13px]">
                                                {formatCurrency(costPrice)}
                                            </span>
                                        </td>

                                        {/* Tax % */}
                                        <td className="px-1 py-2 text-center">
                                            <span className="inline-flex items-center gap-0.5 bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded-full text-[11px] font-semibold border border-cyan-100">
                                                <Percent className="w-2.5 h-2.5" />
                                                {taxRate}%
                                            </span>
                                        </td>

                                        {/* Selling Price (sau thuế) — bold black */}
                                        <td className="px-2 py-2 text-right">
                                            <span className="text-gray-900 font-bold font-mono text-[13px]">
                                                {formatCurrency(sellPrice)}
                                            </span>
                                        </td>

                                        {/* Profit */}
                                        <td className="px-2 py-2 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {hasNegativeProfit && (
                                                    <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" />
                                                )}
                                                <span
                                                    className={`font-bold font-mono text-[13px] ${profit > 0
                                                        ? "text-emerald-600"
                                                        : profit < 0
                                                            ? "text-red-600"
                                                            : "text-gray-500"
                                                        }`}
                                                >
                                                    {profit > 0 && "+"}
                                                    {formatCurrency(profit)}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Hiệu lực */}
                                        <td className="px-1 py-2 text-center">
                                            {variant.activeEffectiveDate ? (
                                                <DateInput
                                                    dateValue={variant.activeEffectiveDate}
                                                    onChange={(val) => onEffectiveDateChange?.(variant, val)}
                                                    disabled={readOnly}
                                                />
                                            ) : (
                                                <span className="text-[11px] text-gray-400 font-medium">Chưa có giá</span>
                                            )}
                                        </td>

                                        {/* Hết hiệu lực */}
                                        <td className="px-1 py-2 text-center">
                                            {variant.activeExpiryDate ? (
                                                <DateInput
                                                    dateValue={variant.activeExpiryDate}
                                                    onChange={(val) => onExpiryDateChange?.(variant, val)}
                                                    disabled={readOnly}
                                                />
                                            ) : (
                                                <span className="text-[11px] text-gray-400 italic">—</span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-2 py-2 text-center shadow-[-5px_0_10px_-3px_rgba(0,0,0,0.03)] sticky right-0 bg-white group-hover:bg-blue-50/30 transition-colors">
                                            <div className="flex items-center justify-center gap-1">
                                                {!readOnly && (
                                                    <button
                                                        onClick={() => onCreatePriceModalOpen?.(variant)}
                                                        className="w-7 h-7 flex items-center justify-center text-emerald-600 bg-emerald-50 hover:bg-emerald-500 hover:text-white rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-emerald-100/50 hover:border-emerald-500 transition-all duration-200"
                                                        title="Tạo giá mới"
                                                    >
                                                        <DollarSign className="w-[13px] h-[13px]" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => onViewHistory(variant)}
                                                    className="w-7 h-7 flex items-center justify-center text-purple-600 bg-purple-50 hover:bg-purple-500 hover:text-white rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-purple-100/50 hover:border-purple-500 transition-all duration-200"
                                                    title="Lịch sử giá"
                                                >
                                                    <History className="w-[13px] h-[13px]" />
                                                </button>
                                            </div>
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
