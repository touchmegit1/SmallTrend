import { useEffect, useState } from "react";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ProductComponents/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ProductComponents/table";
import { Badge } from "../ProductComponents/badge";
import { Plus, Search, Edit, Package, Eye, CheckCircle, Power } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import EditProductModal from "./EditProductModal";

// Redux Custom Hooks cho tác vụ gọi dữ liệu nền
import { useFetchProducts } from "../../../hooks/products";
import { useFetchCategories } from "../../../hooks/categories";
import { useFetchBrands } from "../../../hooks/brands";
import { useFetchTaxRates } from "../../../hooks/taxRates";
import api from "../../../config/axiosConfig";

/**
 * Màn hình danh sách Sản phẩm (ProductListScreen)
 * Nơi giúp quản trị viên thống kê tất cả sản phẩm, lọc theo trạng thái/chi nhánh, 
 * và thay đổi kích hoạt nhanh.
 */
export function ProductListScreen() {
  // Navigation & URL Location từ React Router DOM
  const navigate = useNavigate();
  const location = useLocation();

  // --- QUẢN LÝ STATE ---
  // State phục vụ việc Lọc/Tìm kiếm
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterTaxRate, setFilterTaxRate] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // State phục vụ sắp xếp thứ tự bảng (Sorting)
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  // State phục vụ Modal UI & Toast cảnh báo
  const [toastMessage, setToastMessage] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [productToToggle, setProductToToggle] = useState(null);

  // --- API HOOKS ---
  const { products, loading, error, fetchProducts } = useFetchProducts();
  const { categories } = useFetchCategories();
  const { brands } = useFetchBrands();
  const { taxRates } = useFetchTaxRates();

  // --- CÁC HÀM TIỆN ÍCH (HELPER) --- 
  /**
   * Truy xuất tên Danh mục từ ID (Vì Product Entity chỉ lưu khoá ngoại category_id)
   */
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id == categoryId);
    return category?.name || 'N/A';
  };

  /**
   * Truy xuất tên Thương hiệu từ ID
   */
  const getBrandName = (brandId) => {
    const brand = brands.find(b => b.id == brandId);
    return brand?.name || 'N/A';
  };

  // --- LOGIC XỬ LÝ (HANDLERS) ---
  /**
   * Đảo ngược thứ tự sắp xếp cột của bảng (A-Z sang Z-A)
   */
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  /**
   * Bật popup xác nhận Ngừng/Kích hoạt bán
   */
  const handleToggleStatus = (product) => {
    setProductToToggle(product);
    setShowConfirm(true); // Mở Modal Cảnh báo
  };

  /**
   * Submit API để tiến hành thay đổi status
   */
  const confirmToggleStatus = async () => {
    try {
      await api.put(`/products/${productToToggle.id}/toggle-status`);
      setToastMessage(`Đã ${productToToggle.is_active ? 'ngừng' : 'kích hoạt'} bán sản phẩm!`);
      fetchProducts(); // Làm mới dữ liệu sau khi sửa thành công
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      setToastMessage("Lỗi khi thay đổi trạng thái!");
      setTimeout(() => setToastMessage(""), 3000);
    } finally {
      // Dọn dẹp đóng dại dọn Modal
      setShowConfirm(false);
      setProductToToggle(null);
    }
  };

  /**
   * Gửi Props sang màn hình Edit Modal
   */
  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  /**
   * Xử lý sau khi người dùng lưu Modal Edit thành công
   */
  const handleSaveProduct = async (updatedProduct) => {
    setToastMessage("Cập nhật sản phẩm thành công!");
    setIsEditModalOpen(false);
    await fetchProducts();
    setTimeout(() => setToastMessage(""), 3000);
  };

  // --- USE EFFECTS ---
  // Dùng để bắt Navigation State Message (Ví dụ khi tạo xong SP mới, trang Add chuyển hướng sang đây và báo thành công)
  useEffect(() => {
    if (location.state?.message) {
      setToastMessage(location.state.message);
      // Giới hạn hiển thị Toast là 3s
      setTimeout(() => {
        setToastMessage("");
      }, 3000);
    }
  }, [location.state]);

  // --- LỌC DỮ LIỆU HIỂN THỊ (FILTER DATA) ---
  const filteredProducts = (products || [])
    .filter((product) => {
      // 1. Map ID ra tên thật để filter text search dễ dàng
      const brandName = getBrandName(product.brand_id);
      const categoryName = getCategoryName(product.category_id);

      // 2. Xét theo từ khoá tìm kiếm
      const matchesSearch =
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brandName.toLowerCase().includes(searchQuery.toLowerCase());

      // 3. Xét theo Category
      const matchesCategory =
        filterCategory === "all" || categoryName === filterCategory;

      // 4. Xét theo Tax Rate
      const matchesTaxRate =
        filterTaxRate === "all" || String(product.tax_rate_id) === filterTaxRate;

      // 5. Xét theo Trạng thái Hoạt động
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && product.is_active) ||
        (filterStatus === "inactive" && !product.is_active);

      return matchesSearch && matchesCategory && matchesTaxRate && matchesStatus;
    })
    .sort((a, b) => {
      // Không sort nếu đang null
      if (!sortField) return 0;

      let aValue, bValue;

      // Logic tuỳ chỉnh nếu sort theo Tên thương hiệu, hoặc Date, hoặc Text thuần
      if (sortField === "brand") {
        aValue = getBrandName(a.brand_id);
        bValue = getBrandName(b.brand_id);
      } else if (sortField === "created_at" || sortField === "updated_at") {
        aValue = new Date(a[sortField]);
        bValue = new Date(b[sortField]);
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }

      if (!aValue || !bValue) return 0;

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Trả boolean -1 & 1 cho hàm Sort
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });


  // --- TRẠNG THÁI CHỜ CHO KHỐI UI ---
  if (loading) return <p>Đang tải danh sách sản phẩm...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">

      {/* KHỐI HIỂN THỊ 1: Popup xác nhận thay đổi Status (Enable/Disable) */}
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
                className="bg-blue-600 hover:bg-blue-700 text-white border border-transparent shadow-sm hover:shadow-md"
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* KHỐI HIỂN THỊ 2: Toast thông báo chung cho trang */}
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

      {/* KHỐI HIỂN THỊ CHÍNH */}
      <div className="space-y-6">

        {/* --- Phần Header Thông tin & Nút thêm --- */}
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
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30">
              Xuất dữ liệu
            </Button>
            <Button
              onClick={() => navigate("/products/addproduct")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 border border-transparent"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm sản phẩm mới
            </Button>
          </div>
        </div>

        {/* --- Bộ Lọc Filter Search --- */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Cột Search */}
              <div className="relative col-span-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                  className="pl-12 h-12 text-sm border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Lọc: Category */}
              <select
                className="h-12 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>

              {/* Lọc: Tax */}
              <select
                className="h-12 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
                value={filterTaxRate}
                onChange={(e) => setFilterTaxRate(e.target.value)}
              >
                <option value="all">Tất cả thuế</option>
                {taxRates.map((tax) => (
                  <option key={tax.id} value={String(tax.id)}>{tax.name} ({tax.rate}%)</option>
                ))}
              </select>

              {/* Lọc: Trạng thái (Active/Inactive) */}
              <select
                className="h-12 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
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

        {/* --- Component Bảng Danh Sách Sản Phẩm --- */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4">
            <CardTitle className="text-xl font-bold text-gray-800">Danh sách sản phẩm</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-slate-50 border-b-2 border-gray-200">
                  <TableHead
                    className="cursor-pointer hover:bg-blue-50 select-none transition-colors font-semibold"
                    onClick={() => handleSort("name")}
                  >
                    Sản phẩm {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="font-semibold">Danh mục</TableHead>
                  <TableHead className="font-semibold">Thuế</TableHead>
                  <TableHead className="font-semibold">Biến thể</TableHead>
                  <TableHead className="font-semibold">Trạng thái</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-blue-50 select-none transition-colors font-semibold"
                    onClick={() => handleSort("updated_at")}
                  >
                    Cập nhật {sortField === "updated_at" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="text-center font-semibold">Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {/* Fallback khi mảng data trống rỗng (không có record hoặc filter không thấy) */}
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">Không tìm thấy sản phẩm nào phù hợp</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow className="hover:bg-blue-50/50 transition-colors border-b border-gray-100" key={product.id}>
                      {/* Cột 1: Box Ảnh + Tên Sản phẩm & Tên Brand sub-text */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {product.image_url ? (
                            <img
                              src={product.image_url.startsWith('http') ? product.image_url : `http://localhost:8081${product.image_url.startsWith('/') ? '' : '/'}${product.image_url}`}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover shadow-sm border border-gray-100 bg-white"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center shadow-sm">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-900 line-clamp-1 max-w-[200px]">{product.name}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">{getBrandName(product.brand_id)}</p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Cột 2: Danh mục Item Badge */}
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-slate-100 to-gray-100 text-gray-700 border border-gray-200 font-medium" variant="ghost">
                          {product.category_name || 'N/A'}
                        </Badge>
                      </TableCell>

                      {/* Cột 3: Loại Tax Badge */}
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200 font-medium" variant="ghost">
                          {product.tax_rate_name || 'N/A'}
                        </Badge>
                      </TableCell>

                      {/* Cột 4: Số lượng Biến thể Badge */}
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200 font-medium" variant="ghost">
                          {product.variant_count} biến thể
                        </Badge>
                      </TableCell>

                      {/* Cột 5: Trạng thái (Status Bubble) */}
                      <TableCell>
                        {product.is_active ? (
                          <Badge className="bg-green-50 text-green-700 border border-green-200 font-medium" variant="success">Đang bán</Badge>
                        ) : (
                          <Badge className="bg-red-50 text-red-700 border border-red-200 font-medium" variant="destructive">Ngừng bán</Badge>
                        )}
                      </TableCell>

                      {/* Cột 6: Timestamp được format Locale hiển thị */}
                      <TableCell className="text-gray-600 text-xs">
                        {product.updated_at ? new Date(product.updated_at).toLocaleString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '-'}
                      </TableCell>

                      {/* Cột 7: Nút Hành động */}
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1">

                          {/* Nút Xem Chi Tiết -> Redirect */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/products/detail/${product.id}`, {
                              state: { product }
                            })}
                            className="hover:bg-blue-100 hover:text-blue-600 rounded-lg p-1"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {/* Nút Change Status -> Mọi thay đổi đều kích hoạt showConfirm Modal */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleStatus(product)}
                            className={`hover:bg-amber-100 rounded-lg p-1 ${product.is_active ? 'text-green-600 hover:text-amber-600' : 'text-gray-400 hover:text-green-600'}`}
                            title={product.is_active ? "Ngừng bán" : "Kích hoạt"}
                          >
                            <Power className="w-4 h-4" />
                          </Button>

                          {/* Nút Render Edit -> Trực tiếp nạp dữ liệu vào component Dialog Modal */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditClick(product)}
                            className="hover:bg-indigo-100 hover:text-indigo-600 rounded-lg p-1"
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
      </div>

      {/* COMPONENT MODAL CHỈNH SỬA - Ẩn hiện tuỳ thuộc vào biến isEditModalOpen */}
      <EditProductModal
        product={selectedProduct} // Nạp Data prop vào
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)} // Sự kiện thoát
        onSave={handleSaveProduct} // Callback sau khi save DB thành công
      />
    </div>
  );
}

export default ProductListScreen;