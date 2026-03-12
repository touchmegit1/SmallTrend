import { useState, useEffect, useRef } from "react";
import { X, Save, Image as ImageIcon, Upload, Plus, Trash, Zap, Barcode } from "lucide-react";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import { Label } from "../ProductComponents/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ProductComponents/card";
import UnitConversionSection from "./UnitConversionSection";
import { useFetchUnits } from "../../../hooks/product_variants";
import api from "../../../config/axiosConfig";

// Modal Component hiển thị thông tin và cho phép Chỉnh sửa một Variant (Loại sản phẩm)
// Cho phép update SKU, Barcode, PLU Code, giá bán, hình ảnh...
export function EditVariantModal({ variant, parentProduct, isOpen, onClose, onSave }) {
  const { units, loading: unitsLoading } = useFetchUnits();

  const [formData, setFormData] = useState({
    sku: "",
    barcode: "",
    plu_code: "",
    unit_id: "",
    cost_price: "",
    sell_price: "",
    is_active: true,
  });
  const [attributes, setAttributes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [generatingSku, setGeneratingSku] = useState(false);
  const [generatingBarcode, setGeneratingBarcode] = useState(false);

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
        plu_code: variant.plu_code || "",
        unit_id: variant.unit_id ? String(variant.unit_id) : "",
        cost_price:
          variant.costPrice != null ? String(variant.costPrice) : variant.cost_price != null ? String(variant.cost_price) : "",
        sell_price:
          variant.sellPrice != null ? String(variant.sellPrice) : variant.sell_price != null ? String(variant.sell_price) : "",
        is_active:
          parentProduct?.is_active === false
            ? false
            : (variant.is_active ?? true),
      });
      setImageFile(null);
      setImagePreview(
        variant.image_url
          ? variant.image_url.startsWith("http")
            ? variant.image_url
            : `http://localhost:8081${variant.image_url.startsWith("/") ? "" : "/"}${variant.image_url}`
          : null,
      );
      setErrorMsg("");

      const attrsObj = variant.attributes || {};
      const attrsArr = Object.keys(attrsObj).map(key => ({ name: key, value: attrsObj[key] }));
      setAttributes(attrsArr);
    }
  }, [variant, isOpen, parentProduct]);

  if (!isOpen) return null;

  // Get productId from variant for API calls
  const productId = parentProduct?.id || variant?.product_id;

  // Xử lý tạo URL Preview cho file ảnh được người dùng chọn
  const handleImageSelect = (file) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Catcher khi người dùng click vào ô input file ẩn
  const handleFileSelect = (e) => {
    if (e.target.files?.[0]) {
      handleImageSelect(e.target.files[0]);
    }
  };

  // Sự kiện Kéo và Thả ảnh
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

  // Gỡ ảnh hiện tại
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Tải ảnh lên Server (nếu có update) thông qua /upload/image để lấy URL mới trả về
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

  // Update state mỗi khi giá trị các field đổi
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "sku") {
      setFormData((prev) => ({ ...prev, [name]: value.toUpperCase().replace(/\s+/g, "-") }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddAttribute = () => setAttributes([...attributes, { name: "", value: "" }]);
  const handleRemoveAttribute = (index) => setAttributes(attributes.filter((_, i) => i !== index));
  const handleChangeAttribute = (index, field, value) => {
    const newAttrs = [...attributes];
    newAttrs[index][field] = value;
    setAttributes(newAttrs);
  };

  // ─── Generate SKU ──────────────────────────────────────────────────
  const handleGenerateSku = async () => {
    if (!productId) return;
    setGeneratingSku(true);
    try {
      const params = {};
      if (formData.unit_id) params.unitId = formData.unit_id;
      const res = await api.get(`/products/${productId}/generate-sku`, { params });
      setFormData((prev) => ({ ...prev, sku: res.data.sku }));
    } catch (err) {
      console.error("Error generating SKU:", err);
      setErrorMsg("Không thể tạo mã SKU tự động.");
    } finally {
      setGeneratingSku(false);
    }
  };

  // ─── Generate Internal Barcode ─────────────────────────────────────
  const handleGenerateBarcode = async () => {
    if (!productId) return;
    setGeneratingBarcode(true);
    try {
      const res = await api.get(`/products/${productId}/generate-barcode`);
      setFormData((prev) => ({ ...prev, barcode: res.data.barcode }));
    } catch (err) {
      console.error("Error generating barcode:", err);
      setErrorMsg("Không thể tạo mã Barcode nội bộ.");
    } finally {
      setGeneratingBarcode(false);
    }
  };

  // ─── Client-side Validation ────────────────────────────────────────
  const validateForm = () => {
    if (!formData.sku.trim()) {
      setErrorMsg("SKU là bắt buộc. Vui lòng nhập hoặc tạo mã SKU.");
      return false;
    }
    if (!formData.unit_id) {
      setErrorMsg("Vui lòng chọn đơn vị");
      return false;
    }

    if (formData.barcode.trim() && !/^\d{12,13}$/.test(formData.barcode.trim())) {
      setErrorMsg("Barcode phải gồm 12-13 chữ số.");
      return false;
    }
    if (formData.plu_code.trim() && !/^\d{4,5}$/.test(formData.plu_code.trim())) {
      setErrorMsg("Mã PLU phải gồm 4-5 chữ số.");
      return false;
    }
    return true;
  };

  // Hàm xác nhận Cập nhật thông tin Variant hiện tại
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setErrorMsg("");

    if (!validateForm()) return;

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

      const attributesMap = {};
      attributes.forEach((attr) => {
        if (attr.name.trim() && attr.value.trim()) {
          attributesMap[attr.name.trim()] = attr.value.trim();
        }
      });

      await api.put(`/products/variants/${variant.id}`, {
        sku: formData.sku,
        barcode: formData.barcode || null,
        pluCode: formData.plu_code || null,
        unitId: parseInt(formData.unit_id),
        costPrice: null,
        sellPrice: 0,
        imageUrl: imageUrl,
        isActive: formData.is_active,
        attributes: Object.keys(attributesMap).length > 0 ? attributesMap : null,
      });

      onSave({
        ...variant,
        sku: formData.sku,
        barcode: formData.barcode,
        plu_code: formData.plu_code,
        unit_id: parseInt(formData.unit_id),
        costPrice: null,
        sellPrice: 0,
        sell_price: 0,
        image_url: imageUrl,
        is_active: formData.is_active,
        attributes: Object.keys(attributesMap).length > 0 ? attributesMap : null,
      });
    } catch (err) {
      console.error("Error updating variant:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Lỗi khi cập nhật loại sản phẩm!";
      setErrorMsg(typeof msg === "string" ? msg : "Lỗi khi cập nhật loại sản phẩm!");
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
            <h2 className="text-2xl font-bold">Chỉnh sửa loại sản phẩm</h2>
            <p className="text-gray-500 text-sm mt-1">
              Cập nhật thông tin loại sản phẩm sản phẩm
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
                Mã sản phẩm & Thông tin loại sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* ── SKU Field with Generate Button ── */}
              <div>
                <Label>
                  SKU (Mã nội bộ) <span className="text-red-600">*</span>
                </Label>
                <p className="text-xs text-gray-400 mb-1">Mã quản lý tồn kho. VD: BEV-COCA-COLA-330ML</p>
                <div className="flex gap-2">
                  <Input
                    className="flex-1 text-md bg-gray-200 border border-gray-200 rounded-lg font-mono uppercase tracking-wider"
                    placeholder="VD: BEV-COCA-COLA-330ML"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    required
                  />
                  <Button
                    type="button"
                    onClick={handleGenerateSku}
                    disabled={generatingSku}
                    className="px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg font-medium text-sm flex items-center gap-1 whitespace-nowrap"
                  >
                    <Zap className="w-4 h-4" />
                    {generatingSku ? "..." : "Tạo SKU"}
                  </Button>
                </div>
              </div>

              {/* ── Barcode Field with Generate Button ── */}
              <div>
                <Label>Barcode (Mã vạch)</Label>
                <p className="text-xs text-gray-400 mb-1">Nhập EAN-13 nhà SX hoặc tạo mã nội bộ (20xxxx). 12-13 chữ số.</p>
                <div className="flex gap-2">
                  <Input
                    className="flex-1 text-md bg-gray-200 border border-gray-200 rounded-lg font-mono tracking-widest"
                    placeholder="VD: 8938505974192"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    maxLength={13}
                  />
                  <Button
                    type="button"
                    onClick={handleGenerateBarcode}
                    disabled={generatingBarcode}
                    className="px-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-lg font-medium text-sm flex items-center gap-1 whitespace-nowrap"
                  >
                    <Barcode className="w-4 h-4" />
                    {generatingBarcode ? "..." : "Tạo Barcode"}
                  </Button>
                </div>
              </div>

              {/* ── PLU Code (Optional) ── */}
              <div>
                <Label>PLU Code (Mã sản phẩm tươi sống)</Label>
                <p className="text-xs text-gray-400 mb-1">Dùng cho sản phẩm bán theo cân. 4-5 chữ số. VD: 4011 (Chuối)</p>
                <Input
                  className="text-md bg-gray-200 border border-gray-200 rounded-lg font-mono w-48"
                  placeholder="VD: 4011"
                  name="plu_code"
                  value={formData.plu_code}
                  onChange={handleChange}
                  maxLength={5}
                />
              </div>

              <div className="border-t border-gray-100 pt-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>
                    Đơn vị <span className="text-red-600">*</span>
                  </Label>
                  <select
                    name="unit_id"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                      Sản phẩm gốc đang ngừng hoạt động, không thể kích hoạt loại sản phẩm.
                    </p>
                  )}
                </div>
              </div>

              {/* Product Code Summary */}
              {(formData.sku || formData.barcode || formData.plu_code) && (
                <div className="p-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm font-bold text-gray-700 mb-2">📦 Tổng kết mã sản phẩm</p>
                  <div className="space-y-1">
                    {formData.sku && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">SKU</span>
                        <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{formData.sku}</span>
                      </div>
                    )}
                    {formData.barcode && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Barcode</span>
                        <span className="font-mono text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">{formData.barcode}</span>
                      </div>
                    )}
                    {formData.plu_code && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">PLU</span>
                        <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{formData.plu_code}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* DYNAMIC ATTRIBUTES */}
              <div className="pt-4 border-t border-gray-100 mt-4">
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-sm font-semibold text-gray-700">Thuộc tính mở rộng</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleAddAttribute}
                    className="h-8 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg px-2 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Thêm thuộc tính
                  </Button>
                </div>
                {attributes.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Có thể thêm kích cỡ (Size), hương vị (Flavor), mầu sắc (Color)...</p>
                ) : (
                  <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                    {attributes.map((attr, index) => (
                      <div key={index} className="flex gap-3 items-start animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex-1">
                          <Input
                            placeholder="Tên thuộc tính (VD: Hương vị)"
                            className="h-10 text-sm border-gray-200 rounded-xl"
                            value={attr.name}
                            onChange={(e) => handleChangeAttribute(index, "name", e.target.value)}
                          />
                        </div>
                        <div className="flex-1">
                          <Input
                            placeholder="Giá trị (VD: Dâu tây)"
                            className="h-10 text-sm border-gray-200 rounded-xl"
                            value={attr.value}
                            onChange={(e) => handleChangeAttribute(index, "value", e.target.value)}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleRemoveAttribute(index)}
                          className="h-10 w-10 p-0 text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card className="border border-gray-300 rounded-lg bg-white mt-4">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Hình ảnh loại sản phẩm</CardTitle>
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
                <div
                  className="relative rounded-2xl overflow-hidden group border border-gray-200"
                  style={{ height: "300px" }}
                >
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
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${isDragging
                    ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 scale-[1.02]"
                    : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/30"
                    }`}
                  style={{ height: "300px" }}
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

          {/* Unit Conversions - Inline Management */}
          {variant && (
            <Card className="border border-gray-300 rounded-lg bg-white mt-4">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Quy đổi đơn vị</CardTitle>
              </CardHeader>
              <CardContent>
                <UnitConversionSection
                  variant={variant}
                  product={parentProduct}
                  units={units}
                  onSuccess={() => { /* nothing to do, state is handled internally */ }}
                />
              </CardContent>
            </Card>
          )}

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
