import { useState, useEffect, useMemo, useCallback } from "react";
import {
    Megaphone,
    Plus,
    Eye,
    EyeOff,
    Pencil,
    Trash2,
    Search,
    Filter,
    Image,
    Save,
    X,
} from "lucide-react";
import adService from "../../services/adService";
import cloudinaryUploadService from "../../services/cloudinaryUploadService";
import { useToast, ToastContainer } from "../../hooks/useToast.jsx";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const SLOT_LABEL = {
    LEFT: "Bên trái",
    RIGHT: "Bên phải",
};

const INPUT_CLS = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors";

const initialForm = {
    slot: "LEFT",
    sponsorName: "",
    title: "",
    subtitle: "",
    imageUrl: "",
    linkUrl: "",
    ctaText: "",
    ctaColor: "#4f46e5",
    bgColor: "#ffffff",
    isActive: true,
};

const fmtDateTime = (value) => {
    if (!value) return "-";
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toLocaleString("vi-VN");
};

function StatusBadge({ active }) {
    return active ? (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
            Đang hiển thị
        </span>
    ) : (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            Đã tắt
        </span>
    );
}

function SlotBadge({ slot }) {
    const isLeft = slot === "LEFT";
    const cls = isLeft
        ? "bg-indigo-100 text-indigo-700"
        : "bg-emerald-100 text-emerald-700";
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${cls}`}>
            {SLOT_LABEL[slot] || slot}
        </span>
    );
}

function AdModal({ ad, onClose, onSaved, showToast }) {
    const isEdit = !!ad?.id;
    const [form, setForm] = useState(ad ? { ...initialForm, ...ad } : initialForm);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const setField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleUploadImage = async (file) => {
        if (!file) return;
        if (!file.type?.startsWith("image/")) {
            showToast("Vui lòng chọn file ảnh hợp lệ", "warning");
            return;
        }

        setUploadingImage(true);
        try {
            const res = await cloudinaryUploadService.uploadImage(file, "crm/ads");
            setField("imageUrl", res.url || "");
            showToast("Upload ảnh quảng cáo thành công");
        } catch (err) {
            showToast("Upload ảnh thất bại: " + (err?.response?.data?.error || err.message), "error");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.sponsorName.trim() || !form.title.trim() || !form.slot) {
            showToast("Vui lòng nhập đầy đủ nhà tài trợ, tiêu đề và vị trí", "warning");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                slot: form.slot,
                sponsorName: form.sponsorName.trim(),
                title: form.title.trim(),
                subtitle: form.subtitle?.trim() || "",
                imageUrl: form.imageUrl?.trim() || "",
                linkUrl: form.linkUrl?.trim() || "",
                ctaText: form.ctaText?.trim() || "",
                ctaColor: form.ctaColor || "#4f46e5",
                bgColor: form.bgColor || "#ffffff",
                isActive: !!form.isActive,
            };

            if (isEdit) {
                await adService.update(ad.id, payload);
                showToast("Cập nhật quảng cáo thành công");
            } else {
                await adService.create(payload);
                showToast("Tạo quảng cáo mới thành công");
            }
            onSaved();
            onClose();
        } catch (err) {
            showToast("Lỗi: " + (err?.response?.data?.message || err.message), "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Megaphone size={16} className="text-indigo-600" />
                        <h3 className="text-base font-bold text-slate-800">
                            {isEdit ? "Chỉnh sửa quảng cáo" : "Thêm quảng cáo"}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    >
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Vị trí *</label>
                            <select
                                className={INPUT_CLS}
                                value={form.slot}
                                onChange={(e) => setField("slot", e.target.value)}
                            >
                                <option value="LEFT">Bên trái</option>
                                <option value="RIGHT">Bên phải</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Nhà tài trợ *</label>
                            <input
                                className={INPUT_CLS}
                                value={form.sponsorName}
                                onChange={(e) => setField("sponsorName", e.target.value)}
                                placeholder="Tên nhà tài trợ"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Tiêu đề *</label>
                            <input
                                className={INPUT_CLS}
                                value={form.title}
                                onChange={(e) => setField("title", e.target.value)}
                                placeholder="Tiêu đề hiển thị"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Phụ đề</label>
                            <input
                                className={INPUT_CLS}
                                value={form.subtitle || ""}
                                onChange={(e) => setField("subtitle", e.target.value)}
                                placeholder="Mô tả ngắn"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">URL ảnh</label>
                            <div className="flex gap-2">
                                <input
                                    className={INPUT_CLS}
                                    value={form.imageUrl || ""}
                                    onChange={(e) => setField("imageUrl", e.target.value)}
                                    placeholder="https://..."
                                />
                                <label className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-700 cursor-pointer whitespace-nowrap transition-colors">
                                    {uploadingImage ? "Đang up..." : "Up ảnh"}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        disabled={uploadingImage}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            handleUploadImage(file);
                                            e.target.value = "";
                                        }}
                                    />
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">URL liên kết</label>
                            <input
                                className={INPUT_CLS}
                                value={form.linkUrl || ""}
                                onChange={(e) => setField("linkUrl", e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Nội dung CTA</label>
                            <input
                                className={INPUT_CLS}
                                value={form.ctaText || ""}
                                onChange={(e) => setField("ctaText", e.target.value)}
                                placeholder="Mua ngay"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Màu CTA</label>
                                <input
                                    type="color"
                                    className="h-10 w-full rounded-lg border border-slate-200"
                                    value={form.ctaColor || "#4f46e5"}
                                    onChange={(e) => setField("ctaColor", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Màu nền</label>
                                <input
                                    type="color"
                                    className="h-10 w-full rounded-lg border border-slate-200"
                                    value={form.bgColor || "#ffffff"}
                                    onChange={(e) => setField("bgColor", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input
                            type="checkbox"
                            className="w-4 h-4 accent-indigo-600"
                            checked={!!form.isActive}
                            onChange={(e) => setField("isActive", e.target.checked)}
                        />
                        Hiển thị ngay sau khi lưu
                    </label>

                    <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-60"
                        >
                            <Save size={14} />
                            {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo mới"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AdsManagement() {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [keyword, setKeyword] = useState("");
    const [slotFilter, setSlotFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const { toasts, showToast, removeToast } = useToast();

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const list = await adService.getAll();
            setAds(Array.isArray(list) ? list : []);
        } catch (err) {
            showToast("Không thể tải danh sách quảng cáo", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        load();
    }, [load]);

    const filteredAds = useMemo(() => {
        const q = keyword.trim().toLowerCase();
        return ads.filter((ad) => {
            const okKeyword =
                !q ||
                ad.sponsorName?.toLowerCase().includes(q) ||
                ad.title?.toLowerCase().includes(q) ||
                ad.subtitle?.toLowerCase().includes(q);

            const okSlot = slotFilter === "ALL" || ad.slot === slotFilter;
            const okStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && ad.isActive) ||
                (statusFilter === "INACTIVE" && !ad.isActive);

            return okKeyword && okSlot && okStatus;
        });
    }, [ads, keyword, slotFilter, statusFilter]);

    const summary = useMemo(() => {
        const total = ads.length;
        const active = ads.filter((a) => a.isActive).length;
        return {
            total,
            active,
            inactive: total - active,
        };
    }, [ads]);

    const activeBySlot = useMemo(() => {
        return {
            LEFT: ads.find((a) => a.slot === "LEFT" && a.isActive),
            RIGHT: ads.find((a) => a.slot === "RIGHT" && a.isActive),
        };
    }, [ads]);

    const handleToggle = async (id) => {
        try {
            await adService.toggle(id);
            await load();
            showToast("Đã cập nhật trạng thái hiển thị");
        } catch (err) {
            showToast("Lỗi: " + (err?.response?.data?.message || err.message), "error");
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await adService.delete(deleteId);
            showToast("Đã xóa quảng cáo");
            await load();
        } catch (err) {
            showToast("Lỗi: " + (err?.response?.data?.message || err.message), "error");
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-6">
            <ToastContainer toasts={toasts} onRemove={removeToast} />
            <ConfirmDialog
                open={!!deleteId}
                title="Xóa quảng cáo"
                message="Bạn chắc chắn muốn xóa quảng cáo này? Thao tác này không thể hoàn tác."
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
                    onSaved={load}
                    showToast={showToast}
                />
            )}

            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản lý Quảng cáo</h1>
                    <p className="text-slate-500 mt-1">Quản lý nội dung quảng cáo hai bên trang chủ.</p>
                </div>
                <button
                    onClick={() => setModal({ ad: null })}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-lg shadow-indigo-600/30 transition-all text-sm font-medium flex items-center gap-2"
                >
                    <Plus size={16} />
                    Thêm quảng cáo
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <p className="text-xs text-slate-500">Tổng quảng cáo</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{summary.total}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <p className="text-xs text-slate-500">Đang hiển thị</p>
                    <p className="text-2xl font-bold text-emerald-700 mt-1">{summary.active}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <p className="text-xs text-slate-500">Đã tắt</p>
                    <p className="text-2xl font-bold text-slate-700 mt-1">{summary.inactive}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Bố cục đang hiển thị</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(activeBySlot).map((slot) => {
                        const ad = activeBySlot[slot];
                        return (
                            <div key={slot} className="rounded-xl border border-slate-200 p-3 flex items-center gap-3">
                                <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                                    {ad?.imageUrl ? (
                                        <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <Image size={18} />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <SlotBadge slot={slot} />
                                        {!ad && (
                                            <span className="text-xs text-slate-400">Chưa có quảng cáo active</span>
                                        )}
                                    </div>
                                    {ad && (
                                        <>
                                            <p className="text-sm font-semibold text-slate-800 truncate">{ad.sponsorName}</p>
                                            <p className="text-xs text-slate-500 truncate">{ad.title}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-6 relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            className="w-full border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            placeholder="Tìm theo nhà tài trợ, tiêu đề..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-3">
                        <select
                            className={INPUT_CLS}
                            value={slotFilter}
                            onChange={(e) => setSlotFilter(e.target.value)}
                        >
                            <option value="ALL">Tất cả vị trí</option>
                            <option value="LEFT">Bên trái</option>
                            <option value="RIGHT">Bên phải</option>
                        </select>
                    </div>
                    <div className="md:col-span-3">
                        <div className="relative">
                            <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select
                                className="w-full border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">Tất cả trạng thái</option>
                                <option value="ACTIVE">Đang hiển thị</option>
                                <option value="INACTIVE">Đã tắt</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-slate-400">Đang tải...</div>
                ) : filteredAds.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <div className="text-4xl mb-2">📣</div>
                        <p>Không có quảng cáo phù hợp bộ lọc.</p>
                    </div>
                ) : (
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600">Nhà tài trợ / Tiêu đề</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600">Vị trí</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600">Trạng thái</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600">Cập nhật gần nhất</th>
                                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-600">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAds.map((ad) => (
                                <tr key={ad.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded border border-slate-200 bg-slate-100 overflow-hidden flex-shrink-0">
                                                {ad.imageUrl ? (
                                                    <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <Image size={16} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-800 truncate">{ad.sponsorName}</p>
                                                <p className="text-xs text-slate-500 truncate">{ad.title}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <SlotBadge slot={ad.slot} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge active={ad.isActive} />
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 text-xs">
                                        {fmtDateTime(ad.updatedAt)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleToggle(ad.id)}
                                                title={ad.isActive ? "Tắt hiển thị" : "Bật hiển thị"}
                                                className="p-1.5 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                                            >
                                                {ad.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                            <button
                                                onClick={() => setModal({ ad })}
                                                title="Sửa"
                                                className="p-1.5 rounded text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <a
                                                href={ad.linkUrl || "#"}
                                                target="_blank"
                                                rel="noreferrer"
                                                title="Mở liên kết"
                                                className={`p-1.5 rounded transition-colors ${ad.linkUrl
                                                    ? "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                                    : "text-slate-300 cursor-not-allowed pointer-events-none"
                                                    }`}
                                            >
                                                <Image size={16} />
                                            </a>
                                            <button
                                                onClick={() => setDeleteId(ad.id)}
                                                title="Xóa"
                                                className="p-1.5 rounded text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}