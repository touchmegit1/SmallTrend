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
} from "lucide-react";
import Button from "./button";
import { Input } from "./input";
import { calculateProfit, formatCurrency } from "../../../utils/priceCalculation";

export default function PriceTable({
    variants,
    loading,
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
    onViewHistory,
}) {
    const allSelected = variants.length > 0 && selectedIds.length === variants.length;
    const someSelected = selectedIds.length > 0 && !allSelected;

    const getSortIcon = (key) => {
        if (sortConfig?.key !== key) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-300" />;
        return sortConfig.direction === "asc"
            ? <ArrowUp className="w-3.5 h-3.5 text-blue-500" />
            : <ArrowDown className="w-3.5 h-3.5 text-blue-500" />;
    };

    const SortHeader = ({ label, sortKey, align = "left" }) => (
        <th
            className={`px-4 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100/80 transition-colors select-none ${align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"
                }`}
            onClick={() => onSort?.(sortKey)}
        >
            <div className={`flex items-center gap-1.5 ${align === "right" ? "justify-end" : ""}`}>
                <span>{label}</span>
                {getSortIcon(sortKey)}
            </div>
        </th>
    );

    return (
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-500/5 ring-1 ring-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 border-b-2 border-gray-200">
                        <tr>
                            <th className="px-4 py-3.5 w-12">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    ref={(el) => { if (el) el.indeterminate = someSelected; }}
                                    onChange={onToggleSelectAll}
                                    className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                                />
                            </th>
                            <SortHeader label="Sản phẩm" sortKey="name" />
                            <SortHeader label="SKU" sortKey="sku" />
                            <SortHeader label="Giá nhập" sortKey="costPrice" align="right" />
                            <th className="px-4 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider text-center whitespace-nowrap">
                                Thuế %
                            </th>
                            <SortHeader label="Giá bán (gồm thuế)" sortKey="sellPrice" align="right" />
                            <SortHeader label="Lợi nhuận" sortKey="profit" align="right" />
                            <th className="px-4 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider text-center w-28 whitespace-nowrap">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/80">
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="px-6 py-16 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-blue-600" />
                                        <span className="text-sm font-medium">Đang tải dữ liệu...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : variants.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-6 py-16 text-center text-gray-500 bg-gray-50/30">
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
                                const taxRate = Number(variant.taxRate) || 0;
                                // sellPrice trong DB đã bao gồm thuế
                                const sellPrice = isEditing
                                    ? (Number(editPrice) || 0)
                                    : (Number(variant.sellPrice) || 0);
                                // Giá bán cho khách = sellPrice (đã gồm thuế)
                                const finalPrice = isEditing
                                    ? (taxRate > 0 ? Math.round(sellPrice * (1 + taxRate / 100)) : sellPrice)
                                    : sellPrice;
                                const profit = calculateProfit(costPrice, finalPrice);
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
                                        <td className="px-4 py-3.5">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => onToggleSelect(variant.id)}
                                                className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                                            />
                                        </td>

                                        {/* Product */}
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {variant.imageUrl ? (
                                                        <img src={variant.imageUrl} alt={variant.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-gray-400 font-medium text-[10px]">IMG</span>
                                                    )}
                                                </div>
                                                <div className="max-w-[200px]">
                                                    <p className="font-semibold text-gray-900 truncate text-sm" title={variant.name}>
                                                        {variant.name}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                                                        {variant.brandName || variant.categoryName || "Không phân loại"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* SKU */}
                                        <td className="px-4 py-3.5">
                                            <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md border border-gray-200">
                                                {variant.sku}
                                            </span>
                                        </td>

                                        {/* Cost Price — gray */}
                                        <td className="px-4 py-3.5 text-right">
                                            <span className="text-gray-500 font-semibold font-mono text-sm">
                                                {formatCurrency(costPrice)}
                                            </span>
                                        </td>

                                        {/* Tax % */}
                                        <td className="px-4 py-3.5 text-center">
                                            <span className="inline-flex items-center gap-1 bg-cyan-50 text-cyan-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-cyan-100">
                                                <Percent className="w-3 h-3" />
                                                {taxRate}%
                                            </span>
                                        </td>

                                        {/* Selling Price (sau thuế) — bold black */}
                                        <td className="px-4 py-3.5 text-right">
                                            {isEditing ? (
                                                <div>
                                                    <Input
                                                        type="number"
                                                        className="w-32 text-right pr-2 h-9 text-sm font-mono font-bold"
                                                        value={editPrice}
                                                        onChange={(e) => onEditPriceChange(e.target.value)}
                                                        placeholder="0"
                                                        autoFocus
                                                    />
                                                    {editPrice && taxRate > 0 && (
                                                        <p className="text-[10px] text-emerald-600 mt-1 text-right font-medium">
                                                            Sau thuế: {Math.round(Number(editPrice) * (1 + taxRate / 100)).toLocaleString('vi-VN')} đ
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-900 font-bold font-mono text-sm">
                                                    {formatCurrency(finalPrice)}
                                                </span>
                                            )}
                                        </td>

                                        {/* Profit */}
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {hasNegativeProfit && (
                                                    <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                                                )}
                                                <span
                                                    className={`font-bold font-mono text-sm ${profit > 0
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

                                        {/* Actions */}
                                        <td className="px-4 py-3.5 text-center">
                                            {isEditing ? (
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => onSavePrice(variant)}
                                                        className="h-8 w-8 p-0 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-sm"
                                                        disabled={savingId === variant.id}
                                                        title="Lưu"
                                                    >
                                                        {savingId === variant.id
                                                            ? <RefreshCw className="w-4 h-4 animate-spin" />
                                                            : <Save className="w-4 h-4" />}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={onCancelEdit}
                                                        className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                        disabled={savingId === variant.id}
                                                        title="Hủy"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => onEditClick(variant)}
                                                        className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                        title="Chỉnh sửa giá"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => onViewHistory(variant)}
                                                        className="h-8 w-8 p-0 text-gray-500 hover:bg-gray-100 rounded-lg"
                                                        title="Lịch sử giá"
                                                    >
                                                        <Clock className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
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
