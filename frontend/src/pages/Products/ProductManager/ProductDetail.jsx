import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Package, Edit, Box, TrendingUp, Calendar, Eye, Trash2 } from "lucide-react";
import Button from "../ProductComponents/button";
import { Card} from "../ProductComponents/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ProductComponents/table";
import { Label } from "../ProductComponents/label";
import { Badge } from "../ProductComponents/badge";

const productVariants = [
  {
    id: 1,
    product_id: 2035,
    variant_name: "Hộp 500g",
    sku: "SKU-00000001",
    barcode: "8934580000001",
    cost: 78000,
    retail_price: 93000,
    stock: 120,
    is_active: true,
  },
  {
    id: 2,
    product_id: 1957,
    variant_name: "Gói nhỏ 50g",
    sku: "SKU-00000002",
    barcode: "8934580000002",
    cost: 95000,
    retail_price: 114000,
    stock: 80,
    is_active: true,
  },
  {
    id: 3,
    product_id: 1933,
    variant_name: "Lon 250ml",
    sku: "SKU-00000003",
    barcode: "8934580000003",
    cost: 20000,
    retail_price: 26000,
    stock: 300,
    is_active: true,
  },
  {
    id: 4,
    product_id: 676,
    variant_name: "Gói thường",
    sku: "SKU-00000004",
    barcode: "8934580000004",
    cost: 18000,
    retail_price: 24000,
    stock: 150,
    is_active: true,
  },
  {
    id: 5,
    product_id: 1289,
    variant_name: "Chai 500ml",
    sku: "SKU-00000005",
    barcode: "8934580000005",
    cost: 150000,
    retail_price: 179000,
    stock: 0,
    is_active: false,
  },
];



function ProductDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product;
  const [hoveredImage, setHoveredImage] = useState(null);

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
    <div className="p-6 space-y-6">
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
              <p className="text-2xl font-bold text-gray-900">1,250</p>
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
                <p className="text-sm text-gray-900 mt-1">{product.brand}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Danh mục</Label>
                <div className="mt-1">
                  <Badge className="inline-block px-2 py-1 bg-neutral-300 rounded-full text-xs">{product.category}</Badge>
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
              onClick={() => navigate("/products/edit", { state: { product } })}
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
              {productVariants.length} biến thể
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
              {productVariants.map((variant, index) => (
                <TableRow key={variant.id} className="hover:bg-gray-100">
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div 
                        className="relative w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer"
                        onMouseEnter={() => setHoveredImage(variant.id)}
                        onMouseLeave={() => setHoveredImage(null)}
                      >
                        <Package className="w-5 h-5 text-gray-400" />
                        {hoveredImage === variant.id && (
                          <div className="absolute left-12 top-0 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-2">
                            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-24 h-24 text-gray-400" />
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="font-medium">{variant.variant_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{variant.sku}</TableCell>
                  <TableCell className="text-gray-600">{variant.barcode}</TableCell>
                  <TableCell>{variant.cost.toLocaleString('vi-VN')}đ</TableCell>
                  <TableCell className="font-semibold">{variant.retail_price.toLocaleString('vi-VN')}đ</TableCell>
                  <TableCell>
                    <Badge className={variant.stock > 0 ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}>
                      {variant.stock}
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

                      <Button size="sm" variant="ghost" title="Chỉnh sửa">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

export default ProductDetail;
