import { useState, useRef } from "react";
import { ArrowLeft, Save, Image as ImageIcon, X, Upload, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ProductComponents/card";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import { Label } from "../ProductComponents/label";
import { useNavigate } from "react-router-dom";
import { useFetchCategories } from "../../../hooks/categories";
import { useFetchBrands } from "../../../hooks/brands";
import { useFetchTaxRates } from "../../../hooks/taxRates";
import api from "../../../config/axiosConfig";

/**
 * Screen hiển thị Form Tạo Mới Sản Phẩm.
 * Chứa logic Upload Ảnh (File System/Cloud config tuỳ chỉnh), Cập nhật Tên, Category, Thương hiệu...
 * Tích hợp Quick-Create Category và Thương hiệu ngay tại chỗ thông qua Sub-Modal.
 */
const AddNewProduct = () => {
  // --- CUSTOM HOOKS (Gọi dữ liệu Category, Brand, Tax làm dữ liệu dropdown) ---
  const { categories, createCategory } = useFetchCategories();
  const { brands, createBrand } = useFetchBrands();
  const { taxRates } = useFetchTaxRates();

  const navigate = useNavigate();

  // --- STATE QUẢN LÝ DỮ LIỆU ĐIỀN FORM ---
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    brandId: "",
    taxRateId: "",
    description: "",
    isActive: "true",
  });

  // State chuyên biệt xử lý ảnh File Upload UI UX (Hiệu ứng preview, Drag drop)
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // State Loading Block Form Button (Chống submit spam 2 lần)
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // --- STATE & DATA CHO QUICK-CREATE MODAL CATEGORY & BRAND ---
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);

  const [newCategory, setNewCategory] = useState({ code: "", name: "", description: "" });
  const [newBrand, setNewBrand] = useState({ name: "", description: "", country: "" });

  const [creatingCategory, setCreatingCategory] = useState(false);
  const [creatingBrand, setCreatingBrand] = useState(false);

  // --- HANDLER FUNCTIONS FORM LOGIC ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Cập nhật file ảnh khi người dùng bấm chọn từ File Explorer
   */
  const handleImageSelect = (file) => {
    // Chỉ chọn MIME type Hình Ảnh
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Build base64 blob string render ảnh trực tiếp
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files?.[0]) {
      handleImageSelect(e.target.files[0]);
    }
  };

  // 3 Functions xử lý UI Effect kéo thả Ảnh
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

  // Clear sạch data khung ảnh đã chọn
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Gọi API Upload file Binary Form-Data riêng. 
   * (Do Backend Server thường nhận Object JSON cho text và cần 1 endpoint chuẩn cho thao tác lưu file lấy string URL trả về)
   */
  const uploadImage = async () => {
    if (!imageFile) return null;
    setUploadingImage(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", imageFile);
      const response = await api.post("/upload/image", formDataUpload, {
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

  // --- HANDLERS: ACTIONS CỦA QUICK POST MODAL ---
  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) return;
    setCreatingCategory(true);
    try {
      const created = await createCategory(newCategory);
      // Auto-select ID mới nhất vào form thêm Sản phẩm ngay & luôn
      setFormData((prev) => ({ ...prev, categoryId: String(created.id) }));
      setNewCategory({ code: "", name: "", description: "" });
      setShowCategoryModal(false);
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Tạo danh mục thất bại!");
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleCreateBrand = async () => {
    if (!newBrand.name.trim()) return;
    setCreatingBrand(true);
    try {
      const created = await createBrand(newBrand);
      setFormData((prev) => ({ ...prev, brandId: String(created.id) }));
      setNewBrand({ name: "", description: "", country: "" });
      setShowBrandModal(false);
    } catch (error) {
      console.error("Error creating brand:", error);
      alert("Tạo thương hiệu thất bại!");
    } finally {
      setCreatingBrand(false);
    }
  };

  // --- HANDLER SUBMIT TỔNG CHÍNH ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 1. Nếu có file hình thì cần đẩy API up ảnh trước lấy URL
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      // 2. Format Body chuẩn khớp với DTO nhận Json của Spring Boot Backend
      const payload = {
        name: formData.name,
        description: formData.description || null,
        imageUrl: imageUrl, // Url lưu dạng String Path
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        brandId: formData.brandId ? parseInt(formData.brandId) : null,
        taxRateId: formData.taxRateId ? parseInt(formData.taxRateId) : null,
        isActive: formData.isActive === "true", // Ép kiểu boolean DB từ value String option Dropdown
      };

      await api.post("/products", payload);

      // 3. Sau khi Tạo parent Product xong sẽ redirect về Master List
      // Đính kèm state params vào Route để Layout Page List in ra được câu Toast Message màu Xanh
      navigate("/products", {
        state: {
          message: "Thêm sản phẩm thành công!",
          type: "success",
        },
      });
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Lưu sản phẩm thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER ĐIỀU HƯỚNG */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/products")}
            className="hover:bg-white/80 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Thêm sản phẩm mới
            </h1>
            <p className="text-gray-600 mt-2">
              Điền thông tin chi tiết sản phẩm
            </p>
          </div>
        </div>

        {/* --- KHỐI BỐ LIỆU CHÍNH (FORM WRAPPER) --- */}
        <form onSubmit={handleSubmit}>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* CỘT LEFT: THÔNG TIN TEXT & DROPDOWNS --- */}
            <div className="h-full">
              <Card className="h-full border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl border-b border-gray-200">
                  <CardTitle className="text-xl font-bold text-gray-800">
                    Thông tin cơ bản
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-5 p-6">

                  {/* Name Input */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">
                      Tên sản phẩm <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      className="mt-2 h-11 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập tên sản phẩm (Vd: Áo Vest đen nhám)"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Ngành Hàng (Category) Selector + Nút Gọi Modal New */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">
                      Danh mục <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2 mt-2">
                      <select
                        name="categoryId"
                        className="flex-1 h-11 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.categoryId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Chọn danh mục</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowCategoryModal(true)}
                        className="h-11 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl flex items-center gap-1.5 text-sm font-medium transition-all duration-200 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 whitespace-nowrap"
                        title="Thêm danh mục mới"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm mới
                      </button>
                    </div>
                  </div>

                  {/* Thuế - Chạy theo cấu hình Tax Rate DB */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">
                      Thuế nhập/xuất áp dụng mặc định
                    </Label>
                    <select
                      name="taxRateId"
                      className="mt-2 w-full h-11 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.taxRateId}
                      onChange={handleChange}
                    >
                      <option value="">(Non-Tax) Trống</option>
                      {taxRates.map((tax) => (
                        <option key={tax.id} value={tax.id}>{tax.name} ({tax.rate}%)</option>
                      ))}
                    </select>
                  </div>

                  {/* Nhãn hiệu - Brand Picker Component */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Thương hiệu</Label>
                    <div className="flex gap-2 mt-2">
                      <select
                        name="brandId"
                        className="flex-1 h-11 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.brandId}
                        onChange={handleChange}
                      >
                        <option value="">Loại nhãn hàng nội địa/Trống</option>
                        {brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowBrandModal(true)}
                        className="h-11 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl flex items-center gap-1.5 text-sm font-medium transition-all duration-200 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 whitespace-nowrap"
                        title="Thêm thương hiệu mới"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm mới
                      </button>
                    </div>
                  </div>

                  {/* Status Toggle Switch */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Trạng thái phát hành</Label>
                    <select
                      name="isActive"
                      className="mt-2 w-full h-11 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.isActive}
                      onChange={handleChange}
                    >
                      <option value="true" className="text-green-600">Đang hoạt động</option>
                      <option value="false" className="text-red-600">Lưu nháp - Ngừng bán</option>
                    </select>
                  </div>

                  {/* Thẻ Text Area Ghi chú Dài */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Mô tả sản phẩm</Label>
                    <textarea
                      className="mt-2 w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      name="description"
                      placeholder="Bài đăng mô tả chi tiết công dụng/đặc điểm sản phẩm..."
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CỘT RIGHT: IMAGE UPLOADER UI --- */}
            <div className="h-full">
              <Card className="h-full border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col">
                <CardHeader classNa me="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl border-b border-gray-200">
                  <CardTitle className="text-xl font-bold text-gray-800">
                    Hình ảnh sản phẩm gốc
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col flex-1 p-6">
                  {/* Trình Handle File Ẩn - Hoạt động khi người dùng nhấp box Upload Avatar */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Flow Render Avatar */}
                  {imagePreview ? (
                    // Trạng thái (1): Đã Upload Xong Preview - Hiện Hình - Hover Đổi Hình Khác
                    <div className="relative flex-1 rounded-2xl overflow-hidden group">
                      <img
                        src={imagePreview}
                        alt="Preview Avatar"
                        className="w-full h-full object-contain rounded-2xl bg-gray-50"
                        style={{ minHeight: '300px' }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-2xl" />

                      {/* Sub Nút Huỷ Data Ảnh */}
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      {/* Sub Nút Re-select Hình */}
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
                    // Trạng thái (2): Lúc mới vào/Clear ảnh -> Trạng thái chờ Kéo Drop File Empty
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
                        Kéo thả hoặc click để chuyển file tới đây
                      </p>
                      <p className="text-xs text-gray-500">
                        Hỗ trợ PNG, JPG, GIF
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* TWO MAIN FOOTER ACTIONS BOT-RIGHT SCREEN */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <Button
              type="submit"
              disabled={submitting || uploadingImage}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 rounded-xl font-semibold disabled:opacity-50"
            >
              <Save className="w-5 h-5 mr-2" />
              {submitting ? "Đang đẩy request..." : "Lưu vào kho dữ liệu"}
            </Button>
            <Button
              type="button"
              variant="danger"
              className="w-full h-12 border-2 border-red-200 text-red-600 hover:bg-red-400 hover:text-red-800 rounded-xl font-bold flex items-center justify-center"
              onClick={() => navigate("/products")}
            >
              Hủy tiến trình
            </Button>
          </div>
        </form>
      </div>

      {/* --- EXTRA COMPONENTS: QUICK MODALS (Tạo Record ngoại lai nhanh mà không cần thoát Form) --- */}

      {/* 1. Modal: Theem mới Category Mở Pop-up OverLay */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all">
            <div className="relative p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                Lối tắt mở danh mục phân nhóm mới
              </h2>
              <button onClick={() => setShowCategoryModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Mã danh mục <span className="text-red-500">*</span></Label>
                <Input
                  className="mt-2 h-11 text-base bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                  value={newCategory.code}
                  onChange={(e) => setNewCategory((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="VD: FRESH, DRINK, SNACK"
                  maxLength={50}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Tên danh mục <span className="text-red-500">*</span></Label>
                <Input
                  className="mt-2 h-11 text-base bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Nhập tên danh mục"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Mô tả đặc tính quy định chuỗi</Label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 mt-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  value={newCategory.description}
                  onChange={(e) => setNewCategory((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="(Không bắt buộc)"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex gap-3">
              <Button variant="outline" className="flex-1 h-11 rounded-xl font-semibold border-gray-300" onClick={() => setShowCategoryModal(false)}>
                Hủy
              </Button>
              <Button
                className="flex-1 h-11 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md border-0 disabled:brightness-75"
                onClick={handleCreateCategory}
                disabled={creatingCategory || !newCategory.name.trim()}
              >
                {creatingCategory ? "Đang tạo..." : "Thêm mới"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: Thêm mới Brand Mở Pop-up OverLay */}
      {showBrandModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all">
            <div className="relative p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                Lối tắt để thêm mới thương hiệu
              </h2>
              <button onClick={() => setShowBrandModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Tên thương hiệu <span className="text-red-500">*</span></Label>
                <Input
                  className="mt-2 h-11 text-base bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newBrand.name}
                  onChange={(e) => setNewBrand((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Vd: Vinamilk, PepsiCo."
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Quốc gia</Label>
                <Input
                  className="mt-2 h-11 text-base bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newBrand.country}
                  onChange={(e) => setNewBrand((prev) => ({ ...prev, country: e.target.value }))}
                  placeholder="VD: Việt Nam, Mỹ, Thái Lan..."
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Chi tiết bổ sung nhận diện</Label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 mt-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  value={newBrand.description}
                  onChange={(e) => setNewBrand((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Nhập mô tả chi tiết..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
              <Button variant="outline" className="flex-1 h-11 rounded-xl font-semibold" onClick={() => setShowBrandModal(false)}>
                Hủy
              </Button>
              <Button
                className="flex-1 h-11 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
                onClick={handleCreateBrand}
                disabled={creatingBrand || !newBrand.name.trim()}
              >
                {creatingBrand ? "Đang tạo..." : "Thêm mới"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AddNewProduct;