import { useState, useRef, useEffect } from "react";
import { X, Save, Image as ImageIcon, Plus } from "lucide-react";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import { Label } from "../ProductComponents/label";
import { Textarea } from "../ProductComponents/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ProductComponents/card";
import { useFetchCategories } from "../../../hooks/categories";
import { useFetchBrands } from "../../../hooks/brands";
import api from "../../../config/axiosConfig";

export function EditProductModal({ product, isOpen, onClose, onSave }) {
  const { categories } = useFetchCategories();
  const { brands } = useFetchBrands();
  const [formData, setFormData] = useState({
    name: "",
    brand_id: "",
    category_id: "",
    unit: "",
    description: "",
  });
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || "",
        brand_id: product.brand_id || "",
        category_id: product.category_id || "",
        unit: product.unit || "",
        description: product.description || "",
      });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (files) => {
    const newImages = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const handleFileSelect = (e) => {
    if (e.target.files?.length) {
      handleImageUpload(e.target.files);
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
    if (e.dataTransfer.files?.length) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/products/${product.id}`, formData);
      onSave({ ...product, ...formData });
      onClose();
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Lỗi khi cập nhật sản phẩm!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Chỉnh sửa sản phẩm</h2>
            <p className="text-gray-600 text-sm mt-1">Cập nhật thông tin sản phẩm</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 hover:bg-white rounded-full p-2 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-2xl border-b border-gray-200">
                <CardTitle className="text-xl font-bold text-gray-800">Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 p-6">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Tên sản phẩm <span className="text-red-500">*</span></Label>
                  <Input
                    className="mt-2 h-11 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập tên sản phẩm"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Danh mục <span className="text-red-500">*</span></Label>
                  <select
                    name="category_id"
                    className="mt-2 w-full h-11 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.category_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Thương hiệu</Label>
                  <select
                    name="brand_id"
                    className="mt-2 w-full h-11 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.brand_id}
                    onChange={handleChange}
                  >
                    <option value="">Chọn thương hiệu</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Đơn vị <span className="text-red-500">*</span></Label>
                  <Input
                    className="mt-2 h-11 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: Chai, Hộp, Gói, Kg..."
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    required
                  />
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

            {/* RIGHT */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-2xl border-b border-gray-200">
                <CardTitle className="text-xl font-bold text-gray-800">Hình ảnh sản phẩm</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 space-y-4 p-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {images.length === 0 ? (
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
                    className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      isDragging ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 scale-105' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
                    }`}
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4">
                      <ImageIcon className="w-10 h-10 text-blue-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Kéo thả hoặc click để tải ảnh lên</p>
                    <p className="text-xs text-gray-500">Hỗ trợ JPG, PNG, GIF</p>
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
                    className={`flex-1 min-h-0 border-2 border-dashed rounded-2xl p-4 transition-all cursor-pointer ${
                      isDragging ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 scale-105' : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <div className="grid grid-cols-2 gap-3">
                      {images.map((img, index) => (
                        <div key={index} className="relative group aspect-square">
                          <img
                            src={img.preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover rounded-xl shadow-md"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(index);
                            }}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-xl h-11"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm ảnh
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 rounded-xl font-semibold"
            >
              <Save className="w-5 h-5 mr-2" />
              Lưu thay đổi
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full h-12 border-2 border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 rounded-xl font-semibold" 
              onClick={onClose}
            >
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProductModal;
