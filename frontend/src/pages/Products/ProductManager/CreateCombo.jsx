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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/products/combos")}
            className="hover:bg-white/80 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Tạo Combo mới
            </h1>
            <p className="text-gray-600 mt-2">Chọn sản phẩm và thiết lập giá combo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left - Combo Info */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl border-b border-gray-200">
                <CardTitle className="text-xl font-bold text-gray-800">Thông tin Combo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 p-6">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Tên Combo <span className="text-red-500">*</span></Label>
                  <Input
                    className="mt-2 h-11 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: Combo Sáng Năng Động"
                    name="name"
                    value={formData.name}
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
                    <Label className="text-sm font-semibold text-gray-700">Giá Combo <span className="text-red-500">*</span></Label>
                    <Input
                      className="mt-2 h-11 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                    <p className="text-sm text-green-700">
                       Giảm giá: <span className="font-bold">{discountAmount.toLocaleString()}đ ({discountPercent}%)</span>
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Trạng thái</Label>
                  <select
                    name="status"
                    className="mt-2 w-full h-11 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl border-b border-gray-200">
                <CardTitle className="text-xl font-bold text-gray-800">
                  Sản phẩm trong Combo ({selectedVariants.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-xl h-11"
                  onClick={() => setShowVariantPicker(!showVariantPicker)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm sản phẩm
                </Button>

                {showVariantPicker && (
                  <div className="border-2 border-blue-200 bg-blue-50/30 rounded-xl p-4 space-y-3">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        className="pl-12 h-11 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
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
                          className="w-full text-left px-4 py-3 hover:bg-white rounded-xl flex justify-between items-center transition-all shadow-sm"
                        >
                          <span className="text-sm font-medium">{variant.name}</span>
                          <span className="text-sm text-blue-600 font-semibold">{variant.price.toLocaleString()}đ</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {selectedVariants.map(variant => (
                    <div key={variant.id} className="flex items-center gap-3 p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{variant.name}</p>
                        <p className="text-xs text-gray-500">{variant.price.toLocaleString()}đ</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(variant.id, variant.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-bold"
                        >
                          -
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-blue-600">{variant.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(variant.id, variant.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-bold"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => removeVariant(variant.id)}
                          className="ml-2 w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedVariants.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-400 font-medium">Chưa có sản phẩm nào</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 rounded-xl font-semibold"
            >
              <Save className="w-5 h-5 mr-2" />
              Lưu Combo
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full h-12 border-2 border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 rounded-xl font-semibold" 
              onClick={() => navigate("/products/combos")}
            >
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCombo;
