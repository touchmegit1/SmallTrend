import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, Package, Edit, Box, TrendingUp, Calendar, Power, Printer } from "lucide-react";
import Button from "../ProductComponents/button";
import { Card } from "../ProductComponents/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ProductComponents/table";
import { Label } from "../ProductComponents/label";
import { Badge } from "../ProductComponents/badge";
import EditProductModal from "./EditProductModal";
import EditVariantModal from "./EditVariantModal";
import { useFetchVariants } from "../../../hooks/product_variants";
import { useFetchCategories } from "../../../hooks/categories";
import { useFetchBrands } from "../../../hooks/brands";


function ProductDetail() {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product;

  const [hoveredImage, setHoveredImage] = useState(null);

  const { variants, loading, error, fetchVariants } =
    useFetchVariants(productId);

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditVariantModalOpen, setIsEditVariantModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const { categories } = useFetchCategories();
  const { brands } = useFetchBrands();


  // Helper functions để lấy tên từ ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id == categoryId);
    return category?.name || 'N/A';
  };

  const getBrandName = (brandId) => {
    const brand = brands.find(b => b.id == brandId);
    return brand?.name || 'N/A';
  };


  const handleToggleStatus = (variant) => {
    setSelectedVariant(variant);
    setShowConfirm(true);
  };

  const confirmToggleStatus = () => {
    // Call API to toggle status
    fetchVariants();
    setShowConfirm(false);
    setSelectedVariant(null);
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
    // Create print content
    const printWindow = window.open('', '', 'width=400,height=300');
    printWindow.document.write(`
      <html>
        <head>
          <title>In tem mã vạch -  ${product.name} ${product.unit} ${Object.values(variant.attributes || {})[0] || ""}</title>
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
              padding: 20px;
              width: 300px;
            }
            .product-name { font-size: 14px; font-weight: bold; margin-bottom: 10px; }
            .barcode { font-size: 24px; font-family: 'Courier New', monospace; margin: 15px 0; }
            .price { font-size: 18px; font-weight: bold; color: #000; }
            .sku { font-size: 12px; color: #666; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="barcode-label">
            <div class="product-name">
            ${product.name}-${product.unit}:${Object.values(variant.attributes || {})[0] || ""}
            </div>
            <div class="barcode">${variant.barcode || 'N/A'}</div>
            <div class="price">${(variant.sell_price || 0).toLocaleString('vi-VN')}đ</div>
            <div class="sku">SKU: ${variant.sku}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
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
        <div className="fixed inset-0 bg-black/50 shadow-xl backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Xác nhận thay đổi trạng thái</h3>
            <p className="text-gray-600 mb-6">
              Bạn có muốn sửa trạng thái của sản phẩm này thành {selectedVariant?.is_active ? "ngưng bán" : "đang bán"}?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="danger"
                onClick={() => setShowConfirm(false)}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={confirmToggleStatus}
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-4">
          <Button variant="ghost" onClick={() => navigate("/products")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">{product.name}</h1>
            <p className="text-md text-gray-500 font-semibold">ID: #{product.id}</p>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-gray-300 rounded-lg bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Box className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng tồn kho</p>
              <p className="text-2xl font-bold text-gray-900">{product.total_stock}</p>
            </div>
          </div>
        </Card>
        <Card className="border border-gray-300 rounded-lg bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Đã bán (30 ngày)</p>
              <p className="text-2xl font-bold text-gray-900">342</p>
            </div>
          </div>
        </Card>
        <Card className="border border-gray-300 rounded-lg bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Ngày tạo: {product.created_at}</p>
              <p className="text-xs text-gray-500">Cập nhật: {product.created_at}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column - Product Image */}
        <Card className="border border-gray-300 rounded-lg bg-white p-4">
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-3">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Chưa có hình ảnh</p>
          </div>
        </Card>

        {/* Right Column - Product Info */}
        <Card className="border border-gray-300 rounded-lg bg-white">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold">Thông tin cơ bản</h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium text-gray-500">Tên sản phẩm</Label>
                <p className="text-sm font-semibold text-gray-900 mt-1">{product.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Thương hiệu</Label>
                <p className="text-sm text-gray-900 mt-1">{getBrandName(product.brand_id)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Danh mục</Label>
                <div className="mt-1">
                  <Badge className="inline-block px-2 py-1 bg-neutral-300 rounded-full text-xs">{getCategoryName(product.category_id)}</Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Đơn vị</Label>
                <p className="text-sm text-gray-900 mt-1">{product.unit}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Thuế</Label>
                <div className="mt-1">
                  <Badge className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">10%</Badge>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Mô tả</Label>
              <p className="text-sm text-gray-900 mt-1">{product.description}</p>
            </div>
          </div>
          <div className="p-4 border-t border-gray-200">
            <Button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Chỉnh sửa sản phẩm
            </Button>
          </div>
        </Card>
      </div>
      {/* Variants */}
      <Card className="border border-gray-300 rounded-lg bg-white">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">Biến thể sản phẩm</h2>
            <span className="text-gray-300">•</span>
            <Badge className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              {variants.length} biến thể
            </Badge>
          </div>
          <Button
            onClick={() => navigate("/products/addproduct_variant", { state: { product } })}
            className="bg-blue-600 hover:bg-blue-700 text-white">
            Thêm biến thể
          </Button>
        </div>
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-16">STT</TableHead>
                <TableHead>Tên biến thể</TableHead>
                <TableHead>Thuộc tính</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>Giá nhập</TableHead>
                <TableHead>Giá bán</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((variant, index) => (
                <TableRow key={variant.id} className="hover:bg-gray-100">
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="relative w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer border-0 p-0"
                        onMouseEnter={() => setHoveredImage(variant.id)}
                        onMouseLeave={() => setHoveredImage(null)}
                        aria-label="Xem ảnh biến thể"
                      >
                        <Package className="w-5 h-5 text-gray-400" />
                        {hoveredImage === variant.id && (
                          <div className="absolute left-12 top-0 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-2">
                            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-24 h-24 text-gray-400" />
                            </div>
                          </div>
                        )}
                      </button>
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {`${product.unit} ${Object.values(variant.attributes || {})[0] || ""}`}
                        </span>

                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      <div className="space-y-1 text-sm">
                        {Object.entries(variant.attributes).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-gray-400 mr-1 capitalize">
                              {key}:
                            </span>
                            <span className="font-medium text-gray-700">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Badge>

                  </TableCell>

                  <TableCell className="text-gray-600">{variant.sku}</TableCell>
                  <TableCell className="text-gray-600">{variant.barcode}</TableCell>
                  <TableCell>{(variant.cost_price || 0).toLocaleString('vi-VN')}đ</TableCell>
                  <TableCell className="font-semibold">{variant.sell_price?.toLocaleString('vi-VN') || "0"}đ</TableCell>
                  <TableCell>
                    <Badge className={variant.stock_quantity > 0 ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}>
                      {variant.stock_quantity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {variant.is_active ? (
                      <Badge className="bg-green-200 text-green-700">Đang bán</Badge>
                    ) : (
                      <Badge className="bg-red-200 text-red-800">Ngưng bán</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        title={variant.is_active ? "Ngưng bán" : "Bật bán"}
                        onClick={() => handleToggleStatus(variant)}
                      >
                        <Power className={`w-4 h-4 ${variant.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Chỉnh sửa"
                        onClick={() => handleEditVariant(variant)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        title="In tem mã vạch"
                        onClick={() => handlePrintBarcode(variant)}
                      >
                        <Printer className="w-4 h-4 text-blue-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
        isOpen={isEditVariantModalOpen}
        onClose={() => setIsEditVariantModalOpen(false)}
        onSave={handleSaveVariant}
      />
    </div>
  );
}

export default ProductDetail;
