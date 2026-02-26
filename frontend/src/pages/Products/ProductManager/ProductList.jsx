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
  const [showConfirm, setShowConfirm] = useState(false);
  const [productToToggle, setProductToToggle] = useState(null);
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

  const handleToggleStatus = (product) => {
    setProductToToggle(product);
    setShowConfirm(true);
  };

  const confirmToggleStatus = async () => {
    try {
      await api.put(`/products/${productToToggle.id}/toggle-status`);
      setToastMessage(`Đã ${productToToggle.is_active ? 'ngừng' : 'kích hoạt'} bán sản phẩm!`);
      fetchProducts();
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      setToastMessage("Lỗi khi thay đổi trạng thái!");
      setTimeout(() => setToastMessage(""), 3000);
    } finally {
      setShowConfirm(false);
      setProductToToggle(null);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Power className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Xác nhận thay đổi</h3>
            </div>
            <p className="text-gray-600 mb-6 ml-15">
              Bạn có muốn {productToToggle?.is_active ? "ngừng bán" : "kích hoạt"} sản phẩm <span className="font-semibold">{productToToggle?.name}</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => setShowConfirm(false)}
                className="hover:bg-gray-100"
              >
                Hủy
              </Button>
              <Button
                onClick={confirmToggleStatus}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Message */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-3 bg-white border-l-4 border-green-500 rounded-xl px-6 py-4 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="text-green-600 w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-800">
              {toastMessage}
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý sản phẩm
            </h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Tổng số: <span className="font-semibold text-blue-600">{filteredProducts.length}</span> sản phẩm
            </p>
          </div>
          <div className="flex gap-3">
            <Button className="bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700 text-white shadow-lg shadow-green-500/30">
              Xuất dữ liệu
            </Button>
            <Button
              onClick={() => navigate("/products/addproduct")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm sản phẩm mới
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative col-span-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                  className="pl-12 h-12 text-sm border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="h-12 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>

              <select
                className="h-12 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <CardTitle className="text-xl font-bold text-gray-800">Danh sách sản phẩm</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-slate-50 border-b-2 border-gray-200">
                    <TableHead
                      className="cursor-pointer hover:bg-blue-50 select-none transition-colors font-semibold"
                      onClick={() => handleSort("name")}
                    >
                      Sản phẩm {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-blue-50 select-none transition-colors font-semibold"
                      onClick={() => handleSort("brand")}
                    >
                      Thương hiệu {sortField === "brand" && (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="font-semibold">Danh mục</TableHead>
                    <TableHead className="font-semibold">Biến thể</TableHead>
                    <TableHead className="font-semibold">Trạng thái</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-blue-50 select-none transition-colors font-semibold"
                      onClick={() => handleSort("created_at")}
                    >
                      Thời gian tạo {sortField === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="text-center font-semibold">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Không tìm thấy sản phẩm nào</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow className="hover:bg-blue-50/50 transition-colors border-b border-gray-100" key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-sm">
                              <Package className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                              <p className="text-xs text-gray-500">
                                {getBrandName(product.brand_id)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-gray-700">{getBrandName(product.brand_id)}</TableCell>
                        <TableCell>
                          <Badge className="bg-gradient-to-r from-slate-100 to-gray-100 text-gray-700 border-0 font-medium" variant="secondary">
                            {getCategoryName(product.category_id)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-0 font-medium">
                            {product.variant_count} biến thể
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {product.is_active ? (
                            <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-0 font-medium">Đang bán</Badge>
                          ) : (
                            <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-0 font-medium">Ngừng bán</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm">{product.created_at}</TableCell>

                        <TableCell className="text-center">
                          <div className="flex justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/products/detail/${product.id}`, {
                                state: { product }
                              })}
                              className="hover:bg-blue-100 hover:text-blue-600 rounded-lg"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleStatus(product)}
                              className={`hover:bg-amber-100 rounded-lg ${product.is_active ? 'text-green-600 hover:text-amber-600' : 'text-gray-400 hover:text-green-600'}`}
                              title={product.is_active ? "Ngừng bán" : "Kích hoạt"}
                            >
                              <Power className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditClick(product)}
                              className="hover:bg-indigo-100 hover:text-indigo-600 rounded-lg"
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
            </div>
          </CardContent>
        </Card>
      </div>

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