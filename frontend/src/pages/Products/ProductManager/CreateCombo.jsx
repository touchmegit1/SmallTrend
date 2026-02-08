import { useState } from "react";
import { ArrowLeft, Save, Plus, X, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ProductComponents/card";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import { Label } from "../ProductComponents/label";
import { Textarea } from "../ProductComponents/textarea";
import { useNavigate } from "react-router-dom";

const mockVariants = [
  { id: 1, name: "Yaourt Vinamilk 100ml", price: 8000, stock: 500 },
  { id: 2, name: "Bánh mì que 50g", price: 5000, stock: 300 },
  { id: 3, name: "Nước cam ép 200ml", price: 12000, stock: 200 },
  { id: 4, name: "Mì Hảo Hảo tôm chua cay", price: 4000, stock: 800 },
  { id: 5, name: "Coca Cola 330ml", price: 10000, stock: 600 },
  { id: 6, name: "Snack Oishi 50g", price: 8000, stock: 400 },
  { id: 7, name: "Sữa TH True Milk 1L", price: 35000, stock: 150 },
  { id: 8, name: "Bánh quy Cosy 200g", price: 25000, stock: 250 },
];

const CreateCombo = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discount_price: "",
    status: "active",
  });
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showVariantPicker, setShowVariantPicker] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addVariant = (variant) => {
    const existing = selectedVariants.find(v => v.id === variant.id);
    if (existing) {
      setSelectedVariants(selectedVariants.map(v => 
        v.id === variant.id ? { ...v, quantity: v.quantity + 1 } : v
      ));
    } else {
      setSelectedVariants([...selectedVariants, { ...variant, quantity: 1 }]);
    }
  };

  const removeVariant = (variantId) => {
    setSelectedVariants(selectedVariants.filter(v => v.id !== variantId));
  };

  const updateQuantity = (variantId, quantity) => {
    if (quantity < 1) return;
    setSelectedVariants(selectedVariants.map(v => 
      v.id === variantId ? { ...v, quantity } : v
    ));
  };

  const totalPrice = selectedVariants.reduce((sum, v) => sum + (v.price * v.quantity), 0);
  const discountAmount = totalPrice - (formData.discount_price || 0);
  const discountPercent = totalPrice > 0 ? ((discountAmount / totalPrice) * 100).toFixed(0) : 0;

  const filteredVariants = mockVariants.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedVariants.length === 0) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm!");
      return;
    }
    navigate("/products/combos", {
      state: { message: "Tạo combo thành công!" }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/products/combos")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Tạo Combo mới</h1>
          <p className="text-gray-500 mt-1">Chọn sản phẩm và thiết lập giá combo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left - Combo Info */}
          <Card className="border border-gray-300 rounded-lg bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Thông tin Combo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tên Combo <span className="text-red-600">*</span></Label>
                <Input
                  className="text-md bg-gray-200 border border-gray-200 rounded-lg"
                  placeholder="VD: Combo Sáng Năng Động"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Mô tả</Label>
                <Textarea
                  className="text-md bg-gray-200 border border-gray-200 rounded-lg"
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
                    className="text-md bg-gray-100 border border-gray-200 rounded-lg"
                    value={totalPrice.toLocaleString()}
                    disabled
                  />
                </div>
                <div>
                  <Label>Giá Combo <span className="text-red-600">*</span></Label>
                  <Input
                    className="text-md bg-gray-200 border border-gray-200 rounded-lg"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Đang bán</option>
                  <option value="inactive">Ngưng bán</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Right - Product Selection */}
          <Card className="border border-gray-300 rounded-lg bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Sản phẩm trong Combo ({selectedVariants.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => setShowVariantPicker(!showVariantPicker)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm sản phẩm
              </Button>

              {showVariantPicker && (
                <div className="border border-gray-300 rounded-lg p-3 space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      className="pl-9"
                      placeholder="Tìm sản phẩm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filteredVariants.map(variant => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => addVariant(variant)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg flex justify-between items-center"
                      >
                        <span className="text-sm">{variant.name}</span>
                        <span className="text-sm text-gray-500">{variant.price.toLocaleString()}đ</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {selectedVariants.map(variant => (
                  <div key={variant.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{variant.name}</p>
                      <p className="text-xs text-gray-500">{variant.price.toLocaleString()}đ</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(variant.id, variant.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center bg-white border border-gray-300 rounded"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{variant.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(variant.id, variant.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center bg-white border border-gray-300 rounded"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeVariant(variant.id)}
                        className="ml-2 text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {selectedVariants.length === 0 && (
                <p className="text-center text-gray-400 py-8">Chưa có sản phẩm nào</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Lưu Combo
          </Button>
          <Button type="button" variant="danger" className="w-full" onClick={() => navigate("/products/combos")}>
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateCombo;
