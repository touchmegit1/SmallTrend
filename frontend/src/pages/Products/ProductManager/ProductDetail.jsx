import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, Package, Edit, Box, Calendar, Power, Printer } from "lucide-react";
import Button from "../ProductComponents/button";
import { Card } from "../ProductComponents/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ProductComponents/table";
import { Label } from "../ProductComponents/label";
import { Badge } from "../ProductComponents/badge";
import EditProductModal from "./EditProductModal";
import EditVariantModal from "./EditVariantModal";
import { useFetchVariants } from "../../../hooks/product_variants";
import api from "../../../config/axiosConfig";


function ProductDetail() {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product;

  const { variants, loading, error, fetchVariants } =
    useFetchVariants(productId);

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditVariantModalOpen, setIsEditVariantModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleToggleStatus = (variant) => {
    setSelectedVariant(variant);
    setShowConfirm(true);
  };

  const confirmToggleStatus = async () => {
    try {
      await api.put(`/products/variants/${selectedVariant.id}/toggle-status`);
      setToastMessage(`Đã ${selectedVariant.is_active ? 'ngừng' : 'kích hoạt'} bán biến thể!`);
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

  const handleSaveProduct = (updatedProduct) => {
    setToastMessage("Cập nhật sản phẩm thành công!");
    setIsEditModalOpen(false);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleEditVariant = (variant) => {
    setSelectedVariant(variant);
    setIsEditVariantModalOpen(true);
  };

  const handleSaveVariant = (updatedVariant) => {
    setToastMessage("Chỉnh sửa biến thể thành công!");
    setIsEditVariantModalOpen(false);
    fetchVariants();
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handlePrintBarcode = (variant) => {
    const printWindow = window.open("", "", "width=400,height=300");

    printWindow.document.write(`
    <html>
      <head>
        <title>In tem mã vạch ${product.name} - ${variant.sku}</title>
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
        </style>
      </head>
      <body>
        <div class="barcode-label">
          <div class="product-name">
            ${product.name}
          </div>
          <svg id="barcode"></svg>
          <div class="price">
            ${(variant.sell_price || 0).toLocaleString("vi-VN")}đ
          </div>
          <div class="sku">
            SKU: ${variant.sku}
          </div>
        </div>
        <script>
          JsBarcode("#barcode", "${variant.barcode || variant.sku}", {
            format: "CODE128",
            width: 2,
            height: 60,
            displayValue: true,
            fontSize: 14
          });
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


  // Check for message from AddNewProductVariant
  React.useEffect(() => {
    if (location.state?.message) {
      setToastMessage(location.state.message);
      setTimeout(() => setToastMessage(""), 3000);
    }
  }, [location.state]);

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

  if (loading) return <p>Đang tải biến thể...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

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
    <div className="p-6 space-y-6">
      {/* Toast Message */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50">
          <div className="bg-green-50 border border-green-200 rounded-xl px-8 py-5 shadow-lg">
            <span className="text-base font-semibold text-gray-800">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận thay đổi trạng thái</h3>
              <p className="text-gray-600">
                Bạn có muốn sửa trạng thái của biến thể này thành <span className="font-semibold">{selectedVariant?.is_active ? "ngưng bán" : "đang bán"}</span>?
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-b-2xl flex gap-3">
              <Button variant="outline" className="flex-1 h-11 rounded-xl font-semibold" onClick={() => setShowConfirm(false)}>
                Hủy
              </Button>
              <Button className="flex-1 h-11 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md" onClick={confirmToggleStatus}>
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-4">
          <Button variant="ghost" onClick={() => navigate("/products")} className="hover:bg-white/80 rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-gray-500">ID: #{product.id}</span>
              {product.is_active ? (
                <Badge className="bg-green-100 text-green-700 text-xs">Đang hoạt động</Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700 text-xs">Ngừng hoạt động</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-gray-200 rounded-xl bg-white p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Box className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Số biến thể</p>
              <p className="text-2xl font-bold text-gray-900">{product.variant_count || variants.length}</p>
            </div>
          </div>
        </Card>
        <Card className="border border-gray-200 rounded-xl bg-white p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Ngày tạo</p>
              <p className="text-base font-semibold text-gray-900">{formatDate(product.created_at)}</p>
              <p className="text-xs text-gray-400 mt-0.5">Cập nhật: {formatDate(product.updated_at)}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column - Product Image */}
        <Card className="border border-gray-200 rounded-xl bg-white p-5">
          <div className="aspect-video bg-gray-50 rounded-xl flex items-center justify-center">
            {product.image_url ? (
              <img
                src={`http://localhost:8081${product.image_url}`}
                alt={product.name}
                className="w-full h-full object-contain rounded-xl"
              />
            ) : (
              <div className="text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Chưa có hình ảnh</p>
              </div>
            )}
          </div>
        </Card>

        {/* Right Column - Product Info */}
        <Card className="border border-gray-200 rounded-xl bg-white">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Thông tin cơ bản</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Tên sản phẩm</Label>
                <p className="text-sm font-semibold text-gray-900 mt-1">{product.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Thương hiệu</Label>
                <p className="text-sm text-gray-900 mt-1">{product.brand_name || "—"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Danh mục</Label>
                <div className="mt-1">
                  <Badge className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                    {product.category_name || "—"}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Thuế</Label>
                <p className="text-sm text-gray-900 mt-1">{product.tax_rate_name || "—"}</p>
              </div>
            </div>
            {product.description && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Mô tả</Label>
                <p className="text-sm text-gray-700 mt-1 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
          <div className="p-5 border-t border-gray-100">
            <Button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 h-11 rounded-xl font-semibold"
            >
              <Edit className="w-4 h-4" />
              Chỉnh sửa sản phẩm
            </Button>
          </div>
        </Card>
      </div>

      {/* Variants */}
      <Card className="border border-gray-200 rounded-xl bg-white">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-800">Biến thể sản phẩm</h2>
            <Badge className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              {variants.length} biến thể
            </Badge>
          </div>
          <Button
            onClick={() => navigate("/products/addproduct_variant", { state: { product } })}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
            Thêm biến thể
          </Button>
        </div>
        <div className="p-6">
          {variants.length === 0 ? (
            <div className="text-center py-12">
              <Box className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Chưa có biến thể nào</p>
              <p className="text-sm text-gray-400 mt-1">Nhấn "Thêm biến thể" để bắt đầu</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-16">STT</TableHead>
                  <TableHead className="w-16">Ảnh</TableHead>
                  <TableHead>Tên biến thể</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Giá vốn</TableHead>
                  <TableHead>Giá bán</TableHead>
                  <TableHead>Tồn kho</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant, index) => (
                  <TableRow key={variant.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-500">{index + 1}</TableCell>
                    <TableCell>
                      {variant.image_url ? (
                        <img
                          src={`http://localhost:8081${variant.image_url}`}
                          alt={variant.name}
                          className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900">{variant.name || "—"}</TableCell>
                    <TableCell className="font-mono text-sm text-gray-700">{variant.sku || "—"}</TableCell>
                    <TableCell className="font-mono text-sm text-gray-600">{variant.barcode || "—"}</TableCell>
                    <TableCell className="text-gray-700">{variant.cost_price != null ? variant.cost_price.toLocaleString('vi-VN') + "đ" : "—"}</TableCell>
                    <TableCell className="font-semibold text-gray-900">{variant.sell_price?.toLocaleString('vi-VN') || "0"}đ</TableCell>
                    <TableCell>
                      <Badge className={variant.stock_quantity > 0 ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}>
                        {variant.stock_quantity ?? 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {variant.is_active ? (
                        <Badge className="bg-green-100 text-green-700">Đang bán</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700">Ngưng bán</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          title={variant.is_active ? "Ngưng bán" : (product?.is_active === false ? "Sản phẩm gốc ngưng bán" : "Bật bán")}
                          onClick={() => handleToggleStatus(variant)}
                          disabled={!variant.is_active && product?.is_active === false}
                          className="hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Power className={`w-4 h-4 ${variant.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Chỉnh sửa"
                          onClick={() => handleEditVariant(variant)}
                          className="hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          title="In tem mã vạch"
                          onClick={() => handlePrintBarcode(variant)}
                          className="hover:bg-blue-50"
                        >
                          <Printer className="w-4 h-4 text-blue-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      <EditProductModal
        product={product}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProduct}
      />

      <EditVariantModal
        variant={selectedVariant}
        parentProduct={product}
        isOpen={isEditVariantModalOpen}
        onClose={() => setIsEditVariantModalOpen(false)}
        onSave={handleSaveVariant}
      />
    </div>
  );
}

export default ProductDetail;
