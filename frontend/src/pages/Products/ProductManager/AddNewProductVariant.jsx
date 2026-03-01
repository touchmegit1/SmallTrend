import { useState, useRef } from "react";
import { ArrowLeft, Save, Image as ImageIcon, X, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ProductComponents/card";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import { Label } from "../ProductComponents/label";
import { useNavigate, useLocation } from "react-router-dom";
import { useFetchUnits } from "../../../hooks/product_variants";
import api from "../../../config/axiosConfig";

// Màn hình Thêm mới một Variant (Sản phẩm biến thể)
// Cho phép khai báo đơn vị, giá bán, giá nhập và hình ảnh
const AddNewProductVariant = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product;

  const { units, loading: unitsLoading } = useFetchUnits();

  const [formData, setFormData] = useState({
    sku: "",
    barcode: "",
    unit_id: "",
    unit_value: "",
    sell_price: "",
    is_active: product?.is_active === false ? false : true,
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Xử lý đọc file ảnh cục bộ dưới dạng DateURL để hiển thị Preview
  const handleImageSelect = (file) => {
    if (file) {
      // The original code had a type check, let's keep it for robustness
      if (!file.type.startsWith("image/")) {
        // toast.error("File không phải là ảnh"); // Assuming toast is available
        console.error("File is not an image.");
        return;
      }
      // if (file.size > 5 * 1024 * 1024) { // Assuming toast is available
      //   toast.error("Kích thước ảnh không được vượt quá 5MB");
      //   return;
      // }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImageFile(file); // Changed from setSelectedImage to setImageFile
      };
      reader.readAsDataURL(file);
    }
  };

  // Kích hoạt khi người dùng tải tệp từ ô input type="file"
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageSelect(e.target.files[0]);
    }
  };

  // 3 Hàm dưới đây dùng để hỗ trợ UX: Kéo thả file ảnh trực tiếp vào box
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

  // Gỡ ảnh hiện tại ra khỏi form
  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null); // Changed from setSelectedImage to setImageFile
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Hàm đẩy ảnh dạng Binary Form-data lên Server và nhận link URL trả về
  const uploadImage = async () => {
    if (!imageFile) return null; // Changed from selectedImage to imageFile
    setUploadingImage(true); // Kept from original
    const formData = new FormData();
    formData.append("file", imageFile); // Changed from selectedImage to imageFile
    try {
      const response = await api.post("/upload/image", formData, { // Changed endpoint from /upload to /upload/image
        headers: { "Content-Type": undefined }, // Changed from "multipart/form-data" to undefined to let browser set it
      });
      return response.data.url;
    } catch (error) {
      console.error("Lỗi upload ảnh:", error); // Changed error message
      throw new Error("Không thể upload ảnh"); // Changed error handling
    } finally {
      setUploadingImage(false); // Kept from original
    }
  };

  // Cập nhật bộ đệm nội dung state mỗi khi gõ
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Hàm Submit: Tiến hành Upload image (nếu có) trước rồi lấy URL đính vào payload Variant để Post tạo mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(""); // Kept from original

    // if (isSubmitting) return; // isSubmitting state variable is not defined in the original code, so commenting out or adding it. Assuming it should be `saving`
    if (saving) return;

    if (!formData.sku.trim()) {
      setErrorMsg("Vui lòng nhập SKU");
      return;
    }
    if (!formData.unit_id) {
      setErrorMsg("Vui lòng chọn đơn vị");
      return;
    }
    if (!formData.sell_price) {
      setErrorMsg("Vui lòng nhập giá bán");
      return;
    }

    setSaving(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      await api.post(`/products/${product.id}/variants`, {
        sku: formData.sku,
        barcode: formData.barcode || null,
        unitId: parseInt(formData.unit_id),
        unitValue: formData.unit_value ? parseFloat(formData.unit_value) : null,
        sellPrice: parseFloat(formData.sell_price),
        imageUrl: imageUrl,
        isActive: formData.is_active,
      });

      navigate(`/products/detail/${product.id}`, {
        state: {
          product,
          message: "Thêm biến thể thành công!",
        },
      });
    } catch (err) {
      console.error("Error creating variant:", err);
      const msg = err.response?.data?.message || err.response?.data || "Lỗi khi thêm biến thể!";
      setErrorMsg(typeof msg === "string" ? msg : "Lỗi khi thêm biến thể!");
    } finally {
      setSaving(false);
    }
  };

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Không tìm thấy sản phẩm</p>
          <button
            onClick={() => navigate("/products")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  // Get selected unit for preview
  const selectedUnit = units.find((u) => u.id === parseInt(formData.unit_id));
  const previewName = (() => {
    let name = product.name;
    if (formData.unit_value || selectedUnit) {
      name += " - ";
      if (formData.unit_value) {
        name += formData.unit_value;
        if (selectedUnit) name += " ";
      }
      if (selectedUnit) name += selectedUnit.name;
    }
    return name;
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() =>
              navigate(`/products/detail/${product.id}`, {
                state: { product },
              })
            }
            className="hover:bg-white/80 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Thêm biến thể mới
            </h1>
            <p className="text-gray-600 mt-2">
              Sản phẩm gốc: <span className="font-semibold">{product.name}</span>
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-4 animate-in fade-in">
            <span className="text-red-700 font-medium">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* LEFT - Main Info */}
            <div className="h-full">
              <Card className="h-full border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl border-b border-gray-200">
                  <CardTitle className="text-xl font-bold text-gray-800">
                    Thông tin cơ bản
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-6 flex-1">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">
                        SKU <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        className="mt-2 h-11 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono uppercase"
                        placeholder="VD: SKU-001"
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Barcode</Label>
                      <Input
                        className="mt-2 h-11 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                        placeholder="VD: 893458..."
                        name="barcode"
                        value={formData.barcode}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">
                        Đơn vị <span className="text-red-500">*</span>
                      </Label>
                      <select
                        name="unit_id"
                        className="mt-2 w-full h-11 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.unit_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Chọn đơn vị</option>
                        {units.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name} ({unit.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Giá trị đơn vị</Label>
                      <Input
                        type="number"
                        step="any"
                        className="mt-2 h-11 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="VD: 500"
                        name="unit_value"
                        value={formData.unit_value}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700">
                      Giá bán <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      step="any"
                      className="mt-2 h-11 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: 93000"
                      name="sell_price"
                      value={formData.sell_price}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Trạng thái</Label>
                    <select
                      name="is_active"
                      className="mt-2 w-full h-11 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                      value={formData.is_active}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_active: e.target.value === "true",
                        }))
                      }
                      disabled={product?.is_active === false}
                    >
                      {product?.is_active !== false && <option value="true">Đang hoạt động</option>}
                      <option value="false">Ngừng hoạt động</option>
                    </select>
                    {product?.is_active === false && (
                      <p className="text-xs text-red-500 mt-1">
                        Sản phẩm gốc đang ngừng hoạt động, không thể tạo biến thể kích hoạt.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT - Image Upload */}
            <div className="h-full">
              <Card className="h-full border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl border-b border-gray-200">
                  <CardTitle className="text-xl font-bold text-gray-800">
                    Hình ảnh biến thể
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 p-6">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {imagePreview ? (
                    <div className="relative flex-1 rounded-2xl overflow-hidden group border border-gray-100 shadow-inner">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-contain bg-white"
                        style={{ minHeight: '300px' }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-2xl" />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-gray-700 rounded-xl px-4 py-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Đổi ảnh
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
                      className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${isDragging
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 scale-[1.02]'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
                        }`}
                      style={{ minHeight: '300px' }}
                    >
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4">
                        <ImageIcon className="w-10 h-10 text-blue-600" />
                      </div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Kéo thả hoặc click để tải ảnh lên
                      </p>
                      <p className="text-xs text-gray-500">
                        Hỗ trợ JPG, PNG, GIF
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 rounded-xl font-semibold disabled:opacity-50"
              disabled={saving || uploadingImage}
            >
              <Save className="w-5 h-5 mr-2" />
              {saving || uploadingImage ? "Đang lưu..." : "Lưu biến thể"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full h-12 border-2 border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 rounded-xl font-semibold"
              onClick={() =>
                navigate(`/products/detail/${product.id}`, {
                  state: { product },
                })
              }
            >
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewProductVariant;
