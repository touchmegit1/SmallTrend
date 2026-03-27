import React, { useEffect, useRef, useState } from 'react';
import { Plus, Edit, Trash2, X, Save, CheckCircle, Barcode, Tag } from 'lucide-react';
import Button from '../../../components/product/button';
import { Input } from '../../../components/product/input';
import { Label } from '../../../components/product/label';
import { Badge } from '../../../components/product/badge';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import api from '../../../config/axiosConfig';

export default function UnitConversionSection({ variant, units, onSuccess }) {
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
                <div className="space-y-2 mb-2">
                    {conversions.map(conv => (
                        <div key={conv.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-800 text-sm">
                                        {conv.conversionFactor} {variant.unit_name || 'Gốc'} = 1 {conv.toUnitName}
                                    </span>
                                    {!conv.isActive && <Badge variant="destructive" className="text-[10px] px-1.5 bg-red-100 text-red-700 border-red-200">Ngừng kích hoạt</Badge>}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                    {conv.description && <span>Mô tả: {conv.description}</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button size="sm" variant="ghost" onClick={() => handleEdit(conv)} className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 rounded-lg">
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(conv.id)} className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
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
