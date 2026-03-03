import { useState, useRef } from "react";
import { ArrowLeft, Save, Image as ImageIcon, X, Upload, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ProductComponents/card";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import { Label } from "../ProductComponents/label";
import { Textarea } from "../ProductComponents/textarea";
import { useNavigate } from "react-router-dom";
import { useFetchCategories } from "../../../hooks/categories";
import { useFetchBrands } from "../../../hooks/brands";
import { useFetchTaxRates } from "../../../hooks/taxRates";
import api from "../../../config/axiosConfig";

const AddNewProduct = () => {
  const { categories, createCategory } = useFetchCategories();
  const { brands, createBrand } = useFetchBrands();
  const { taxRates } = useFetchTaxRates();

  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    brandId: "",
    taxRateId: "",
    description: "",
    isActive: "true",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Modal states for adding new category/brand
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ code: "", name: "", description: "" });
  const [newBrand, setNewBrand] = useState({ name: "", description: "", country: "" });
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [creatingBrand, setCreatingBrand] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  // Handle creating new category
  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) return;
    setCreatingCategory(true);
    try {
      const created = await createCategory(newCategory);
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

  // Handle creating new brand
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const payload = {
        name: formData.name,
        description: formData.description || null,
        imageUrl: imageUrl,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        brandId: formData.brandId ? parseInt(formData.brandId) : null,
        taxRateId: formData.taxRateId ? parseInt(formData.taxRateId) : null,
        isActive: formData.isActive === "true",
      };

      await api.post("/products", payload);

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
        {/* Header */}
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

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

            {/* LEFT */}
            <div className="h-full">
              <Card className="h-full border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl border-b border-gray-200">
                  <CardTitle className="text-xl font-bold text-gray-800">
                    Thông tin cơ bản
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-5 p-6">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">
                      Tên sản phẩm <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      className="mt-2 h-11 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập tên sản phẩm"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Category with Add New */}
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

                  <div>
                    <Label className="text-sm font-semibold text-gray-700">
                      Thuế
                    </Label>
                    <select
                      name="taxRateId"
                      className="mt-2 w-full h-11 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.taxRateId}
                      onChange={handleChange}
                    >
                      <option value="">Chọn loại thuế</option>
                      {taxRates.map((tax) => (
                        <option key={tax.id} value={tax.id}>{tax.name} ({tax.rate}%)</option>
                      ))}
                    </select>
                  </div>

                  {/* Brand with Add New */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Thương hiệu</Label>
                    <div className="flex gap-2 mt-2">
                      <select
                        name="brandId"
                        className="flex-1 h-11 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.brandId}
                        onChange={handleChange}
                      >
                        <option value="">Chọn thương hiệu</option>
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

                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Trạng thái</Label>
                    <select
                      name="isActive"
                      className="mt-2 w-full h-11 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.isActive}
                      onChange={handleChange}
                    >
                      <option value="true">Đang hoạt động</option>
                      <option value="false">Ngừng hoạt động</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Mô tả sản phẩm</Label>
                    <Textarea
                      className="mt-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      name="description"
                      placeholder="Nhập mô tả chi tiết về sản phẩm..."
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right - Image */}
            <div className="h-full">
              <Card className="h-full border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl border-b border-gray-200">
                  <CardTitle className="text-xl font-bold text-gray-800">
                    Hình ảnh sản phẩm
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
                    <div className="relative flex-1 rounded-2xl overflow-hidden group">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-contain rounded-2xl bg-gray-50"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <Button
              type="submit"
              disabled={submitting || uploadingImage}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 rounded-xl font-semibold disabled:opacity-50"
            >
              <Save className="w-5 h-5 mr-2" />
              {submitting ? "Đang lưu..." : "Lưu sản phẩm"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full h-12 border-2 border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 rounded-xl font-semibold"
              onClick={() => navigate("/products")}
            >
              Hủy
            </Button>
          </div>
        </form>
      </div>

      {/* Modal: Add New Category */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all">
            <div className="relative p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-2xl font-bold text-gray-900">
                Thêm mới danh mục
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
                <Label className="text-sm font-semibold text-gray-700">Mô tả</Label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 mt-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  value={newCategory.description}
                  onChange={(e) => setNewCategory((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Nhập mô tả chi tiết..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
              <Button variant="outline" className="flex-1 h-11 rounded-xl font-semibold" onClick={() => setShowCategoryModal(false)}>
                Hủy
              </Button>
              <Button
                className="flex-1 h-11 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
                onClick={handleCreateCategory}
                disabled={creatingCategory || !newCategory.name.trim()}
              >
                {creatingCategory ? "Đang tạo..." : "Thêm mới"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Brand */}
      {showBrandModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all">
            <div className="relative p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-2xl font-bold text-gray-900">
                Thêm mới thương hiệu
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
                  placeholder="Nhập tên thương hiệu"
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
                <Label className="text-sm font-semibold text-gray-700">Mô tả</Label>
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

export default AddNewProduct