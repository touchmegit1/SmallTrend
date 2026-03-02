import React, { useState, useEffect } from "react";
import api from "../../../config/axiosConfig";
import { Search, Save, X, Edit2, AlertCircle, Percent, DollarSign, RefreshCw } from "lucide-react";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";

/**
 * Màn hình Thiết lập Giá (Price Setting)
 * Cho phép xem Giá nhập, Thuế, Lợi Nhuận và chỉnh sửa Giá bán.
 */
const PriceSetting = () => {
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Trạng thái edit
    const [editingId, setEditingId] = useState(null);
    // Giá đang edit (sell price trước thuế)
    const [editPrice, setEditPrice] = useState("");
    // Giá đang edit (sell price sau thuế)
    const [editPriceAfterTax, setEditPriceAfterTax] = useState("");

    const [savingId, setSavingId] = useState(null);

    useEffect(() => {
        fetchVariants();
    }, []);

    const fetchVariants = async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const response = await api.get("/pos/product");
            setVariants(response.data);
        } catch (err) {
            console.error("Error fetching variants: ", err);
            setErrorMsg("Không thể tải danh sách sản phẩm.");
        } finally {
            setLoading(false);
        }
    };

    // Hàm tính toán giá trị dựa trên Thuế
    const calculateWithTax = (price, taxRate) => {
        if (!price) return 0;
        const rate = taxRate || 0;
        return price + (price * rate) / 100;
    };

    // Tính ngược giá trước thuế từ giá sau thuế
    const calculateBeforeTax = (priceAfterTax, taxRate) => {
        if (!priceAfterTax) return 0;
        const rate = taxRate || 0;
        return priceAfterTax / (1 + rate / 100);
    };

    // Bắt đầu edit thao tác trên 1 dòng
    const handleEditClick = (variant) => {
        setEditingId(variant.id);
        const beforeTax = variant.sellPrice || 0;
        const afterTax = calculateWithTax(beforeTax, variant.taxRate);

        setEditPrice(beforeTax);
        setEditPriceAfterTax(afterTax);
        setSuccessMsg("");
        setErrorMsg("");
    };

    // Hủy edit
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditPrice("");
        setEditPriceAfterTax("");
    };

    // Thay đổi giá bán (Trước Thuế)
    const handleBeforeTaxChange = (e, taxRate) => {
        const val = parseFloat(e.target.value);
        setEditPrice(e.target.value);

        if (!isNaN(val)) {
            setEditPriceAfterTax(calculateWithTax(val, taxRate).toFixed(2));
        } else {
            setEditPriceAfterTax("");
        }
    };

    // Thay đổi giá bán (Sau Thuế)
    const handleAfterTaxChange = (e, taxRate) => {
        const val = parseFloat(e.target.value);
        setEditPriceAfterTax(e.target.value);

        if (!isNaN(val)) {
            setEditPrice(calculateBeforeTax(val, taxRate).toFixed(2));
        } else {
            setEditPrice("");
        }
    };

    // Lưu Giá
    const handleSavePrice = async (variant) => {
        const parsedPrice = parseFloat(editPrice);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            setErrorMsg("Giá bán không hợp lệ.");
            return;
        }

        setSavingId(variant.id);
        setErrorMsg("");

        try {
            // Re-construct the payload according to CreateVariantRequest
            // We only want to update the sellPrice, so we pass other existing fields as is.
            // Note: The /api/products/variants/{id} endpoint expects CreateVariantRequest
            // We use default values for required fields if they are missing from the response DTO
            const payload = {
                sku: variant.sku,
                barcode: variant.barcode,
                unitId: variant.unitId || 1, // Fallback to a default unit if null (Unit 1 usually exists)
                unitValue: variant.unitValue || 1,
                sellPrice: parsedPrice,
                imageUrl: variant.imageUrl || null,
                isActive: variant.isActive !== false // Fallback to true if undefined
            };

            await api.put(`/products/variants/${variant.id}`, payload);

            setSuccessMsg(`Cập nhật giá bán cho ${variant.name} thành công!`);
            setEditingId(null);

            // Update local state without fetching all again
            setVariants((prev) =>
                prev.map((v) =>
                    v.id === variant.id ? { ...v, sellPrice: parsedPrice } : v
                )
            );

        } catch (err) {
            console.error("Error updating price: ", err);
            setErrorMsg("Lỗi khi cập nhật giá bán.");
        } finally {
            setSavingId(null);
        }
    };

    // Format Tiền tệ
    const fCurrency = (value) => {
        if (!value && value !== 0) return "-";
        return Number(value).toLocaleString() + " đ";
    };

    // Calculate profit
    const calculateProfit = (costPrice, sellPriceBeforeTax, taxRate) => {
        const sellAfter = calculateWithTax(sellPriceBeforeTax || 0, taxRate);
        return sellAfter - (costPrice || 0);
    };

    const filteredVariants = variants.filter(
        (v) =>
            (v.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (v.sku || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <div className="max-w-[1600px] mx-auto space-y-6">
                {/* HEADER */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Thiết lập giá sản phẩm</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Quản lý giá nhập, giá bán và theo dõi lợi nhuận sau thuế của các biến thể.
                        </p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Tìm sản phẩm theo Tên hoặc SKU..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-11 w-full border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={fetchVariants}
                            className="h-11 px-4 border-gray-200 hover:bg-gray-50 rounded-xl whitespace-nowrap"
                            disabled={loading}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Làm mới
                        </Button>
                    </div>
                </div>

                {/* ALERTS */}
                {errorMsg && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 border border-red-100 shadow-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium text-sm">{errorMsg}</span>
                    </div>
                )}
                {successMsg && (
                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center gap-3 border border-emerald-100 shadow-sm">
                        <Save className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium text-sm">{successMsg}</span>
                    </div>
                )}

                {/* DATA TABLE */}
                <div className="bg-white rounded-2xl shadow-xl shadow-blue-500/5 ring-1 ring-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-5 py-4 font-semibold text-gray-700 whitespace-nowrap">Sản phẩm</th>
                                    <th className="px-5 py-4 font-semibold text-gray-700 whitespace-nowrap">SKU</th>
                                    <th className="px-5 py-4 font-semibold text-gray-700 whitespace-nowrap text-center">Thuế</th>
                                    <th className="px-5 py-4 font-semibold text-gray-700 whitespace-nowrap text-right bg-blue-50/30 border-l border-blue-100">Giá nhập</th>
                                    <th className="px-5 py-4 font-semibold text-gray-700 whitespace-nowrap text-right bg-emerald-50/50 border-l border-emerald-100">Giá bán (Tr.Thuế)</th>
                                    <th className="px-5 py-4 font-semibold text-gray-700 whitespace-nowrap text-right bg-emerald-50/50">Giá bán (S.Thuế)</th>
                                    <th className="px-5 py-4 font-semibold text-gray-700 whitespace-nowrap text-right border-l border-gray-100">Lợi nhuận</th>
                                    <th className="px-5 py-4 font-semibold text-gray-700 whitespace-nowrap text-center w-28">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                                <span>Đang tải dữ liệu...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredVariants.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-12 text-center text-gray-500 bg-gray-50/30">
                                            <div className="flex flex-col items-center gap-2">
                                                <Search className="w-8 h-8 text-gray-300" />
                                                <p>Không tìm thấy sản phẩm nào khớp với tìm kiếm.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredVariants.map((variant) => {
                                        const isEditing = editingId === variant.id;
                                        const taxRate = variant.taxRate || 0;

                                        const costPrice = variant.costPrice || 0;

                                        // Lợi nhuận hiện tại (nếu đang edit thì tính theo giá đang nhập, nếu không thì theo giá đã lưu)
                                        const profit = isEditing
                                            ? calculateProfit(costPrice, parseFloat(editPrice) || 0, taxRate)
                                            : calculateProfit(costPrice, variant.sellPrice, taxRate);

                                        const profitMargin = (costPrice > 0 && profit > 0)
                                            ? ((profit / costPrice) * 100).toFixed(1)
                                            : 0;

                                        return (
                                            <tr key={variant.id} className="hover:bg-blue-50/20 transition-colors group">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                            {variant.imageUrl ? (
                                                                <img src={variant.imageUrl} alt={variant.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-gray-400 font-medium text-xs">No IMG</span>
                                                            )}
                                                        </div>
                                                        <div className="max-w-[200px]">
                                                            <p className="font-semibold text-gray-900 truncate" title={variant.name}>{variant.name}</p>
                                                            <p className="text-xs text-gray-500 truncate mt-0.5">{variant.categoryName || "Không phân loại"}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md border border-gray-200">
                                                        {variant.sku}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <div className="inline-flex items-center gap-1 bg-cyan-50 text-cyan-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-cyan-100 shadow-sm">
                                                        <Percent className="w-3 h-3" />
                                                        {taxRate}%
                                                    </div>
                                                </td>

                                                {/* Cost Column */}
                                                <td className="px-5 py-4 text-right bg-blue-50/10 border-l border-blue-50">
                                                    <span className="text-blue-900 font-bold font-mono text-sm">{fCurrency(costPrice)}</span>
                                                </td>

                                                {/* Sell Column - Thể hiện form input nếu đang chỉnh sửa */}
                                                <td className="px-5 py-4 text-right bg-emerald-50/20 border-l border-emerald-50">
                                                    {isEditing ? (
                                                        <div className="relative">
                                                            <Input
                                                                type="number"
                                                                className="w-28 text-right pr-2 h-9 text-sm font-mono"
                                                                value={editPrice}
                                                                onChange={(e) => handleBeforeTaxChange(e, taxRate)}
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-600 font-medium font-mono text-sm">{fCurrency(variant.sellPrice)}</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-right bg-emerald-50/20">
                                                    {isEditing ? (
                                                        <div className="relative">
                                                            <Input
                                                                type="number"
                                                                className="w-28 text-right pr-2 h-9 text-sm font-bold text-emerald-700 font-mono border-emerald-200 focus:ring-emerald-500"
                                                                value={editPriceAfterTax}
                                                                onChange={(e) => handleAfterTaxChange(e, taxRate)}
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <span className="text-emerald-700 font-extrabold font-mono text-sm">
                                                            {fCurrency(calculateWithTax(variant.sellPrice, taxRate))}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Profit Result */}
                                                <td className="px-5 py-4 text-right border-l border-gray-100">
                                                    <div className="flex flex-col items-end">
                                                        <span className={`font-bold font-mono text-sm ${profit >= 0 ? "text-indigo-600" : "text-red-500"}`}>
                                                            {profit > 0 && "+"}{fCurrency(profit)}
                                                        </span>
                                                        <span className={`text-xs mt-0.5 font-medium px-1.5 rounded-sm ${profit >= 0 ? "bg-indigo-50 text-indigo-700" : "bg-red-50 text-red-700"}`}>
                                                            {profitMargin}%
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-5 py-4 text-center">
                                                    {isEditing ? (
                                                        <div className="flex items-center justify-center gap-1 animate-in fade-in zoom-in duration-200">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleSavePrice(variant)}
                                                                className="h-8 w-8 p-0 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-sm"
                                                                disabled={savingId === variant.id}
                                                                title="Lưu thay đổi"
                                                            >
                                                                {savingId === variant.id ? (
                                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <Save className="w-4 h-4" />
                                                                )}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={handleCancelEdit}
                                                                className="h-8 w-8 p-0 border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                                disabled={savingId === variant.id}
                                                                title="Hủy bỏ"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleEditClick(variant)}
                                                            className="h-8 w-8 p-0 border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
                                                            title="Thiết lập giá bán"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
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
            </div>
        </div>
    );
};

export default PriceSetting;
