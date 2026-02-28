import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import { Label } from "../ProductComponents/label";
import { Textarea } from "../ProductComponents/textarea";

const EditComboModal = ({ combo, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    comboName: "",
    description: "",
    comboPrice: "",
    isActive: true,
  });

  useEffect(() => {
    if (combo) {
      setFormData({
        comboName: combo.comboName || "",
        description: combo.description || "",
        comboPrice: combo.comboPrice || "",
        isActive: combo.isActive !== undefined ? combo.isActive : true,
      });
    }
  }, [combo]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...combo, ...formData });
  };

  if (!isOpen) return null;

  const totalPrice = combo?.originalPrice || 0;
  const discountAmount = totalPrice - (Number(formData.comboPrice) || 0);
  const discountPercent = totalPrice > 0 && formData.comboPrice ? ((discountAmount / totalPrice) * 100).toFixed(0) : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">✏️ Chỉnh sửa Combo</h2>
            <p className="text-gray-600 text-sm mt-1">Cập nhật thông tin combo</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-white rounded-full p-2 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <Label className="text-sm font-semibold text-gray-700">
              Tên Combo <span className="text-red-500">*</span>
            </Label>
            <Input
              className="mt-2 h-11 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập tên combo"
              name="comboName"
              value={formData.comboName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label className="text-sm font-semibold text-gray-700">Mô tả</Label>
            <Textarea
              className="mt-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              name="description"
              placeholder="Mô tả về combo..."
              rows={3}
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700">Giá gốc</Label>
              <Input
                className="mt-2 h-11 bg-gray-100 border-gray-200 rounded-xl"
                value={totalPrice.toLocaleString()}
                disabled
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-700">
                Giá Combo <span className="text-red-500">*</span>
              </Label>
              <Input
                className="mt-2 h-11 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="number"
                placeholder="0"
                name="comboPrice"
                value={formData.comboPrice}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {formData.comboPrice && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
              <p className="text-sm text-green-700">
                💰 Giảm giá: <span className="font-bold">{discountAmount.toLocaleString()}đ ({discountPercent}%)</span>
              </p>
            </div>
          )}

          <div>
            <Label className="text-sm font-semibold text-gray-700">Trạng thái</Label>
            <select
              name="isActive"
              className="mt-2 w-full h-11 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.isActive}
              onChange={handleChange}
            >
              <option value={true}>✅ Đang bán</option>
              <option value={false}>❌ Ngưng bán</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 rounded-xl font-semibold"
            >
              <Save className="w-5 h-5 mr-2" />
              Lưu thay đổi
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-12 border-2 border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 rounded-xl font-semibold"
              onClick={onClose}
            >
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditComboModal;
