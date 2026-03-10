import React, { useState, useEffect, useMemo, useCallback } from "react";
import api from "../../../config/axiosConfig";
import {
    Search,
    AlertCircle,
    Percent,
    RefreshCw,
    Save,
    Filter,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import TaxRateManagerModal from "./TaxRateManagerModal";
import PriceHistoryModal from "./PriceHistoryModal";
import PriceTable from "../ProductComponents/PriceTable";
import BulkUpdatePanel from "../ProductComponents/BulkUpdatePanel";
import { calculateProfit } from "../../../utils/priceCalculation";
import * as XLSX from "xlsx";

/**
 * Thiết lập Giá sản phẩm — phiên bản đơn giản.
 *
 * Mô hình giá:
 *   cost_price    = Giá nhập
 *   selling_price = Giá bán (đã bao gồm thuế, user nhập trực tiếp)
 *   profit        = selling_price − cost_price
 */
const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

const PriceSetting = () => {
    // ─── Data ────────────────────────────────
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // ─── Search & Filter ─────────────────────
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    // ─── Sort ────────────────────────────────
    const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });

    // ─── Pagination ──────────────────────────
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // ─── Edit ────────────────────────────────
    const [editingId, setEditingId] = useState(null);
    const [editPrice, setEditPrice] = useState("");
    const [savingId, setSavingId] = useState(null);

    // ─── Selection ───────────────────────────
    const [selectedIds, setSelectedIds] = useState([]);

    // ─── Modals ──────────────────────────────
    const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
    const [historyVariant, setHistoryVariant] = useState(null);

    // ═══════════════════════════════════════════
    // FETCH
    // ═══════════════════════════════════════════
    useEffect(() => { fetchVariants(); }, []);

    const fetchVariants = async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const res = await api.get("/products/variants");
            setVariants(res.data);
        } catch (err) {
            console.error("Error fetching variants:", err);
            setErrorMsg("Không thể tải danh sách sản phẩm.");
        } finally {
            setLoading(false);
        }
    };

    // ═══════════════════════════════════════════
    // CATEGORIES (for filter dropdown)
    // ═══════════════════════════════════════════
    const categories = useMemo(() => {
        const set = new Set();
        variants.forEach((v) => { if (v.categoryName) set.add(v.categoryName); });
        return Array.from(set).sort();
    }, [variants]);

    // ═══════════════════════════════════════════
    // SEARCH + FILTER + SORT
    // ═══════════════════════════════════════════
    const processedVariants = useMemo(() => {
        let result = [...variants];

        // Search by name, SKU, brand
        if (searchTerm.trim()) {
            const t = searchTerm.toLowerCase();
            result = result.filter(
                (v) =>
                    (v.name || "").toLowerCase().includes(t) ||
                    (v.sku || "").toLowerCase().includes(t) ||
                    (v.brandName || "").toLowerCase().includes(t)
            );
        }

        // Category filter
        if (categoryFilter) {
            result = result.filter((v) => v.categoryName === categoryFilter);
        }

        // Sort
        if (sortConfig.key) {
            result.sort((a, b) => {
                let aV, bV;
                switch (sortConfig.key) {
                    case "name":
                        aV = (a.name || "").toLowerCase();
                        bV = (b.name || "").toLowerCase();
                        break;
                    case "sku":
                        aV = (a.sku || "").toLowerCase();
                        bV = (b.sku || "").toLowerCase();
                        break;
                    case "costPrice":
                        aV = Number(a.costPrice) || 0;
                        bV = Number(b.costPrice) || 0;
                        break;
                    case "sellPrice":
                        aV = Number(a.sellPrice) || 0;
                        bV = Number(b.sellPrice) || 0;
                        break;
                    case "profit":
                        aV = calculateProfit(a.costPrice, a.sellPrice);
                        bV = calculateProfit(b.costPrice, b.sellPrice);
                        break;
                    default:
                        aV = 0; bV = 0;
                }
                if (typeof aV === "string") {
                    return sortConfig.direction === "asc" ? aV.localeCompare(bV) : bV.localeCompare(aV);
                }
                return sortConfig.direction === "asc" ? aV - bV : bV - aV;
            });
        }

        return result;
    }, [variants, searchTerm, categoryFilter, sortConfig]);

    // ═══════════════════════════════════════════
    // PAGINATION
    // ═══════════════════════════════════════════
    const totalItems = processedVariants.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const safePage = Math.min(currentPage, totalPages);

    const paginatedVariants = useMemo(() => {
        const start = (safePage - 1) * itemsPerPage;
        return processedVariants.slice(start, start + itemsPerPage);
    }, [processedVariants, safePage, itemsPerPage]);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, categoryFilter, itemsPerPage]);

    // ═══════════════════════════════════════════
    // SORT
    // ═══════════════════════════════════════════
    const handleSort = useCallback((key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    }, []);

    // ═══════════════════════════════════════════
    // INLINE EDIT (only selling price)
    // ═══════════════════════════════════════════
    const handleEditClick = useCallback((variant) => {
        setEditingId(variant.id);
        setEditPrice(variant.sellPrice || 0);
        setSuccessMsg("");
        setErrorMsg("");
    }, []);

    const handleCancelEdit = useCallback(() => {
        setEditingId(null);
        setEditPrice("");
    }, []);

    const handleSavePrice = async (variant) => {
        const parsed = parseFloat(editPrice);
        if (isNaN(parsed) || parsed < 0) {
            setErrorMsg("Giá bán không hợp lệ.");
            return;
        }

        const cost = Number(variant.costPrice) || 0;
        if (parsed < cost) {
            const ok = window.confirm(
                `⚠️ Giá bán (${parsed.toLocaleString()} đ) thấp hơn giá nhập (${cost.toLocaleString()} đ).\n\nBạn có chắc chắn muốn lưu?`
            );
            if (!ok) return;
        }

        setSavingId(variant.id);
        setErrorMsg("");

        try {
            // Tính giá sau thuế trước khi lưu
            const taxRate = Number(variant.taxRate) || 0;
            const finalPrice = taxRate > 0
                ? Math.round(parsed * (1 + taxRate / 100))
                : parsed;

            const payload = {
                sku: variant.sku,
                barcode: variant.barcode,
                unitId: variant.unitId || 1,
                sellPrice: finalPrice,
                imageUrl: variant.imageUrl || null,
                isActive: variant.isActive !== false,
            };

            await api.put(`/products/variants/${variant.id}`, payload);

            setSuccessMsg(`Cập nhật giá bán cho ${variant.name} thành công!`);
            setEditingId(null);
            setEditPrice("");
            setVariants((prev) =>
                prev.map((v) => (v.id === variant.id ? { ...v, sellPrice: finalPrice } : v))
            );
            setTimeout(() => setSuccessMsg(""), 4000);
        } catch (err) {
            console.error("Error updating price:", err);
            setErrorMsg("Lỗi khi cập nhật giá bán.");
        } finally {
            setSavingId(null);
        }
    };

    // ═══════════════════════════════════════════
    // SELECTION
    // ═══════════════════════════════════════════
    const handleToggleSelect = useCallback((id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    }, []);

    const handleToggleSelectAll = useCallback(() => {
        setSelectedIds((prev) =>
            prev.length === paginatedVariants.length ? [] : paginatedVariants.map((v) => v.id)
        );
    }, [paginatedVariants]);

    // ═══════════════════════════════════════════
    // BULK: Increase by %
    // ═══════════════════════════════════════════
    const handleBulkIncrease = async (percent) => {
        const toUpdate = variants.filter((v) => selectedIds.includes(v.id));
        if (toUpdate.length === 0) return;

        setErrorMsg("");
        let ok = 0, fail = 0;

        for (const v of toUpdate) {
            const newPrice = Number(((Number(v.sellPrice) || 0) * (1 + percent / 100)).toFixed(2));
            try {
                await api.put(`/products/variants/${v.id}`, {
                    sku: v.sku, barcode: v.barcode, unitId: v.unitId || 1,
                    sellPrice: newPrice, imageUrl: v.imageUrl || null, isActive: v.isActive !== false,
                });
                setVariants((prev) => prev.map((pv) => (pv.id === v.id ? { ...pv, sellPrice: newPrice } : pv)));
                ok++;
            } catch { fail++; }
        }

        if (fail > 0) {
            setErrorMsg(`Cập nhật: ${ok} thành công, ${fail} thất bại.`);
        } else {
            setSuccessMsg(`Đã tăng giá ${ok} sản phẩm thành công!`);
            setTimeout(() => setSuccessMsg(""), 4000);
        }
        setSelectedIds([]);
    };

    // ═══════════════════════════════════════════
    // BULK: Import Excel
    // ═══════════════════════════════════════════
    const handleImportExcel = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const wb = XLSX.read(e.target.result, { type: "binary" });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(ws);

                let updated = 0;
                setVariants((prev) => {
                    const next = [...prev];
                    rows.forEach((row) => {
                        const sku = String(row["SKU"] || row["sku"] || "").trim();
                        const price = parseFloat(row["Selling Price"] || row["sellPrice"] || row["Giá bán"] || 0);
                        if (sku && !isNaN(price) && price >= 0) {
                            const idx = next.findIndex((v) => v.sku === sku);
                            if (idx !== -1) { next[idx] = { ...next[idx], sellPrice: price }; updated++; }
                        }
                    });
                    return next;
                });
                setSuccessMsg(`Import thành công! Đã cập nhật ${updated} sản phẩm. Nhấn nút Lưu trên từng dòng để xác nhận.`);
                setTimeout(() => setSuccessMsg(""), 5000);
            } catch (err) {
                console.error("Excel import error:", err);
                setErrorMsg("Không thể đọc file Excel. Vui lòng kiểm tra định dạng.");
            }
        };
        reader.readAsBinaryString(file);
    };

    // ═══════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/30 p-6">
            <div className="max-w-[1600px] mx-auto space-y-5">

                {/* ─── HEADER ─── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                Thiết lập giá sản phẩm
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Quản lý giá nhập, giá bán và theo dõi lợi nhuận sản phẩm.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                            <Button
                                variant="outline"
                                onClick={() => setIsTaxModalOpen(true)}
                                className="h-11 px-4 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 rounded-xl whitespace-nowrap"
                            >
                                <Percent className="w-4 h-4 mr-2" />
                                Thiết lập thuế
                            </Button>

                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="h-11 pl-9 pr-8 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                                >
                                    <option value="">Tất cả danh mục</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative flex-1 lg:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Tìm theo Tên, SKU, Brand..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-11 w-full border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                                />
                            </div>

                            <Button
                                variant="ghost"
                                onClick={fetchVariants}
                                className="h-11 w-11 p-0 rounded-xl text-gray-500 hover:bg-gray-100"
                                disabled={loading}
                                title="Làm mới"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* ─── ALERTS ─── */}
                {errorMsg && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 border border-red-100 shadow-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium text-sm flex-1">{errorMsg}</span>
                        <button onClick={() => setErrorMsg("")} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                    </div>
                )}
                {successMsg && (
                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center gap-3 border border-emerald-100 shadow-sm">
                        <Save className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium text-sm flex-1">{successMsg}</span>
                        <button onClick={() => setSuccessMsg("")} className="text-emerald-400 hover:text-emerald-600 text-lg leading-none">×</button>
                    </div>
                )}

                {/* ─── BULK UPDATE ─── */}
                <BulkUpdatePanel
                    selectedCount={selectedIds.length}
                    onIncreaseByPercent={handleBulkIncrease}
                    onImportExcel={handleImportExcel}
                />

                {/* ─── TABLE ─── */}
                <PriceTable
                    variants={paginatedVariants}
                    loading={loading}
                    editingId={editingId}
                    editPrice={editPrice}
                    savingId={savingId}
                    onEditClick={handleEditClick}
                    onCancelEdit={handleCancelEdit}
                    onSavePrice={handleSavePrice}
                    onEditPriceChange={setEditPrice}
                    selectedIds={selectedIds}
                    onToggleSelect={handleToggleSelect}
                    onToggleSelectAll={handleToggleSelectAll}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    onViewHistory={(v) => setHistoryVariant(v)}
                />

                {/* ─── PAGINATION ─── */}
                {!loading && totalItems > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span>
                                Hiển thị{" "}
                                <span className="font-semibold text-gray-900">{(safePage - 1) * itemsPerPage + 1}</span>
                                {" – "}
                                <span className="font-semibold text-gray-900">{Math.min(safePage * itemsPerPage, totalItems)}</span>
                                {" / "}
                                <span className="font-semibold text-gray-900">{totalItems}</span> sản phẩm
                            </span>
                            <span className="text-gray-300">|</span>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500">Mỗi trang:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    className="h-8 px-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                >
                                    {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setCurrentPage(1)} disabled={safePage === 1} className="h-9 w-9 p-0 rounded-lg" title="Trang đầu">
                                <ChevronsLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="h-9 w-9 p-0 rounded-lg" title="Trang trước">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>

                            {(() => {
                                const pages = [];
                                const range = 2;
                                const start = Math.max(1, safePage - range);
                                const end = Math.min(totalPages, safePage + range);

                                if (start > 1) {
                                    pages.push(<Button key={1} variant="ghost" size="sm" onClick={() => setCurrentPage(1)} className="h-9 w-9 p-0 rounded-lg text-sm">1</Button>);
                                    if (start > 2) pages.push(<span key="ds" className="px-1 text-gray-400">…</span>);
                                }
                                for (let i = start; i <= end; i++) {
                                    pages.push(
                                        <Button
                                            key={i}
                                            variant={i === safePage ? "primary" : "ghost"}
                                            size="sm"
                                            onClick={() => setCurrentPage(i)}
                                            className={`h-9 w-9 p-0 rounded-lg text-sm font-semibold ${i === safePage ? "bg-blue-600 text-white shadow-sm" : ""}`}
                                        >
                                            {i}
                                        </Button>
                                    );
                                }
                                if (end < totalPages) {
                                    if (end < totalPages - 1) pages.push(<span key="de" className="px-1 text-gray-400">…</span>);
                                    pages.push(<Button key={totalPages} variant="ghost" size="sm" onClick={() => setCurrentPage(totalPages)} className="h-9 w-9 p-0 rounded-lg text-sm">{totalPages}</Button>);
                                }
                                return pages;
                            })()}

                            <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="h-9 w-9 p-0 rounded-lg" title="Trang sau">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={safePage === totalPages} className="h-9 w-9 p-0 rounded-lg" title="Trang cuối">
                                <ChevronsRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── MODALS ─── */}
            {isTaxModalOpen && (
                <TaxRateManagerModal onClose={() => setIsTaxModalOpen(false)} onDataChange={fetchVariants} />
            )}
            {historyVariant && (
                <PriceHistoryModal variant={historyVariant} onClose={() => setHistoryVariant(null)} />
            )}
        </div>
    );
};

export default PriceSetting;
