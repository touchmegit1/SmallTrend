import React, { useEffect, useRef, useState } from 'react';
import { Plus, Edit, Trash2, X, Save, CheckCircle, Barcode, Tag, Printer, Power, Package, AlertTriangle } from 'lucide-react';
import Button from '../../../components/product/button';
import { Input } from '../../../components/product/input';
import { Label } from '../../../components/product/label';
import { Badge } from '../../../components/product/badge';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import api from '../../../config/axiosConfig';

export default function UnitConversionSection({
    variant,
    units,
    conversionVariants = [],
    canManageProduct = false,
    parentProductActive = true,
    onPrintBarcode,
    onToggleStatus,
    onEditVariant,
    onDeleteVariant,
    isWithin2Minutes,
    onSuccess,
}) {
    const [conversions, setConversions] = useState(variant.unit_conversions || []);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        toUnitId: "",
        conversionFactor: "",
        description: "",
        isActive: true
    });

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteStatusMsg, setDeleteStatusMsg] = useState("");
    const deleteTimeoutRef = useRef(null);

    // Thông tin variant tự động tạo sau khi thêm quy đổi
    const [autoCreatedInfo, setAutoCreatedInfo] = useState(null);

    const resetForm = () => {
        setFormData({
            toUnitId: "",
            conversionFactor: "",
            description: "",
            isActive: true
        });
        setIsAdding(false);
        setEditingId(null);
        setErrorMsg("");
    };

    const handleEdit = (conv) => {
        setFormData({
            toUnitId: conv.toUnitId,
            conversionFactor: conv.conversionFactor,
            description: conv.description || "",
            isActive: conv.isActive
        });
        setEditingId(conv.id);
        setIsAdding(false);
        setErrorMsg("");
        setAutoCreatedInfo(null);
    };

    const handleDelete = async (id) => {
        if (!id || isDeleting) return;

        setIsDeleting(true);
        setDeleteStatusMsg("");

        try {
            const timeoutPromise = new Promise((_, reject) => {
                deleteTimeoutRef.current = setTimeout(() => {
                    reject(new Error("Không thể xoá quy đổi vì thao tác đã quá 2 phút. Vui lòng thử lại."));
                }, 120000);
            });

            await Promise.race([
                api.delete(`/products/conversions/${id}`),
                timeoutPromise,
            ]);

            setConversions(prev => prev.filter(c => c.id !== id));
            if (onSuccess) onSuccess();
            setDeleteStatusMsg("");
            setConfirmDeleteId(null);
        } catch (err) {
            console.error("Lỗi xóa quy đổi:", err);
            const msg = err?.response?.data?.message || err?.response?.data || err?.message || "Không thể xoá quy đổi. Vui lòng thử lại.";
            setDeleteStatusMsg(typeof msg === "string" ? msg : "Không thể xoá quy đổi. Vui lòng thử lại.");
        } finally {
            if (deleteTimeoutRef.current) {
                clearTimeout(deleteTimeoutRef.current);
                deleteTimeoutRef.current = null;
            }
            setIsDeleting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setAutoCreatedInfo(null);

        if (!formData.toUnitId || !formData.conversionFactor) {
            setErrorMsg("Vui lòng điền đầy đủ đơn vị đích và hệ số");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                toUnitId: parseInt(formData.toUnitId),
                conversionFactor: parseFloat(formData.conversionFactor),
                description: formData.description,
                isActive: formData.isActive
            };

            if (editingId) {
                // Update
                const res = await api.put(`/products/conversions/${editingId}`, payload);
                setConversions(prev => prev.map(c => c.id === editingId ? res.data : c));
            } else {
                // Create — hệ thống tự động tạo variant mới cho đơn vị đóng gói
                const res = await api.post(`/products/variants/${variant.id}/conversions`, payload);
                setConversions(prev => [...prev, res.data]);

                // Hiển thị thông tin variant tự động tạo
                if (res.data.autoCreatedVariantId) {
                    setAutoCreatedInfo({
                        variantId: res.data.autoCreatedVariantId,
                        sku: res.data.autoCreatedSku,
                        barcode: res.data.autoCreatedBarcode,
                        unitName: res.data.toUnitName,
                    });
                }
            }

            resetForm();
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("Lỗi lưu quy đổi:", err);
            const msg = err.response?.data?.message || err.response?.data || "Lỗi khi lưu quy đổi!";
            setErrorMsg(typeof msg === 'string' ? msg : "Lỗi khi lưu quy đổi!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            if (deleteTimeoutRef.current) {
                clearTimeout(deleteTimeoutRef.current);
            }
        };
    }, []);

    // Lấy tên đơn vị đích từ ID
    const getUnitName = (unitId) => {
        const u = units.find(u => u.id === unitId);
        return u ? u.name : '';
    };

    return (
        <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-4 mt-3">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-gray-700">Quy đổi đơn vị (Từ: {variant.unit_name || 'Đơn vị gốc'})</h4>
                {!isAdding && !editingId && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setIsAdding(true); setAutoCreatedInfo(null); }}
                        className="h-8 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg px-2 flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3" /> Thêm quy đổi
                    </Button>
                )}
            </div>

            {/* ═══ Thông báo variant tự động tạo ═══ */}
            {autoCreatedInfo && (
                <div className="mb-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-bold text-emerald-800">
                            Đã tự động tạo biến thể đóng gói: {autoCreatedInfo.unitName}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-1.5">
                            <Tag className="w-3.5 h-3.5 text-blue-500" />
                            <div>
                                <p className="text-[10px] text-gray-400">SKU</p>
                                <p className="text-xs font-mono font-bold text-blue-700">{autoCreatedInfo.sku}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-1.5">
                            <Barcode className="w-3.5 h-3.5 text-purple-500" />
                            <div>
                                <p className="text-[10px] text-gray-400">Barcode nội bộ</p>
                                <p className="text-xs font-mono font-bold text-purple-700">{autoCreatedInfo.barcode}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setAutoCreatedInfo(null)}
                        className="mt-2 text-xs text-emerald-600 hover:text-emerald-800 underline"
                    >
                        Đóng thông báo
                    </button>
                </div>
            )}

            {/* Danh sách quy đổi hiện có */}
            {conversions.length > 0 && !isAdding && !editingId && (
                <div className="space-y-3 mb-2">
                    {conversions.map(conv => {
                        const mapped = conversionVariants.find(item => item.conversion?.id === conv.id);
                        const conversionVariant = mapped?.variant;

                        return (
                            <div key={conv.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-gray-800 text-sm">
                                                {conv.conversionFactor} {variant.unit_name || 'Gốc'} = 1 {conv.toUnitName}
                                            </span>
                                            {!conv.isActive && <Badge variant="destructive" className="text-[10px] px-1.5 bg-red-100 text-red-700 border-red-200">Ngừng kích hoạt</Badge>}
                                            {conversionVariant?.is_active ? (
                                                <Badge variant="outline" className="text-[10px] px-1.5 bg-green-50 border-green-200 text-green-700">Biến thể đang hoạt động</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-[10px] px-1.5 bg-gray-100 border-gray-200 text-gray-500">Biến thể đang tắt</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                                            {conv.description && <span>Mô tả: {conv.description}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button size="sm" variant="ghost" onClick={() => handleEdit(conv)} className="h-10 w-10 p-0 text-blue-600 hover:bg-blue-50 rounded-lg" title="Sửa quy đổi">
                                            <Edit className="w-[18px] h-[18px]" />
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(conv.id)} className="h-10 w-10 p-0 text-red-500 hover:bg-red-50 rounded-lg" title="Xóa quy đổi">
                                            <Trash2 className="w-[18px] h-[18px]" />
                                        </Button>
                                    </div>
                                </div>

                                {conversionVariant ? (
                                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3">
                                        <div className="grid grid-cols-1 md:grid-cols-8 gap-3 text-xs">
                                            <div className="md:col-span-2 flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                                    {conversionVariant.image_url ? (
                                                        <img
                                                            src={conversionVariant.image_url.startsWith('http') ? conversionVariant.image_url : `${import.meta.env.PROD ? "" : "http://localhost:8081"}${conversionVariant.image_url.startsWith('/') ? '' : '/'}${conversionVariant.image_url}`}
                                                            alt={conversionVariant.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Package className="w-4 h-4 text-gray-300" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-900 truncate">{conversionVariant.name || 'Biến thể quy đổi'}</p>
                                                    <p className="text-[11px] text-gray-500">{conversionVariant.unit_name || conv.toUnitName}</p>
                                                </div>
                                            </div>

                                            <div className="md:col-span-2">
                                                <p className="text-gray-400 mb-1">Mã SKU</p>
                                                <p className="font-mono text-[11px] bg-white border border-gray-200 rounded px-2 py-1 break-all">{conversionVariant.sku || '—'}</p>
                                            </div>

                                            <div>
                                                <p className="text-gray-400 mb-1">Barcode</p>
                                                <p className="font-mono text-[11px] break-all">{conversionVariant.barcode || '—'}</p>
                                            </div>

                                            <div>
                                                <p className="text-gray-400 mb-1">Giá bán</p>
                                                <p className="font-bold text-emerald-600">{(conversionVariant.sell_price ?? 0).toLocaleString('vi-VN')} ₫</p>
                                            </div>

                                            <div>
                                                <p className="text-gray-400 mb-1">Tồn kho</p>
                                                <p className="font-bold text-indigo-700">{conversionVariant.stock_quantity || 0}</p>
                                            </div>

                                            <div>
                                                <p className="text-gray-400 mb-1">Trạng thái</p>
                                                <p className={conversionVariant.is_active ? 'font-semibold text-green-700' : 'font-semibold text-red-600'}>
                                                    {conversionVariant.is_active ? 'Hoạt động' : 'Ngừng'}
                                                </p>
                                            </div>
                                        </div>

                                        {conversionVariant.attributes && Object.keys(conversionVariant.attributes).length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-1">
                                                {Object.entries(conversionVariant.attributes).map(([key, val]) => (
                                                    <Badge key={`${conv.id}-${key}`} variant="outline" className="text-[10px] bg-white border-indigo-200 text-indigo-700 px-1.5 py-0.5">
                                                        {key}: {val}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        {canManageProduct && (
                                            <div className="mt-3 flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    title="Xem/In mã vạch"
                                                    onClick={() => onPrintBarcode && onPrintBarcode(conversionVariant)}
                                                    className="h-11 w-11 p-0 rounded-lg border border-gray-200 bg-white text-slate-700 hover:bg-slate-100"
                                                >
                                                    <Printer className="w-5 h-5" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    title={conversionVariant.is_active ? 'Dừng xuất nhập' : (parentProductActive === false ? 'Vui lòng mở khoá SP Gốc trước' : 'Kích hoạt trở lại')}
                                                    onClick={() => onToggleStatus && onToggleStatus(conversionVariant)}
                                                    disabled={!conversionVariant.is_active && parentProductActive === false}
                                                    className={`h-11 w-11 p-0 rounded-lg border border-gray-200 bg-white hover:bg-amber-50 ${conversionVariant.is_active ? 'text-amber-600' : 'text-gray-400'}`}
                                                >
                                                    <Power className="w-5 h-5" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    title="Sửa biến thể quy đổi"
                                                    onClick={() => onEditVariant && onEditVariant(conversionVariant)}
                                                    className="h-11 w-11 p-0 rounded-lg border border-gray-200 bg-white text-blue-600 hover:bg-blue-50"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </Button>
                                                {isWithin2Minutes?.(conversionVariant.created_at) && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        title="Xoá biến thể quy đổi (trong 2 phút)"
                                                        onClick={() => onDeleteVariant && onDeleteVariant(conversionVariant)}
                                                        className="h-11 w-11 p-0 rounded-lg border border-red-200 bg-white text-red-500 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        <span>Chưa đồng bộ được biến thể quy đổi tương ứng. Vui lòng tải lại dữ liệu.</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {conversions.length === 0 && !isAdding && !editingId && (
                <p className="text-xs text-gray-400 italic text-center py-2">Loại sản phẩm này chưa có phép quy đổi đơn vị nào.</p>
            )}

            {/* Form Thêm/Sửa quy đổi */}
            {(isAdding || editingId) && (
                <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-3">
                        <h5 className="font-semibold text-sm text-indigo-800">{editingId ? 'Sửa quy đổi' : 'Thêm quy đổi mới'}</h5>
                        <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {!editingId && (
                        <div className="mb-3 p-2 bg-blue-50 border border-blue-100 rounded-lg">
                            <p className="text-xs text-blue-700">
                                💡 Khi thêm quy đổi, hệ thống sẽ <strong>tự động tạo biến thể mới</strong> cho đơn vị đóng gói (bao gồm SKU và Barcode nội bộ).
                            </p>
                        </div>
                    )}

                    {errorMsg && (
                        <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg mb-3 border border-red-100">{errorMsg}</p>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <Label className="text-xs">Đơn vị đích <span className="text-red-500">*</span></Label>
                            <select
                                value={formData.toUnitId}
                                onChange={e => setFormData({ ...formData, toUnitId: e.target.value })}
                                className="w-full mt-1 h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                                required
                            >
                                <option value="">-- Chọn đơn vị --</option>
                                {units.filter(u => u.id !== variant.unit_id).map(u => (
                                    <option key={u.id} value={u.id}>{u.name} ({u.code})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label className="text-xs">Hệ số (Bao nhiêu Gốc = 1 Đích) <span className="text-red-500">*</span></Label>
                            <Input
                                type="number" step="any" min="0.01"
                                value={formData.conversionFactor}
                                onChange={e => setFormData({ ...formData, conversionFactor: e.target.value })}
                                className="h-9 mt-1 text-sm border-gray-200 rounded-lg"
                                placeholder="VD: 6, 24..." required
                            />
                        </div>
                    </div>

                    {/* Preview: hiển thị phép quy đổi sẽ được tạo */}
                    {formData.toUnitId && formData.conversionFactor && (
                        <div className="mb-3 p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                            <p className="text-xs font-semibold text-indigo-800">
                                📦 {formData.conversionFactor} {variant.unit_name || 'Gốc'} = 1 {getUnitName(parseInt(formData.toUnitId))}
                            </p>
                        </div>
                    )}

                    <div className="mb-4">
                        <Label className="text-xs">Mô tả thêm</Label>
                        <Input
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="h-9 mt-1 text-sm border-gray-200 rounded-lg"
                            placeholder="VD: Lốc 6 lon"
                        />
                    </div>

                    <div className="flex justify-between items-center">
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                            />
                            <span className="text-gray-700">Đang hoạt động</span>
                        </label>

                        <div className="flex gap-2">
                            <Button type="button" variant="ghost" onClick={resetForm} className="h-8 px-3 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg">Hủy</Button>
                            <Button type="submit" disabled={loading} className="h-8 px-4 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1">
                                <Save className="w-3 h-3" /> {loading ? 'Đang lưu...' : 'Lưu'}
                            </Button>
                        </div>
                    </div>
                </form>
            )}
            <ConfirmDialog
                open={confirmDeleteId !== null}
                title="Xóa quy đổi đơn vị"
                message={deleteStatusMsg || "Bạn có chắc chắn muốn xoá quy đổi này?"}
                confirmText={isDeleting ? "Đang xóa..." : "Xóa"}
                cancelText={isDeleting ? "Đang xử lý" : "Hủy"}
                variant="danger"
                onConfirm={() => handleDelete(confirmDeleteId)}
                onCancel={() => {
                    if (isDeleting) return;
                    setConfirmDeleteId(null);
                }}
            />
        </div>
    );
}
