import { useState, useEffect } from "react";
import { Image, Eye, EyeOff, RotateCcw, Save, Megaphone, Link, Type, Palette, AlignLeft, MousePointer } from "lucide-react";
import { useToast, ToastContainer } from "../../hooks/useToast.jsx";

// ─── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY = "smalltrend_side_ads";

const DEFAULT_ADS = [
    {
        slot: "left",
        label: "Quảng cáo trái",
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80",
        title: "Mega Sale 50% OFF",
        subtitle: "Ưu đãi cuối tuần",
        ctaText: "Mua ngay",
        ctaColor: "#4f46e5",
        bgColor: "#ffffff",
        sponsor: "SmallTrend",
        linkUrl: "",
    },
    {
        slot: "right",
        label: "Quảng cáo phải",
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80",
        title: "Free Shipping",
        subtitle: "Đơn từ 200.000đ",
        ctaText: "Tìm hiểu thêm",
        ctaColor: "#059669",
        bgColor: "#ffffff",
        sponsor: "SmallTrend Express",
        linkUrl: "",
    },
];

const loadAds = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : DEFAULT_ADS;
    } catch {
        return DEFAULT_ADS;
    }
};

const saveAds = (ads) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ads));
};

// ─── Preview Component ────────────────────────────────────────────────────────
function AdPreview({ ad }) {
    return (
        <div
            className="w-40 rounded-2xl overflow-hidden shadow-xl border border-slate-200 flex flex-col"
            style={{ backgroundColor: ad.bgColor, minHeight: 240 }}
        >
            {ad.imageUrl ? (
                <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-full h-32 object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
            ) : (
                <div className="w-full h-32 bg-slate-100 flex items-center justify-center">
                    <Image size={24} className="text-slate-300" />
                </div>
            )}
            <div className="flex-1 p-3 flex flex-col justify-between">
                <div>
                    <p className="text-[10px] text-slate-400 font-medium mb-0.5">{ad.sponsor}</p>
                    <p className="font-bold text-xs text-slate-800 leading-tight">{ad.title || "Tiêu đề quảng cáo"}</p>
                    {ad.subtitle && <p className="text-[10px] text-slate-500 mt-0.5">{ad.subtitle}</p>}
                </div>
                <button
                    className="mt-2 text-white text-[10px] px-3 py-1.5 rounded-full font-semibold"
                    style={{ backgroundColor: ad.ctaColor }}
                >
                    {ad.ctaText || "Click here"}
                </button>
            </div>
            {!ad.active && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-2xl">
                    <span className="text-xs text-slate-500 font-medium bg-white px-2 py-1 rounded-full shadow">Đã ẩn</span>
                </div>
            )}
        </div>
    );
}

// ─── Field Row ────────────────────────────────────────────────────────────────
function Field({ label, icon: Icon, children }) {
    return (
        <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
                {Icon && <Icon size={12} className="text-slate-400" />}
                {label}
            </label>
            {children}
        </div>
    );
}

const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors";

// ─── Ad Editor Card ───────────────────────────────────────────────────────────
function AdEditor({ ad, onChange }) {
    const gradient = ad.slot === "left"
        ? "from-indigo-500 to-purple-500"
        : "from-emerald-500 to-teal-500";

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className={`bg-gradient-to-r ${gradient} px-5 py-4 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                    <Megaphone size={16} className="text-white/80" />
                    <span className="text-white font-bold text-sm">{ad.label}</span>
                </div>
                <button
                    onClick={() => onChange({ ...ad, active: !ad.active })}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${ad.active
                            ? "bg-white/20 text-white hover:bg-white/30"
                            : "bg-white/10 text-white/60 hover:bg-white/20"
                        }`}
                >
                    {ad.active ? <Eye size={12} /> : <EyeOff size={12} />}
                    {ad.active ? "Đang hiển thị" : "Đã ẩn"}
                </button>
            </div>

            <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form fields */}
                <div className="lg:col-span-2 space-y-4">
                    <Field label="Nhà tài trợ / Tên hiển thị" icon={Type}>
                        <input
                            type="text"
                            className={inputCls}
                            placeholder="Tên nhà tài trợ..."
                            value={ad.sponsor}
                            onChange={e => onChange({ ...ad, sponsor: e.target.value })}
                        />
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Tiêu đề chính" icon={Type}>
                            <input
                                type="text"
                                className={inputCls}
                                placeholder="Mega Sale 50%..."
                                value={ad.title}
                                onChange={e => onChange({ ...ad, title: e.target.value })}
                            />
                        </Field>
                        <Field label="Phụ đề" icon={AlignLeft}>
                            <input
                                type="text"
                                className={inputCls}
                                placeholder="Mô tả ngắn..."
                                value={ad.subtitle}
                                onChange={e => onChange({ ...ad, subtitle: e.target.value })}
                            />
                        </Field>
                    </div>

                    <Field label="URL ảnh quảng cáo" icon={Image}>
                        <input
                            type="url"
                            className={inputCls}
                            placeholder="https://..."
                            value={ad.imageUrl}
                            onChange={e => onChange({ ...ad, imageUrl: e.target.value })}
                        />
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Nội dung nút CTA" icon={MousePointer}>
                            <input
                                type="text"
                                className={inputCls}
                                placeholder="Mua ngay..."
                                value={ad.ctaText}
                                onChange={e => onChange({ ...ad, ctaText: e.target.value })}
                            />
                        </Field>
                        <Field label="URL liên kết" icon={Link}>
                            <input
                                type="url"
                                className={inputCls}
                                placeholder="https://..."
                                value={ad.linkUrl}
                                onChange={e => onChange({ ...ad, linkUrl: e.target.value })}
                            />
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Màu nền" icon={Palette}>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={ad.bgColor}
                                    onChange={e => onChange({ ...ad, bgColor: e.target.value })}
                                    className="h-9 w-12 rounded-lg border-2 border-slate-200 cursor-pointer"
                                />
                                <span className="text-xs text-slate-400 font-mono">{ad.bgColor}</span>
                            </div>
                        </Field>
                        <Field label="Màu nút CTA" icon={Palette}>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={ad.ctaColor}
                                    onChange={e => onChange({ ...ad, ctaColor: e.target.value })}
                                    className="h-9 w-12 rounded-lg border-2 border-slate-200 cursor-pointer"
                                />
                                <span className="text-xs text-slate-400 font-mono">{ad.ctaColor}</span>
                            </div>
                        </Field>
                    </div>
                </div>

                {/* Preview */}
                <div className="flex flex-col items-center gap-3">
                    <p className="text-xs font-semibold text-slate-500 self-start">Xem trước</p>
                    <div className="relative">
                        <AdPreview ad={ad} />
                    </div>
                    <p className="text-xs text-slate-400 text-center">Preview 1:1 với sidebar thật</p>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdsManagement() {
    const [ads, setAds] = useState(loadAds);
    const [isDirty, setIsDirty] = useState(false);
    const { toasts, showToast, removeToast } = useToast();

    // Sync dirty flag
    useEffect(() => { setIsDirty(true); }, [ads]);

    const updateAd = (slot, newAd) => {
        setAds(prev => prev.map(a => a.slot === slot ? newAd : a));
    };

    const handleSave = () => {
        saveAds(ads);
        setIsDirty(false);
        showToast("Đã lưu cấu hình quảng cáo — trang chủ sẽ cập nhật ngay");
    };

    const handleReset = () => {
        setAds(DEFAULT_ADS);
        showToast("Đã đặt lại về mặc định", "warning");
    };

    const leftAd = ads.find(a => a.slot === "left");
    const rightAd = ads.find(a => a.slot === "right");

    return (
        <div className="space-y-6">
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản lý Quảng cáo</h1>
                    <p className="text-slate-500 mt-1">
                        Tùy chỉnh 2 vị trí quảng cáo hai bên trang chủ (chỉ hiển thị trên màn hình ≥ 1280px).
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                        <RotateCcw size={15} />
                        Đặt lại
                    </button>
                    <button
                        onClick={handleSave}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all shadow-lg ${isDirty
                                ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30"
                                : "bg-slate-400 cursor-not-allowed"
                            }`}
                    >
                        <Save size={15} />
                        {isDirty ? "Lưu thay đổi" : "Đã lưu"}
                    </button>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3 text-sm text-amber-700">
                <Megaphone size={16} className="mt-0.5 flex-shrink-0" />
                <div>
                    <strong>Quy tắc hiển thị:</strong> Đúng 2 quảng cáo được hiển thị cùng lúc — 1 bên trái, 1 bên phải.
                    Bạn có thể ẩn từng ô riêng lẻ. Thay đổi có hiệu lực ngay sau khi lưu và tải lại trang chủ.
                </div>
            </div>

            {/* Live preview strip */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Layout tổng quan</p>
                <div className="flex items-center gap-4">
                    {/* Left panel */}
                    <div className="flex-shrink-0">
                        {leftAd?.active ? (
                            <AdPreview ad={leftAd} />
                        ) : (
                            <div className="w-40 h-[240px] border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center">
                                <div className="text-center text-slate-300">
                                    <EyeOff size={20} className="mx-auto mb-1" />
                                    <p className="text-xs">Trái - Ẩn</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Center content area */}
                    <div className="flex-1 bg-slate-50 rounded-2xl border border-dashed border-slate-200 h-[240px] flex items-center justify-center">
                        <div className="text-center text-slate-300">
                            <div className="w-16 h-2 bg-slate-200 rounded mb-2 mx-auto" />
                            <div className="w-24 h-2 bg-slate-200 rounded mb-2 mx-auto" />
                            <div className="w-20 h-2 bg-slate-200 rounded mx-auto" />
                            <p className="text-xs mt-3">Nội dung trang chính</p>
                        </div>
                    </div>

                    {/* Right panel */}
                    <div className="flex-shrink-0">
                        {rightAd?.active ? (
                            <AdPreview ad={rightAd} />
                        ) : (
                            <div className="w-40 h-[240px] border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center">
                                <div className="text-center text-slate-300">
                                    <EyeOff size={20} className="mx-auto mb-1" />
                                    <p className="text-xs">Phải - Ẩn</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Editor cards */}
            {leftAd && (
                <AdEditor ad={leftAd} onChange={(updated) => updateAd("left", updated)} />
            )}
            {rightAd && (
                <AdEditor ad={rightAd} onChange={(updated) => updateAd("right", updated)} />
            )}
        </div>
    );
}
