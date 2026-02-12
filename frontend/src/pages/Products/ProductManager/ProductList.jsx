import { useEffect, useState } from "react";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ProductComponents/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ProductComponents/table";
import { Badge } from "../ProductComponents/badge";
import { Plus, Search, Edit, Package, Eye, CheckCircle, Power } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import EditProductModal from "./EditProductModal";
import { useFetchProducts } from "../../../hooks/products";
import { useFetchCategories } from "../../../hooks/categories";
import { useFetchBrands } from "../../../hooks/brands";
import api from "../../../config/axiosConfig";


export function ProductListScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const navigate = useNavigate();
  const location = useLocation();
  const [toastMessage, setToastMessage] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { products, loading, error, fetchProducts } = useFetchProducts();
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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredProducts = (products || [])
    .filter((product) => {
      const brandName = getBrandName(product.brand_id);
      const categoryName = getCategoryName(product.category_id);

      const matchesSearch =
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brandName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        filterCategory === "all" || categoryName === filterCategory;

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && product.is_active) ||
        (filterStatus === "inactive" && !product.is_active);

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortField) return 0;

      let aValue, bValue;

      if (sortField === "brand") {
        aValue = getBrandName(a.brand_id);
        bValue = getBrandName(b.brand_id);
      } else if (sortField === "created_at") {
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }

      if (!aValue || !bValue) return 0;

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const handleToggleStatus = async (product) => {
    try {
      await api.put(`/products/${product.id}/toggle-status`);
      setToastMessage(`Đã ${product.is_active ? 'ngừng' : 'kích hoạt'} bán sản phẩm!`);
      fetchProducts();
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      setToastMessage("Lỗi khi thay đổi trạng thái!");
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleSaveProduct = async (updatedProduct) => {
    setToastMessage("Cập nhật sản phẩm thành công!");
    setIsEditModalOpen(false);
    await fetchProducts(); // Refresh the product list
    setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    if (location.state?.message) {
      setToastMessage(location.state.message);

      // tự ẩn sau 3s
      setTimeout(() => {
        setToastMessage("");
      }, 3000);
    }
  }, [location.state]);

  // xu ly loading & error
  if (loading) return <p>Đang tải sản phẩm...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      {/* Alter */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50">
          <div className="relative flex gap-4 bg-green-50 border border-green-200 rounded-xl px-8 py-5 min-w-105 shadow-lg">
            <CheckCircle className="text-green-600 w-6 h-6" />
            <span className="text-base font-semibold text-gray-800">
              {toastMessage}
            </span>
          </div>
        </div>
      )}
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
          <Button
            onClick={() => navigate("/products/addproduct")}
            className="bg-blue-600 hover:bg-blue-700"
          >
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
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang bán</option>
              <option value="inactive">Ngừng bán</option>
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
                <TableHead
                  className="cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort("name")}
                >
                  Sản phẩm {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort("brand")}
                >
                  Thương hiệu {sortField === "brand" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Biến thể</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort("created_at")}
                >
                  Thời gian tạo {sortField === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Không tìm thấy sản phẩm nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow className="hover:bg-gray-200" key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">
                            {getBrandName(product.brand_id)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getBrandName(product.brand_id)}</TableCell>
                    <TableCell>
                      <Badge className="bg-neutral-300" variant="secondary">{getCategoryName(product.category_id)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-purple-100 text-purple-700">
                        {product.variant_count} biến thể
                      </Badge>

                    </TableCell>
                    <TableCell>
                      {product.is_active ? (
                        <Badge className="bg-green-100 text-green-700">Đang bán</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700">Ngừng bán</Badge>
                      )}
                    </TableCell>
                    <TableCell>{product.created_at}</TableCell>

                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/products/detail/${product.id}`, {
                            state: { product }
                          })}
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleStatus(product)}
                          title={product.is_active ? "Ngừng bán" : "Kích hoạt"}
                        >
                          <Power className={`w-4 h-4 ${product.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditClick(product)}
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EditProductModal
        product={selectedProduct}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProduct}
      />
    </div>
  );
}

export default ProductListScreen