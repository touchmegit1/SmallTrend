import { useState, useRef } from "react";
import { ArrowLeft, Save, Image as ImageIcon, X, Upload, Plus, Trash, Zap, Barcode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ProductComponents/card";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import { Label } from "../ProductComponents/label";
import { useNavigate, useLocation } from "react-router-dom";
import { useFetchUnits } from "../../../hooks/product_variants";
import api from "../../../config/axiosConfig";

// Màn hình Thêm mới một Variant (Sản phẩm biến thể)
// Cho phép khai báo SKU, Barcode, PLU Code, đơn vị, giá bán và hình ảnh
const AddNewProductVariant = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product;

  const { units, loading: unitsLoading } = useFetchUnits();

  const [formData, setFormData] = useState({
    sku: "",
    barcode: "",
    plu_code: "",
    unit_id: "",
    cost_price: "",
    sell_price: "",
    is_active: product?.is_active === false ? false : true,
  });
  const [attributes, setAttributes] = useState([]); // [{ name: "", value: "" }]
  const [conversions, setConversions] = useState([]); // [{ toUnitId: "", conversionFactor: "", sellPrice: "", isActive: true }]
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [generatingSku, setGeneratingSku] = useState(false);
  const [generatingBarcode, setGeneratingBarcode] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Xử lý đọc file ảnh cục bộ dưới dạng DateURL để hiển thị Preview
  const handleImageSelect = (file) => {
    if (file) {
      if (!file.type.startsWith("image/")) {
        console.error("File is not an image.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImageFile(file);
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
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Hàm đẩy ảnh dạng Binary Form-data lên Server và nhận link URL trả về
  const uploadImage = async () => {
    if (!imageFile) return null;
    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", imageFile);
    try {
      const response = await api.post("/upload/image", formData, {
        headers: { "Content-Type": undefined },
      });
      return response.data.url;
    } catch (error) {
      console.error("Lỗi upload ảnh:", error);
      throw new Error("Không thể upload ảnh");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "sku") {
      // Auto uppercase, no spaces, words separated by dash
      setFormData((prev) => ({ ...prev, [name]: value.toUpperCase().replace(/\s+/g, "-") }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddAttribute = () => {
    setAttributes([...attributes, { name: "", value: "" }]);
  };

  const handleRemoveAttribute = (index) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const handleChangeAttribute = (index, field, value) => {
    const newAttrs = [...attributes];
    newAttrs[index][field] = value;
    setAttributes(newAttrs);
  };

  const handleAddConversion = () => {
    setConversions([...conversions, { toUnitId: "", conversionFactor: "", sellPrice: "", isActive: true }]);
  };

  const handleRemoveConversion = (index) => {
    setConversions(conversions.filter((_, i) => i !== index));
  };

  const handleChangeConversion = (index, field, value) => {
    const newConvs = [...conversions];
    newConvs[index][field] = value;
    setConversions(newConvs);
  };

  // ─── Generate SKU ──────────────────────────────────────────────────
  const handleGenerateSku = async () => {
    if (!product?.id) return;
    setGeneratingSku(true);
    try {
      const params = {};
      if (formData.unit_id) params.unitId = formData.unit_id;
      const res = await api.get(`/products/${product.id}/generate-sku`, { params });
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
    if (!product?.id) return;
    setGeneratingBarcode(true);
    try {
      const res = await api.get(`/products/${product.id}/generate-barcode`);
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

    // Barcode: optional but must be 12-13 digits if provided
    if (formData.barcode.trim() && !/^\d{12,13}$/.test(formData.barcode.trim())) {
      setErrorMsg("Barcode phải gồm 12-13 chữ số.");
      return false;
    }
    // PLU: optional but must be 4-5 digits if provided
    if (formData.plu_code.trim() && !/^\d{4,5}$/.test(formData.plu_code.trim())) {
      setErrorMsg("Mã PLU phải gồm 4-5 chữ số.");
      return false;
    }
    return true;
  };

  // Hàm Submit: Tiến hành Upload image (nếu có) trước rồi lấy URL đính vào payload Variant để Post tạo mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (saving) return;
    if (!validateForm()) return;

    setSaving(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const attributesMap = {};
      attributes.forEach((attr) => {
        if (attr.name.trim() && attr.value.trim()) {
          attributesMap[attr.name.trim()] = attr.value.trim();
        }
      });

      const response = await api.post(`/products/${product.id}/variants`, {
        sku: formData.sku,
        barcode: formData.barcode || null,
        pluCode: formData.plu_code || null,
        unitId: parseInt(formData.unit_id),
        costPrice: formData.cost_price ? parseFloat(formData.cost_price) : null,
        sellPrice: formData.sell_price ? parseFloat(formData.sell_price) : 0,
        imageUrl: imageUrl,
        isActive: formData.is_active,
        attributes: Object.keys(attributesMap).length > 0 ? attributesMap : null,
      });

      const variantId = response.data?.id || response.data?.data?.id; // Fallback for diff API responses

      if (variantId && conversions.length > 0) {
        const validConversions = conversions.filter((c) => c.toUnitId && c.conversionFactor);
        if (validConversions.length > 0) {
          await Promise.all(
            validConversions.map((c) =>
              api.post(`/products/variants/${variantId}/conversions`, {
                toUnitId: parseInt(c.toUnitId),
                conversionFactor: parseFloat(c.conversionFactor),
                sellPrice: 0,
                isActive: c.isActive,
                description: "Quy đổi đơn vị"
              })
            )
          );
        }
      }

      navigate(`/products/detail/${product.id}`, {
        state: {
          product,
          message: "Thêm biến thể thành công!",
        },
      });
    } catch (err) {
      console.error("Error creating variant:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Lỗi khi thêm biến thể!";
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
    const activeAttributes = attributes.filter(attr => attr.name.trim() && attr.value.trim());
    if (activeAttributes.length > 0) {
      name += " - " + activeAttributes.map(attr => attr.value.trim()).join(" - ");
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
              Sản phẩm gốc:{" "}
              <span className="font-semibold">{product.name}</span>
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
                    Mã sản phẩm & Thông tin cơ bản
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-6 flex-1">

                  {/* ── SKU Field with Generate Button ── */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">
                      SKU (Mã nội bộ) <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-xs text-gray-400 mb-1">Mã quản lý tồn kho nội bộ cửa hàng. VD: BEV-COCA-COLA-330ML</p>
                    <div className="flex gap-2">
                      <Input
                        className="flex-1 h-11 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono uppercase tracking-wider"
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
                        className="h-11 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-medium text-sm flex items-center gap-2 whitespace-nowrap shadow-md shadow-emerald-200/50 transition-all"
                      >
                        <Zap className="w-4 h-4" />
                        {generatingSku ? "Đang tạo..." : "Tạo SKU"}
                      </Button>
                    </div>
                  </div>

                  {/* ── Barcode Field with Generate Button ── */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">
                      Barcode (Mã vạch)
                    </Label>
                    <p className="text-xs text-gray-400 mb-1">
                      Nhập barcode nhà sản xuất (EAN-13) hoặc tạo mã nội bộ. 12-13 chữ số.
                    </p>
                    <div className="flex gap-2">
                      <Input
                        className="flex-1 h-11 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono tracking-widest"
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
                        className="h-11 px-4 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-xl font-medium text-sm flex items-center gap-2 whitespace-nowrap shadow-md shadow-violet-200/50 transition-all"
                      >
                        <Barcode className="w-4 h-4" />
                        {generatingBarcode ? "Đang tạo..." : "Tạo Barcode"}
                      </Button>
                    </div>
                  </div>

                  {/* ── PLU Code (Optional) ── */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">
                      PLU Code (Mã sản phẩm tươi sống)
                    </Label>
                    <p className="text-xs text-gray-400 mb-1">
                      Dùng cho sản phẩm bán theo cân (rau, trái cây...). 4-5 chữ số. VD: 4011 (Chuối)
                    </p>
                    <Input
                      className="h-11 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono w-48"
                      placeholder="VD: 4011"
                      name="plu_code"
                      value={formData.plu_code}
                      onChange={handleChange}
                      maxLength={5}
                    />
                  </div>

                  <div className="border-t border-gray-100 pt-4" />

                  <div className="border-t border-gray-100 pt-4" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                      <Label className="text-sm font-semibold text-gray-700">
                        Trạng thái
                      </Label>
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
                        {product?.is_active !== false && (
                          <option value="true">Đang hoạt động</option>
                        )}
                        <option value="false">Ngừng hoạt động</option>
                      </select>
                      {product?.is_active === false && (
                        <p className="text-xs text-red-500 mt-1">
                          Sản phẩm gốc đang ngừng hoạt động, không thể tạo biến
                          thể kích hoạt.
                        </p>
                      )}
                    </div>
                  </div>

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
                      <div className="space-y-3">
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

                  {/* DYNAMIC CONVERSIONS */}
                  <div className="pt-4 border-t border-gray-100 mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <Label className="text-sm font-semibold text-gray-700">Quy đổi đơn vị</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleAddConversion}
                        className="h-8 text-xs bg-green-50 text-green-700 hover:bg-green-100 rounded-lg px-2 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Thêm quy đổi
                      </Button>
                    </div>
                    {conversions.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Có thể thêm các đơn vị quy đổi (VD: Hộp, Thùng...)</p>
                    ) : (
                      <div className="space-y-4">
                        {conversions.map((conv, index) => (
                          <div key={index} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex gap-3 items-start">
                              <div className="flex-1">
                                <Label className="text-xs text-gray-500 mb-1 block">Đơn vị đích</Label>
                                <select
                                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl bg-white"
                                  value={conv.toUnitId}
                                  onChange={(e) => handleChangeConversion(index, "toUnitId", e.target.value)}
                                >
                                  <option value="">Chọn đơn vị</option>
                                  {units
                                    .filter(u => u.id !== parseInt(formData.unit_id)) // Lọc bỏ đơn vị chính
                                    .map((unit) => (
                                      <option key={unit.id} value={unit.id}>{unit.name} ({unit.code})</option>
                                    ))}
                                </select>
                              </div>
                              <div className="flex-1">
                                <Label className="text-xs text-gray-500 mb-1 block">Tỷ lệ quy đổi</Label>
                                <Input
                                  type="number"
                                  step="any"
                                  placeholder="VD: 10"
                                  className="h-10 text-sm border-gray-200 rounded-xl"
                                  title="1 Đơn vị đích bằng bao nhiêu Đơn vị cơ bản"
                                  value={conv.conversionFactor}
                                  onChange={(e) => handleChangeConversion(index, "conversionFactor", e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="flex gap-3 items-end">

                              <div className="flex-1 mb-2">
                                <label className="flex items-center gap-2 cursor-pointer mt-2 text-sm text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={conv.isActive}
                                    onChange={(e) => handleChangeConversion(index, "isActive", e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                  />
                                  <span>Kích hoạt</span>
                                </label>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => handleRemoveConversion(index)}
                                className="h-10 w-10 p-0 text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200"
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
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
                        style={{ minHeight: "300px" }}
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
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          fileInputRef.current?.click();
                        }
                      }}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${isDragging
                        ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 scale-[1.02]"
                        : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/30"
                        }`}
                      style={{ minHeight: "300px" }}
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

                  {/* Product Code Summary Card */}
                  {(formData.sku || formData.barcode || formData.plu_code) && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-gray-200">
                      <p className="text-sm font-bold text-gray-700 mb-3">📦 Tổng kết mã sản phẩm</p>
                      <div className="space-y-2">
                        {formData.sku && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">SKU</span>
                            <span className="font-mono text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">{formData.sku}</span>
                          </div>
                        )}
                        {formData.barcode && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Barcode</span>
                            <span className="font-mono text-sm font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-lg">{formData.barcode}</span>
                          </div>
                        )}
                        {formData.plu_code && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">PLU</span>
                            <span className="font-mono text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">{formData.plu_code}</span>
                          </div>
                        )}
                      </div>
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
              variant="danger"
              className="w-full h-12 border-2 border-red-200 text-red-600 hover:bg-red-400 hover:text-red-800 rounded-xl font-bold flex items-center justify-center"
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
      </div >
    </div >
  );
};

export default AddNewProductVariant;
