import { useState, useRef, useEffect } from "react";
import { X, Save, Image as ImageIcon, Plus } from "lucide-react";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import { Label } from "../ProductComponents/label";
import { Textarea } from "../ProductComponents/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ProductComponents/card";

export function EditProductModal({ product, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    unit: "",
    description: "",
    tax: "10%",
  });
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || "",
        brand: product.brand || "",
        category: product.category || "",
        unit: product.unit || "",
        description: product.description || "",
        tax: "10%",
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...product, ...formData });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Chỉnh sửa sản phẩm</h2>
            <p className="text-gray-500 text-sm mt-1">Cập nhật thông tin sản phẩm</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT */}
            <Card className="border border-gray-300 rounded-lg bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tên sản phẩm <span className="text-red-600">*</span></Label>
                  <Input
                    className="text-md bg-gray-200 border border-gray-200 rounded-lg"
                    placeholder="Nhập tên sản phẩm"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label>Danh mục <span className="text-red-600">*</span></Label>
                  <select
                    name="category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    <option value="Nước giải khát">Nước giải khát</option>
                    <option value="Mì ăn liền">Mì ăn liền</option>
                    <option value="Sữa">Sữa</option>
                    <option value="Bánh kẹo">Bánh kẹo</option>
                    <option value="Gia vị">Gia vị</option>
                  </select>
                </div>

                <div>
                  <Label>Thuế <span className="text-red-600">*</span></Label>
                  <select
                    name="tax"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    value={formData.tax}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Chọn loại thuế</option>
                    <option value="10%">10%</option>
                    <option value="5%">5%</option>
                    <option value="0%">0%</option>
                  </select>
                </div>

                <div>
                  <Label>Thương hiệu</Label>
                  <Input
                    className="text-md bg-gray-200 border border-gray-200 rounded-lg"
                    placeholder="Nhập tên thương hiệu"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label>Mô tả sản phẩm</Label>
                  <Textarea
                    className="text-md bg-gray-200 border border-gray-200 rounded-lg"
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
            <Card className="border border-gray-300 rounded-lg bg-white flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Hình ảnh sản phẩm</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 space-y-4">
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
                    className={`flex-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
                      isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600">Kéo thả hoặc click để tải ảnh lên</p>
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
                    className={`flex-1 min-h-0 border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer ${
                      isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    <div className="auto-rows-min">
                      {images.map((img, index) => (
                        <div key={index} className="relative group aspect-square">
                          <img
                            src={img.preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(index);
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                  variant="secondary"
                  className="w-full"
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
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Lưu thay đổi
            </Button>
            <Button type="button" variant="danger" className="w-full" onClick={onClose}>
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProductModal;
