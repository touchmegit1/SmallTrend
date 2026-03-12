import { useState, useRef } from "react";
import { Eye, EyeOff, Save, ExternalLink, FileImage, Plus, Trash2, X, Edit2, CheckCircle2 } from "lucide-react";
import { useToast, ToastContainer } from "../../hooks/useToast.jsx";
import { uploadImage } from "../../services/uploadService.js";

// Lấy danh sách ads từ localStorage
const loadAds = () => {
    try {
        const saved = localStorage.getItem("smalltrend_side_ads");
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
};

const saveAds = (ads) => {
    localStorage.setItem("smalltrend_side_ads", JSON.stringify(ads));
};

export default function AdsManagement() {
    const [ads, setAds] = useState(loadAds);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAd, setEditingAd] = useState(null);
    const [uploading, setUploading] = useState(false);
    const { toasts, showToast, removeToast } = useToast();
    const fileInputRef = useRef(null);

    const initialForm = { id: null, title: "", slot: "left", imageUrl: "", linkUrl: "", isActive: false };
    const [form, setForm] = useState(initialForm);

    const openModal = (ad = null) => {
        setForm(ad || { ...initialForm, id: Date.now().toString() });
        setEditingAd(ad ? ad.id : null);
        setIsModalOpen(true);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await uploadImage(file);
            setForm((prev) => ({ ...prev, imageUrl: url }));
            showToast("Tải ảnh lên thành công");
        } catch (error) {
            showToast("Lỗi tải ảnh. Vui lòng thử lại.", "error");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();

        let newAds = [...ads];
        if (editingAd) {
            newAds = newAds.map(a => a.id === editingAd ? form : a);
        } else {
            newAds.push(form);
        }

        // Logic "Chỉ 1 quảng cáo mỗi bên được hiển thị"
        if (form.isActive) {
            newAds = newAds.map(a => {
                if (a.slot === form.slot && a.id !== form.id) {
                    return { ...a, isActive: false };
                }
                return a;
            });
        }

        setAds(newAds);
        saveAds(newAds);
        setIsModalOpen(false);
        showToast(editingAd ? "Cập nhật thành công!" : "Tạo quảng cáo thành công!");
    };

    const toggleActive = (ad) => {
        const newStatus = !ad.isActive;
        let newAds = ads.map(a => {
            if (a.id === ad.id) return { ...a, isActive: newStatus };
            // NẾU bật ad này, hãy tắt tất cả ad khác cùng slot (khác ID)
            if (newStatus && a.slot === ad.slot && a.id !== ad.id) {
                return { ...a, isActive: false };
            }
            return a;
        });

        setAds(newAds);
        saveAds(newAds);
        showToast(`Đã ${newStatus ? 'BẬT' : 'TẮT'} quảng cáo: ${ad.title}`);
    };

    const deleteAd = (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa quảng cáo này?")) return;
        const newAds = ads.filter(a => a.id !== id);
        setAds(newAds);
        saveAds(newAds);
        showToast("Đã xóa quảng cáo", "warning");
    };

    const activeLeftCount = ads.filter(a => a.slot === "left" && a.isActive).length;
    const activeRightCount = ads.filter(a => a.slot === "right" && a.isActive).length;

    return (
        <div className="space-y-6">
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            {/* ── HEADER ── */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản lý Quảng cáo Trang chủ</h1>
                    <p className="text-slate-500 mt-1">
                        Cấu hình banner quảng cáo hai bên trang chủ. Chỉ cho phép 1 quảng cáo hoạt động mỗi bên.
                    </p>
                </div>
                <button onClick={() => openModal()}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-indigo-600/30 transition-all">
                    <Plus size={16} /> Thêm quảng cáo
                </button>
            </div>

            {/* ── SUMMARY CARDS ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mb-2" />
                    <p className="text-xl font-black text-slate-800">{ads.length}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Tổng số quảng cáo</p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mb-2" />
                    <p className="text-xl font-black text-emerald-600">{ads.filter(a => a.isActive).length}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Đang hiển thị</p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <div className={`w-2 h-2 rounded-full ${activeLeftCount ? 'bg-indigo-500' : 'bg-slate-300'} mb-2`} />
                        <p className={`text-sm font-semibold ${activeLeftCount ? 'text-indigo-600' : 'text-slate-500'}`}>
                            {activeLeftCount ? 'ĐANG BẬT' : 'ĐÃ TẮT'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">Slot TRÁI</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <div className={`w-2 h-2 rounded-full ${activeRightCount ? 'bg-purple-500' : 'bg-slate-300'} mb-2`} />
                        <p className={`text-sm font-semibold ${activeRightCount ? 'text-purple-600' : 'text-slate-500'}`}>
                            {activeRightCount ? 'ĐANG BẬT' : 'ĐÃ TẮT'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">Slot PHẢI</p>
                    </div>
                </div>
            </div>

            {/* ── ADS TABLE ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {ads.length === 0 ? (
                    <div className="py-16 text-center text-slate-400">
                        <FileImage size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Chưa có quảng cáo nào. Nhấn "Thêm quảng cáo" để tạo.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-5 py-3 text-left font-semibold text-slate-600">Quảng cáo</th>
                                    <th className="px-5 py-3 text-left font-semibold text-slate-600">Vị trí Slot</th>
                                    <th className="px-5 py-3 text-center font-semibold text-slate-600">Hiển thị Trang chủ</th>
                                    <th className="px-5 py-3 text-center font-semibold text-slate-600">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ads.map(ad => (
                                    <tr key={ad.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-16 rounded shadow-sm border border-slate-200 overflow-hidden flex-shrink-0 bg-slate-100">
                                                    {ad.imageUrl ? (
                                                        <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <FileImage className="w-6 h-6 m-auto text-slate-300 mt-4" />
                                                    )}
                                                </div>
                                                <div className="font-semibold text-slate-800">{ad.title}</div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${ad.slot === 'left' ? "bg-indigo-50 text-indigo-700" : "bg-purple-50 text-purple-700"
                                                }`}>
                                                {ad.slot === 'left' ? 'BÊN TRÁI' : 'BÊN PHẢI'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <button
                                                onClick={() => toggleActive(ad)}
                                                className={`mx-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${ad.isActive ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                                    }`}
                                            >
                                                {ad.isActive ? <CheckCircle2 size={14} /> : <EyeOff size={14} />}
                                                {ad.isActive ? 'ĐANG BẬT' : 'ĐANG TẮT'}
                                            </button>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => openModal(ad)}
                                                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors" title="Chỉnh sửa">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => deleteAd(ad.id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Xóa">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── MODAL CREATE/EDIT ── */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={e => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800">
                                {editingAd ? "Cập nhật Quảng Cáo" : "Thêm Quảng Cáo Mới"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tiêu đề (Để phân biệt) *</label>
                                <input required type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                    value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Ví dụ: Sale banner mùa hè" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Vị trí *</label>
                                    <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none bg-white"
                                        value={form.slot} onChange={e => setForm(prev => ({ ...prev, slot: e.target.value }))} >
                                        <option value="left">Bên Trái</option>
                                        <option value="right">Bên Phải</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Trạng thái ban đầu</label>
                                    <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none bg-white"
                                        value={form.isActive} onChange={e => setForm(prev => ({ ...prev, isActive: e.target.value === 'true' }))} >
                                        <option value={"false"}>Tắt (Lưu nháp)</option>
                                        <option value={"true"}>Bật lên trang chủ</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ảnh quảng cáo (Tỉ lệ tham khảo: dọc)*</label>

                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-3">
                                    {form.imageUrl ? (
                                        <div className="relative group w-32 rounded-lg overflow-hidden border border-slate-200">
                                            <img src={form.imageUrl} alt="preview" className="w-full h-auto object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <button type="button" onClick={() => setForm(prev => ({ ...prev, imageUrl: "" }))}
                                                    className="bg-red-500 text-white p-1.5 rounded text-xs font-medium">Gỡ ảnh</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-xs text-slate-500">Tải ảnh lên từ Cloudinary</p>
                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-medium transition-colors">
                                                {uploading ? "Đang tải lên..." : "Chọn File Ảnh"}
                                            </button>
                                        </>
                                    )}
                                </div>
                                {form.imageUrl && (
                                    <input type="url" value={form.imageUrl} onChange={e => setForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500 mt-2 bg-slate-50" placeholder="Hoặc dán URL vào đây" />
                                )}
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg text-sm font-medium transition-colors">
                                    Hủy
                                </button>
                                <button type="submit" disabled={uploading || !form.imageUrl || !form.title}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                                    {editingAd ? "Cập nhật" : "Lưu Quảng Cáo"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
