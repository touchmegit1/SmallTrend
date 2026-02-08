import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import { Label } from "../ProductComponents/label";
import { Textarea } from "../ProductComponents/textarea";

const EditComboModal = ({ combo, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discount_price: "",
    status: "active",
  });

  useEffect(() => {
    if (combo) {
      setFormData({
        name: combo.name || "",
        description: combo.description || "",
        discount_price: combo.discount_price || "",
        status: combo.status || "active",
      });
    }
  }, [combo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...combo, ...formData });
  };

  if (!isOpen) return null;

  const totalPrice = combo?.price || 0;
  const discountAmount = totalPrice - (formData.discount_price || 0);
  const discountPercent = totalPrice > 0 ? ((discountAmount / totalPrice) * 100).toFixed(0) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa Combo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label>
              Tên Combo <span className="text-red-600">*</span>
            </Label>
            <Input
              className="text-md bg-gray-200 border border-gray-200 rounded-lg mt-1"
              placeholder="Nhập tên combo"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label>Mô tả</Label>
            <Textarea
              className="text-md bg-gray-200 border border-gray-200 rounded-lg mt-1"
              name="description"
              placeholder="Mô tả về combo..."
              rows={3}
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Giá gốc</Label>
              <Input
                className="text-md bg-gray-100 border border-gray-200 rounded-lg mt-1"
                value={totalPrice.toLocaleString()}
                disabled
              />
            </div>
            <div>
              <Label>
                Giá Combo <span className="text-red-600">*</span>
              </Label>
              <Input
                className="text-md bg-gray-200 border border-gray-200 rounded-lg mt-1"
                type="number"
                placeholder="0"
                name="discount_price"
                value={formData.discount_price}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {formData.discount_price && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                Giảm giá: <span className="font-bold">{discountAmount.toLocaleString()}đ ({discountPercent}%)</span>
              </p>
            </div>
          )}

          <div>
            <Label>Trạng thái</Label>
            <select
              name="status"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white mt-1"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Đang bán</option>
              <option value="inactive">Ngưng bán</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Lưu thay đổi
            </Button>
            <Button
              type="button"
              variant="danger"
              className="flex-1"
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
