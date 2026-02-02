import { useState } from "react";
import Button from "./ProductComponents/button";
import { Input } from "./ProductComponents/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ProductComponents/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ProductComponents/table";
import { Badge } from "./ProductComponents/badge";
import { Plus, Search, Edit, Package, Eye } from "lucide-react";


const mockProducts = [
  {
    id: "1",
    name: "Coca Cola",
    sku: "CC001",
    barcode: "8934588012345",
    category: "Nước giải khát",
    brand: "Coca Cola",
    unit: "Chai",
    costPrice: 12000,
    retailPrice: 15000,
    wholesalePrice: 13500,
    stock: 245,
    variants: 3,
    status: "active",
  },
  {
    id: "2",
    name: "Mì Hảo Hảo",
    sku: "HH001",
    barcode: "8934588012346",
    category: "Mì ăn liền",
    brand: "Acecook",
    unit: "Gói",
    costPrice: 3000,
    retailPrice: 4000,
    wholesalePrice: 3500,
    stock: 456,
    variants: 5,
    status: "active",
  },
  {
    id: "3",
    name: "Pepsi",
    sku: "PP001",
    barcode: "8934588012347",
    category: "Nước giải khát",
    brand: "Pepsi",
    unit: "Chai",
    costPrice: 11000,
    retailPrice: 14000,
    wholesalePrice: 13000,
    stock: 180,
    variants: 2,
    status: "active",
  },
  {
    id: "4",
    name: "Bánh Oreo",
    sku: "OR001",
    barcode: "8934588012348",
    category: "Bánh kẹo",
    brand: "Oreo",
    unit: "Gói",
    costPrice: 8000,
    retailPrice: 12000,
    wholesalePrice: 10000,
    stock: 320,
    variants: 4,
    status: "active",
  },
  {
    id: "5",
    name: "Sữa tươi Vinamilk",
    sku: "VM001",
    barcode: "8934588012349",
    category: "Sữa",
    brand: "Vinamilk",
    unit: "Hộp",
    costPrice: 6500,
    retailPrice: 9000,
    wholesalePrice: 8000,
    stock: 210,
    variants: 3,
    status: "inactive",
  },
  {
    id: "6",
    name: "Trà xanh Không Độ",
    sku: "KD001",
    barcode: "8934588012350",
    category: "Nước giải khát",
    brand: "Không Độ",
    unit: "Chai",
    costPrice: 9000,
    retailPrice: 12000,
    wholesalePrice: 11000,
    stock: 390,
    variants: 2,
    status: "active",
  },
];


export function ProductListScreen({
  onAddNew = () => { },
  onViewDetail = () => { },
  onEdit = () => { },
  onDelete = () => { },
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode.includes(searchQuery);

    const matchesCategory =
      filterCategory === "all" || product.category === filterCategory;

    const matchesStatus =
      filterStatus === "all" || product.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Quản lý sản phẩm
          </h1>
          <p className="text-gray-500 mt-1">
            Tổng số: {filteredProducts.length} sản phẩm
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="success">
            Xuất dữ liệu
          </Button>
          <Button onClick={onAddNew} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Thêm sản phẩm mới
          </Button>
        </div>

      </div>

      {/* Filters */}
      <Card className="border border-gray-300 rounded-lg bg-white">
        <CardContent className="p-4 ">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm sản phẩm..."
                className="pl-9 h-10 text-md bg-gray-200 border border-gray-200 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Tất cả danh mục</option>
              <option value="Nước giải khát">Nước giải khát</option>
              <option value="Mì ăn liền">Mì ăn liền</option>
              <option value="Sữa">Sữa</option>
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang bán</option>
              <option value="inactive">Ngưng bán</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-gray-300 rounded-lg bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Danh sách sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader >
              <TableRow className="bg-gray-50">
                <TableHead>Sản phẩm</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Giá bán</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          {product.brand}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.barcode}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {product.retailPrice.toLocaleString("vi-VN")}đ
                  </TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{product.status}</TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewDetail(product)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProductListScreen