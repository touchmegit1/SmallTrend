import { useState, useRef, useEffect } from "react";
import { X, Save, Image as ImageIcon, Upload } from "lucide-react";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import { Label } from "../ProductComponents/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ProductComponents/card";
import { useFetchCategories } from "../../../hooks/categories";
import { useFetchBrands } from "../../../hooks/brands";
import { useFetchTaxRates } from "../../../hooks/taxRates";
import api from "../../../config/axiosConfig";

/**
 * Component Modal sửa Chỉnh Phông Thông tin Gốc của một Sản Phẩm.
 * Nằm nổi đè lên Giao diện chính thông qua tham số isOpen bật/tắt state truyền vào.
 */
export function EditProductModal({ product, isOpen, onClose, onSave }) {
  // Lấy dữ liệu Selectbox Configuration List từ các màn CRUD khác
  const { categories } = useFetchCategories();
  const { brands } = useFetchBrands();
  const { taxRates } = useFetchTaxRates();

  // --- STATE ---
  const [formData, setFormData] = useState({
    name: "",
    brandId: "",
    categoryId: "",
    taxRateId: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Gán thông tin Parent Item đang target vào Hook để đẩy lên Form Control 
  // khi Modal bật mở lần đầu hoặc có thay đổi dòng click.
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || "",
        brandId: product.brand_id || "",
        categoryId: product.category_id || "",
        taxRateId: product.tax_rate_id || "",
        description: product.description || "",
      });
      // Gán ImageUrl Cũ render cho user xem đối soát
      setImagePreview(product.image_url || null);
      setImageFile(null); // Reset trạng thái select upload cho ảnh raw DB
    }
  }, [product, isOpen]);

  // UI render bảo vệ: Early Return không hiện Modal nếu biến flag `isOpen` là false.
  if (!isOpen) return null;

  // --- HANDLER FUNCTIONS UI / IMAGE SELECTOR ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (file) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Base64 View
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
    setImagePreview(null); // Return về null xoá ảnh
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // --- API SERVICE DISPATCH ---
  const uploadImage = async () => {
    if (!imageFile) return null;
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", imageFile);
      const response = await api.post("/upload/image", formDataUpload, {
        headers: { "Content-Type": undefined },
      });
      return response.data.url; // SpringBoot server trả chuỗi Path /uploads...
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  /**
   * Khởi động quá trình Update và gọi callback OnSave của component Cha để báo tải lại list
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Tránh form auto reload window
    try {
      // Logic xử lý Link Image Path:
      // - Biến imageUrl ban đầu ưu tiên lấy State Preview đã init từ prop.
      // - NẾU NGƯỜI DÙNG GIỮ NGUYÊN -> imageFile null -> lấy Preview đang lưu -> Update y chang cũ lên DB
      // - NẾU NGƯỜI DÙNG XOÁ ẢNH -> removeImage kích hoạt set Preview = null -> null -> Update rỗng lên DB (Bỏ ảnh)
      // - NẾU NGƯỜI DÙNG UP ẢNH MỚI -> Gọi Hàm Upload đẩy File vật lý đi trên Server -> Gán lại bằng URL server trả về.
      let imageUrl = imagePreview;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      // Khúc này map tên DTO Model Field Json để Backend đón nhận PUT /products/{id}
      const payload = {
        name: formData.name,
        description: formData.description || null,
        imageUrl: imageUrl || null,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        brandId: formData.brandId ? parseInt(formData.brandId) : null,
        taxRateId: formData.taxRateId ? parseInt(formData.taxRateId) : null,
      };

      const response = await api.put(`/products/${product.id}`, payload);

      // Chạy callback ở file ProductList hoặc ProductDetail truyền vào báo hiệu thành công
      onSave(response.data);
      onClose(); // Auto Trigger Off trạng thái Toggle hiển thị Pop-Up
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Lỗi kết nối khi cập nhật chỉnh sửa DB!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Chỉnh sửa sản phẩm gốc</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-white border rounded-full p-2.5 transition-all shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 bg-slate-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* THÔNG TIN TEXT META KHỐI LEFT */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-2xl border-b border-gray-200 p-5">
                <CardTitle className="text-xl font-bold text-gray-800">Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 p-6">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Tên sản phẩm gốc <span className="text-red-500">*</span></Label>
                  <Input
                    className="mt-2 h-11 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
                    placeholder="Thay đổi brand tên thương phẩm"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Ngành hàng - Danh mục <span className="text-red-500">*</span></Label>
                  <select
                    name="categoryId"
                    className="mt-2 w-full h-11 px-4 text-sm font-medium border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Lược bỏ & Trống thông tin</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Công ty phân phối (Thương hiệu)</Label>
                  <select
                    name="brandId"
                    className="mt-2 w-full h-11 px-4 text-sm font-medium border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.brandId}
                    onChange={handleChange}
                  >
                    <option value="">Lược bỏ & Không dùng brand</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Thuế đặc biệt/VAT Thu thêm</Label>
                  <select
                    name="taxRateId"
                    className="mt-2 w-full h-11 px-4 text-sm font-medium border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.taxRateId}
                    onChange={handleChange}
                  >
                    <option value="">Không set tax cho món hàng này</option>
                    {taxRates.map((tax) => (
                      <option key={tax.id} value={tax.id}>{tax.name} ({tax.rate}%)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Mô tả đặc điểm sản phẩm</Label>
                  <textarea
                    className="mt-2 w-full p-4 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none leading-relaxed"
                    name="description"
                    placeholder="Bổ sung note thông số..."
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>

            {/* KHỐI MEDIA AVATAR BÊN RIGHT */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-2xl border-b border-gray-200 p-5">
                <CardTitle className="text-xl font-bold text-gray-800">Hình ảnh sản phẩm gốc</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 p-6">
                {/* Input xử lý event file vật lý hệ điều hành */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {imagePreview ? (
                  // ĐÃ TẢI ẢNH LÊN XONG - SHOW BẢN XEM TRƯỚC VÀ NÚT RE-SELECT
                  <div className="relative flex-1 rounded-2xl overflow-hidden group border border-gray-100 shadow-sm">
                    {/* Hỗ trợ String xử lý đường dẫn Image Config nếu là Link hệ thống Local từ BaseURL backend hay Link Full Http CDN */}
                    <img
                      src={imagePreview.startsWith('blob:') || imagePreview.startsWith('http') ? imagePreview : `http://localhost:8081${imagePreview.startsWith('/') ? '' : '/'}${imagePreview}`}
                      alt="Product Master Visual"
                      className="w-full h-full object-contain rounded-2xl bg-white"
                      style={{ minHeight: '280px' }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 rounded-2xl backdrop-blur-[1px]" />

                    {/* Control Action Clear Ảnh Hiện tại */}
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    {/* Control Action Tải File Khác */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-4 right-4 bg-white hover:bg-slate-50 text-gray-800 rounded-xl px-4 py-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4 text-blue-600" />
                      Tìm file khác
                    </button>
                  </div>
                ) : (
                  // CHƯA CÓ ẢNH Ở RECORD DB CŨ HOẶC MỚI XOÁ - HIỆN FORM DRAG & DROP
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
                    className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer bg-white ${isDragging
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50/70 scale-[1.02]'
                      : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                      }`}
                    style={{ minHeight: '280px' }}
                  >
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4 shadow-sm border border-slate-200">
                      <ImageIcon className="w-10 h-10 text-slate-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 mb-1.5">Trống thông tin Photo File</p>
                    <p className="text-xs font-medium text-slate-500">Ấn để điều hướng File Explorer <br />hoặc dùng chuột thả Drop Ảnh vào vùng này.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
            <Button
              type="submit"
              variant="success"
              className="w-full h-12 bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700 text-white shadow-lg shadow-green-500/20 border-0 rounded-xl font-bold flex items-center justify-center"
            >
              <Save className="w-5 h-5 mr-2" />
              Lưu thay đổi
            </Button>
            <Button
              type="button"
              variant="danger"
              className="w-full h-12 border-2 border-red-200 text-red-600 hover:bg-red-400 hover:text-red-800 rounded-xl font-bold flex items-center justify-center"
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
