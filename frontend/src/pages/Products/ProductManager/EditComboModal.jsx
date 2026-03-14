import { useState, useEffect, useRef } from "react";
import { X, Save, Plus, Search, Image as ImageIcon, Upload } from "lucide-react";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import { Label } from "../ProductComponents/label";
import { Textarea } from "../ProductComponents/textarea";
import axios from "../../../config/axiosConfig";

// Modal Popup dùng chung để sửa thông tin của một Combo đã tồn tại
// Nhận vào state combo được chọn từ component cha và gọi hàm onSave khi hoàn thành
const EditComboModal = ({ combo, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    comboName: "",
    description: "",
    comboPrice: "",
    isActive: true,
  });
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [availableVariants, setAvailableVariants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showVariantPicker, setShowVariantPicker] = useState(false);

  // Thêm state upload image
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (combo) {
      setFormData({
        comboName: combo.comboName || "",
        description: combo.description || "",
        comboPrice: combo.comboPrice || "",
        isActive: combo.isActive !== undefined ? combo.isActive : true,
      });
      if (combo.items && Array.isArray(combo.items)) {
        const initialVariants = combo.items.map(item => ({
          id: item.productVariantId || item.id,
          name: item.productVariantName || item.name,
          sku: item.sku,
          sellPrice: item.sellPrice || 0,
          quantity: item.quantity,
          attributes: {}
        }));
        setSelectedVariants(initialVariants);
      } else {
        setSelectedVariants([]);
      }

      // Gán ImageUrl Cũ
      setImagePreview(combo.imageUrl || null);
      setImageFile(null);
    }
  }, [combo]);

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const response = await axios.get("/products/variants");
        setAvailableVariants(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error fetching variants:", err);
      }
    };
    if (isOpen) {
      fetchVariants();
    }
  }, [isOpen]);

  const addVariant = (variant) => {
    const existing = selectedVariants.find((v) => v.id === variant.id);
    if (existing) {
      setSelectedVariants(
        selectedVariants.map((v) =>
          v.id === variant.id ? { ...v, quantity: v.quantity + 1 } : v,
        )
      );
    } else {
      setSelectedVariants([...selectedVariants, { ...variant, quantity: 1 }]);
    }
    setSearchQuery("");
    setShowVariantPicker(false);
  };

  const removeVariant = (variantId) => {
    setSelectedVariants(selectedVariants.filter((v) => v.id !== variantId));
  };

  const updateQuantity = (variantId, quantity) => {
    if (quantity < 1) return;
    setSelectedVariants(
      selectedVariants.map((v) => (v.id === variantId ? { ...v, quantity } : v))
    );
  };

  // --- HANDLER FUNCTIONS UI / IMAGE SELECTOR ---
  const handleImageSelect = (file) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files?.[0]) {
      handleImageSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleImageSelect(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    setUploadingImage(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", imageFile);
      const response = await axios.post("/upload/image", formDataUpload, {
        headers: { "Content-Type": undefined },
      });
      return response.data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  // Hàm cập nhật state nội bộ khi người dùng gõ vào form chỉnh sửa
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Hàm chặn submit mặc định và đẩy dữ liệu chỉnh sửa lên component cha
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedVariants.length === 0) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm!");
      return;
    }

    try {
      let imageUrl = imagePreview;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const itemsPayload = selectedVariants.map((v) => ({
        productVariantId: v.id,
        quantity: v.quantity,
      }));

      onSave({
        ...combo,
        ...formData,
        imageUrl: imageUrl || null,
        comboPrice: Number(formData.comboPrice),
        originalPrice: totalPrice,
        items: itemsPayload
      });
    } catch (error) {
      console.error("Error saving combo:", error);
      alert("Có lỗi xảy ra khi xử lý ảnh");
    }
  };

  if (!isOpen) return null;

  const totalPrice = selectedVariants.reduce((sum, v) => sum + ((v.sellPrice || 0) * v.quantity), 0);
  const discountAmount = totalPrice - (Number(formData.comboPrice) || 0);
  const discountPercent = totalPrice > 0 && formData.comboPrice ? ((discountAmount / totalPrice) * 100).toFixed(0) : 0;

  const filteredVariants = availableVariants.filter(
    (v) =>
      v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                Giảm giá: <span className="font-bold">{discountAmount.toLocaleString()}đ ({discountPercent}%)</span>
              </p>
            </div>
          )}

          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Sản phẩm trong Combo ({selectedVariants.length})
            </h3>
            <Button
              type="button"
              variant="ghost"
              className="w-full border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-xl h-11 mb-4"
              onClick={() => setShowVariantPicker(!showVariantPicker)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm sản phẩm
            </Button>

            {showVariantPicker && (
              <div className="border-2 border-blue-200 bg-blue-50/30 rounded-xl p-4 space-y-3 mb-4">
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
                  {filteredVariants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => addVariant(variant)}
                      className="w-full text-left px-4 py-3 hover:bg-white rounded-xl flex justify-between items-center transition-all shadow-sm"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{variant.name}</span>
                        {variant.attributes && Object.keys(variant.attributes).length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(variant.attributes).map(([k, v]) => (
                              <span key={k} className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-1.5 py-0 rounded font-medium">{k}: {v}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-blue-600 font-semibold whitespace-nowrap ml-2">{(variant.sellPrice || 0).toLocaleString()}đ</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {selectedVariants.map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 shadow-sm"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{variant.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{(variant.sellPrice || 0).toLocaleString()}đ</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(variant.id, variant.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 font-bold"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-blue-600">
                      {variant.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(variant.id, variant.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 font-bold"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeVariant(variant.id)}
                      className="ml-1 w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {selectedVariants.length === 0 && !showVariantPicker && (
              <p className="text-center text-gray-400 text-sm py-4">
                Chưa có sản phẩm nào
              </p>
            )}
          </div>

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

          {/* KHỐI MEDIA AVATAR */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 block mb-2">Hình ảnh Combo</Label>
            <div className="flex flex-col h-[280px]">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative flex-1 rounded-2xl overflow-hidden group border border-gray-100 shadow-sm">
                  <img
                    src={imagePreview.startsWith('blob:') || imagePreview.startsWith('http') ? imagePreview : `http://localhost:8081${imagePreview.startsWith('/') ? '' : '/'}${imagePreview}`}
                    alt="Combo Visual"
                    className="w-full h-full object-contain rounded-2xl bg-white"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 rounded-2xl backdrop-blur-[1px]" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-4 right-4 bg-white hover:bg-slate-50 text-gray-800 rounded-xl px-4 py-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4 text-blue-600" />
                    Tìm file khác
                  </button>
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer bg-white ${isDragging
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50/70 scale-[1.02]'
                    : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                    }`}
                >
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4 shadow-sm border border-slate-200">
                    <ImageIcon className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 mb-1.5">Trống thông tin Photo File</p>
                  <p className="text-xs font-medium text-slate-500">Ấn để điều hướng File Explorer <br />hoặc dùng chuột thả Drop Ảnh vào vùng này.</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={uploadingImage}
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 rounded-xl font-semibold disabled:opacity-50"
            >
              <Save className="w-5 h-5 mr-2" />
              {uploadingImage ? "Đang xử lý..." : "Lưu thay đổi"}
            </Button>
            <Button
              type="button"
              variant="danger"
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
