import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, Package, Edit, Box, Calendar, Power, Printer, Trash2 } from "lucide-react";

// Tái sử dụng components từ Design system UI thư mục chung ProductComponents
import Button from "../ProductComponents/button";
import { Card } from "../ProductComponents/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ProductComponents/table";
import { Label } from "../ProductComponents/label";
import { Badge } from "../ProductComponents/badge";

// Gọi import các sub-modal Form Add/Edit
import EditProductModal from "./EditProductModal";
import EditVariantModal from "./EditVariantModal";
import UnitConversionSection from "./UnitConversionSection";
import UnitsManagerModal from "./UnitsManagerModal";
import { useFetchVariants, useFetchUnits } from "../../../hooks/product_variants";
import api from "../../../config/axiosConfig";

/**
 * Màn hình Chi tiết Sản phẩm (ProductDetail)
 * Cho phép xem tổng quan thông tin metadata (Thuế, Tên, Hình ảnh, Brand) 
 * Màn hình chịu trách nhiệm kết xuất và cho phép tao tác In tem dòng "Variants" (Loại sản phẩm sku thực giá)
 */
function ProductDetail() {
  const { id: productId } = useParams(); // Lấy mã ID sản phẩm trên path URL
  const navigate = useNavigate();
  const location = useLocation();

  // --- QUẢN LÝ STATE THÔNG TIN SẢN PHẨM CHA ---
  const [product, setProduct] = useState(location.state?.product || null);
  const [productLoading, setProductLoading] = useState(!location.state?.product);

  // Custom Hook tải danh sách Variants riêng cho 1 ID sản phẩm
  const { variants, loading, error, fetchVariants } = useFetchVariants(productId);

  // --- QUẢN LÝ STATE UX/UI ---
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null); // Lưu con trỏ reference lúc đang edit variant
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Modal dành cho Parent Product
  const [isEditVariantModalOpen, setIsEditVariantModalOpen] = useState(false); // Modal dành cho Children Variant
  const [toastMessage, setToastMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteVariant, setDeleteVariant] = useState(null);
  const [expandedVariantId, setExpandedVariantId] = useState(null); // Quản lý đóng/mở phần quy đổi đơn vị
  const [showUnitsManager, setShowUnitsManager] = useState(false); // Trạng thái hiển thị Quản lý Đơn vị
  const [showBarcodeModal, setShowBarcodeModal] = useState(false); // Trạng thái hiển thị modal Barcode
  const [selectedBarcodeVariant, setSelectedBarcodeVariant] = useState(null); // Variant đang chọn để xem barcode
  const [, forceUpdate] = useState(0); // Dùng để re-render khi hết 2 phút

  const { units, fetchUnits } = useFetchUnits(); // Tải danh sách đơn vị để truyền cho form quy đổi

  // --- HANDLER FUNCTIONS ---

  /**
   * Gọi popup hỏi bạn có muốn ngưng kinh doanh SKU variant này hay không
   */
  const handleToggleStatus = (variant) => {
    setSelectedVariant(variant);
    setShowConfirm(true);
  };

  /**
   * Call API đóng băng hoặc un-ban 1 variant thay đổi trạng thái is_active
   */
  const confirmToggleStatus = async () => {
    try {
      await api.put(`/products/variants/${selectedVariant.id}/toggle-status`);
      setToastMessage(`Đã ${selectedVariant.is_active ? 'ngừng' : 'kích hoạt'} bán loại sản phẩm!`);
      fetchVariants();
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      setToastMessage("Lỗi khi thay đổi trạng thái!");
      setTimeout(() => setToastMessage(""), 3000);
    } finally {
      setShowConfirm(false);
      setSelectedVariant(null);
    }
  };

  /**
   * Callback khi Edit Sản phẩm Cha bằng modal đã thành công -> Nạp ngược vào state để load màn hình tức thời
   */
  const handleSaveProduct = (updatedProduct) => {
    setProduct(updatedProduct);
    setToastMessage("Cập nhật thông tin gốc thành công!");
    setIsEditModalOpen(false);
    setTimeout(() => setToastMessage(""), 3000);
  };

  /**
   * Bật mở form Modal để điền chỉnh sửa Variant
   */
  const handleEditVariant = (variant) => {
    setSelectedVariant(variant);
    setIsEditVariantModalOpen(true);
  };

  /**
   * Cập nhật danh sách sau khi Sửa lại Record Của 1 Variant thành công
   */
  const handleSaveVariant = (updatedVariant) => {
    setToastMessage("Lưu thiết lập loại sản phẩm thành công!");
    setIsEditVariantModalOpen(false);
    fetchVariants(); // Tải lại list
    setTimeout(() => setToastMessage(""), 3000);
  };

  /**
   * Xoá variant (chỉ trong 2 phút đầu)
   */
  const handleDeleteVariant = (variant) => {
    setDeleteVariant(variant);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteVariant = async () => {
    try {
      await api.delete(`/products/variants/${deleteVariant.id}`);
      setToastMessage("Đã xoá loại sản phẩm thành công!");
      fetchVariants();
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Lỗi khi xoá loại sản phẩm!";
      setToastMessage(typeof msg === "string" ? msg : "Lỗi khi xoá loại sản phẩm!");
      setTimeout(() => setToastMessage(""), 4000);
    } finally {
      setShowDeleteConfirm(false);
      setDeleteVariant(null);
    }
  };

  // Kiểm tra variant có trong vòng 2 phút không
  const isWithin2Minutes = (createdAt) => {
    if (!createdAt) return false;
    const created = new Date(createdAt);
    const now = new Date();
    return Math.abs(now - created) <= 2 * 60 * 1000;
  };

  /**
   * Hàm Generate script mã vạch in Barcode dành cho cửa hàng. 
   * Sinh một Document HTML mini trên Iframe, chèn thư viện convert Barcode jsBarcode
   */
  const handlePrintBarcode = (variant) => {
    const printWindow = window.open("", "", "width=400,height=300");

    printWindow.document.write(`
    <html>
      <head>
        <title>In tem mã vạch ${product.name} - ${variant.name}</title>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0;
          }
          .barcode-label {
            text-align: center;
            border: 2px solid #000;
            padding: 15px;
            width: 280px;
          }
          .product-name { 
            font-size: 13px; 
            font-weight: bold; 
            margin-bottom: 5px; 
          }
          .price { 
            font-size: 16px; 
            font-weight: bold; 
            margin-top: 5px;
          }
          .sku { 
            font-size: 11px; 
            color: #666; 
          }
          .attributes {
            font-size: 11px;
            color: #333;
            margin-bottom: 3px;
          }
          .attributes span {
            display: inline-block;
            background: #f0f0f0;
            border: 1px solid #ddd;
            border-radius: 3px;
            padding: 1px 5px;
            margin: 1px 2px;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="barcode-label">
          <div class="product-name">
            ${variant.name || product.name}
          </div>
          ${variant.attributes && Object.keys(variant.attributes).length > 0 ? `
          <div class="attributes">
            ${Object.entries(variant.attributes).map(([k, v]) => `<span>${k}: ${v}</span>`).join('')}
          </div>` : ''}
          <svg id="barcode"></svg>
          <div class="price">
            ${(variant.sell_price || 0).toLocaleString("vi-VN")}đ
          </div>
          <div class="sku">
            SKU: ${variant.sku}
          </div>
        </div>
        <script>
          // Gen HTML thành mã Code vạch vởi Barcode Lib (Chuẩn CODE128)
          JsBarcode("#barcode", "${variant.barcode || variant.sku}", {
            format: "CODE128",
            width: 2,
            height: 60,
            displayValue: true,
            fontSize: 14
          });
          // Tự động gọi màn hình Dialog in ấn Print sau khi Lib build html xong
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 300);
          };
        </script>
      </body>
    </html>
    `);

    printWindow.document.close();
  };

  // --- USEEFFECT HOOKS ---
  // Nhận tín hiệu điều hướng về qua state message sau khi AddNewProductVariant xong
  React.useEffect(() => {
    if (location.state?.message) {
      setToastMessage(location.state.message);
      setTimeout(() => setToastMessage(""), 3000);
    }
  }, [location.state]);

  // Timer: re-render mỗi 10s để cập nhật nút xoá (ẩn khi quá 2 phút)
  useEffect(() => {
    const timer = setInterval(() => forceUpdate((n) => n + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  // Load fetch lại Parent Product từ Backend nếu người dùng nhấn Link URL tĩnh copy ở đâu đó 
  // thay vì navigate state nội bộ react (Vd: Load F5)
  React.useEffect(() => {
    if (!product && productId) {
      api.get(`/products/${productId}`)
        .then(res => setProduct(res.data))
        .catch(err => console.error("Error fetching product:", err))
        .finally(() => setProductLoading(false));
    }
  }, [productId, product]);

  // --- RENDER FALLBACK: Khi lỗi load ---
  if (productLoading) {
    return <div className="p-6 flex justify-center items-center h-screen"><p className="text-gray-500 font-medium">Đang tải biểu mẫu thông tin...</p></div>;
  }

  // --- RENDER FALLBACK: Không có sản phẩm (404) ---
  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-6 font-medium text-lg">Không thể tìm thấy sản phẩm này trong khoá đối khớp!</p>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg transition-all"
          >
            Về trang danh sách
          </button>
        </div>
      </div>
    );
  }

  // Fallback Loading của API Variants
  if (loading) return <p className="p-6 text-blue-600 font-medium animate-pulse">Đang đồng bộ loại sản phẩm (Loading variants...)</p>;
  if (error) return <p className="p-6 text-red-500 font-medium bg-red-50">{error}</p>;

  // Tool Date Format Text Convert
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* Toast UI */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-white border-l-4 border-green-500 rounded-xl px-6 py-4 shadow-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <Box className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-gray-800">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Popup Confirm: Edit trang thai */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Thay đổi phân luồng sản phẩm</h3>
              <p className="text-gray-600 text-sm">
                Xác nhận {selectedVariant?.is_active ? "Cấm bán/Chặn kho (Disable)" : "Kích hoạt đưa ra quầy (Enable)"} loại sản phẩm hiện tại?
              </p>
            </div>
            <div className="p-5 bg-gray-50 flex gap-3 border-t">
              <Button variant="ghost" className="flex-1 h-10 border border-gray-200 rounded-xl font-semibold bg-white text-gray-700" onClick={() => setShowConfirm(false)}>
                Hủy lệnh
              </Button>
              <Button className="flex-1 h-10 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md border-0" onClick={confirmToggleStatus}>
                Xác nhận đổi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Confirm: Xoá variant */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-t-2xl border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xoá loại sản phẩm</h3>
              <p className="text-gray-600 text-sm">
                Bạn có chắc chắn muốn xoá loại sản phẩm <strong>{deleteVariant?.name || deleteVariant?.sku}</strong>? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="p-5 bg-gray-50 flex gap-3 border-t">
              <Button variant="ghost" className="flex-1 h-10 border border-gray-200 rounded-xl font-semibold bg-white text-gray-700" onClick={() => setShowDeleteConfirm(false)}>
                Hủy
              </Button>
              <Button className="flex-1 h-10 rounded-xl font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md border-0" onClick={confirmDeleteVariant}>
                Xoá loại sản phẩm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- PHẦN 1: HEADER QUAY LẠI VÀ CHỈ DẤU TRẠNG THÁI GỐC --- */}
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-4">
          <Button variant="ghost" onClick={() => navigate("/products")} className="hover:bg-slate-200 rounded-xl border border-gray-200 bg-white">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">{product.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">ID: #{product.id}</span>
              {product.is_active ? (
                <Badge className="bg-green-100/80 text-green-700 text-xs font-semibold px-2 py-0.5 border-green-200 border">Cho phép kinh doanh</Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 border-red-200 border">Huỷ liên kết</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- PHẦN 2: THỐNG KÊ NHANH CARD (Quick Stats) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Số Variant */}
        <Card className="border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-5 p-5">
            <div className="p-3.5 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 rounded-xl">
              <Box className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Quy cách định danh (Loại sản phẩm)</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{product.variant_count || variants.length}</p>
            </div>
          </div>
        </Card>

        {/* Lịch sử Ngày tháng */}
        <Card className="border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-5 p-5">
            <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100 rounded-xl">
              <Calendar className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Khởi tạo gốc</p>
              <p className="text-base font-bold text-gray-900 mt-0.5">{formatDate(product.created_at)}</p>
              <p className="text-xs font-medium text-gray-400 mt-0.5">Lần chỉnh sửa mới nhất: {formatDate(product.updated_at)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* --- PHẦN 3: BỐ CỤC COLUMN LEFT TỔNG QUAN / RIGHT CHI TIẾT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (Chứa 1 Grid): Product Image */}
        <Card className="border border-gray-200 rounded-2xl bg-white lg:col-span-1 shadow-sm overflow-hidden">
          <div className="bg-gray-50/50 p-2 border-b border-gray-100 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Profile Thu nhỏ</span>
          </div>
          <div className="aspect-square bg-white flex items-center justify-center p-4 relative group">
            {product.image_url ? (
              <img
                src={product.image_url.startsWith('http') ? product.image_url : `http://localhost:8081${product.image_url.startsWith('/') ? '' : '/'}${product.image_url}`}
                alt={product.name}
                className="w-full h-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="text-center">
                <Package className="w-16 h-16 text-gray-200 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-400">Box thiếu ảnh</p>
              </div>
            )}
          </div>
        </Card>

        {/* Right Column (Chứa 2 Grid) : Bảng Metadata */}
        <Card className="border border-gray-200 rounded-2xl bg-white lg:col-span-2 shadow-sm flex flex-col">
          <div className="p-5 bg-gradient-to-r from-gray-50/50 to-slate-50/40 border-b border-gray-100 flex justify-between items-center rounded-t-2xl">
            <h2 className="text-lg font-bold text-gray-800">Thông tin niêm yết Cơ bản</h2>
            <Button
              variant="ghost"
              onClick={() => setIsEditModalOpen(true)}
              className="h-8 px-3 text-xs bg-white hover:bg-blue-50 text-blue-600 border border-gray-200 rounded-lg font-semibold shadow-sm transition-all"
            >
              <Edit className="w-3 h-3 mr-1.5" /> Chỉnh sửa
            </Button>
          </div>

          <div className="p-6 space-y-6 flex-1">
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Tên thương phẩm</Label>
                <p className="text-base font-semibold text-gray-900">{product.name}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Thương hiệu đại diện (Brand)</Label>
                <p className="text-base font-medium text-gray-800">{product.brand_name || "—"}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Nhóm mặt hàng (Category)</Label>
                <div>
                  <Badge className="bg-blue-50 text-blue-700 border border-blue-200 font-semibold px-2.5 py-0.5" variant="secondary">
                    {product.category_name || "Trống"}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Thuế VAT định mức</Label>
                <p className="text-base font-medium text-gray-800 bg-gray-50 border border-gray-200 w-fit px-2 py-0.5 rounded-md shadow-sm">{product.tax_rate_name || "—"}</p>
              </div>
            </div>

            {product.description && (
              <div className="pt-4 border-t border-gray-100">
                <Label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 block">Mô tả (Content)</Label>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50/80 p-4 rounded-xl border border-gray-100">{product.description}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* --- PHẦN 4: KHỐI TABLE QUẢN LÝ LOẠI SẢN PHẨM (Variant Container) --- */}
      <Card className="border border-gray-200 rounded-2xl bg-white shadow-md overflow-hidden">

        {/* Header Table Variant */}
        <div className="p-5 bg-white border-b border-gray-200 flex justify-between items-center sm:flex-row flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Chi tiết phân loại loại sản phẩm</h2>
              <p className="text-xs text-gray-500 font-medium">Bảng kê mẫu mã thực thụ xuất nhập kho</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowUnitsManager(true)}
              variant="outline"
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl px-4 font-semibold shadow-sm flex items-center gap-2">
              <Box className="w-4 h-4" /> Bảng đơn vị tính
            </Button>
            <Button
              onClick={() => navigate("/products/addproduct_variant", { state: { product } })}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md border border-transparent font-semibold shadow-indigo-500/20 px-5">
              + Thêm loại sản phẩm
            </Button>
          </div>
        </div>

        {/* Body Table */}
        <div className="p-0 overflow-x-auto">
          {variants.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Box className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Mặt hàng này đang là form trống rỗng</h3>
              <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">Vui lòng tạo tối thiểu 1 loại sản phẩm SKU (Màu/Size/Hương) để hệ thống có thể tạo Barcode tính tiền.</p>
              <Button onClick={() => navigate("/products/addproduct_variant", { state: { product } })} variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl">Tạo ngay Variant</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="w-12 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">STT</TableHead>
                  <TableHead className="w-16 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Ảnh</TableHead>
                  <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tên loại sản phẩm</TableHead>
                  <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mã SKU</TableHead>
                  <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider">Barcode</TableHead>
                  <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider">Thuộc tính</TableHead>
                  <TableHead className="text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Giá Bán</TableHead>
                  <TableHead className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Tồn kho</TableHead>
                  <TableHead className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</TableHead>
                  <TableHead className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant, index) => (
                  <React.Fragment key={variant.id}>
                    <TableRow className="hover:bg-blue-50/40 transition-colors border-b border-gray-100 group">
                      <TableCell className="font-semibold text-gray-400 text-center text-xs">{index + 1}</TableCell>
                      <TableCell className="text-center">
                        <div className="w-9 h-9 mx-auto bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                          {variant.image_url ? (
                            <img
                              src={variant.image_url.startsWith('http') ? variant.image_url : `http://localhost:8081${variant.image_url.startsWith('/') ? '' : '/'}${variant.image_url}`}
                              alt={variant.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-4 h-4 text-gray-300" />
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">{variant.name || "Mặc định (Default)"}</span>
                      </TableCell>

                      <TableCell>
                        <span className="font-mono text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">{variant.sku || "—"}</span>
                      </TableCell>

                      <TableCell>
                        <span
                          onClick={() => {
                            if (variant.barcode || variant.sku) {
                              setSelectedBarcodeVariant(variant);
                              setShowBarcodeModal(true);
                            }
                          }}
                          className={`font-mono text-xs ${(variant.barcode || variant.sku) ? 'text-indigo-600 hover:text-indigo-800 cursor-pointer underline decoration-dotted font-semibold' : 'text-gray-500'}`}
                          title="Nhấp để xem mã vạch"
                        >
                          {variant.barcode || "—"}
                        </span>
                      </TableCell>

                      <TableCell>
                        {variant.attributes && Object.keys(variant.attributes).length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(variant.attributes).map(([key, val]) => (
                              <Badge key={key} variant="outline" className="text-[11px] bg-indigo-50 border-indigo-200 text-indigo-700 px-2 py-0.5 font-semibold whitespace-nowrap">
                                {key}: {val}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Chưa có</span>
                        )}
                        {variant.unit_conversions && variant.unit_conversions.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-[10px] bg-green-50 border-green-200 text-green-700 px-1.5 py-0.5 font-medium whitespace-nowrap">
                              Có {variant.unit_conversions.length} phép quy đổi
                            </Badge>
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <span className="text-base font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded whitespace-nowrap">{variant.sell_price?.toLocaleString('vi-VN') || "0"} ₫</span>
                      </TableCell>

                      <TableCell className="text-center">
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">{variant.stockQuantity || 0}</span>
                      </TableCell>

                      <TableCell className="text-center">
                        {variant.is_active ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500 mx-auto ring-2 ring-green-100 shadow-sm" title="Hoạt động bình thường" />
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500 mx-auto ring-2 ring-red-100 shadow-sm" title="Vô hiệu hoá" />
                        )}
                      </TableCell>

                      <TableCell className="p-3">
                        <div className="flex justify-center items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            title={variant.is_active ? "Dừng xuất nhập" : (product?.is_active === false ? "Vui lòng mở khoá SP Gốc trước" : "Kích hoạt trở lại")}
                            onClick={() => handleToggleStatus(variant)}
                            disabled={!variant.is_active && product?.is_active === false}
                            className={`h-10 w-10 p-0 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:bg-amber-50 focus:ring-0 ${variant.is_active ? 'text-amber-600' : 'text-gray-400'}`}
                          >
                            <Power className="w-[18px] h-[18px]" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Sửa khung phân loại"
                            onClick={() => handleEditVariant(variant)}
                            className="h-10 w-10 p-0 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:bg-blue-50 text-blue-600 focus:ring-0"
                          >
                            <Edit className="w-[18px] h-[18px]" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Lệnh in Máy Barcode"
                            onClick={() => handlePrintBarcode(variant)}
                            className="h-10 w-10 p-0 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:bg-slate-100 text-slate-700 focus:ring-0"
                          >
                            <Printer className="w-[18px] h-[18px]" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            title={expandedVariantId === variant.id ? "Thu gọn quy đổi" : "Cấu hình quy đổi đơn vị"}
                            onClick={() => setExpandedVariantId(expandedVariantId === variant.id ? null : variant.id)}
                            className={`h-10 w-10 p-0 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all focus:ring-0 ${expandedVariantId === variant.id ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'hover:bg-indigo-50 text-indigo-600'}`}
                          >
                            <Box className="w-[18px] h-[18px]" />
                          </Button>
                          {isWithin2Minutes(variant.created_at) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Xoá loại sản phẩm (trong 2 phút)"
                              onClick={() => handleDeleteVariant(variant)}
                              className="h-10 w-10 p-0 rounded-xl border border-red-200 shadow-sm hover:shadow-md transition-all hover:bg-red-50 text-red-500 focus:ring-0"
                            >
                              <Trash2 className="w-[18px] h-[18px]" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    {/* Dòng hiển thị quy đổi đơn vị khi expand */}
                    {expandedVariantId === variant.id && (
                      <TableRow className="bg-gray-50/30">
                        <TableCell colSpan={10} className="p-0">
                          <div className="px-6 py-4 animate-in slide-in-from-top-2 duration-200 border-b border-gray-100">
                            <UnitConversionSection
                              variant={variant}
                              product={product}
                              units={units}
                              onSuccess={() => fetchVariants()}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* --- CÁC DIALOG CHỨA FORM (MODALS) TRONG FILE KHÁC --- */}
      {/* 1. Modal sửa SP gốc */}
      <EditProductModal
        product={product}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProduct}
      />

      {/* 2. Modal sửa Variant chi tiết */}
      <EditVariantModal
        variant={selectedVariant}
        parentProduct={product}
        isOpen={isEditVariantModalOpen}
        onClose={() => setIsEditVariantModalOpen(false)}
        onSave={handleSaveVariant}
      />

      {/* Modal Quản lý Đơn vị tính */}
      {showUnitsManager && (
        <UnitsManagerModal
          onClose={() => setShowUnitsManager(false)}
          onDataChange={() => {
            if (fetchUnits) fetchUnits();
          }}
        />
      )}

      {/* Modal Xem Barcode Loại sản phẩm */}
      {showBarcodeModal && selectedBarcodeVariant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setShowBarcodeModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full transform transition-all overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Mã vạch sản phẩm</h3>
              <button
                onClick={() => setShowBarcodeModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-8 flex flex-col items-center justify-center bg-white min-h-[220px]">
              <BarcodeGenerator value={selectedBarcodeVariant.barcode || selectedBarcodeVariant.sku} />
              <p className="text-sm font-medium text-gray-500 mt-4 text-center">
                {selectedBarcodeVariant.name || product.name}
              </p>
            </div>
            <div className="p-4 bg-gray-50 border-t flex gap-3">
              <Button

                className="flex-1 h-10 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md border-0 transition-all"
                onClick={() => handlePrintBarcode(selectedBarcodeVariant)}
              >
                In mã vạch
              </Button>
              <Button
                className="flex-1 h-10 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md border-0 transition-all"
                onClick={() => setShowBarcodeModal(false)}
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Component sinh ảnh mã vạch ngay tại frontend sử dụng thư viện jsbarcode
const BarcodeGenerator = ({ value }) => {
  const svgRef = React.useRef(null);

  React.useEffect(() => {
    if (!value) return;

    const generateBarcode = () => {
      // Đảm bảo DOM đã ready và có JsBarcode
      if (window.JsBarcode && svgRef.current) {
        window.JsBarcode(svgRef.current, value, {
          format: "CODE128",
          width: 2.2,
          height: 70,
          displayValue: true,
          fontSize: 15,
          margin: 10,
          background: "#ffffff",
          lineColor: "#000000"
        });
      }
    };

    if (window.JsBarcode) {
      // Đợi 1 frame nếu cần đảm bảo SVG đã render
      requestAnimationFrame(generateBarcode);
    } else {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js";
      script.onload = () => requestAnimationFrame(generateBarcode);
      document.body.appendChild(script);
    }
  }, [value]);

  return <svg ref={svgRef} className="w-full max-w-full h-auto"></svg>;
};

export default ProductDetail;
