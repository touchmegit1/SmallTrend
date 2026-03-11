import React, { useState, useMemo } from 'react';
import {
    Users, Gift, Megaphone, Tag, TrendingUp, Building2,
    ChevronRight, X, Calendar, Search, BarChart2, Award, Clock, FileImage
} from 'lucide-react';
import { useFetchCustomers } from '../../hooks/Customers';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useCoupons } from '../../hooks/useCoupons';
import { useGifts } from '../../hooks/useGifts';

// ─── Date filter helpers ───────────────────────────────────────────────────────
const DATE_FILTERS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'today', label: 'Hôm nay' },
    { key: 'week', label: 'Tuần này' },
    { key: 'month', label: 'Tháng này' },
];

function isInRange(dateStr, key) {
    if (!dateStr || key === 'all') return true;
    const d = new Date(dateStr);
    if (isNaN(d)) return key === 'all';
    const now = new Date();
    if (key === 'today') {
        return d.toDateString() === now.toDateString();
    }
    if (key === 'week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return d >= startOfWeek;
    }
    if (key === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return true;
}

// ─── Sub-components ────────────────────────────────────────────────────────────
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

const Empty = ({ text }) => (
    <div className="text-center py-10 text-slate-400">
        <BarChart2 size={36} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm">{text}</p>
    </div>
);

const Badge = ({ text, color }) => (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>{text}</span>
);

const statusColor = s => ({
    ACTIVE: 'bg-emerald-100 text-emerald-700',
    DRAFT: 'bg-slate-100 text-slate-600',
    COMPLETED: 'bg-blue-100 text-blue-700',
    CANCELLED: 'bg-red-100 text-red-600',
    EXPIRED: 'bg-orange-100 text-orange-700',
}[s] || 'bg-slate-100 text-slate-500');

// ─── Date Filter Bar ─────────────────────────────────────────────────────────
function DateFilterBar({ value, onChange }) {
    const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' });
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Clock size={15} className="text-indigo-400" />
                <span>Báo cáo cho: <strong className="text-slate-700">{today}</strong></span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
                {DATE_FILTERS.map(f => (
                    <button
                        key={f.key}
                        onClick={() => onChange(f.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${value === f.key
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function CRMReport() {
    const { customers, loading: loadingCustomers } = useFetchCustomers();
    const { campaigns, loading: loadingCampaigns } = useCampaigns();
    const { coupons, loading: loadingCoupons } = useCoupons();
    const { gifts, loading: loadingGifts } = useGifts();

    // Load ads từ localStorage
    const ads = useMemo(() => {
        try {
            const saved = localStorage.getItem('smalltrend_side_ads');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    }, []);

    const [dateFilter, setDateFilter] = useState('all');
    const [activeModal, setActiveModal] = useState(null);
    const [search, setSearch] = useState('');

    const openModal = (key) => { setActiveModal(key); setSearch(''); };
    const closeModal = () => { setActiveModal(null); setSearch(''); };

    // Apply date filter to campaigns & coupons
    const filteredCampaignsByDate = useMemo(() =>
        campaigns.filter(c => isInRange(c.startDate, dateFilter) || isInRange(c.endDate, dateFilter)),
        [campaigns, dateFilter]
    );
    const filteredCouponsByDate = useMemo(() =>
        coupons.filter(c => isInRange(c.startDate, dateFilter) || isInRange(c.endDate, dateFilter)),
        [coupons, dateFilter]
    );

    // Bỏ filter hợp đồng theo ngày, ad không có ngày cụ thể

    const kw = search.toLowerCase().trim();
    const filteredCustomers = customers.filter(c => c.name?.toLowerCase().includes(kw) || c.phone?.includes(kw));
    const filteredCampaigns = filteredCampaignsByDate.filter(c =>
        c.campaignName?.toLowerCase().includes(kw) || c.campaignCode?.toLowerCase().includes(kw));
    const filteredCoupons = filteredCouponsByDate.filter(c =>
        c.couponName?.toLowerCase().includes(kw) || c.couponCode?.toLowerCase().includes(kw));
    const filteredGifts = gifts.filter(g => g.name?.toLowerCase().includes(kw));
    const filteredAds = ads.filter(a => a.title?.toLowerCase().includes(kw));

    const activeCampaigns = filteredCampaignsByDate.filter(c => c.status === 'ACTIVE').length;
    const activeCoupons = filteredCouponsByDate.filter(c => c.status === 'ACTIVE').length;
    const totalLoyaltyPts = customers.reduce((s, c) => s + (c.loyaltyPoints || 0), 0);
    const activeAdsCount = ads.filter(a => a.isActive).length;
    const fmt = v => v != null ? Number(v).toLocaleString('vi-VN') + 'đ' : '-';

    const dateLabel = DATE_FILTERS.find(f => f.key === dateFilter)?.label || '';

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Báo cáo & Thống kê CRM</h1>
                <p className="text-slate-500 mt-1">Tổng quan toàn bộ hệ thống CRM. Nhấn vào thẻ để xem chi tiết.</p>
            </div>

            {/* DATE FILTER */}
            <DateFilterBar value={dateFilter} onChange={setDateFilter} />

            {/* SUMMARY ROW */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'KH đăng ký', value: customers.length, color: 'bg-indigo-500' },
                    { label: `Campaign ACTIVE${dateFilter !== 'all' ? ` (${dateLabel})` : ''}`, value: activeCampaigns, color: 'bg-emerald-500' },
                    { label: `Voucher ACTIVE${dateFilter !== 'all' ? ` (${dateLabel})` : ''}`, value: activeCoupons, color: 'bg-purple-500' },
                    { label: 'Q/C đang BẬT', value: activeAdsCount, color: 'bg-orange-500' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
                        <div className={`w-2 h-2 rounded-full ${s.color} mx-auto mb-2`} />
                        <p className="text-2xl font-black text-slate-800">{s.value}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* REPORT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <ReportCard icon={Users} label="Khách hàng" value={loadingCustomers ? '...' : customers.length}
                    sub={`Tổng điểm tích lũy: ${totalLoyaltyPts.toLocaleString()} pts`} color="bg-indigo-500"
                    onClick={() => openModal('customers')} />
                <ReportCard icon={Megaphone} label={`Sự kiện / Campaign${dateFilter !== 'all' ? ` (${dateLabel})` : ''}`}
                    value={loadingCampaigns ? '...' : filteredCampaignsByDate.length}
                    sub={`${activeCampaigns} đang ACTIVE`} color="bg-blue-500" onClick={() => openModal('campaigns')} />
                <ReportCard icon={Tag} label={`Voucher${dateFilter !== 'all' ? ` (${dateLabel})` : ''}`}
                    value={loadingCoupons ? '...' : filteredCouponsByDate.length}
                    sub={`${activeCoupons} đang ACTIVE`} color="bg-purple-500" onClick={() => openModal('coupons')} />
                <ReportCard icon={Gift} label="Kho quà tặng Loyalty" value={loadingGifts ? '...' : gifts.length}
                    sub={`Tổng tồn: ${gifts.reduce((s, g) => s + (g.stock || 0), 0)} sản phẩm`} color="bg-amber-500"
                    onClick={() => openModal('gifts')} />
                <ReportCard icon={Building2} label="Quảng cáo Trang chủ"
                    value={ads.length}
                    sub={`${activeAdsCount} quảng cáo đang hiển thị`} color="bg-orange-500"
                    onClick={() => openModal('ads')} />
                <ReportCard icon={Award} label="Top Loyalty khách hàng"
                    value={customers.length > 0 ? `${Math.max(...customers.map(c => c.loyaltyPoints || 0)).toLocaleString()} pts` : '0'}
                    sub={(() => {
                        if (customers.length === 0) return 'Chưa có dữ liệu';
                        const top = [...customers].sort((a, b) => (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0))[0];
                        return top ? top.name : '';
                    })()} color="bg-emerald-500" onClick={() => openModal('customers')} />
            </div>

            {/* ── MODAL: CUSTOMERS ── */}
            {activeModal === 'customers' && (
                <Modal title="Danh sách Khách hàng" subtitle={`${customers.length} khách hàng đăng ký`} onClose={closeModal}>
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
                                {[...filteredCustomers].sort((a, b) => (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0)).map((c, i) => (
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
                <Modal title={`Campaign / Sự kiện${dateFilter !== 'all' ? ` — ${dateLabel}` : ''}`}
                    subtitle={`${filteredCampaignsByDate.length} sự kiện · ${activeCampaigns} đang ACTIVE`} onClose={closeModal}>
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
                <Modal title={`Coupon${dateFilter !== 'all' ? ` — ${dateLabel}` : ''}`}
                    subtitle={`${filteredCouponsByDate.length} coupon · ${activeCoupons} đang ACTIVE`} onClose={closeModal}>
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
                                        <td className="px-4 py-3 text-slate-500 text-sm">{c.currentUsageCount ?? 0} / {c.totalUsageLimit ?? '∞'}</td>
                                        <td className="px-4 py-3"><Badge text={c.status} color={statusColor(c.status)} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Modal>
            )}

            {/* ── MODAL: GIFTS ── */}
            {activeModal === 'gifts' && (
                <Modal title="Kho quà tặng Loyalty" subtitle={`${gifts.length} loại quà · ${gifts.reduce((s, g) => s + (g.stock || 0), 0)} tổng tồn kho`} onClose={closeModal}>
                    <SearchInput value={search} onChange={setSearch} placeholder="Tìm theo tên quà..." />
                    {filteredGifts.length === 0 ? <Empty text="Kho quà đang trống." /> : (
                        <div className="space-y-3">
                            {filteredGifts.map(g => (
                                <div key={g.id} className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                                    <img src={g.image || 'https://placehold.co/60x60?text=Gift'} alt={g.name}
                                        className="w-14 h-14 rounded-xl object-cover border border-slate-100 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-800 text-sm">{g.name}</p>
                                        <p className="text-xs text-slate-400 font-mono">{g.sku}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-slate-400">Yêu cầu</p>
                                        <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold">{g.requiredPoints} pts</span>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-slate-400">Tồn kho</p>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${g.stock > 10 ? 'bg-emerald-50 text-emerald-700' : g.stock > 0 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>{g.stock}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Modal>
            )}

            {/* ── MODAL: ADS ── */}
            {activeModal === 'ads' && (
                <Modal title="Quảng cáo Trang chủ" subtitle={`${ads.length} quảng cáo · ${activeAdsCount} đang BẬT`} onClose={closeModal}>
                    <SearchInput value={search} onChange={setSearch} placeholder="Tìm theo tên quảng cáo..." />
                    {filteredAds.length === 0 ? <Empty text="Chưa có quảng cáo nào." /> : (
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Quảng cáo</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Vị trí</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAds.map(a => (
                                    <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-800 flex items-center gap-2">
                                            {a.imageUrl && <img src={a.imageUrl} alt={a.title} className="w-8 h-8 rounded border object-cover" />}
                                            {a.title}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${a.slot === 'left' ? 'bg-indigo-50 text-indigo-700' : 'bg-purple-50 text-purple-700'
                                                }`}>{a.slot === 'left' ? 'TRÁI' : 'PHẢI'}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${a.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {a.isActive ? 'ĐANG BẬT' : 'ĐÃ TẮT'}
                                            </span>
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
