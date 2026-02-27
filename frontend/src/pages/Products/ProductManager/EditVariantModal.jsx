import { useState, useEffect, useRef } from "react";
import { X, Save, Image as ImageIcon, Upload } from "lucide-react";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import { Label } from "../ProductComponents/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ProductComponents/card";
import { useFetchUnits } from "../../../hooks/product_variants";
import api from "../../../config/axiosConfig";

export function EditVariantModal({ variant, parentProduct, isOpen, onClose, onSave }) {
  const { units, loading: unitsLoading } = useFetchUnits();

  const [formData, setFormData] = useState({
    sku: "",
    barcode: "",
    unit_id: "",
    unit_value: "",
    sell_price: "",
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (variant && isOpen) {
      setFormData({
        sku: variant.sku || "",
        barcode: variant.barcode || "",
        unit_id: variant.unit_id ? String(variant.unit_id) : "",
        unit_value: variant.unit_value != null ? String(variant.unit_value) : "",
        sell_price: variant.sell_price != null ? String(variant.sell_price) : "",
        is_active: parentProduct?.is_active === false ? false : (variant.is_active ?? true),
      });
      setImageFile(null);
      setImagePreview(variant.image_url ? (variant.image_url.startsWith('http') ? variant.image_url : `http://localhost:8081${variant.image_url.startsWith('/') ? '' : '/'}${variant.image_url}`) : null);
      setErrorMsg("");
    }
  }, [variant, isOpen, parentProduct]);

  if (!isOpen) return null;

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

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
        // Return full path without localhost URL to save on DB
        if (imageUrl) imageUrl = imageUrl.replace("http://localhost:8081", "");
      } else if (imagePreview) {
        // Keep the old image
        imageUrl = variant.image_url;
      }

      await api.put(`/products/variants/${variant.id}`, {
        sku: formData.sku,
        barcode: formData.barcode || null,
        unitId: parseInt(formData.unit_id),
        unitValue: formData.unit_value ? parseFloat(formData.unit_value) : null,
        sellPrice: parseFloat(formData.sell_price),
        imageUrl: imageUrl,
        isActive: formData.is_active,
      });

      onSave({
        ...variant,
        sku: formData.sku,
        barcode: formData.barcode,
        unit_id: parseInt(formData.unit_id),
        unit_value: formData.unit_value ? parseFloat(formData.unit_value) : null,
        sell_price: parseFloat(formData.sell_price),
        image_url: imageUrl,
        is_active: formData.is_active,
      });
    } catch (err) {
      console.error("Error updating variant:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Lỗi khi cập nhật biến thể!";
      setErrorMsg(typeof msg === "string" ? msg : "Lỗi khi cập nhật biến thể!");
    } finally {
      setSaving(false);
    }
  };

  // Get selected unit for preview
  const selectedUnit = units.find((u) => u.id === parseInt(formData.unit_id));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Chỉnh sửa biến thể</h2>
            <p className="text-gray-500 text-sm mt-1">
              Cập nhật thông tin biến thể sản phẩm
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {errorMsg && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-6 py-4">
              <span className="text-red-700 font-medium">{errorMsg}</span>
            </div>
          )}

          <Card className="border border-gray-300 rounded-lg bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Thông tin biến thể
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>
                    SKU <span className="text-red-600">*</span>
                  </Label>
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
                  <Label>
                    Đơn vị <span className="text-red-600">*</span>
                  </Label>
                  <select
                    name="unit_id"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-md"
                    value={formData.unit_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Chọn đơn vị --</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Giá trị đơn vị</Label>
                  <Input
                    type="number"
                    step="any"
                    className="text-md bg-gray-200 border border-gray-200 rounded-lg"
                    placeholder="VD: 500"
                    name="unit_value"
                    value={formData.unit_value}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    VD: 500 (ml), 1 (kg), 250 (g)
                  </p>
                </div>
              </div>

              <div>
                <Label>
                  Giá bán <span className="text-red-600">*</span>
                </Label>
                <Input
                  type="number"
                  step="any"
                  className="text-md bg-gray-200 border border-gray-200 rounded-lg"
                  placeholder="93000"
                  name="sell_price"
                  value={formData.sell_price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Trạng thái</Label>
                <select
                  name="is_active"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white disabled:bg-gray-100 disabled:text-gray-500"
                  value={formData.is_active}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_active: e.target.value === "true",
                    }))
                  }
                  disabled={parentProduct?.is_active === false}
                >
                  <option value="true">Đang bán</option>
                  <option value="false">Ngưng bán</option>
                </select>
                {parentProduct?.is_active === false && (
                  <p className="text-xs text-red-500 mt-1">
                    Sản phẩm gốc đang ngừng hoạt động, không thể kích hoạt biến thể.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card className="border border-gray-300 rounded-lg bg-white mt-4">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Hình ảnh biến thể</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden group border border-gray-200" style={{ height: '300px' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain bg-gray-50"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
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
                  className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${isDragging
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 scale-[1.02]'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
                    }`}
                  style={{ height: '300px' }}
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4">
                    <ImageIcon className="w-10 h-10 text-blue-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Kéo thả hoặc click để tải ảnh lên
                  </p>
                  <p className="text-xs text-gray-500">Hỗ trợ JPG, PNG, GIF</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={saving || uploadingImage}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving || uploadingImage ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
            <Button
              type="button"
              variant="danger"
              className="w-full"
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

export default EditVariantModal;
