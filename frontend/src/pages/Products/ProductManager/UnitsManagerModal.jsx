import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save, RefreshCw } from 'lucide-react';
import Button from '../../../components/product/button';
import { Input } from '../../../components/product/input';
import { Label } from '../../../components/product/label';
import api from '../../../config/axiosConfig';

export default function UnitsManagerModal({ onClose, onDataChange }) {
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        code: "",
        name: "",
        materialType: "Khác",
        symbol: ""
    });

    const [actionLoading, setActionLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const fetchUnits = async () => {
        setLoading(true);
        try {
            const res = await api.get('/products/units');
            setUnits(res.data);
        } catch (err) {
            console.error("Lỗi lấy danh sách đơn vị:", err);
            setErrorMsg("Không thể tải danh sách đơn vị");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnits();
    }, []);

    const resetForm = () => {
        setFormData({
            code: "",
            name: "",
            materialType: "Khác",
            symbol: ""
        });
        setIsAdding(false);
        setEditingId(null);
        setErrorMsg("");
    };

    const handleEdit = (unit) => {
        setFormData({
            code: unit.code,
            name: unit.name,
            materialType: unit.materialType || "Khác",
            symbol: unit.symbol || ""
        });
        setEditingId(unit.id);
        setIsAdding(false);
        setErrorMsg("");
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xoá đơn vị này? Các sản phẩm phụ thuộc có thể bị ảnh hưởng.")) return;

        setActionLoading(true);
        try {
            await api.delete(`/products/units/${id}`);
            setUnits(prev => prev.filter(u => u.id !== id));
            if (onDataChange) onDataChange();
        } catch (err) {
            console.error("Lỗi xóa đơn vị:", err);
            alert(err.response?.data?.message || err.response?.data || "Lỗi xóa đơn vị");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        if (!formData.code || !formData.name) {
            setErrorMsg("Vui lòng điền mã và tên đơn vị");
            return;
        }

        setActionLoading(true);
        try {
            const payload = {
                code: formData.code,
                name: formData.name,
                materialType: formData.materialType,
                symbol: formData.symbol
            };

            if (editingId) {
                // Update
                const res = await api.put(`/products/units/${editingId}`, payload);
                setUnits(prev => prev.map(u => u.id === editingId ? res.data : u));
            } else {
                // Create
                const res = await api.post(`/products/units`, payload);
                setUnits(prev => [...prev, res.data]);
            }

            resetForm();
            if (onDataChange) onDataChange();
        } catch (err) {
            console.error("Lỗi lưu đơn vị:", err);
            const msg = err.response?.data?.message || err.response?.data || "Lỗi khi lưu đơn vị!";
            setErrorMsg(typeof msg === 'string' ? msg : "Lỗi khi lưu đơn vị!");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Quản lý Đơn vị tính</h2>
                        <p className="text-sm text-gray-500 mt-1">Thêm, sửa, hoặc xoá các đơn vị dùng chung trong hệ thống</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Info Banner & Actions */}
                <div className="p-6 pb-2 flex justify-between items-center">
                    <Button
                        onClick={() => { setIsAdding(true); setEditingId(null); setErrorMsg(""); }}
                        className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm flex items-center justify-center gap-2 font-medium"
                        disabled={isAdding || editingId}
                    >
                        <Plus className="w-4 h-4" /> Thêm đơn vị mới
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={fetchUnits}
                        className="h-10 w-10 p-0 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"
                        title="Tải lại danh sách"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 pt-2">

                    {/* Form Thêm/Sửa */}
                    {(isAdding || editingId) && (
                        <form onSubmit={handleSubmit} className="mb-6 bg-indigo-50/50 p-5 rounded-xl border border-indigo-100 animate-in fade-in zoom-in-95">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-indigo-900 border-b-2 border-indigo-200 pb-1">
                                    {editingId ? 'Chỉnh sửa đơn vị' : 'Tạo đơn vị mới'}
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
                                    <Label>Mã đơn vị <span className="text-red-500">*</span></Label>
                                    <Input
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                                        placeholder="VD: LON"
                                        className="mt-1 bg-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Tên đơn vị <span className="text-red-500">*</span></Label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="VD: Lon"
                                        className="mt-1 bg-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Ký hiệu</Label>
                                    <Input
                                        value={formData.symbol}
                                        onChange={e => setFormData({ ...formData, symbol: e.target.value })}
                                        placeholder="VD: ln"
                                        className="mt-1 bg-white"
                                    />
                                </div>
                                <div>
                                    <Label>Loại vật liệu</Label>
                                    <select
                                        value={formData.materialType}
                                        onChange={e => setFormData({ ...formData, materialType: e.target.value })}
                                        className="w-full mt-1 h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="Nhựa">Nhựa</option>
                                        <option value="Giấy">Giấy</option>
                                        <option value="Kim loại">Kim loại</option>
                                        <option value="Loại khác">Loại khác</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>

                            </div>

                            <div className="mt-5 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={resetForm} className="h-10 border-gray-300">
                                    Hủy bỏ
                                </Button>
                                <Button type="submit" disabled={actionLoading} className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                                    <Save className="w-4 h-4" /> {actionLoading ? 'Đang lưu...' : 'Lưu đơn vị'}
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Bảng danh sách */}
                    <div className="bg-white border rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Mã</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Tên</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Ký hiệu</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Vật liệu</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && units.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">Đang tải dữ liệu...</td>
                                    </tr>
                                ) : units.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">Chưa có đơn vị tính nào.</td>
                                    </tr>
                                ) : (
                                    units.map(unit => (
                                        <tr key={unit.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                                            <td className="px-4 py-3 text-sm font-medium text-indigo-700">{unit.code}</td>
                                            <td className="px-4 py-3 text-sm text-gray-800 font-semibold">{unit.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{unit.symbol || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{unit.materialType}</td>
                                            <td className="px-4 py-3 text-sm text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost" size="sm"
                                                        onClick={() => handleEdit(unit)}
                                                        className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost" size="sm"
                                                        onClick={() => handleDelete(unit.id)}
                                                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                                                        disabled={actionLoading}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
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
    );
}
