import { useState, useEffect, useRef } from "react";
import { X, Save, Plus, Search, Image as ImageIcon, Upload, Loader2 } from "lucide-react";
import Button from "../../../components/product/button";
import { Input } from "../../../components/product/input";
import { Label } from "../../../components/product/label";
import { Textarea } from "../../../components/product/textarea";
import axios from "../../../config/axiosConfig";

// Modal Popup dùng chung để sửa thông tin của một Combo đã tồn tại
// Nhận vào state combo được chọn từ component cha và gọi hàm onSave khi hoàn thành
const EditComboModal = ({ combo, combos = [], isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    comboName: "",
    description: "",
    comboPrice: "",
    discountPercent: "",
    isActive: true,
  });
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [availableVariants, setAvailableVariants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showVariantPicker, setShowVariantPicker] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [discountMode, setDiscountMode] = useState("percent");
  const [discountAmountInput, setDiscountAmountInput] = useState("");

  // Thêm state upload image
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (combo) {
      const comboPrice = Number(combo.comboPrice) || 0;
      const originalPrice = Number(combo.originalPrice) || 0;
      const initialDiscountPercent =
        originalPrice > 0 && comboPrice >= 0
          ? Number((((originalPrice - comboPrice) / originalPrice) * 100).toFixed(2))
          : 0;
      const initialDiscountAmount =
        originalPrice > 0 && comboPrice >= 0
          ? Number((originalPrice - comboPrice).toFixed(2))
          : 0;

      setFormData({
        comboName: combo.comboName || "",
        description: combo.description || "",
        comboPrice: combo.comboPrice || "",
        discountPercent: initialDiscountPercent.toString(),
        isActive: combo.isActive !== undefined ? combo.isActive : true,
      });
      setDiscountMode("percent");
      setDiscountAmountInput(initialDiscountAmount > 0 ? initialDiscountAmount.toString() : "");
      setErrorMsg("");
      setSearchQuery("");
      setShowVariantPicker(false);
      if (combo.items && Array.isArray(combo.items)) {
        const initialVariants = combo.items.map(item => ({
          id: item.productVariantId || item.id,
          name: item.productVariantName || item.name,
          sku: item.sku,
          sellPrice: Number(item.sellPrice) || 0,
          costPrice: Number(item.costPrice) || 0,
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
    setErrorMsg("");
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
    setErrorMsg("");
    setSelectedVariants(selectedVariants.filter((v) => v.id !== variantId));
  };

  const updateQuantity = (variantId, quantity) => {
    if (quantity < 1) return;
    setErrorMsg("");
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hàm cập nhật state nội bộ khi người dùng gõ vào form chỉnh sửa
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setErrorMsg("");
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const syncDiscountFromComboPrice = (comboPriceValue) => {
    const parsedComboPrice = Number(comboPriceValue);
    if (!Number.isFinite(parsedComboPrice) || parsedComboPrice <= 0 || totalPrice <= 0) {
      return "";
    }
    const roundedPrice = Math.round(parsedComboPrice / 100) * 100;
    const rawDiscountPercent = ((totalPrice - roundedPrice) / totalPrice) * 100;
    const clampedDiscountPercent = Math.min(99.99, Math.max(0.01, rawDiscountPercent));
    return Number(clampedDiscountPercent.toFixed(2)).toString();
  };

  const syncDiscountAmountFromComboPrice = (comboPriceValue) => {
    const parsedComboPrice = Number(comboPriceValue);
    if (!Number.isFinite(parsedComboPrice) || parsedComboPrice <= 0 || totalPrice <= 0) {
      return "";
    }
    const roundedPrice = Math.round(parsedComboPrice / 100) * 100;
    const amount = totalPrice - roundedPrice;
    if (!Number.isFinite(amount) || amount <= 0) {
      return "";
    }
    return Number(amount.toFixed(2)).toString();
  };

  const applyDiscountAmountToComboPrice = (discountAmountValue) => {
    const parsedDiscountAmount = Number(discountAmountValue);
    if (!Number.isFinite(parsedDiscountAmount)) {
      return { comboPrice: formData.comboPrice, discountPercent: formData.discountPercent };
    }

    const clampedDiscountAmount = Math.min(totalPrice - 1, Math.max(1, parsedDiscountAmount));
    const comboPriceByAmount = totalPrice > 0
      ? Math.round((totalPrice - clampedDiscountAmount) / 100) * 100
      : 0;
    const normalizedComboPrice = totalPrice > 0 ? comboPriceByAmount.toString() : "";

    return {
      comboPrice: normalizedComboPrice,
      discountPercent: syncDiscountFromComboPrice(normalizedComboPrice),
    };
  };

  const toggleDiscountMode = () => {
    setErrorMsg("");
    setDiscountMode((prevMode) => {
      const nextMode = prevMode === "percent" ? "amount" : "percent";
      if (nextMode === "amount") {
        setDiscountAmountInput(syncDiscountAmountFromComboPrice(formData.comboPrice));
      }
      return nextMode;
    });
  };

  const handleDiscountAmountChange = (e) => {
    const value = e.target.value;
    setErrorMsg("");
    setDiscountAmountInput(value);

    if (value === "") {
      setFormData((prev) => ({ ...prev, discountPercent: "", comboPrice: "" }));
      return;
    }

    if (totalPrice <= 0) {
      setFormData((prev) => ({ ...prev, comboPrice: "", discountPercent: "" }));
      return;
    }

    const parsedDiscountAmount = Number(value);
    if (!Number.isFinite(parsedDiscountAmount)) {
      return;
    }

    const { comboPrice, discountPercent } = applyDiscountAmountToComboPrice(value);
    setFormData((prev) => ({
      ...prev,
      comboPrice,
      discountPercent,
    }));
  };

  const handleComboPriceChange = (e) => {
    const value = e.target.value;
    setErrorMsg("");

    if (value === "") {
      setFormData((prev) => ({ ...prev, comboPrice: "", discountPercent: "" }));
      if (discountMode === "amount") {
        setDiscountAmountInput("");
      }
      return;
    }

    const parsedComboPrice = Number(value);
    if (!Number.isFinite(parsedComboPrice)) {
      setFormData((prev) => ({ ...prev, comboPrice: value }));
      return;
    }

    const boundedComboPrice = totalPrice > 0 ? Math.min(parsedComboPrice, totalPrice) : parsedComboPrice;
    const normalizedComboPrice = Number.isFinite(boundedComboPrice)
      ? Number(boundedComboPrice.toFixed(2)).toString()
      : value;

    setFormData((prev) => ({
      ...prev,
      comboPrice: normalizedComboPrice,
      discountPercent: syncDiscountFromComboPrice(normalizedComboPrice),
    }));

    if (discountMode === "amount") {
      setDiscountAmountInput(syncDiscountAmountFromComboPrice(normalizedComboPrice));
    }
  };

  const handleDiscountPercentChange = (e) => {
    const value = e.target.value;
    setErrorMsg("");

    if (value === "") {
      setFormData((prev) => ({ ...prev, discountPercent: "", comboPrice: "" }));
      if (discountMode === "amount") {
        setDiscountAmountInput("");
      }
      return;
    }

    const parsedDiscountPercent = Number(value);
    if (!Number.isFinite(parsedDiscountPercent)) {
      setFormData((prev) => ({ ...prev, discountPercent: value }));
      return;
    }

    const clampedDiscountPercent = Math.min(99.99, Math.max(0.01, parsedDiscountPercent));
    const comboPriceByPercent = totalPrice > 0
      ? Math.round((totalPrice * (1 - clampedDiscountPercent / 100)) / 100) * 100
      : 0;

    const normalizedDiscountPercent = Number(clampedDiscountPercent.toFixed(2)).toString();

    setFormData((prev) => ({
      ...prev,
      discountPercent: normalizedDiscountPercent,
      comboPrice: totalPrice > 0 ? comboPriceByPercent.toString() : "",
    }));

    if (discountMode === "amount") {
      setDiscountAmountInput(syncDiscountAmountFromComboPrice(totalPrice > 0 ? comboPriceByPercent.toString() : ""));
    }
  };

  const validateForm = () => {
    const normalizedName = (formData.comboName || "").trim();
    const parsedComboPrice = Number(formData.comboPrice);
    const parsedDiscountPercent = Number(formData.discountPercent);
    const parsedDiscountAmount = Number(currentDiscountInputValue);

    if (!normalizedName) {
      return "Vui lòng nhập tên combo";
    }

    if (!Number.isFinite(parsedComboPrice) || parsedComboPrice <= 0) {
      return "Giá combo phải lớn hơn 0";
    }

    if (totalPrice > 0 && parsedComboPrice > totalPrice) {
      return "Giá combo không được vượt quá giá gốc";
    }

    if (discountMode === "percent") {
      if (!Number.isFinite(parsedDiscountPercent) || parsedDiscountPercent <= 0 || parsedDiscountPercent >= 100) {
        return "% giảm giá phải lớn hơn 0 và nhỏ hơn 100";
      }
    } else if (!Number.isFinite(parsedDiscountAmount) || parsedDiscountAmount <= 0 || parsedDiscountAmount >= totalPrice) {
      return "Số tiền giảm phải lớn hơn 0 và nhỏ hơn giá gốc";
    }

    if (roundedComboPrice < totalCost) {
      return "Giá combo sau làm tròn phải lớn hơn hoặc bằng tổng giá nhập của các sản phẩm trong combo";
    }

    if (selectedVariants.length === 0) {
      return "Vui lòng chọn ít nhất 1 sản phẩm";
    }

    const seen = new Set();
    for (const variant of selectedVariants) {
      if (!variant?.id) {
        return "Sản phẩm trong combo không hợp lệ";
      }
      if (variant.quantity < 1) {
        return "Số lượng sản phẩm trong combo phải lớn hơn 0";
      }
      if (seen.has(variant.id)) {
        return "Không được thêm trùng sản phẩm trong combo";
      }
      seen.add(variant.id);
    }

    const duplicateName = combos.some(
      (item) => item.id !== combo?.id
        && (item.comboName || "").trim().toLowerCase() === normalizedName.toLowerCase(),
    );

    if (duplicateName) {
      return "Tên combo đã tồn tại";
    }

    return null;
  };

  // Hàm chặn submit mặc định và đẩy dữ liệu chỉnh sửa lên component cha
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg("");

    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = imagePreview;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const itemsPayload = selectedVariants.map((v) => ({
        productVariantId: v.id,
        quantity: v.quantity,
      }));

      await onSave({
        ...combo,
        ...formData,
        comboName: formData.comboName.trim(),
        imageUrl: imageUrl || null,
        comboPrice: roundedComboPrice,
        discountPercent: formData.discountPercent === "" ? 0 : Number(formData.discountPercent),
        originalPrice: totalPrice,
        items: itemsPayload
      });
    } catch (error) {
      console.error("Error saving combo:", error);
      setErrorMsg(error.message || "Có lỗi xảy ra khi lưu combo");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const totalPrice = selectedVariants.reduce((sum, v) => sum + ((Number(v.sellPrice) || 0) * v.quantity), 0);
  const totalCost = selectedVariants.reduce((sum, v) => sum + ((Number(v.costPrice) || 0) * v.quantity), 0);
  const comboPriceNumber = Number(formData.comboPrice) || 0;
  const roundedComboPrice = comboPriceNumber > 0 ? Math.round(comboPriceNumber / 100) * 100 : 0;
  const discountAmount = totalPrice - roundedComboPrice;
  const computedDiscountPercent = totalPrice > 0 && roundedComboPrice > 0
    ? Number((((discountAmount / totalPrice) * 100).toFixed(2)))
    : 0;
  const discountPercent = formData.discountPercent === ""
    ? computedDiscountPercent
    : Number(formData.discountPercent);
  const isComboPriceNotAboveCost = roundedComboPrice > 0 && roundedComboPrice < totalCost;

  const currentDiscountInputValue = discountMode === "percent"
    ? formData.discountPercent
    : discountAmountInput;
  const discountInputLabel = discountMode === "percent" ? "Giảm giá (%)" : "Số tiền giảm (đ)";
  const discountHelperText = discountMode === "percent"
    ? "% giảm giá chỉ được nhập lớn hơn 0% và nhỏ hơn 100% (0.01% - 99.99%)."
    : `Số tiền giảm phải lớn hơn 0đ và nhỏ hơn Giá gốc (${totalPrice.toLocaleString()}đ).`;
  const discountInputMin = discountMode === "percent" ? "0.01" : "1";
  const discountInputMax = discountMode === "percent" ? "99.99" : (totalPrice > 0 ? String(Math.max(1, totalPrice - 1)) : undefined);
  const discountInputStep = discountMode === "percent" ? "0.01" : "1";
  const discountInputHandler = discountMode === "percent" ? handleDiscountPercentChange : handleDiscountAmountChange;

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
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
              {errorMsg}
            </div>
          )}
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
              <Label className="text-sm font-semibold text-gray-700">Tổng giá nhập</Label>
              <Input
                className="mt-2 h-11 bg-gray-100 border-gray-200 rounded-xl"
                value={totalCost.toLocaleString()}
                disabled
              />
            </div>
            <div className="col-span-2">
              <Label className="text-sm font-semibold text-gray-700">
                Giá Combo <span className="text-red-500">*</span>
              </Label>
              <Input
                className="mt-2 h-11 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="number"
                min="1"
                max={totalPrice > 0 ? totalPrice : undefined}
                placeholder="0"
                name="comboPrice"
                value={formData.comboPrice}
                onChange={handleComboPriceChange}
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                Giá combo sẽ được làm tròn theo bội số 100đ: <span className="font-semibold">{roundedComboPrice.toLocaleString()}đ</span>
              </p>
              <p className="mt-1 text-xs text-amber-600">
                Giá Combo phải lớn hơn 0, không vượt Giá gốc và phải lớn hơn hoặc bằng Tổng giá nhập.
              </p>
            </div>
            <div className="col-span-2">
              <div className="flex items-center justify-between gap-3">
                <Label className="text-sm font-semibold text-gray-700">
                  {discountInputLabel} <span className="text-red-500">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                  onClick={toggleDiscountMode}
                >
                  Nhập theo {discountMode === "percent" ? "số tiền" : "%"}
                </Button>
              </div>
              <Input
                className="mt-2 h-11 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="number"
                min={discountInputMin}
                max={discountInputMax}
                step={discountInputStep}
                placeholder="0"
                name="discountPercent"
                value={currentDiscountInputValue}
                onChange={discountInputHandler}
                required
              />
              <p className="mt-1 text-xs text-amber-600">
                {discountHelperText}
              </p>
            </div>
          </div>

          {isComboPriceNotAboveCost && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
              Giá combo sau làm tròn phải lớn hơn hoặc bằng tổng giá nhập của các sản phẩm trong combo.
            </div>
          )}

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

                  {uploadingImage && (
                    <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2 rounded-2xl z-10">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                      <p className="text-sm font-semibold text-blue-700">Đang tải ảnh lên...</p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={uploadingImage || isSubmitting}
                    className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage || isSubmitting}
                    className="absolute bottom-4 right-4 bg-white hover:bg-slate-50 text-gray-800 rounded-xl px-4 py-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Upload className="w-4 h-4 text-blue-600" />
                    Tìm file khác
                  </button>
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => !(uploadingImage || isSubmitting) && fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !(uploadingImage || isSubmitting)) {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all bg-white ${(uploadingImage || isSubmitting) ? 'cursor-wait opacity-80' : 'cursor-pointer'} ${isDragging
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50/70 scale-[1.02]'
                    : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                    }`}
                >
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2 rounded-2xl z-10">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                      <p className="text-sm font-semibold text-blue-700">Đang tải ảnh lên...</p>
                    </div>
                  )}
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
              disabled={uploadingImage || isSubmitting}
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 rounded-xl font-semibold disabled:opacity-50"
            >
              {(uploadingImage || isSubmitting) ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
              {uploadingImage ? "Đang tải ảnh..." : isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
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
