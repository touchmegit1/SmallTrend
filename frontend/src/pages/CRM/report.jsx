import React, { useState } from 'react';
import {
    Users, Gift, Megaphone, Tag, TrendingUp,
    ChevronRight, X, Calendar, Search, BarChart2, Award
} from 'lucide-react';
import { useFetchCustomers } from '../../hooks/Customers';
import { useCustomerTiers } from '../../hooks/useCustomerTiers';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useCoupons } from '../../hooks/useCoupons';
import { useGifts } from '../../hooks/useGifts';
import adService from '../../services/adService';

// ─── STAT CARD (clickable) ────────────────────────────────────────────────────
const ReportCard = ({ icon: Icon, label, value, sub, color, onClick }) => (
    <button
        onClick={onClick}
        className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 w-full text-left hover:shadow-md hover:border-indigo-200 transition-all group"
    >
        <div className={`p-3 rounded-xl ${color} flex-shrink-0 group-hover:scale-110 transition-transform`}>
            <Icon size={22} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 font-medium">{label}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
        <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
    </button>
);

// ─── MODAL WRAPPER ────────────────────────────────────────────────────────────
const Modal = ({ title, subtitle, onClose, children }) => (
    <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-start px-6 py-4 border-b border-slate-100 flex-shrink-0">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">{title}</h2>
                    {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
                </div>
                <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors ml-4">
                    <X size={20} className="text-slate-500" />
                </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6">{children}</div>
        </div>
    </div>
);

// ─── SEARCH INPUT ─────────────────────────────────────────────────────────────
const SearchInput = ({ value, onChange, placeholder }) => (
    <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
    </div>
);

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
const Empty = ({ text }) => (
    <div className="text-center py-10 text-slate-400">
        <BarChart2 size={36} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm">{text}</p>
    </div>
);

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
const Badge = ({ text, color }) => (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>{text}</span>
);

const AnalyticsPanel = ({ title, subtitle, children, className = '' }) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-5 ${className}`}>
        <div className="mb-4">
            <h3 className="text-base font-bold text-slate-800">{title}</h3>
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {children}
    </div>
);

const MiniMetric = ({ label, value, sub, tone = 'indigo' }) => {
    const toneClass = {
        indigo: 'bg-indigo-50 text-indigo-700',
        emerald: 'bg-emerald-50 text-emerald-700',
        amber: 'bg-amber-50 text-amber-700',
        rose: 'bg-rose-50 text-rose-700',
        sky: 'bg-sky-50 text-sky-700',
        slate: 'bg-slate-100 text-slate-700',
        purple: 'bg-purple-50 text-purple-700',
    }[tone] || 'bg-slate-100 text-slate-700';

    return (
        <div className={`rounded-xl px-4 py-3 ${toneClass}`}>
            <p className="text-xs font-medium opacity-80">{label}</p>
            <p className="text-xl font-black mt-1">{value}</p>
            {sub && <p className="text-xs mt-1 opacity-75">{sub}</p>}
        </div>
    );
};

const HorizontalBar = ({ label, labelTag, value, percent, helper, color = 'indigo' }) => {
    const colorClass = {
        indigo: 'bg-indigo-500',
        emerald: 'bg-emerald-500',
        amber: 'bg-amber-500',
        rose: 'bg-rose-500',
        sky: 'bg-sky-500',
        purple: 'bg-purple-500',
    }[color] || 'bg-indigo-500';

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{label}</p>
                        {labelTag ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 flex-shrink-0">
                                {labelTag}
                            </span>
                        ) : null}
                    </div>
                    {helper && <p className="text-xs text-slate-400 truncate">{helper}</p>}
                </div>
                <span className="text-sm font-bold text-slate-700 whitespace-nowrap">{value}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                    className={`h-full rounded-full ${colorClass}`}
                    style={{ width: `${Math.max(0, Math.min(100, percent || 0))}%` }}
                />
            </div>
        </div>
    );
};

const VerticalBars = ({ rows, valueKey, labelKey, subLabelKey, color = 'indigo', formatter = (v) => v }) => {
    const max = Math.max(...rows.map(row => Number(row[valueKey]) || 0), 1);
    const colorClass = {
        indigo: 'bg-indigo-500',
        emerald: 'bg-emerald-500',
        amber: 'bg-amber-500',
        rose: 'bg-rose-500',
        sky: 'bg-sky-500',
        purple: 'bg-purple-500',
    }[color] || 'bg-indigo-500';

    if (!rows.length) {
        return <Empty text="Chưa có dữ liệu để vẽ biểu đồ." />;
    }

    return (
        <div className="space-y-4">
            <div className="h-56 flex items-end gap-3">
                {rows.map((row) => {
                    const raw = Number(row[valueKey]) || 0;
                    const pct = (raw / max) * 100;
                    return (
                        <div key={row[labelKey]} className="flex-1 min-w-0 flex flex-col items-center gap-2">
                            <div className="text-[11px] font-semibold text-slate-600">{formatter(raw)}</div>
                            <div className="w-full h-44 flex items-end">
                                <div
                                    className={`w-full rounded-t-lg ${colorClass} transition-all duration-300`}
                                    style={{ height: `${Math.max(4, pct)}%` }}
                                />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-semibold text-slate-700 truncate max-w-[100px]" title={row[labelKey]}>
                                    {row[labelKey]}
                                </p>
                                {subLabelKey && row[subLabelKey] != null ? (
                                    <p className="text-[11px] text-slate-400 truncate max-w-[100px]" title={row[subLabelKey]}>
                                        {row[subLabelKey]}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const statusColor = s => ({
    ACTIVE: 'bg-emerald-100 text-emerald-700',
    DRAFT: 'bg-slate-100 text-slate-600',
    COMPLETED: 'bg-blue-100 text-blue-700',
    CANCELLED: 'bg-red-100 text-red-600',
    EXPIRED: 'bg-orange-100 text-orange-700',
}[s] || 'bg-slate-100 text-slate-500');

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function CRMReport() {
    const { customers, loading: loadingCustomers } = useFetchCustomers();
    const { tiers } = useCustomerTiers();
    const { campaigns, loading: loadingCampaigns } = useCampaigns();
    const { coupons, loading: loadingCoupons } = useCoupons();
    const { gifts, loading: loadingGifts } = useGifts();
    const [ads, setAds] = useState([]);
    const [loadingAds, setLoadingAds] = useState(true);

    const [activeModal, setActiveModal] = useState(null); // 'customers' | 'campaigns' | 'coupons' | 'gifts' | 'ads'
    const [search, setSearch] = useState('');
    const [campaignChartMode, setCampaignChartMode] = useState('monthly');

    React.useEffect(() => {
        const loadAds = async () => {
            setLoadingAds(true);
            try {
                const list = await adService.getAll();
                setAds(Array.isArray(list) ? list : []);
            } catch (_e) {
                setAds([]);
            } finally {
                setLoadingAds(false);
            }
        };
        loadAds();
    }, []);

    const openModal = (key) => { setActiveModal(key); setSearch(''); };
    const closeModal = () => { setActiveModal(null); setSearch(''); };

    // Filtered data for modals
    const kw = search.toLowerCase().trim();
    const filteredCustomers = customers.filter(c =>
        c.name?.toLowerCase().includes(kw) || c.phone?.includes(kw)
    );
    const filteredCampaigns = campaigns.filter(c =>
        c.campaignName?.toLowerCase().includes(kw) || c.campaignCode?.toLowerCase().includes(kw)
    );
    const filteredCoupons = coupons.filter(c =>
        c.couponName?.toLowerCase().includes(kw) || c.couponCode?.toLowerCase().includes(kw)
    );
    const filteredGifts = gifts.filter(g => g.name?.toLowerCase().includes(kw));
    const filteredAds = ads.filter(a =>
        a.sponsorName?.toLowerCase().includes(kw)
        || a.title?.toLowerCase().includes(kw)
        || a.slot?.toLowerCase().includes(kw)
    );

    // Summary stats
    const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length;
    const activeCoupons = coupons.filter(c => c.status === 'ACTIVE').length;
    const totalLoyaltyPts = customers.reduce((s, c) => s + (c.loyaltyPoints || 0), 0);
    const activeAds = ads.filter(a => a.isActive).length;
    const totalSpent = customers.reduce((sum, customer) => sum + (Number(customer.spentAmount) || 0), 0);
    const avgSpentPerCustomer = customers.length > 0 ? totalSpent / customers.length : 0;
    const totalGiftStock = gifts.reduce((sum, gift) => sum + (gift.stock || 0), 0);
    const outOfStockGifts = gifts.filter(gift => (gift.stock || 0) <= 0).length;
    const totalCouponUsage = coupons.reduce((sum, coupon) => sum + (coupon.currentUsageCount || 0), 0);
    const couponsWithFiniteLimit = coupons.filter(coupon => coupon.totalUsageLimit != null);
    const totalCouponCapacity = couponsWithFiniteLimit.reduce((sum, coupon) => sum + (coupon.totalUsageLimit || 0), 0);
    const couponUsageRate = totalCouponCapacity > 0 ? (totalCouponUsage / totalCouponCapacity) * 100 : 0;
    const percentageCoupons = coupons.filter(coupon => coupon.couponType === 'PERCENTAGE').length;
    const fixedCoupons = coupons.filter(coupon => coupon.couponType === 'FIXED_AMOUNT').length;
    const activeAdSlots = new Set(ads.filter(ad => ad.isActive).map(ad => ad.slot)).size;
    const draftCampaigns = campaigns.filter(campaign => campaign.status === 'DRAFT').length;
    const expiredCoupons = coupons.filter(coupon => coupon.status === 'EXPIRED').length;
    const topLoyaltyCustomer = customers.length > 0
        ? [...customers].sort((a, b) => (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0))[0]
        : null;
    const topSpentCustomer = customers.length > 0
        ? [...customers].sort((a, b) => (Number(b.spentAmount) || 0) - (Number(a.spentAmount) || 0))[0]
        : null;

    const topCoupons = [...coupons]
        .sort((a, b) => (b.currentUsageCount || 0) - (a.currentUsageCount || 0))
        .slice(0, 5);
    const topCustomersBySpend = [...customers]
        .sort((a, b) => (Number(b.spentAmount) || 0) - (Number(a.spentAmount) || 0))
        .slice(0, 5);
    const maxCustomerSpend = Math.max(...topCustomersBySpend.map(customer => Number(customer.spentAmount) || 0), 1);

    const eventBudgetComparison = [...campaigns]
        .filter(campaign => Number(campaign.budget) > 0)
        .sort((a, b) => (Number(b.budget) || 0) - (Number(a.budget) || 0))
        .slice(0, 6)
        .map(campaign => ({
            name: campaign.campaignName || campaign.campaignCode || `Event ${campaign.id}`,
            code: campaign.campaignCode,
            budget: Number(campaign.budget) || 0,
        }));

    const campaignsByMonthMap = campaigns.reduce((acc, campaign) => {
        const dateStr = campaign.startDate || campaign.createdAt || campaign.created_at;
        if (!dateStr) return acc;
        const dt = new Date(dateStr);
        if (Number.isNaN(dt.getTime())) return acc;

        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = dt.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
        const current = acc.get(key) || { monthKey: key, month: monthLabel, total: 0, active: 0 };
        current.total += 1;
        if (campaign.status === 'ACTIVE') current.active += 1;
        acc.set(key, current);
        return acc;
    }, new Map());

    const campaignsByMonth = Array.from(campaignsByMonthMap.values())
        .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
        .slice(-6);

    const campaignStatusRows = [
        { label: 'ACTIVE', value: activeCampaigns },
        { label: 'DRAFT', value: draftCampaigns },
        { label: 'Khác', value: Math.max(0, campaigns.length - activeCampaigns - draftCampaigns) },
    ];

    const voucherUsageRows = topCoupons.map((coupon) => ({
        label: coupon.couponName || coupon.couponCode,
        code: coupon.couponCode,
        value: coupon.currentUsageCount || 0,
    }));

    const adSlotRows = ['LEFT', 'RIGHT'].map((slot) => {
        const slotAds = ads.filter(ad => ad.slot === slot);
        const activeCount = slotAds.filter(ad => ad.isActive).length;
        return {
            slot,
            total: slotAds.length,
            active: activeCount,
            percent: slotAds.length > 0 ? (activeCount / slotAds.length) * 100 : 0,
        };
    });

    const fmt = v => v != null ? Number(v).toLocaleString('vi-VN') + 'đ' : '-';

    const getCustomerTierLabel = (customer) => {
        const directTier = customer?.tierName || customer?.tier || customer?.customerTierName || customer?.tierInfo?.tierName;
        if (directTier) return String(directTier);

        const spent = Number(customer?.spentAmount) || 0;
        if (!Array.isArray(tiers) || tiers.length === 0) return 'Thường';

        const matchedTier = [...tiers]
            .sort((a, b) => (Number(b.minSpending) || 0) - (Number(a.minSpending) || 0))
            .find((tier) => spent >= (Number(tier.minSpending) || 0));

        return matchedTier?.tierName || 'Thường';
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Báo cáo & Thống kê CRM</h1>
                <p className="text-slate-500 mt-1">Tổng quan toàn bộ hệ thống CRM. Nhấn vào thẻ để xem chi tiết.</p>
            </div>

            {/* REPORT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <ReportCard
                    icon={Users}
                    label="Khách hàng"
                    value={loadingCustomers ? '...' : customers.length}
                    sub={customers.length > 0 ? `Chi tiêu trung bình: ${fmt(avgSpentPerCustomer)}` : 'Chưa có dữ liệu khách hàng'}
                    color="bg-indigo-500"
                    onClick={() => openModal('customers')}
                />
                <ReportCard
                    icon={Megaphone}
                    label="Sự kiện / Campaign"
                    value={loadingCampaigns ? '...' : campaigns.length}
                    sub={`${activeCampaigns} ACTIVE · ${draftCampaigns} draft`}
                    color="bg-blue-500"
                    onClick={() => openModal('campaigns')}
                />
                <ReportCard
                    icon={Tag}
                    label="Coupon"
                    value={loadingCoupons ? '...' : coupons.length}
                    sub={`${totalCouponUsage.toLocaleString()} lượt sử dụng · ${activeCoupons} ACTIVE`}
                    color="bg-purple-500"
                    onClick={() => openModal('coupons')}
                />
                <ReportCard
                    icon={Gift}
                    label="Kho quà tặng Loyalty"
                    value={loadingGifts ? '...' : gifts.length}
                    sub={`Tổng tồn: ${totalGiftStock} · Hết hàng: ${outOfStockGifts}`}
                    color="bg-amber-500"
                    onClick={() => openModal('gifts')}
                />
                <ReportCard
                    icon={TrendingUp}
                    label="Quảng cáo"
                    value={loadingAds ? '...' : ads.length}
                    sub={`${activeAds} đang hiển thị trên ${activeAdSlots} vị trí`}
                    color="bg-sky-500"
                    onClick={() => openModal('ads')}
                />
                <ReportCard
                    icon={Award}
                    label="Top Loyalty khách hàng"
                    value={topLoyaltyCustomer ? `${(topLoyaltyCustomer.loyaltyPoints || 0).toLocaleString()} pts` : '0'}
                    sub={topSpentCustomer ? `Chi tiêu cao nhất: ${fmt(topSpentCustomer.spentAmount)}` : 'Chưa có dữ liệu'}
                    color="bg-emerald-500"
                    onClick={() => openModal('customers')}
                />
            </div>

            {/* ANALYTICS OVERVIEW */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <AnalyticsPanel
                    title="Hiệu suất voucher"
                >
                    <div className="grid grid-cols-2 gap-3">
                        <MiniMetric label="Tổng coupon" value={coupons.length} sub={`${activeCoupons} ACTIVE`} tone="purple" />
                        <MiniMetric label="Lượt sử dụng" value={totalCouponUsage.toLocaleString()} sub={`${couponUsageRate.toFixed(1)}% trên quota`} tone="emerald" />
                        <MiniMetric label="Coupon %" value={percentageCoupons} sub="Theo phần trăm" tone="amber" />
                        <MiniMetric label="Coupon cố định" value={fixedCoupons} sub={`${expiredCoupons} đã hết hạn`} tone="rose" />
                    </div>
                </AnalyticsPanel>

                <AnalyticsPanel
                    title="Giá trị khách hàng"
                >
                    <div className="grid grid-cols-2 gap-3">
                        <MiniMetric label="Total spent" value={fmt(totalSpent)} sub="Toàn bộ khách CRM" tone="indigo" />
                        <MiniMetric label="Chi tiêu TB" value={fmt(avgSpentPerCustomer)} sub="Mỗi khách đăng ký" tone="sky" />
                        <MiniMetric label="Tổng loyalty" value={`${totalLoyaltyPts.toLocaleString()} pts`} sub="Điểm đang tích lũy" tone="emerald" />
                        <MiniMetric label="Top spender" value={topCustomersBySpend[0]?.name || '-'} sub={topCustomersBySpend[0] ? fmt(topCustomersBySpend[0].spentAmount) : 'Chưa có dữ liệu'} tone="amber" />
                    </div>
                </AnalyticsPanel>

                <AnalyticsPanel
                    title="Vận hành CRM"
                >
                    <div className="grid grid-cols-2 gap-3">
                        <MiniMetric label="Campaign active" value={activeCampaigns} sub={`${draftCampaigns} draft`} tone="sky" />
                        <MiniMetric label="Ads active" value={activeAds} sub={`${activeAdSlots} vị trí có hiển thị`} tone="indigo" />
                        <MiniMetric label="Tồn quà loyalty" value={totalGiftStock.toLocaleString()} sub={`${outOfStockGifts} quà đã hết`} tone="amber" />
                        <MiniMetric label="Ngân sách campaign" value={fmt(campaigns.reduce((sum, campaign) => sum + (Number(campaign.budget) || 0), 0))} sub="Tổng ngân sách khai báo" tone="emerald" />
                    </div>
                </AnalyticsPanel>
            </div>

            {/* DETAILED INSIGHTS */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <AnalyticsPanel
                    title="Top khách hàng theo chi tiêu"
                >
                    {topCustomersBySpend.length === 0 ? <Empty text="Chưa có dữ liệu chi tiêu khách hàng." /> : (
                        <div className="space-y-4">
                            {topCustomersBySpend.map((customer) => (
                                <HorizontalBar
                                    key={customer.id}
                                    label={customer.name}
                                    labelTag={getCustomerTierLabel(customer)}
                                    helper={`${customer.phone || 'Không có SĐT'} · ${(customer.loyaltyPoints || 0).toLocaleString()} pts`}
                                    value={fmt(customer.spentAmount)}
                                    percent={((Number(customer.spentAmount) || 0) / maxCustomerSpend) * 100}
                                    color="emerald"
                                />
                            ))}
                        </div>
                    )}
                </AnalyticsPanel>
                <AnalyticsPanel
                    title="Kho quà loyalty"
                >
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <MiniMetric label="Quà sắp hết" value={gifts.filter(gift => (gift.stock || 0) > 0 && (gift.stock || 0) <= 5).length} tone="amber" />
                        <MiniMetric label="Tổng số quà" value={gifts.length} tone="indigo" />
                    </div>
                    <div className="space-y-4">
                        {gifts.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-4">Chưa có quà trong kho.</p>
                        ) : (() => {
                            const maxStock = Math.max(...gifts.map(g => Number(g.stock) || 0), 1);
                            return gifts
                                .slice()
                                .sort((a, b) => (Number(b.stock) || 0) - (Number(a.stock) || 0))
                                .map((gift) => {
                                    const stock = Number(gift.stock) || 0;
                                    const color = stock === 0 ? 'rose' : stock <= 5 ? 'amber' : 'emerald';
                                    return (
                                        <HorizontalBar
                                            key={gift.id || gift.name}
                                            label={gift.name || 'Quà'}
                                            helper={stock === 0 ? 'Hết hàng' : `Cần ${gift.requiredPoints || 0} pts`}
                                            value={`${stock}`}
                                            percent={(stock / maxStock) * 100}
                                            color={color}
                                        />
                                    );
                                });
                        })()}
                    </div>
                </AnalyticsPanel>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <AnalyticsPanel
                    title="Biểu đồ tổng hợp CRM"
                    subtitle={campaignChartMode === 'monthly'
                        ? 'Số lượng campaign được tạo theo tháng (6 tháng gần nhất).'
                        : campaignChartMode === 'budget'
                            ? 'Top chiến dịch theo ngân sách khai báo.'
                            : campaignChartMode === 'voucher'
                                ? 'Top coupon theo số lượt sử dụng.'
                                : 'Tương quan số lượng campaign theo trạng thái.'}
                >
                    <div className="inline-flex rounded-lg bg-slate-100 p-1 mb-4">
                        <button
                            type="button"
                            onClick={() => setCampaignChartMode('monthly')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${campaignChartMode === 'monthly' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                        >
                            Theo tháng
                        </button>
                        <button
                            type="button"
                            onClick={() => setCampaignChartMode('budget')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${campaignChartMode === 'budget' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                        >
                            Theo ngân sách
                        </button>
                        <button
                            type="button"
                            onClick={() => setCampaignChartMode('voucher')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${campaignChartMode === 'voucher' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                        >
                            Voucher
                        </button>
                        <button
                            type="button"
                            onClick={() => setCampaignChartMode('status')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${campaignChartMode === 'status' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                        >
                            Trạng thái
                        </button>
                    </div>

                    {campaignChartMode === 'monthly' ? (
                        <>
                            <VerticalBars
                                rows={campaignsByMonth}
                                valueKey="total"
                                labelKey="month"
                                subLabelKey="active"
                                color="indigo"
                                formatter={(v) => `${v} event`}
                            />
                            {campaignsByMonth.length > 0 ? (
                                <p className="text-xs text-slate-400 mt-2">Dòng phụ dưới cột là số campaign ACTIVE trong tháng đó.</p>
                            ) : null}
                        </>
                    ) : campaignChartMode === 'budget' ? (
                        <VerticalBars
                            rows={eventBudgetComparison}
                            valueKey="budget"
                            labelKey="name"
                            subLabelKey="code"
                            color="sky"
                            formatter={(v) => fmt(v)}
                        />
                    ) : campaignChartMode === 'voucher' ? (
                        <VerticalBars
                            rows={voucherUsageRows}
                            valueKey="value"
                            labelKey="label"
                            subLabelKey="code"
                            color="purple"
                            formatter={(v) => `${v} lượt`}
                        />
                    ) : (
                        <VerticalBars
                            rows={campaignStatusRows}
                            valueKey="value"
                            labelKey="label"
                            color="emerald"
                            formatter={(v) => `${v} campaign`}
                        />
                    )}
                </AnalyticsPanel>
            </div>

            {/* ── MODAL: CUSTOMERS ── */}
            {activeModal === 'customers' && (
                <Modal
                    title="Danh sách Khách hàng"
                    subtitle={`${customers.length} khách hàng đăng ký`}
                    onClose={closeModal}
                >
                    <SearchInput value={search} onChange={setSearch} placeholder="Tìm theo tên hoặc SĐT..." />
                    {filteredCustomers.length === 0 ? <Empty text="Không tìm thấy khách hàng." /> : (
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Tên</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">SĐT</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Điểm Loyalty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...filteredCustomers]
                                    .sort((a, b) => (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0))
                                    .map((c, i) => (
                                        <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-slate-800 flex items-center gap-2">
                                                {i < 3 && <span className="text-amber-500 font-bold text-xs">#{i + 1}</span>}
                                                {c.name}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">{c.phone}</td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">
                                                    {(c.loyaltyPoints || 0).toLocaleString()} pts
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    )}
                </Modal>
            )}

            {/* ── MODAL: CAMPAIGNS ── */}
            {activeModal === 'campaigns' && (
                <Modal
                    title="Danh sách Campaign / Sự kiện"
                    subtitle={`${campaigns.length} sự kiện · ${activeCampaigns} đang ACTIVE`}
                    onClose={closeModal}
                >
                    <SearchInput value={search} onChange={setSearch} placeholder="Tìm theo tên hoặc mã..." />
                    {filteredCampaigns.length === 0 ? <Empty text="Không tìm thấy sự kiện." /> : (
                        <div className="space-y-3">
                            {filteredCampaigns.map(c => (
                                <div key={c.id} className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                                    {c.bannerImageUrl ? (
                                        <img src={c.bannerImageUrl} alt={c.campaignName} className="w-14 h-14 rounded-xl object-cover border border-slate-100 flex-shrink-0" />
                                    ) : (
                                        <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                                            <Megaphone size={24} className="text-blue-400" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-slate-800 text-sm">{c.campaignName}</span>
                                            <Badge text={c.status} color={statusColor(c.status)} />
                                        </div>
                                        <p className="text-xs text-slate-400 font-mono mt-0.5">{c.campaignCode}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            <Calendar size={11} className="inline mr-1" />
                                            {c.startDate || '?'} → {c.endDate || '∞'}
                                        </p>
                                    </div>
                                    {c.budget && (
                                        <div className="text-right">
                                            <p className="text-xs text-slate-400">Ngân sách</p>
                                            <p className="text-sm font-bold text-slate-700">{fmt(c.budget)}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Modal>
            )}

            {/* ── MODAL: COUPONS ── */}
            {activeModal === 'coupons' && (
                <Modal
                    title="Danh sách Coupon"
                    subtitle={`${coupons.length} coupon · ${activeCoupons} đang ACTIVE`}
                    onClose={closeModal}
                >
                    <SearchInput value={search} onChange={setSearch} placeholder="Tìm theo tên hoặc mã coupon..." />
                    {filteredCoupons.length === 0 ? <Empty text="Không tìm thấy coupon." /> : (
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Mã</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Tên</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Giảm giá</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Đã dùng</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCoupons.map(c => (
                                    <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-bold">{c.couponCode}</span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-700 font-medium text-sm">{c.couponName}</td>
                                        <td className="px-4 py-3 font-bold text-rose-500 text-sm">
                                            {c.couponType === 'PERCENTAGE' ? `-${c.discountPercent}%` :
                                                c.couponType === 'FIXED_AMOUNT' ? `-${fmt(c.discountAmount)}` : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 text-sm">
                                            {c.currentUsageCount ?? 0} / {c.totalUsageLimit ?? '∞'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge text={c.status} color={statusColor(c.status)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Modal>
            )}

            {/* ── MODAL: GIFTS ── */}
            {activeModal === 'gifts' && (
                <Modal
                    title="Kho quà tặng Loyalty"
                    subtitle={`${gifts.length} loại quà · ${gifts.reduce((s, g) => s + (g.stock || 0), 0)} tổng tồn kho`}
                    onClose={closeModal}
                >
                    <SearchInput value={search} onChange={setSearch} placeholder="Tìm theo tên quà..." />
                    {filteredGifts.length === 0 ? <Empty text="Kho quà đang trống." /> : (
                        <div className="space-y-3">
                            {filteredGifts.map(g => (
                                <div key={g.id} className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                                    <img
                                        src={g.image || 'https://placehold.co/60x60?text=Gift'}
                                        alt={g.name}
                                        className="w-14 h-14 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                                    />
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-800 text-sm">{g.name}</p>
                                        <p className="text-xs text-slate-400 font-mono">{g.sku}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-slate-400">Yêu cầu</p>
                                        <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold">
                                            {g.requiredPoints} pts
                                        </span>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-slate-400">Tồn kho</p>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${g.stock > 10 ? 'bg-emerald-50 text-emerald-700' : g.stock > 0 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                                            {g.stock}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Modal>
            )}

            {/* ── MODAL: ADS ── */}
            {activeModal === 'ads' && (
                <Modal
                    title="Danh sách quảng cáo"
                    subtitle={`${ads.length} quảng cáo · ${activeAds} đang hiển thị`}
                    onClose={closeModal}
                >
                    <SearchInput value={search} onChange={setSearch} placeholder="Tìm theo nhà tài trợ, tiêu đề hoặc vị trí..." />
                    {filteredAds.length === 0 ? <Empty text="Chưa có quảng cáo phù hợp." /> : (
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Nhà tài trợ / Tiêu đề</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Vị trí</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAds.map(a => (
                                    <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={a.imageUrl || 'https://placehold.co/40x40?text=Ad'}
                                                    alt={a.title}
                                                    className="w-9 h-9 rounded-lg object-cover border border-slate-100 flex-shrink-0"
                                                    onError={e => { e.target.src = 'https://placehold.co/40x40?text=Ad'; }}
                                                />
                                                <div>
                                                    <p className="font-medium text-slate-800 text-sm">{a.sponsorName}</p>
                                                    <p className="text-xs text-slate-500">{a.title}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-mono text-xs font-bold">
                                                {a.slot}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge
                                                text={a.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                color={a.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Modal>
            )}
        </div>
    );
}
