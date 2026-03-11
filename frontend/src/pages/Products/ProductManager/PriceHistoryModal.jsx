/**
 * PriceHistoryModal.jsx
 * Modal hiển thị lịch sử thay đổi giá một sản phẩm.
 */
import React, { useState, useEffect } from "react";
import { X, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatCurrency } from "../../../utils/priceCalculation";

export default function PriceHistoryModal({ variant, onClose }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading price history (replace with actual API call)
        setLoading(true);
        const timer = setTimeout(() => {
            // Mock data - replace with actual API: api.get(`/products/variants/${variant.id}/price-history`)
            setHistory([
                {
                    id: 1,
                    date: new Date().toISOString(),
                    oldPrice: variant.costPrice || 0,
                    newPrice: variant.sellPrice || 0,
                    changedBy: "Hệ thống",
                    reason: "Khởi tạo giá bán",
                },
            ]);
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [variant]);

    const getPriceChangeIcon = (oldP, newP) => {
        if (newP > oldP) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
        if (newP < oldP) return <TrendingDown className="w-4 h-4 text-red-500" />;
        return <Minus className="w-4 h-4 text-gray-400" />;
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Lịch sử giá</h2>
                            <p className="text-xs text-gray-500 mt-0.5">{variant?.name} — {variant?.sku}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                            <span className="text-sm">Đang tải lịch sử...</span>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="font-medium">Chưa có lịch sử thay đổi giá</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100/70 transition-colors"
                                >
                                    <div className="flex-shrink-0">
                                        {getPriceChangeIcon(entry.oldPrice, entry.newPrice)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-500 line-through">
                                                {formatCurrency(entry.oldPrice)}
                                            </span>
                                            <span className="text-gray-400">→</span>
                                            <span className="font-bold text-gray-900">
                                                {formatCurrency(entry.newPrice)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{entry.reason || "Không có ghi chú"}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-xs text-gray-500">
                                            {new Date(entry.date).toLocaleDateString("vi-VN")}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">{entry.changedBy}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
