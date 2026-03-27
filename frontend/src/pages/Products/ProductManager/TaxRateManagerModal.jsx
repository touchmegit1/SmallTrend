import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import Button from '../../../components/product/button';
import { Input } from '../../../components/product/input';
import { Label } from '../../../components/product/label';
import api from '../../../config/axiosConfig';

/**
 * Modal quản lý danh sách thuế suất (thêm/sửa/xóa).
 * Sau mỗi thao tác thành công sẽ gọi onDataChange để đồng bộ màn hình cha.
 */
export default function TaxRateManagerModal({ onClose, onDataChange }) {
    const [taxRates, setTaxRates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        rate: 0,
        active: true
    });

    const [actionLoading, setActionLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [toast, setToast] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(""), 3000);
    };

    const fetchTaxRates = async () => {
        setLoading(true);
        try {
            const res = await api.get('/tax-rates');
            setTaxRates(res.data);
        } catch (err) {
            console.error("Lỗi lấy danh sách thuế suất:", err);
            setErrorMsg("Không thể tải danh sách thuế suất");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTaxRates();
    }, []);

    const resetForm = () => {
        setFormData({
            name: "",
            rate: 0,
            active: true
        });
        setIsAdding(false);
        setEditingId(null);
        setErrorMsg("");
    };

    const handleEdit = (taxRate) => {
        setFormData({
            name: taxRate.name || "",
            rate: taxRate.rate || 0,
            active: taxRate.active !== false
        });
        setEditingId(taxRate.id);
        setIsAdding(false);
        setErrorMsg("");
    };

    const handleDelete = async () => {
        if (!deleteTarget?.id) return;

        setActionLoading(true);
        try {
            await api.delete(`/tax-rates/${deleteTarget.id}`);
            setTaxRates(prev => prev.filter(t => t.id !== deleteTarget.id));
            showToast("Xóa thuế suất thành công!");
            if (onDataChange) onDataChange();
        } catch (err) {
            console.error("Lỗi xóa thuế suất:", err);
            const rawError = err.response?.data?.message || err.response?.data;
            const normalizedError = typeof rawError === 'string' ? rawError : rawError?.message;
            const deleteErrorMessage = normalizedError?.includes("danh mục hoặc thương hiệu")
                ? "Lỗi: Không thể xóa thuế suất này vì đang có sản phẩm áp dụng!"
                : (normalizedError || "Lỗi xóa thuế suất");
            showToast(deleteErrorMessage);
        } finally {
            setDeleteTarget(null);
            setActionLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        const normalizedName = formData.name?.trim() || "";
        const parsedRate = Number(formData.rate);

        if (!normalizedName) {
            setErrorMsg("Vui lòng điền tên loại thuế");
            return;
        }

        if (!Number.isFinite(parsedRate)) {
            setErrorMsg("Vui lòng nhập mức tỷ lệ thuế hợp lệ");
            return;
        }

        if (parsedRate < 0 || parsedRate > 100) {
            setErrorMsg("Mức tỷ lệ thuế phải nằm trong khoảng từ 0 đến 100");
            return;
        }

        const duplicate = taxRates.some(tax =>
            tax.id !== editingId &&
            (tax.name || "").trim().toLowerCase() === normalizedName.toLowerCase()
        );

        if (duplicate) {
            setErrorMsg("Tên thuế suất đã tồn tại");
            return;
        }

        setActionLoading(true);
        try {
            const payload = {
                name: normalizedName,
                rate: parsedRate,
                active: formData.active
            };

            if (editingId) {
                // Update
                const res = await api.put(`/tax-rates/${editingId}`, payload);
                setTaxRates(prev => prev.map(t => t.id === editingId ? res.data : t));
            } else {
                // Create
                const res = await api.post(`/tax-rates`, payload);
                setTaxRates(prev => [...prev, res.data]);
            }

            resetForm();
            if (onDataChange) onDataChange();
        } catch (err) {
            console.error("Lỗi lưu thuế suất:", err);
            const msg = err.response?.data?.message || err.response?.data || "Lỗi khi lưu thuế suất!";
            setErrorMsg(typeof msg === 'string' ? msg : "Lỗi khi lưu thuế suất!");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <>
            {toast && (
                <div className="fixed top-6 right-6 z-[70] animate-in slide-in-from-right duration-300">
                    <div
                        className={`flex items-center gap-3 rounded-xl px-5 py-3 shadow-xl border-l-4 bg-white ${
                            toast.startsWith("Không thể") || toast.startsWith("Lỗi")
                                ? "border-red-500"
                                : "border-green-500"
                        }`}
                    >
                        {toast.startsWith("Không thể") || toast.startsWith("Lỗi") ? (
                            <XCircle className="w-5 h-5 text-red-600" />
                        ) : (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                        <span className="text-sm font-medium text-gray-800">{toast}</span>
                    </div>
                </div>
            )}

            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Quản lý Thuế suất (Tax Rate)</h2>
                        <p className="text-sm text-gray-500 mt-1">Thêm, sửa, hoặc xoá các loại thuế dùng cho sản phẩm</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Info Banner & Actions */}
                <div className="p-6 pb-2 flex justify-between items-center">
                    <Button
                        onClick={() => { setIsAdding(true); setEditingId(null); setErrorMsg(""); }}
                        className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm flex items-center justify-center gap-2 font-medium"
                        disabled={isAdding || editingId}
                    >
                        <Plus className="w-4 h-4" /> Thêm thuế mới
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={fetchTaxRates}
                        className="h-10 w-10 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                        title="Tải lại danh sách"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 pt-2">

                    {/* Form Thêm/Sửa */}
                    {(isAdding || editingId) && (
                        <form onSubmit={handleSubmit} className="mb-6 bg-blue-50/50 p-5 rounded-xl border border-blue-100 animate-in fade-in zoom-in-95">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-blue-900 border-b-2 border-blue-200 pb-1">
                                    {editingId ? 'Chỉnh sửa thuế' : 'Tạo thuế mới'}
                                </h3>
                                <button type="button" onClick={resetForm} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {errorMsg && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm font-medium">
                                    {errorMsg}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <Label>Tên thuế suất <span className="text-red-500">*</span></Label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="VD: VAT 10%, Thuế nhập khẩu..."
                                        className="mt-1 bg-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Mức tỷ lệ (%) <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={formData.rate}
                                        onChange={e => setFormData({ ...formData, rate: e.target.value })}
                                        placeholder="VD: 10, 8, 5..."
                                        className="mt-1 bg-white"
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-2 mt-7">
                                    <input
                                        type="checkbox"
                                        id="activeStatus"
                                        checked={formData.active}
                                        onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                        className="rounded text-blue-600 w-4 h-4"
                                    />
                                    <Label htmlFor="activeStatus" className="m-0 cursor-pointer">Hoạt động (Kích hoạt)</Label>
                                </div>
                            </div>

                            <div className="mt-5 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={resetForm} className="h-10 border-gray-300">
                                    Hủy bỏ
                                </Button>
                                <Button type="submit" disabled={actionLoading} className="h-10 bg-blue-600 hover:bg-blue-700 text-white gap-2">
                                    <Save className="w-4 h-4" /> {actionLoading ? 'Đang lưu...' : 'Lưu thuế'}
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Bảng danh sách */}
                    <div className="bg-white border rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Tên thuế</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Mức tỷ lệ (%)</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Trạng thái</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && taxRates.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500">Đang tải dữ liệu...</td>
                                    </tr>
                                ) : taxRates.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500">Chưa có loại thuế nào.</td>
                                    </tr>
                                ) : (
                                    taxRates.map(tax => (
                                        <tr key={tax.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                                            <td className="px-4 py-3 text-sm text-gray-800 font-semibold">{tax.name}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-blue-700">{tax.rate}%</td>
                                            <td className="px-4 py-3 text-sm">
                                                {tax.active ? (
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Đang hoạt động</span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">Đã tắt</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost" size="sm"
                                                        onClick={() => handleEdit(tax)}
                                                        className="h-10 w-10 p-0 text-blue-600 hover:bg-blue-50"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost" size="sm"
                                                        onClick={() => setDeleteTarget(tax)}
                                                        className="h-10 w-10 p-0 text-red-500 hover:bg-red-50"
                                                        disabled={actionLoading}
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
                </div>
            </div>

            {deleteTarget && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
                        <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-t-2xl">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-7 h-7 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Xác nhận xóa thuế suất</h3>
                            <p className="text-center text-gray-600">
                                Bạn có chắc muốn xóa <span className="font-bold text-gray-900">{deleteTarget?.name}</span>?
                            </p>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-b-2xl flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 h-11 rounded-xl font-semibold"
                                onClick={() => setDeleteTarget(null)}
                                disabled={actionLoading}
                            >
                                Hủy
                            </Button>
                            <Button
                                variant="danger"
                                className="flex-1 h-11 rounded-xl font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-md"
                                onClick={handleDelete}
                                disabled={actionLoading}
                            >
                                {actionLoading ? 'Đang xóa...' : 'Xóa ngay'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
