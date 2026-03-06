import { useState, useEffect, useCallback } from "react";
import {
    Image, Eye, EyeOff, Save, Megaphone, Link, Type, Palette,
    AlignLeft, MousePointer, FileText, DollarSign, Calendar,
    User, Phone, Mail, Plus, Trash2, ChevronDown, ChevronUp,
    TrendingUp, Clock, CheckCircle2, XCircle,
} from "lucide-react";
import adService from "../../services/adService";
import { useToast, ToastContainer } from "../../hooks/useToast.jsx";
import ConfirmDialog from "../../components/common/ConfirmDialog";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtVND = (v) =>
    v != null ? Number(v).toLocaleString("vi-VN") + "đ" : "—";

const isExpired = (dateStr) =>
    dateStr && new Date(dateStr) < new Date();

const daysLeft = (dateStr) => {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
    return diff;
};

const SLOT_LABEL = { LEFT: "Trái", RIGHT: "Phải" };
const SLOT_GRADIENT = {
    LEFT: "from-indigo-500 to-purple-500",
    RIGHT: "from-emerald-500 to-teal-500",
};

// ─── Ad Preview ───────────────────────────────────────────────────────────────
function AdPreview({ ad }) {
    return (
        <div
            className="w-36 rounded-2xl overflow-hidden shadow-lg border border-slate-200 flex flex-col flex-shrink-0"
            style={{ backgroundColor: ad.bgColor || "#fff", minHeight: 200 }}
        >
            {ad.imageUrl ? (
                <img src={ad.imageUrl} alt="" className="w-full h-24 object-cover"
                    onError={(e) => { e.target.style.display = "none"; }} />
            ) : (
                <div className="w-full h-24 bg-slate-100 flex items-center justify-center">
                    <Image size={20} className="text-slate-300" />
                </div>
            )}
            <div className="flex-1 p-2.5 flex flex-col justify-between">
                <div>
                    <p className="text-[9px] text-slate-400">{ad.sponsorName}</p>
                    <p className="font-bold text-[11px] text-slate-800 leading-tight mt-0.5">{ad.title}</p>
                    {ad.subtitle && <p className="text-[9px] text-slate-500 mt-0.5">{ad.subtitle}</p>}
                </div>
                <button className="mt-2 text-white text-[10px] px-2 py-1 rounded-full font-semibold"
                    style={{ backgroundColor: ad.ctaColor || "#4f46e5" }}>
                    {ad.ctaText || "Click"}
                </button>
            </div>
        </div>
    );
}

// ─── Input helpers ────────────────────────────────────────────────────────────
const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors";

function Field({ label, icon: Icon, half, children }) {
    return (
        <div className={half ? "" : ""}>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
                {Icon && <Icon size={11} className="text-slate-400" />}{label}
            </label>
            {children}
        </div>
    );
}

// ─── Stats Cards ──────────────────────────────────────────────────────────────
function StatsBar({ stats }) {
    const cards = [
        { label: "Tổng hợp đồng", value: stats.total ?? 0, icon: FileText, color: "text-indigo-600 bg-indigo-50" },
        { label: "Đang chạy", value: stats.active ?? 0, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
        { label: "Đã tắt", value: stats.inactive ?? 0, icon: XCircle, color: "text-slate-500 bg-slate-50" },
        { label: "Hết hạn HĐ", value: stats.expired ?? 0, icon: Clock, color: "text-red-500 bg-red-50" },
        {
            label: "Tổng giá trị HĐ",
            value: fmtVND(stats.totalContractValue),
            icon: DollarSign,
            color: "text-amber-600 bg-amber-50",
        },
    ];
    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {cards.map((c) => (
                <div key={c.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${c.color}`}>
                        <c.icon size={16} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">{c.label}</p>
                        <p className="text-lg font-bold text-slate-800">{c.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Ad Editor Modal ──────────────────────────────────────────────────────────
function AdModal({ ad, onClose, onSaved, showToast }) {
    const isNew = !ad?.id;
    const [form, setForm] = useState(
        ad ?? {
            slot: "LEFT", sponsorName: "", title: "", subtitle: "",
            imageUrl: "", linkUrl: "", ctaText: "Xem ngay",
            ctaColor: "#4f46e5", bgColor: "#ffffff", isActive: true,
            contractNumber: "", contractValue: "", contractStart: "",
            contractEnd: "", paymentTerms: "", contactPerson: "",
            contactEmail: "", contactPhone: "", notes: "",
        }
    );
    const [saving, setSaving] = useState(false);
    const [showContract, setShowContract] = useState(!isNew);

    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const handleSave = async () => {
        if (!form.sponsorName || !form.title || !form.slot) {
            showToast("Vui lòng điền tên nhà tài trợ, tiêu đề và slot", "warning");
            return;
        }
        setSaving(true);
        try {
            const payload = { ...form, contractValue: form.contractValue || null };
            const saved = isNew
                ? await adService.create(payload)
                : await adService.update(ad.id, payload);
            onSaved(saved);
            showToast(isNew ? "Đã tạo quảng cáo mới" : "Đã cập nhật quảng cáo");
            onClose();
        } catch (e) {
            showToast("Lỗi: " + (e.response?.data?.message || e.message), "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className={`bg-gradient-to-r ${SLOT_GRADIENT[form.slot] || "from-indigo-500 to-purple-500"} px-6 py-4 flex items-center justify-between flex-shrink-0`}>
                    <div className="flex items-center gap-2">
                        <Megaphone size={16} className="text-white/80" />
                        <span className="text-white font-bold">{isNew ? "Thêm quảng cáo mới" : `Chỉnh sửa: ${ad.sponsorName}`}</span>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white text-xl leading-none">×</button>
                </div>

                <div className="overflow-y-auto flex-1 p-6 space-y-6">
                    {/* Display fields */}
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Nội dung hiển thị</p>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Slot vị trí *" icon={TrendingUp}>
                                <select className={inputCls} value={form.slot} onChange={e => set("slot", e.target.value)}>
                                    <option value="LEFT">Bên trái</option>
                                    <option value="RIGHT">Bên phải</option>
                                </select>
                            </Field>
                            <Field label="Nhà tài trợ *" icon={User}>
                                <input className={inputCls} value={form.sponsorName} onChange={e => set("sponsorName", e.target.value)} placeholder="Tên nhà tài trợ..." />
                            </Field>
                            <Field label="Tiêu đề chính *" icon={Type}>
                                <input className={inputCls} value={form.title} onChange={e => set("title", e.target.value)} placeholder="Mega Sale 50%..." />
                            </Field>
                            <Field label="Phụ đề" icon={AlignLeft}>
                                <input className={inputCls} value={form.subtitle} onChange={e => set("subtitle", e.target.value)} placeholder="Mô tả ngắn..." />
                            </Field>
                            <Field label="URL ảnh" icon={Image}>
                                <input className={inputCls} value={form.imageUrl} onChange={e => set("imageUrl", e.target.value)} placeholder="https://..." />
                            </Field>
                            <Field label="URL liên kết" icon={Link}>
                                <input className={inputCls} value={form.linkUrl} onChange={e => set("linkUrl", e.target.value)} placeholder="https://..." />
                            </Field>
                            <Field label="Nội dung nút CTA" icon={MousePointer}>
                                <input className={inputCls} value={form.ctaText} onChange={e => set("ctaText", e.target.value)} placeholder="Mua ngay..." />
                            </Field>
                            <div className="grid grid-cols-2 gap-2">
                                <Field label="Màu nút" icon={Palette}>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={form.ctaColor} onChange={e => set("ctaColor", e.target.value)}
                                            className="h-9 w-10 rounded-lg border-2 border-slate-200 cursor-pointer" />
                                        <span className="text-xs font-mono text-slate-400">{form.ctaColor}</span>
                                    </div>
                                </Field>
                                <Field label="Màu nền" icon={Palette}>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={form.bgColor} onChange={e => set("bgColor", e.target.value)}
                                            className="h-9 w-10 rounded-lg border-2 border-slate-200 cursor-pointer" />
                                        <span className="text-xs font-mono text-slate-400">{form.bgColor}</span>
                                    </div>
                                </Field>
                            </div>
                        </div>
                    </div>

                    {/* Contract accordion */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setShowContract(v => !v)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-semibold text-slate-700"
                        >
                            <span className="flex items-center gap-2"><FileText size={14} /> Thông tin hợp đồng</span>
                            {showContract ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        {showContract && (
                            <div className="p-4 grid grid-cols-2 gap-3">
                                <Field label="Số hợp đồng" icon={FileText}>
                                    <input className={inputCls} value={form.contractNumber} onChange={e => set("contractNumber", e.target.value)} placeholder="AD-2026-LEFT-001" />
                                </Field>
                                <Field label="Giá trị HĐ (VNĐ)" icon={DollarSign}>
                                    <input type="number" className={inputCls} value={form.contractValue} onChange={e => set("contractValue", e.target.value)} placeholder="5000000" />
                                </Field>
                                <Field label="Ngày bắt đầu" icon={Calendar}>
                                    <input type="date" className={inputCls} value={form.contractStart} onChange={e => set("contractStart", e.target.value)} />
                                </Field>
                                <Field label="Ngày kết thúc" icon={Calendar}>
                                    <input type="date" className={inputCls} value={form.contractEnd} onChange={e => set("contractEnd", e.target.value)} />
                                </Field>
                                <Field label="Điều khoản thanh toán" icon={FileText}>
                                    <input className={inputCls} value={form.paymentTerms} onChange={e => set("paymentTerms", e.target.value)} placeholder="Thanh toán hàng quý..." />
                                </Field>
                                <Field label="Người liên hệ" icon={User}>
                                    <input className={inputCls} value={form.contactPerson} onChange={e => set("contactPerson", e.target.value)} placeholder="Họ tên..." />
                                </Field>
                                <Field label="Email" icon={Mail}>
                                    <input type="email" className={inputCls} value={form.contactEmail} onChange={e => set("contactEmail", e.target.value)} placeholder="email@..." />
                                </Field>
                                <Field label="Số điện thoại" icon={Phone}>
                                    <input className={inputCls} value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} placeholder="09xx-xxx-xxx" />
                                </Field>
                                <div className="col-span-2">
                                    <Field label="Ghi chú" icon={AlignLeft}>
                                        <textarea className={inputCls + " resize-none"} rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Ghi chú thêm về hợp đồng..." />
                                    </Field>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Preview */}
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Xem trước</p>
                        <AdPreview ad={form} />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={!!form.isActive} onChange={e => set("isActive", e.target.checked)}
                            className="w-4 h-4 rounded accent-indigo-600" />
                        <span className="text-sm text-slate-600">Hiển thị ngay</span>
                    </label>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">Hủy</button>
                        <button onClick={handleSave} disabled={saving}
                            className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-60">
                            <Save size={14} />
                            {saving ? "Đang lưu..." : isNew ? "Tạo mới" : "Lưu"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Ad Row Card ──────────────────────────────────────────────────────────────
function AdCard({ ad, onEdit, onToggle, onDelete }) {
    const expired = isExpired(ad.contractEnd);
    const days = daysLeft(ad.contractEnd);
    const gradient = SLOT_GRADIENT[ad.slot] || "from-slate-400 to-slate-500";

    return (
        <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${ad.isActive ? "border-slate-100" : "border-dashed border-slate-200 opacity-70"}`}>
            <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
            <div className="p-5 flex gap-4 items-start">
                {/* Preview */}
                <AdPreview ad={ad} />

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${gradient}`}>
                                    {SLOT_LABEL[ad.slot] || ad.slot}
                                </span>
                                {ad.isActive
                                    ? <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">Đang hiển thị</span>
                                    : <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">Đã tắt</span>}
                                {expired && <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full font-medium">HĐ hết hạn</span>}
                            </div>
                            <p className="font-bold text-slate-800">{ad.sponsorName}</p>
                            <p className="text-sm text-slate-500">{ad.title}</p>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                            <button onClick={() => onToggle(ad.id)}
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500" title={ad.isActive ? "Tắt" : "Bật"}>
                                {ad.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <button onClick={() => onEdit(ad)}
                                className="p-2 rounded-lg hover:bg-indigo-100 transition-colors text-indigo-600" title="Chỉnh sửa">
                                <FileText size={16} />
                            </button>
                            <button onClick={() => onDelete(ad.id)}
                                className="p-2 rounded-lg hover:bg-red-100 transition-colors text-red-500" title="Xóa">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Contract summary */}
                    {ad.contractNumber && (
                        <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            <div>
                                <p className="text-slate-400 mb-0.5">Số HĐ</p>
                                <p className="font-semibold text-slate-700">{ad.contractNumber}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 mb-0.5">Giá trị</p>
                                <p className="font-semibold text-slate-700">{fmtVND(ad.contractValue)}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 mb-0.5">Thời hạn</p>
                                <p className={`font-semibold ${expired ? "text-red-500" : days != null && days <= 30 ? "text-amber-600" : "text-slate-700"}`}>
                                    {ad.contractEnd
                                        ? expired
                                            ? "Đã hết hạn"
                                            : days != null && days <= 30
                                                ? `Còn ${days} ngày`
                                                : new Date(ad.contractEnd).toLocaleDateString("vi-VN")
                                        : "—"}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-400 mb-0.5">Liên hệ</p>
                                <p className="font-semibold text-slate-700">{ad.contactPerson || "—"}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdsManagement() {
    const [ads, setAds] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // null | { ad } | { ad: null } for new
    const [deleteId, setDeleteId] = useState(null);
    const { toasts, showToast, removeToast } = useToast();

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [list, st] = await Promise.all([adService.getAll(), adService.getStats()]);
            setAds(list);
            setStats(st);
        } catch (e) {
            showToast("Không thể tải dữ liệu quảng cáo", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleToggle = async (id) => {
        try {
            const updated = await adService.toggle(id);
            setAds((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
            showToast(updated.isActive ? "Đã bật quảng cáo" : "Đã tắt quảng cáo");
            setStats((prev) => ({
                ...prev,
                active: ads.filter((a) => a.id === id ? updated.isActive : a.isActive).length,
            }));
        } catch (e) {
            showToast("Lỗi: " + e.message, "error");
        }
    };

    const handleDelete = async () => {
        try {
            await adService.delete(deleteId);
            setAds((prev) => prev.filter((a) => a.id !== deleteId));
            showToast("Đã xóa quảng cáo");
            load();
        } catch (e) {
            showToast("Lỗi: " + e.message, "error");
        } finally {
            setDeleteId(null);
        }
    };

    const handleSaved = (saved) => {
        setAds((prev) => {
            const idx = prev.findIndex((a) => a.id === saved.id);
            return idx >= 0 ? prev.map((a) => (a.id === saved.id ? saved : a)) : [...prev, saved];
        });
        load(); // reload stats
    };

    return (
        <div className="space-y-6">
            <ToastContainer toasts={toasts} onRemove={removeToast} />
            <ConfirmDialog
                open={!!deleteId}
                title="Xóa quảng cáo"
                message="Bạn chắc chắn muốn xóa quảng cáo này? Thao tác không thể hoàn tác."
                confirmText="Xóa"
                cancelText="Hủy"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />
            {modal && (
                <AdModal
                    ad={modal.ad}
                    onClose={() => setModal(null)}
                    onSaved={handleSaved}
                    showToast={showToast}
                />
            )}

            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản lý Quảng cáo</h1>
                    <p className="text-slate-500 mt-1">
                        Quản lý 2 slot quảng cáo hai bên trang chủ + hợp đồng nhà tài trợ.
                    </p>
                </div>
                <button
                    onClick={() => setModal({ ad: null })}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-lg shadow-indigo-600/30 text-sm font-medium transition-all"
                >
                    <Plus size={16} /> Thêm quảng cáo
                </button>
            </div>

            {/* Info banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3 text-sm text-amber-700">
                <Megaphone size={15} className="mt-0.5 flex-shrink-0" />
                <span>
                    <strong>Quy tắc:</strong> Đúng 2 quảng cáo hiển thị cùng lúc — 1 slot trái, 1 slot phải.
                    Chỉ quảng cáo nào có <strong>isActive = true</strong> mới hiện trên trang chủ.
                    Nếu cùng slot có nhiều active, hệ thống lấy bản ghi đầu tiên.
                </span>
            </div>

            {/* Stats */}
            {!loading && <StatsBar stats={stats} />}

            {/* Layout preview */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Bố cục trang chủ</p>
                <div className="flex items-center gap-4">
                    {["LEFT", "RIGHT"].map((slot) => {
                        const active = ads.find((a) => a.slot === slot && a.isActive);
                        return slot === "LEFT" ? (
                            <div key={slot} className="flex-shrink-0">
                                {active ? <AdPreview ad={active} /> : (
                                    <div className="w-36 h-48 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-300">
                                        <div className="text-center"><EyeOff size={18} className="mx-auto mb-1" /><p className="text-xs">Trái trống</p></div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div key="center" className="flex-1 bg-slate-50 rounded-2xl border border-dashed border-slate-200 h-48 flex items-center justify-center text-slate-300 text-xs">
                                    Nội dung trang chính
                                </div>
                                <div key={slot} className="flex-shrink-0">
                                    {active ? <AdPreview ad={active} /> : (
                                        <div className="w-36 h-48 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-300">
                                            <div className="text-center"><EyeOff size={18} className="mx-auto mb-1" /><p className="text-xs">Phải trống</p></div>
                                        </div>
                                    )}
                                </div>
                            </>
                        );
                    })}
                </div>
            </div>

            {/* Ad list */}
            {loading ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">Đang tải...</div>
            ) : ads.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
                    <Megaphone size={32} className="mx-auto mb-3 opacity-30" />
                    <p>Chưa có quảng cáo nào. Nhấn "Thêm quảng cáo" để bắt đầu.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {ads.map((ad) => (
                        <AdCard
                            key={ad.id}
                            ad={ad}
                            onEdit={(a) => setModal({ ad: a })}
                            onToggle={handleToggle}
                            onDelete={setDeleteId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
