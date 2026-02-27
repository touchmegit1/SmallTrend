import { useState, useRef } from "react";
import { ArrowLeft, Save, Image as ImageIcon, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ProductComponents/card";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import { Label } from "../ProductComponents/label";
import { useNavigate, useLocation } from "react-router-dom";

const AddNewProductVariant = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product;
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    variant_name: "",
    sku: "",
    barcode: "",
    cost: "",
    retail_price: "",
    stock: "",
    is_active: true,
    attributes: [{ key: "", value: "" }],
  });
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAttributeChange = (index, field, value) => {
    const newAttributes = [...formData.attributes];
    newAttributes[index][field] = value;
    setFormData((prev) => ({ ...prev, attributes: newAttributes }));
  };

  const addAttribute = () => {
    setFormData((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { key: "", value: "" }],
    }));
  };

  const removeAttribute = (index) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = (files) => {
    const newImages = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
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
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/products/detail/${product.id}`, {
      state: { 
        product,
        message: "Thêm biến thể thành công!" 
      },
    });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(`/products/detail/${product.id}`, { state: { product } })}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Thêm biến thể mới</h1>
          <p className="text-gray-500 mt-1">Sản phẩm gốc: {product.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT */}
          <Card className="border border-gray-300 rounded-lg bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Thông tin biến thể</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tên biến thể <span className="text-red-600">*</span></Label>
                <Input
                  className="text-md bg-gray-200 border border-gray-200 rounded-lg"
                  placeholder="VD: Hộp 500g, Lon 250ml"
                  name="variant_name"
                  value={formData.variant_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>SKU <span className="text-red-600">*</span></Label>
                  <Input
                    className="text-md bg-gray-200 border border-gray-200 rounded-lg"
                    placeholder="SKU-00000001"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label>Barcode</Label>
                  <Input
                    className="text-md bg-gray-200 border border-gray-200 rounded-lg"
                    placeholder="8934580000001"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Giá vốn <span className="text-red-600">*</span></Label>
                  <Input
                    type="number"
                    className="text-md bg-gray-200 border border-gray-200 rounded-lg"
                    placeholder="78000"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label>Giá bán <span className="text-red-600">*</span></Label>
                  <Input
                    type="number"
                    className="text-md bg-gray-200 border border-gray-200 rounded-lg"
                    placeholder="93000"
                    name="retail_price"
                    value={formData.retail_price}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Tồn kho ban đầu <span className="text-red-600">*</span></Label>
                <Input
                  type="number"
                  className="text-md bg-gray-200 border border-gray-200 rounded-lg"
                  placeholder="100"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Trạng thái</Label>
                <select
                  name="is_active"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  value={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                >
                  <option value="true">Đang bán</option>
                  <option value="false">Ngưng bán</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Thuộc tính</Label>
                  <Button variant="warning" type="button" size="sm" onClick={addAttribute}>
                    <Plus className="w-4 h-4 mr-1" />
                    Thêm
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.attributes.map((attr, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        className="text-md bg-gray-200 border border-gray-200 rounded-lg"
                        placeholder="VD: Kích thước"
                        value={attr.key}
                        onChange={(e) => handleAttributeChange(index, "key", e.target.value)}
                      />
                      <Input
                        className="text-md bg-gray-200 border border-gray-200 rounded-lg"
                        placeholder="VD: 500ml"
                        value={attr.value}
                        onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
                      />
                      {formData.attributes.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttribute(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RIGHT */}
          <Card className="border border-gray-300 rounded-lg bg-white flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Hình ảnh biến thể</CardTitle>
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
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
                    isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-500"
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
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex-1 min-h-0 border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer ${
                    isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-500"
                  }`}
                >
                  <div className="">
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
        <CardContent className="justify-center p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Lưu biến thể
            </Button>
            <Button
              type="button"
              variant="danger"
              className="w-full"
              onClick={() => navigate(`/products/detail/${product.id}`, { state: { product } })}
            >
              Hủy
            </Button>
          </div>
        </CardContent>
      </form>
    </div>
  );
};

export default AddNewProductVariant;
