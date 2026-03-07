import { useEffect, useState, useMemo } from "react";
import Button from "../ProductComponents/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ProductComponents/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ProductComponents/table";
import { Badge } from "../ProductComponents/badge";
import { Plus, Edit, Package, Eye, CheckCircle, Power, Trash2, AlertTriangle, X, Filter, Layers, Tag, Box, Puzzle, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import EditProductModal from "./EditProductModal";

// Dùng CustomSelect có sẵn trong hệ thống
import CustomSelect from "../../../components/common/CustomSelect";

// Redux Custom Hooks cho tác vụ gọi dữ liệu nền
import { useFetchProducts } from "../../../hooks/products";
import { useFetchCategories } from "../../../hooks/categories";
import { useFetchBrands } from "../../../hooks/brands";
import { useFetchTaxRates } from "../../../hooks/taxRates";
import api from "../../../config/axiosConfig";

/**
 * Màn hình danh sách Sản phẩm (ProductListScreen)
 * Redesigned: Filter theo thứ tự phân cấp Category → Brand → Base Product → Variant
 * Sử dụng CustomSelect component có sẵn
 */
export function ProductListScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- STATE QUẢN LÝ FILTER PHÂN CẤP ---
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterBrand, setFilterBrand] = useState(null);
  const [filterProduct, setFilterProduct] = useState(null);
  const [filterVariant, setFilterVariant] = useState(null);

  // State cho variants data (fetch theo product)
  const [variantsData, setVariantsData] = useState([]);
  const [variantsLoading, setVariantsLoading] = useState(false);

  // State phục vụ sắp xếp thứ tự bảng (Sorting)
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  // State phục vụ Modal UI & Toast cảnh báo
  const [toastMessage, setToastMessage] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [productToToggle, setProductToToggle] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [, forceUpdate] = useState(0);

  // --- API HOOKS ---
  const { products, loading, error, fetchProducts, deleteProduct } = useFetchProducts();
  const { categories } = useFetchCategories();
  const { brands } = useFetchBrands();
  const { taxRates } = useFetchTaxRates();

  // Debug: Check if categories are loaded
  useEffect(() => {
    console.log('Categories loaded:', categories);
  }, [categories]);

  // --- CÁC HÀM TIỆN ÍCH (HELPER) ---
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id == categoryId);
    return category?.name || 'N/A';
  };

  const getBrandName = (brandId) => {
    const brand = brands.find(b => b.id == brandId);
    return brand?.name || 'N/A';
  };

  // --- DEPENDENT FILTER LOGIC ---

  // Brands lọc theo Category đã chọn
  // Mở rộng logic: lấy trực tiếp thuộc tính category(Id) của brand VÀ cả những brand đang được gán cho các sản phẩm trong danh mục này.
  const brandsForCategory = useMemo(() => {
    if (!filterCategory) return [];

    // Lấy Set chứa các brand_id từ danh sách products thuộc category hiện tại
    const activeBrandIds = new Set(
      (products || [])
        .filter((p) => String(p.category_id) === String(filterCategory) && p.brand_id)
        .map((p) => String(p.brand_id))
    );

    return brands.filter((b) => {
      // 1. Brand có thông tin object category
      const matchObj = b.category && String(b.category.id) === String(filterCategory);
      // 2. Brand trả về theo field category_id hoặc categoryId trực tiếp
      const matchField = (b.category_id && String(b.category_id) === String(filterCategory)) ||
        (b.categoryId && String(b.categoryId) === String(filterCategory));
      // 3. Brand đang được dùng bởi ít nhất 1 product trong category này
      const matchProduct = activeBrandIds.has(String(b.id));

      return matchObj || matchField || matchProduct;
    });
  }, [filterCategory, brands, products]);

  // Products lọc theo Brand đã chọn (trong category đã chọn)
  const productsForBrand = useMemo(() => {
    if (!filterBrand) return [];
    return (products || []).filter(
      (p) => String(p.brand_id) === String(filterBrand) && String(p.category_id) === String(filterCategory)
    );
  }, [filterBrand, filterCategory, products]);

  // Fetch variants khi chọn product cụ thể
  useEffect(() => {
    if (filterProduct) {
      setVariantsLoading(true);
      api
        .get(`/products/${filterProduct}/variants`)
        .then((res) => {
          const data = Array.isArray(res.data) ? res.data : [];
          const mapped = data.map((v) => ({
            id: v.id,
            name: v.name,
            sku: v.sku,
            barcode: v.barcode,
            sell_price: v.sellPrice,
            cost_price: v.costPrice,
            stock_quantity: v.stockQuantity,
            image_url: v.imageUrl,
            is_active: v.isActive,
            created_at: v.createdAt,
            unit_name: v.unitName,
            attributes: v.attributes,
          }));
          setVariantsData(mapped);
        })
        .catch(() => setVariantsData([]))
        .finally(() => setVariantsLoading(false));
    } else {
      setVariantsData([]);
    }
  }, [filterProduct]);

  // --- CASCADE RESET HANDLERS ---
  const handleCategoryChange = (val) => {
    console.log('handleCategoryChange called with:', val);
    setFilterCategory(val);
    setFilterBrand(null);
    setFilterProduct(null);
    setFilterVariant(null);
    setVariantsData([]);
  };

  const handleBrandChange = (val) => {
    setFilterBrand(val);
    setFilterProduct(null);
    setFilterVariant(null);
    setVariantsData([]);
  };

  const handleProductChange = (val) => {
    setFilterProduct(val);
    setFilterVariant(null);
  };

  const handleVariantChange = (val) => {
    console.log('handleVariantChange called with:', val);
    console.log('variantsData:', variantsData);
    setFilterVariant(val);
  };

  const handleResetFilters = () => {
    setFilterCategory(null);
    setFilterBrand(null);
    setFilterProduct(null);
    setFilterVariant(null);
    setVariantsData([]);
  };

  // --- LOGIC XỬ LÝ ---
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

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

  const handleSaveProduct = async () => {
    setToastMessage("Cập nhật sản phẩm thành công!");
    setIsEditModalOpen(false);
    await fetchProducts();
    setTimeout(() => setToastMessage(""), 3000);
  };

  const canDeleteProduct = (createdAt) => {
    if (!createdAt) return false;
    const createdTime = new Date(createdAt).getTime();
    const now = new Date().getTime();
    return Math.abs(now - createdTime) <= 2 * 60 * 1000;
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteProduct = async () => {
    try {
      await deleteProduct(productToDelete.id);
      setToastMessage("Xóa sản phẩm thành công!");
      await fetchProducts();
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      setToastMessage(err.message || "Lỗi khi xóa sản phẩm!");
      setTimeout(() => setToastMessage(""), 3000);
    } finally {
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    }
  };

  // --- USE EFFECTS ---
  useEffect(() => {
    const timer = setInterval(() => forceUpdate((n) => n + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      setToastMessage(location.state.message);
      setTimeout(() => setToastMessage(""), 3000);
    }
  }, [location.state]);

  // --- LỌC DỮ LIỆU HIỂN THỊ ---
  const filteredProducts = useMemo(() => {
    let result = products || [];

    if (filterCategory) {
      result = result.filter((p) => String(p.category_id) === String(filterCategory));
    }
    if (filterBrand) {
      result = result.filter((p) => String(p.brand_id) === String(filterBrand));
    }
    if (filterProduct) {
      result = result.filter((p) => String(p.id) === String(filterProduct));
    }

    return [...result].sort((a, b) => {
      if (!sortField) return 0;
      let aValue, bValue;

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
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [products, filterCategory, filterBrand, filterProduct, sortField, sortOrder]);

  // --- DROPDOWN OPTIONS ---
  const categoryOptions = useMemo(() => {
    console.log('Creating categoryOptions, categories:', categories);
    const options = [
      { value: null, label: 'Tất cả danh mục' },
      ...(categories || []).map((c) => ({ value: String(c.id), label: c.name })),
    ];
    console.log('CategoryOptions created:', options);
    console.log('Current filterCategory:', filterCategory);
    return options;
  }, [categories, filterCategory]);

  const brandOptions = useMemo(() => [
    { value: null, label: !filterCategory ? '-- Chọn danh mục trước --' : 'Tất cả thương hiệu' },
    ...(brandsForCategory || []).map((b) => ({ value: String(b.id), label: b.name })),
  ], [filterCategory, brandsForCategory]);

  const productOptions = useMemo(() => [
    { value: null, label: !filterBrand ? '-- Chọn thương hiệu trước --' : 'Tất cả sản phẩm' },
    ...(productsForBrand || []).map((p) => ({ value: String(p.id), label: p.name })),
  ], [filterBrand, productsForBrand]);

  const variantOptions = useMemo(() => [
    { value: null, label: !filterProduct ? '-- Chọn sản phẩm trước --' : (variantsLoading ? 'Đang tải...' : 'Tất cả loại sản phẩm') },
    ...(variantsData || []).map((v) => ({ value: String(v.id), label: v.name })),
  ], [filterProduct, variantsLoading, variantsData]);

  const hasAnyFilter = filterCategory || filterBrand || filterProduct || filterVariant;
  const activeStep = filterVariant ? 4 : filterProduct ? 3 : filterBrand ? 2 : filterCategory ? 1 : 0;

  // --- TRẠNG THÁI CHỜ ---
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Đang tải danh sách sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">

      {/* Popup xác nhận thay đổi Status */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
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
              <Button variant="ghost" onClick={() => setShowConfirm(false)} className="hover:bg-gray-100">Hủy</Button>
              <Button onClick={confirmToggleStatus} className="bg-blue-600 hover:bg-blue-700 text-white border border-transparent shadow-sm hover:shadow-md">Xác nhận</Button>
            </div>
          </div>
        </div>
      )}

      {/* Popup xác nhận xóa */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Xóa sản phẩm mới</h3>
            </div>
            <p className="text-gray-600 mb-6 ml-15">
              Bạn có chắc chắn muốn xóa sản phẩm <span className="font-bold">{productToDelete?.name}</span>?
              Hành động này <span className="text-red-600 font-semibold">không thể hoàn tác</span>.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} className="hover:bg-gray-100">Hủy</Button>
              <Button onClick={confirmDeleteProduct} className="bg-red-600 hover:bg-red-700 text-white border border-transparent shadow-sm hover:shadow-md">Xác nhận xóa</Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-3 bg-white border-l-4 border-green-500 rounded-xl px-6 py-4 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="text-green-600 w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-800">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* KHỐI HIỂN THỊ CHÍNH */}
      <div className="space-y-5">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Tổng số: <span className="font-semibold text-blue-600">{filteredProducts.length}</span> sản phẩm
              {hasAnyFilter && <span className="text-gray-400">(đang lọc)</span>}
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

        {/* ============================================================ */}
        {/* BỘ LỌC PHÂN CẤP: Category → Brand → Product → Variant        */}
        {/* ============================================================ */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
          {/* Filter Header với gradient */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Filter className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Bộ lọc phân cấp</h3>
                <p className="text-blue-100 text-xs">Category → Brand → Product → Variant</p>
              </div>
            </div>

            {/* Steps Indicator */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { step: 1, label: "Danh mục" },
                { step: 2, label: "Thương hiệu" },
                { step: 3, label: "Sản phẩm" },
                { step: 4, label: "Loại sản phẩm" },
              ].map((s, i) => {
                const completed = activeStep >= s.step;
                const isCurrent = activeStep === s.step - 1;
                return (
                  <div key={s.step} className="flex items-center gap-1">
                    {i > 0 && <div className={`w-6 h-px ${completed ? "bg-white/60" : "bg-white/20"}`} />}
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
                      ${completed ? "bg-white/90 text-indigo-700"
                        : isCurrent ? "bg-white/40 text-white ring-2 ring-white/50"
                          : "bg-white/15 text-white/50"}
                    `}>
                      {completed ? "✓" : s.step}
                    </div>
                    <span className={`text-xs font-medium hidden xl:inline ${completed ? "text-white" : "text-white/40"}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Reset Button */}
            {hasAnyFilter && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-white text-xs font-medium transition-colors backdrop-blur-sm"
              >
                <X className="w-3.5 h-3.5" />
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Filter Dropdowns - Dùng CustomSelect */}
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Step 1: Category */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                  Danh mục
                </label>
                {categories.length > 0 ? (
                  <select
                    value={filterCategory || ''}
                    onChange={(e) => handleCategoryChange(e.target.value || null)}
                    className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Tất cả danh mục</option>
                    {categories.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-100 text-gray-400">
                    Đang tải...
                  </div>
                )}
              </div>

              {/* Step 2: Brand (depends on Category) */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  <Tag className="w-3.5 h-3.5 text-violet-500" />
                  Thương hiệu
                </label>
                <select
                  value={filterBrand || ''}
                  onChange={(e) => handleBrandChange(e.target.value || null)}
                  disabled={!filterCategory}
                  className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-violet-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">{!filterCategory ? '-- Chọn danh mục trước --' : 'Tất cả thương hiệu'}</option>
                  {brandsForCategory.map((b) => (
                    <option key={b.id} value={String(b.id)}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 3: Base Product (depends on Brand) */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  <Box className="w-3.5 h-3.5 text-emerald-500" />
                  Sản phẩm gốc
                </label>
                <select
                  value={filterProduct || ''}
                  onChange={(e) => handleProductChange(e.target.value || null)}
                  disabled={!filterBrand}
                  className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">{!filterBrand ? '-- Chọn thương hiệu trước --' : 'Tất cả sản phẩm'}</option>
                  {productsForBrand.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 4: Variant (depends on Product) */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  <Puzzle className="w-3.5 h-3.5 text-amber-500" />
                  Loại sản phẩm
                </label>
                <select
                  value={filterVariant || ''}
                  onChange={(e) => handleVariantChange(e.target.value || null)}
                  disabled={!filterProduct || variantsLoading}
                  className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-amber-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">{!filterProduct ? '-- Chọn sản phẩm trước --' : (variantsLoading ? 'Đang tải...' : 'Tất cả loại sản phẩm')}</option>
                  {variantsData.map((v) => (
                    <option key={v.id} value={String(v.id)}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Summary Chips */}
            {hasAnyFilter && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Đang lọc:</span>
                {filterCategory && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                    <Layers className="w-3 h-3" />
                    {categories.find(c => c.id === filterCategory)?.name}
                    <button onClick={() => handleCategoryChange(null)} className="ml-0.5 hover:text-blue-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filterBrand && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-medium border border-violet-200">
                    <Tag className="w-3 h-3" />
                    {brands.find(b => b.id === filterBrand)?.name}
                    <button onClick={() => handleBrandChange(null)} className="ml-0.5 hover:text-violet-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filterProduct && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
                    <Box className="w-3 h-3" />
                    {(products || []).find(p => p.id === filterProduct)?.name}
                    <button onClick={() => handleProductChange(null)} className="ml-0.5 hover:text-emerald-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filterVariant && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-200">
                    <Puzzle className="w-3 h-3" />
                    {variantsData.find(v => v.id === filterVariant)?.name}
                    <button onClick={() => handleVariantChange(null)} className="ml-0.5 hover:text-amber-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ============================================================ */}
        {/* CHI TIẾT VARIANT KHI CHỌN VARIANT CỤ THỂ                    */}
        {/* ============================================================ */}
        {filterVariant && variantsData.length > 0 && (() => {
          const variant = variantsData.find(v => String(v.id) === String(filterVariant));
          if (!variant) return null;
          return (
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 p-4">
                <CardTitle className="text-lg font-bold text-amber-800 flex items-center gap-2">
                  <Puzzle className="w-5 h-5" />
                  Chi tiết loại sản phẩm
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Tên loại sản phẩm</p>
                    <p className="font-bold text-gray-900">{variant.name}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 font-semibold uppercase mb-1">SKU</p>
                    <p className="font-mono text-gray-700">{variant.sku || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Barcode</p>
                    <p className="font-mono text-gray-700">{variant.barcode || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Giá bán</p>
                    <p className="font-bold text-emerald-600">
                      {variant.sell_price ? Number(variant.sell_price).toLocaleString('vi-VN') + ' ₫' : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Đơn vị</p>
                    <p className="font-medium text-gray-700">{variant.unit_name || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Trạng thái</p>
                    {variant.is_active ? (
                      <Badge className="bg-green-50 text-green-700 border border-green-200 font-medium" variant="success">Đang bán</Badge>
                    ) : (
                      <Badge className="bg-red-50 text-red-700 border border-red-200 font-medium" variant="destructive">Ngừng bán</Badge>
                    )}
                  </div>
                  {variant.attributes && Object.keys(variant.attributes).length > 0 && (
                    <div className="col-span-full bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Thuộc tính</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(variant.attributes).map(([key, val]) => (
                          <span key={key} className="px-3 py-1 bg-white rounded-lg text-sm border border-gray-200 text-gray-700">
                            <span className="font-medium text-gray-500">{key}:</span> {val}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* ============================================================ */}
        {/* BẢNG VARIANT KHI CHỌN BASE PRODUCT (KHÔNG VARIANT CỤ THỂ)   */}
        {/* ============================================================ */}
        {filterProduct && !filterVariant && variantsData.length > 0 && (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200 p-4">
              <CardTitle className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                <Puzzle className="w-5 h-5" />
                Các loại sản phẩm của sản phẩm ({variantsData.length} loại sản phẩm)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-slate-50 border-b-2 border-gray-200">
                    <TableHead className="font-semibold">Loại sản phẩm</TableHead>
                    <TableHead className="font-semibold">SKU</TableHead>
                    <TableHead className="font-semibold">Giá bán</TableHead>
                    <TableHead className="font-semibold">Đơn vị</TableHead>
                    <TableHead className="font-semibold">Trạng thái</TableHead>
                    <TableHead className="font-semibold">Thuộc tính</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variantsData.map((v) => (
                    <TableRow key={v.id} className="hover:bg-emerald-50/50 transition-colors border-b border-gray-100">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {v.image_url ? (
                            <img
                              src={v.image_url.startsWith('http') ? v.image_url : `http://localhost:8081${v.image_url.startsWith('/') ? '' : '/'}${v.image_url}`}
                              alt={v.name}
                              className="w-9 h-9 rounded-lg object-cover shadow-sm border border-gray-100"
                            />
                          ) : (
                            <div className="w-9 h-9 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                              <Puzzle className="w-4 h-4 text-emerald-600" />
                            </div>
                          )}
                          <p className="text-sm font-semibold text-gray-900">{v.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-mono text-gray-600">{v.sku || 'N/A'}</TableCell>
                      <TableCell className="text-sm font-bold text-emerald-600">
                        {v.sell_price ? Number(v.sell_price).toLocaleString('vi-VN') + ' ₫' : 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{v.unit_name || 'N/A'}</TableCell>
                      <TableCell>
                        {v.is_active ? (
                          <Badge className="bg-green-50 text-green-700 border border-green-200 text-xs" variant="success">Đang bán</Badge>
                        ) : (
                          <Badge className="bg-red-50 text-red-700 border border-red-200 text-xs" variant="destructive">Ngừng bán</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {v.attributes && Object.entries(v.attributes).map(([key, val]) => (
                            <span key={key} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                              {key}: {val}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Loading variant spinner */}
        {filterProduct && variantsLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mr-2" />
            <span className="text-gray-500 text-sm">Đang tải loại sản phẩm...</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* BẢNG DANH SÁCH SẢN PHẨM CHÍNH                                */}
        {/* ============================================================ */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Danh sách sản phẩm
            </CardTitle>
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
                  <TableHead className="font-semibold">Loại sản phẩm</TableHead>
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
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">Không tìm thấy sản phẩm nào phù hợp</p>
                      {hasAnyFilter && (
                        <button onClick={handleResetFilters} className="mt-3 text-blue-600 text-sm font-medium hover:underline">
                          Xóa bộ lọc để xem tất cả
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow className="hover:bg-blue-50/50 transition-colors border-b border-gray-100" key={product.id}>
                      {/* Cột 1: Ảnh + Tên SP */}
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

                      {/* Cột 2: Danh mục */}
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-slate-100 to-gray-100 text-gray-700 border border-gray-200 font-medium" variant="ghost">
                          {product.category_name || 'N/A'}
                        </Badge>
                      </TableCell>

                      {/* Cột 3: Thuế */}
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200 font-medium" variant="ghost">
                          {product.tax_rate_name || 'N/A'}
                        </Badge>
                      </TableCell>

                      {/* Cột 4: Loại sản phẩm */}
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200 font-medium" variant="ghost">
                          {product.variant_count} loại sản phẩm
                        </Badge>
                      </TableCell>

                      {/* Cột 5: Trạng thái */}
                      <TableCell>
                        {product.is_active ? (
                          <Badge className="bg-green-50 text-green-700 border border-green-200 font-medium" variant="success">Đang bán</Badge>
                        ) : (
                          <Badge className="bg-red-50 text-red-700 border border-red-200 font-medium" variant="destructive">Ngừng bán</Badge>
                        )}
                      </TableCell>

                      {/* Cột 6: Ngày cập nhật */}
                      <TableCell className="text-gray-600 text-xs">
                        {product.updated_at ? new Date(product.updated_at).toLocaleString('vi-VN', {
                          year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                        }) : '-'}
                      </TableCell>

                      {/* Cột 7: Thao tác */}
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1">
                          <Button
                            size="sm" variant="ghost"
                            onClick={() => navigate(`/products/detail/${product.id}`, { state: { product } })}
                            className="hover:bg-blue-100 hover:text-blue-600 rounded-lg p-1"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm" variant="ghost"
                            onClick={() => handleToggleStatus(product)}
                            className={`hover:bg-amber-100 rounded-lg p-1 ${product.is_active ? 'text-green-600 hover:text-amber-600' : 'text-gray-400 hover:text-green-600'}`}
                            title={product.is_active ? "Ngừng bán" : "Kích hoạt"}
                          >
                            <Power className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm" variant="ghost"
                            onClick={() => handleEditClick(product)}
                            className="hover:bg-indigo-100 hover:text-indigo-600 rounded-lg p-1"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {canDeleteProduct(product.created_at) && (
                            <Button
                              size="sm" variant="ghost"
                              onClick={() => handleDeleteClick(product)}
                              className="hover:bg-red-100 hover:text-red-600 rounded-lg p-1 text-red-500"
                              title="Xóa sản phẩm (Trong vòng 2 phút)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
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

      {/* MODAL CHỈNH SỬA */}
      <EditProductModal
        product={selectedProduct}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProduct}
      />
    </div>
  );
}

export default ProductListScreen;