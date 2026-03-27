import {
    AlertCircle,
    Bell,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Clock3,
    Filter,
    Percent,
    RefreshCw,
    Save,
    Search,
    Trash2,
    X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../../config/axiosConfig";
import Button from "../../../components/product/button";
import { Input } from "../../../components/product/input";
import PriceTable from "../../../components/product/PriceTable";
import CreatePriceModal from "./CreatePriceModal";
import PriceHistoryModal from "./PriceHistoryModal";
import TaxRateManagerModal from "./TaxRateManagerModal";
import { useAuth } from "../../../context/AuthContext";
import { canManageProducts } from "../../../utils/roleUtils";
import { calculateProfit } from "../../../utils/priceCalculation";

/**
 * Thiết lập Giá sản phẩm — phiên bản đơn giản.
 *
 * Mô hình giá:
 *   cost_price    = Giá nhập
 *   selling_price = Giá bán (đã bao gồm thuế, user nhập trực tiếp)
 *   profit        = selling_price − cost_price
 */
const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100];
const PRICE_SYNC_NOTICE_KEY = "priceSyncNotice";
const PRICE_SYNC_HISTORY_KEY = "priceSyncNotifications";
const PRICE_SYNC_BROADCAST_KEY = "priceSyncNoticeBroadcast";
const MAX_PRICE_SYNC_NOTIFICATIONS = 30;

const formatSyncedItemLabel = (item) => {
    const name = item?.productName || "Sản phẩm";
    const sku = item?.sku || "-";
    return `${name} (SKU: ${sku})`;
};

const buildSyncSummary = (syncedItems = [], syncedCount = 0) => {
    if (!Array.isArray(syncedItems) || syncedItems.length === 0) {
        return `Đồng bộ giá nhập cho ${syncedCount} sản phẩm`;
    }

    if (syncedCount === 1) {
        return `Đồng bộ giá nhập: ${formatSyncedItemLabel(syncedItems[0])}`;
    }

    const first = formatSyncedItemLabel(syncedItems[0]);
    return `Đồng bộ giá nhập cho ${syncedCount} sản phẩm (ví dụ: ${first})`;
};

const buildSyncSuccessMessage = (syncedItems = [], syncedCount = 0, orderNumber = null) => {
    const summary = buildSyncSummary(syncedItems, syncedCount);
    return orderNumber ? `${summary} từ phiếu nhập ${orderNumber}.` : `${summary}.`;
};

const PriceSetting = () => {
    const { user } = useAuth();
    const canEditProducts = canManageProducts(user);
    // ─── Data ────────────────────────────────
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [priceSyncNotice, setPriceSyncNotice] = useState(null);
    const [showSyncedProducts, setShowSyncedProducts] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [historyHydrated, setHistoryHydrated] = useState(false);
    const [nearExpiryAlerts, setNearExpiryAlerts] = useState([]);
    const [showAllNearExpiry, setShowAllNearExpiry] = useState(false);
    const [focusedVariantId, setFocusedVariantId] = useState(null);

    const handleNearExpiryClick = useCallback((alert) => {
        if (!alert?.variantId) return;

        const targetVariant = variants.find((v) => v.id === alert.variantId);
        if (!targetVariant) return;

        setCategoryFilter("");
        setSearchTerm(targetVariant.sku || targetVariant.name || "");
        setSelectedIds([targetVariant.id]);
        setFocusedVariantId(targetVariant.id);
    }, [variants]);


    useEffect(() => {
        try {
            const raw = localStorage.getItem(PRICE_SYNC_HISTORY_KEY);
            if (!raw) {
                setHistoryHydrated(true);
                return;
            }
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                setNotifications(parsed);
            }
        } catch {
            localStorage.removeItem(PRICE_SYNC_HISTORY_KEY);
        } finally {
            setHistoryHydrated(true);
        }
    }, []);

    useEffect(() => {
        if (!historyHydrated) return;
        try {
            localStorage.setItem(PRICE_SYNC_HISTORY_KEY, JSON.stringify(notifications));
        } catch {
            // ignore storage write errors
        }
    }, [notifications, historyHydrated]);

    const consumePriceSyncNotice = useCallback(() => {
        try {
            const rawNotice = sessionStorage.getItem(PRICE_SYNC_NOTICE_KEY);
            if (!rawNotice) return;

            sessionStorage.removeItem(PRICE_SYNC_NOTICE_KEY);
            const notice = JSON.parse(rawNotice);
            const syncedCount = Number(notice?.syncedCount ?? notice?.syncedPurchasePriceCount) || 0;
            if (syncedCount <= 0) return;

            const syncedItems = Array.isArray(notice?.syncedItems)
                ? notice.syncedItems.map((item, index) => ({
                    itemId: item?.itemId || item?.variantId || index,
                    variantId: item?.variantId || null,
                    productName: item?.productName || item?.name || "Sản phẩm",
                    sku: item?.sku || "-",
                    purchasePrice: Number(item?.purchasePrice ?? item?.unitCost ?? 0),
                    previousPurchasePrice: Number(item?.previousPurchasePrice ?? 0),
                }))
                : [];
            const orderNumber = notice?.orderNumber || notice?.poNumber || null;
            const createdAt = notice?.createdAt || new Date().toISOString();

            const notificationEntry = {
                id: Date.now() + Math.random(),
                syncedCount,
                syncedItems,
                orderNumber,
                createdAt,
            };

            let nextNotifications = [notificationEntry];
            try {
                const existingRaw = localStorage.getItem(PRICE_SYNC_HISTORY_KEY);
                const existing = existingRaw ? JSON.parse(existingRaw) : [];
                if (Array.isArray(existing)) {
                    nextNotifications = [notificationEntry, ...existing].slice(0, MAX_PRICE_SYNC_NOTIFICATIONS);
                }
                localStorage.setItem(PRICE_SYNC_HISTORY_KEY, JSON.stringify(nextNotifications));
            } catch {
                // keep in-memory fallback only
            }

            setPriceSyncNotice(notificationEntry);
            setShowSyncedProducts(false);
            setNotifications(nextNotifications);
            setUnreadCount((prev) => prev + 1);
            setSuccessMsg(buildSyncSuccessMessage(syncedItems, syncedCount, orderNumber));
            setTimeout(() => setSuccessMsg(""), 6000);
            sessionStorage.removeItem(PRICE_SYNC_NOTICE_KEY);
        } catch (error) {
            sessionStorage.removeItem(PRICE_SYNC_NOTICE_KEY);
            setPriceSyncNotice(null);
        }
    }, []);

    const toggleNotificationPanel = useCallback(() => {
        setNotificationPanelOpen((prev) => {
            const next = !prev;
            if (next) {
                setUnreadCount(0);
            }
            return next;
        });
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
    }, []);

    // ─── Search & Filter ─────────────────────
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    // ─── Sort ────────────────────────────────
    const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });

    // ─── Pagination ──────────────────────────
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // ─── Selection ───────────────────────────
    const [selectedIds, setSelectedIds] = useState([]);

    // ─── Modals ──────────────────────────────
    const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
    const [historyVariant, setHistoryVariant] = useState(null);
    const [createPriceVariant, setCreatePriceVariant] = useState(null);

    // ═══════════════════════════════════════════
    // FETCH
    // ═══════════════════════════════════════════
    useEffect(() => {
        fetchVariants();
        consumePriceSyncNotice();
    }, [consumePriceSyncNotice]);

    useEffect(() => {
        const handleLivePriceSyncNotice = (event) => {
            const detail = event?.detail;
            if (!detail) return;
            try {
                sessionStorage.setItem(PRICE_SYNC_NOTICE_KEY, JSON.stringify(detail));
            } catch {
                // ignore storage write errors
            }
            consumePriceSyncNotice();
        };

        const handleBroadcastPriceSyncNotice = (event) => {
            if (event.key !== PRICE_SYNC_BROADCAST_KEY || !event.newValue) return;
            try {
                const detail = JSON.parse(event.newValue);
                if (!detail) return;
                sessionStorage.setItem(PRICE_SYNC_NOTICE_KEY, JSON.stringify(detail));
                consumePriceSyncNotice();
            } catch {
                // ignore invalid broadcast payload
            }
        };

        window.addEventListener("price-sync-notice", handleLivePriceSyncNotice);
        window.addEventListener("storage", handleBroadcastPriceSyncNotice);
        return () => {
            window.removeEventListener("price-sync-notice", handleLivePriceSyncNotice);
            window.removeEventListener("storage", handleBroadcastPriceSyncNotice);
        };
    }, [consumePriceSyncNotice]);

    const fetchVariants = async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const variantsRes = await api.get("/products/variants");
            const variantsData = variantsRes.data || [];
            setVariants(variantsData);

            try {
                const alertsRes = await api.get("/products/price-expiry-alerts", { params: { days: 7 } });
                setNearExpiryAlerts(Array.isArray(alertsRes.data) ? alertsRes.data : []);
            } catch (alertsErr) {
                console.error("Error fetching near expiry alerts:", alertsErr);
                setNearExpiryAlerts([]);
            }
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
                    case "activeSellingPrice":
                        aV = Number(a.activeSellingPrice) || Number(a.sellPrice) || 0;
                        bV = Number(b.activeSellingPrice) || Number(b.sellPrice) || 0;
                        break;
                    case "profit": {
                        const aTax = Number(a.activeTaxPercent) || Number(a.taxRate) || 0;
                        const bTax = Number(b.activeTaxPercent) || Number(b.taxRate) || 0;
                        const aFinal = Number(a.activeSellingPrice) || Number(a.sellPrice) || 0;
                        const bFinal = Number(b.activeSellingPrice) || Number(b.sellPrice) || 0;
                        const aBase = Number.isFinite(Number(a.activeBaseSellingPrice)) && Number(a.activeBaseSellingPrice) > 0
                            ? Number(a.activeBaseSellingPrice)
                            : (aTax >= 0 ? aFinal / (1 + aTax / 100) : aFinal);
                        const bBase = Number.isFinite(Number(b.activeBaseSellingPrice)) && Number(b.activeBaseSellingPrice) > 0
                            ? Number(b.activeBaseSellingPrice)
                            : (bTax >= 0 ? bFinal / (1 + bTax / 100) : bFinal);
                        aV = calculateProfit(Number(a.costPrice) || 0, aBase);
                        bV = calculateProfit(Number(b.costPrice) || 0, bBase);
                        break;
                    }
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

    useEffect(() => {
        if (!focusedVariantId) return;
        const targetIndex = processedVariants.findIndex((v) => v.id === focusedVariantId);
        if (targetIndex >= 0) {
            const nextPage = Math.floor(targetIndex / itemsPerPage) + 1;
            setCurrentPage(nextPage);
        }
    }, [focusedVariantId, processedVariants, itemsPerPage]);

    useEffect(() => {
        if (!focusedVariantId) return;
        const timer = setTimeout(() => setFocusedVariantId(null), 3000);
        return () => clearTimeout(timer);
    }, [focusedVariantId]);

    useEffect(() => {
        if (!focusedVariantId) return;
        const rowEl = document.getElementById(`variant-row-${focusedVariantId}`);
        rowEl?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [focusedVariantId, paginatedVariants]);

    useEffect(() => {
        if (focusedVariantId && !processedVariants.some((v) => v.id === focusedVariantId)) {
            setFocusedVariantId(null);
        }
    }, [focusedVariantId, processedVariants]);

    useEffect(() => {
        if (nearExpiryAlerts.length === 0) {
            setFocusedVariantId(null);
        }
    }, [nearExpiryAlerts]);

    useEffect(() => {
        if (!focusedVariantId) return;
        setSelectedIds((prev) => (prev.includes(focusedVariantId) ? prev : [focusedVariantId]));
    }, [focusedVariantId]);


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
    // NO INLINE EDIT ANYMORE - We use Create Price Modal, EXCEPT for Date
    // ═══════════════════════════════════════════

    const handleEffectiveDateChange = async (variant, newDateStr) => {
        if (!newDateStr) return;
        try {
            // Update the backend
            await api.put(`/products/variants/${variant.id}/prices/active/date`, { effectiveDate: newDateStr });
            setSuccessMsg(`Đã cập nhật ngày hiệu lực cho ${variant.name}`);
            // Update the UI immediately without refetching all
            setVariants((prev) =>
                prev.map((v) => (v.id === variant.id ? { ...v, activeEffectiveDate: newDateStr } : v))
            );
            setTimeout(() => setSuccessMsg(""), 4000);
        } catch (err) {
            console.error("Error updating effective date:", err);
            setErrorMsg("Lỗi khi cập nhật ngày hiệu lực. Hãy đảm bảo sản phẩm đã có bảng giá ACTIVE.");
            setTimeout(() => setErrorMsg(""), 4000);
        }
    };

    const handleExpiryDateChange = async (variant, newDateStr) => {
        try {
            await api.put(`/products/variants/${variant.id}/prices/active/expiry`, { expiryDate: newDateStr || null });
            setSuccessMsg(`Đã cập nhật ngày hết hiệu lực cho ${variant.name}`);
            setVariants((prev) =>
                prev.map((v) => (v.id === variant.id ? { ...v, activeExpiryDate: newDateStr || null } : v))
            );
            setTimeout(() => setSuccessMsg(""), 4000);
        } catch (err) {
            console.error("Error updating expiry date:", err);
            setErrorMsg("Lỗi khi cập nhật ngày hết hiệu lực.");
            setTimeout(() => setErrorMsg(""), 4000);
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
                            <div className="relative">
                                <Button
                                    variant="ghost"
                                    onClick={toggleNotificationPanel}
                                    className="h-11 w-11 p-0 rounded-xl text-gray-600 hover:bg-gray-100 relative"
                                    title="Thông báo đồng bộ giá"
                                >
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
                                            {unreadCount > 9 ? "9+" : unreadCount}
                                        </span>
                                    )}
                                </Button>

                                {notificationPanelOpen && (
                                    <div className="absolute right-0 mt-2 w-[360px] max-h-[420px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl z-20">
                                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                            <div className="font-semibold text-gray-800">Thông báo đồng bộ giá</div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={clearNotifications}
                                                className="h-8 px-2 text-xs text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 mr-1" />
                                                Xóa hết
                                            </Button>
                                        </div>

                                        {notifications.length === 0 ? (
                                            <div className="px-4 py-6 text-sm text-gray-500 text-center">
                                                Chưa có thông báo nào.
                                            </div>
                                        ) : (
                                            <div className="max-h-[360px] overflow-auto divide-y divide-gray-100">
                                                {notifications.map((notice) => {
                                                    const formattedTime = new Date(notice.createdAt || Date.now()).toLocaleString("vi-VN");
                                                    const summary = buildSyncSummary(notice.syncedItems, Number(notice.syncedCount) || 0);
                                                    return (
                                                        <div key={notice.id} className="px-4 py-3 space-y-2">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <p className="text-sm font-medium text-gray-800">
                                                                    {summary}
                                                                    {notice.orderNumber ? ` (PO: ${notice.orderNumber})` : ""}
                                                                </p>
                                                            </div>
                                                            <p className="text-xs text-gray-500 inline-flex items-center gap-1">
                                                                <Clock3 className="w-3.5 h-3.5" />
                                                                {formattedTime}
                                                            </p>
                                                            {Array.isArray(notice.syncedItems) && notice.syncedItems.length > 0 && (
                                                                <ul className="space-y-1">
                                                                    {notice.syncedItems.map((item, index) => (
                                                                        <li
                                                                            key={`${notice.id}-${item.variantId || item.itemId || index}`}
                                                                            className="text-xs text-gray-700 bg-gray-50 rounded-md px-2 py-1"
                                                                        >
                                                                            <span className="font-medium text-gray-900">{item.productName || "Sản phẩm"}</span>
                                                                            <span className="text-gray-500"> · SKU: {item.sku || "-"}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {canEditProducts && (
                                <Button
                                    variant="outline"
                                    onClick={() => setIsTaxModalOpen(true)}
                                    className="h-11 px-4 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 rounded-xl whitespace-nowrap"
                                >
                                    <Percent className="w-4 h-4 mr-2" />
                                    Thiết lập thuế
                                </Button>
                            )}

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
                                    placeholder="Tìm theo tên, SKU, thương hiệu..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-10 h-11 w-full border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        aria-label="Xóa từ khóa tìm kiếm"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
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
                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 shadow-sm space-y-3">
                        <div className="flex items-center gap-3">
                            <Save className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium text-sm flex-1">{successMsg}</span>
                            <button onClick={() => setSuccessMsg("")} className="text-emerald-400 hover:text-emerald-600 text-lg leading-none">×</button>
                        </div>

                        {priceSyncNotice?.syncedItems?.length > 0 && (
                            <div className="pl-8">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowSyncedProducts((prev) => !prev)}
                                    className="h-9 px-3 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                                >
                                    {showSyncedProducts ? "Ẩn sản phẩm đã đổi giá nhập" : "Xem sản phẩm đã đổi giá nhập"}
                                </Button>

                                {showSyncedProducts && (
                                    <div className="mt-3 rounded-lg border border-emerald-200 bg-white p-3 max-h-56 overflow-auto">
                                        <ul className="space-y-2 text-sm text-gray-700">
                                            {priceSyncNotice.syncedItems.map((item, index) => (
                                                <li key={`${item.itemId || item.variantId || index}`} className="border-b border-gray-100 pb-2 last:border-b-0">
                                                    <div className="font-medium text-gray-900">{item.productName || "Sản phẩm"}</div>
                                                    <div className="text-xs text-gray-500">SKU: {item.sku || "-"}</div>
                                                    <div className="text-xs text-gray-600">
                                                        Giá nhập: {Number(item.previousPurchasePrice || 0).toLocaleString("vi-VN")} → {Number(item.purchasePrice || 0).toLocaleString("vi-VN")}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h3 className="text-sm font-semibold text-amber-800">Giá sắp hết hiệu lực trong 7 ngày</h3>
                                {nearExpiryAlerts.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                                            {nearExpiryAlerts.length} sản phẩm
                                        </span>
                                        {nearExpiryAlerts.length > 3 && (
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowAllNearExpiry((prev) => !prev)}
                                                className="h-7 px-2 text-xs border-amber-300 text-amber-800 hover:bg-amber-100"
                                            >
                                                {showAllNearExpiry ? "Thu gọn" : `Xem thêm ${nearExpiryAlerts.length - 3}`}
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {nearExpiryAlerts.length === 0 ? (
                                <p className="text-sm text-amber-700 mt-1">Không có sản phẩm nào sắp hết hiệu lực giá trong 7 ngày tới.</p>
                            ) : (
                                <div className="mt-3 rounded-lg border border-amber-200 bg-white overflow-hidden">
                                    <div className="max-h-44 overflow-auto divide-y divide-amber-100">
                                        {(showAllNearExpiry ? nearExpiryAlerts : nearExpiryAlerts.slice(0, 3)).map((alert) => (
                                            <button
                                                key={`${alert.variantPriceId}-${alert.variantId}`}
                                                type="button"
                                                onClick={() => handleNearExpiryClick(alert)}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-amber-50 transition-colors"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                                    <div className="font-medium text-gray-900 truncate">{alert.variantName || "N/A"}</div>
                                                    <div className="text-xs text-amber-700">
                                                        {Number.isFinite(Number(alert.daysUntilExpiry))
                                                            ? `Còn ${Number(alert.daysUntilExpiry)} ngày`
                                                            : ""}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-500 truncate">SKU: {alert.sku || "-"}</div>
                                                <div className="text-xs text-gray-600">
                                                    Hết hiệu lực: {alert.expiryDate ? new Date(alert.expiryDate).toLocaleDateString("vi-VN") : "Chưa có"}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ─── TABLE ─── */}
                <PriceTable
                    variants={paginatedVariants}
                    loading={loading}
                    readOnly={!canEditProducts}
                    selectedIds={selectedIds}
                    onToggleSelect={handleToggleSelect}
                    onToggleSelectAll={handleToggleSelectAll}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    onCreatePriceModalOpen={canEditProducts ? (v) => setCreatePriceVariant(v) : undefined}
                    onViewHistory={(v) => setHistoryVariant(v)}
                    onEffectiveDateChange={canEditProducts ? handleEffectiveDateChange : undefined}
                    onExpiryDateChange={canEditProducts ? handleExpiryDateChange : undefined}
                    focusedVariantId={focusedVariantId}
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
            {canEditProducts && isTaxModalOpen && (
                <TaxRateManagerModal onClose={() => setIsTaxModalOpen(false)} onDataChange={fetchVariants} />
            )}
            {historyVariant && (
                <PriceHistoryModal
                    isOpen={true}
                    variant={historyVariant}
                    onClose={() => setHistoryVariant(null)}
                    onStatusChanged={fetchVariants}
                />
            )}
            {canEditProducts && createPriceVariant && (
                <CreatePriceModal
                    isOpen={true}
                    variant={createPriceVariant}
                    onClose={(isSuccess) => {
                        setCreatePriceVariant(null);
                        if (isSuccess === true) fetchVariants(); // Ensure it fetches when fully success
                    }}
                />
            )}
        </div>
    );
};

export default PriceSetting;
