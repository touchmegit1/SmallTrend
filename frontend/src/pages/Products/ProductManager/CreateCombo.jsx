import { useState, useEffect } from "react";
import { ArrowLeft, Save, Plus, X, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ProductComponents/card";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import { Label } from "../ProductComponents/label";
import { Textarea } from "../ProductComponents/textarea";
import { useNavigate } from "react-router-dom";
import axios from "../../../config/axiosConfig";
import { useProductCombos } from "../../../hooks/product_combos";

// Component tạo mới một Combo Sản phẩm
// Cho phép chọn và gán nhiều sản phẩm con với số lượng tuỳ ý để tạo thành Combo
const CreateCombo = () => {
  const [formData, setFormData] = useState({
    comboName: "",
    description: "",
    comboPrice: "",
    isActive: true,
  });
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showVariantPicker, setShowVariantPicker] = useState(false);
  const [availableVariants, setAvailableVariants] = useState([]); // Renamed from allVariants to match original
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { createCombo } = useProductCombos();

  useEffect(() => {
    // Gọi API lấy danh sách các variant (sản phẩm con) để hiển thị trên ô tìm kiếm
    const fetchVariants = async () => {
      try {
        const response = await axios.get("/product-variants"); // Changed endpoint
        if (response.data && response.data.content) {
          setAvailableVariants(response.data.content); // Updated state variable
        } else {
          setAvailableVariants([]); // Ensure it's an array even if content is missing
        }
      } catch (err) { // Kept original error variable name
        console.error("Error fetching variants:", err); // Kept original error variable name
      }
    };
    fetchVariants();
  }, []);

  // Hàm xử lý việc gõ text nội dung của thông tin Combo
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Thêm một Variant (sản phẩm con) vào danh sách Combo dự kiến
  const addVariant = (variant) => {
    const existing = selectedVariants.find(v => v.id === variant.id);
    if (existing) {
      setSelectedVariants(selectedVariants.map(v =>
        v.id === variant.id ? { ...v, quantity: v.quantity + 1 } : v
      ));
    } else {
      setSelectedVariants([...selectedVariants, { ...variant, quantity: 1 }]);
    }
    setSearchQuery(""); // Use searchQuery instead of searchTerm
    setShowVariantPicker(false); // Use showVariantPicker instead of showResults
  };

  // Xóa một Variant (sản phẩm con) khỏi danh sách Combo
  const removeVariant = (variantId) => {
    setSelectedVariants(selectedVariants.filter(v => v.id !== variantId));
  };

  // Điều chỉnh số lượng cho mỗi Variant trong Combo
  const updateQuantity = (variantId, quantity) => {
    if (quantity < 1) return;
    setSelectedVariants(
      selectedVariants.map((v) => (v.id === variantId ? { ...v, quantity } : v))
    );
  };

  const totalPrice = selectedVariants.reduce((sum, v) => sum + ((v.sellPrice || v.price || 0) * v.quantity), 0);
  const discountAmount = totalPrice - (formData.comboPrice || 0);
  const discountPercent = totalPrice > 0 && formData.comboPrice ? ((discountAmount / totalPrice) * 100).toFixed(0) : 0;

  const filteredVariants = availableVariants.filter(v =>
    v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Xử lý gửi API để lưu danh sách con thành Combo duy nhất
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedVariants.length === 0) { // Changed condition from < 2 to === 0
      alert("Vui lòng chọn ít nhất 1 sản phẩm!"); // Used alert instead of setToast
      return;
    }

    setIsSubmitting(true); // Used setIsSubmitting instead of setLoading
    try {
      const payload = {
        ...formData,
        comboPrice: Number(formData.comboPrice),
        originalPrice: totalPrice,
        isActive: formData.isActive === true || formData.isActive === "true",
        items: selectedVariants.map(v => ({
          productVariantId: v.id,
          quantity: v.quantity
        }))
      };

      await createCombo(payload);
      navigate("/products/combo", {
        state: { message: "Tạo combo thành công!" }
      });
    } catch (err) {
      alert(err.message || "Có lỗi xảy ra khi tạo combo");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/products/combo")}
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
                    <Label className="text-sm font-semibold text-gray-700">Giá Combo <span className="text-red-500">*</span></Label>
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
                      Giảm giá: <span className="font-bold">{discountAmount.toLocaleString()}đ ({discountPercent}%)</span>
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
                    <option value={true}>Đang bán</option>
                    <option value={false}>Ngưng bán</option>
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
                          <span className="text-sm font-medium">{variant.name || variant.productName} {variant.unitValue ? `- ${variant.unitValue} ${variant.unitName}` : ''}</span>
                          <span className="text-sm text-blue-600 font-semibold">{(variant.sellPrice || variant.price || 0).toLocaleString()}đ</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {selectedVariants.map(variant => (
                    <div key={variant.id} className="flex items-center gap-3 p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{variant.name || variant.productName} {variant.unitValue ? `- ${variant.unitValue} ${variant.unitName}` : ''}</p>
                        <p className="text-xs text-gray-500">{(variant.sellPrice || variant.price || 0).toLocaleString()}đ</p>
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
              disabled={isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 rounded-xl font-semibold disabled:opacity-50"
            >
              <Save className="w-5 h-5 mr-2" />
              {isSubmitting ? "Đang xử lý..." : "Lưu Combo"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full h-12 border-2 border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 rounded-xl font-semibold"
              onClick={() => navigate("/products/combo")}
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
