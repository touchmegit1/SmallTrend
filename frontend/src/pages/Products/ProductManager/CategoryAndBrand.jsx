import { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Search, CheckCircle, Tag, FolderTree, X, Filter, ArrowUpDown, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../ProductComponents/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ProductComponents/table";
import { Badge } from "../ProductComponents/badge";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import { Label } from "../ProductComponents/label";
import { useFetchCategories } from "../../../hooks/categories";
import { useFetchBrands } from "../../../hooks/brands";
import { useFetchProducts } from "../../../hooks/products";

const Category_Brand = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [sortOrder, setSortOrder] = useState('desc');
  const [toastMessage, setToastMessage] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    country: ''
  });


  const { categories, loading: catLoading, error: catError, createCategory, updateCategory, deleteCategory } = useFetchCategories();
  const { brands, loading: brandLoading, error: brandError, createBrand, updateBrand, deleteBrand } = useFetchBrands();
  const { products } = useFetchProducts();

  const productCountMap = useMemo(() => {
    const map = {};

    products?.forEach(p => {
      if (activeTab === "categories") {
        map[p.category_id] = (map[p.category_id] || 0) + 1;
      }
      if (activeTab === "brands") {
        map[p.brand_id] = (map[p.brand_id] || 0) + 1;
      }
    });

    return map;
  }, [products, activeTab]);


  const handleAdd = () => {
    setModalMode('add');
    setFormData({
      code: '',
      name: '',
      description: '',
      country: ''
    });

    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setModalMode('edit');
    setSelectedItem(item);
    setFormData({
      code: item.code || '',
      name: item.name,
      description: item.description || '',
      country: item.country || ''
    });

    setShowModal(true);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await (activeTab === 'categories' ? deleteCategory : deleteBrand)(selectedItem.id);
      setToastMessage(`Xóa ${activeTab === 'categories' ? 'danh mục' : 'thương hiệu'} thành công!`);
      setTimeout(() => setToastMessage(""), 3000);
    } catch (error) {
      setToastMessage(`Lỗi: ${error.response?.data?.message || 'Không thể xóa'}`);
      setTimeout(() => setToastMessage(""), 3000);
    } finally {
      setShowDeleteConfirm(false);
      setSelectedItem(null);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name?.trim()) {
      setToastMessage('Vui lòng nhập tên!');
      setTimeout(() => setToastMessage(""), 3000);
      return;
    }

    if (activeTab === 'categories' && !formData.code?.trim()) {
      setToastMessage('Vui lòng nhập mã danh mục!');
      setTimeout(() => setToastMessage(""), 3000);
      return;
    }

    try {
      if (activeTab === 'categories') {
        if (modalMode === 'add') {
          await createCategory(formData);
        } else {
          await updateCategory(selectedItem.id, formData);
        }
      } else {
        if (modalMode === 'add') {
          await createBrand(formData);
        } else {
          await updateBrand(selectedItem.id, formData);
        }
      }
      setToastMessage(`${modalMode === 'add' ? 'Thêm' : 'Cập nhật'} ${activeTab === 'categories' ? 'danh mục' : 'thương hiệu'} thành công!`);
      setTimeout(() => setToastMessage(""), 3000);
      setShowModal(false);
    } catch (error) {
      setToastMessage(`Lỗi: ${error.response?.data?.message || 'Không thể lưu'}`);
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  const data = activeTab === 'categories' ? (categories || []) : (brands || []);
  
  const uniqueCountries = useMemo(() => {
    if (activeTab !== 'brands') return [];
    const countries = brands?.map(b => b.country).filter(Boolean) || [];
    return [...new Set(countries)].sort();
  }, [brands, activeTab]);

  const filteredData = useMemo(() => {
    let filtered = data.filter(item =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (activeTab === 'brands' && countryFilter) {
      filtered = filtered.filter(item => item.country === countryFilter);
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [data, searchQuery, countryFilter, sortOrder, activeTab]);

  if (catLoading || brandLoading) return <p>Đang tải...</p>;
  if (catError || brandError) return <p className="text-red-500">{catError || brandError}</p>;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right">
          <div className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg px-6 py-4 shadow-lg">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Danh mục & Thương hiệu</h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
              {filteredData.length} {activeTab === 'categories' ? 'danh mục' : 'thương hiệu'}
            </span>
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md">
          <Plus className="w-4 h-4 mr-2" />
          Thêm mới
        </Button>
      </div>

      {/* Tabs */}
      <Card className="border-0 shadow-md rounded-xl bg-white overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex p-1 bg-gray-50">
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${activeTab === 'categories'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <FolderTree className="w-4 h-4 inline mr-2" />
              Danh mục
            </button>
            <button
              onClick={() => setActiveTab('brands')}
              className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${activeTab === 'brands'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <Tag className="w-4 h-4 inline mr-2" />
              Thương hiệu
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <CardContent className="p-6">
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder={`Tìm kiếm ${activeTab === 'categories' ? 'danh mục' : 'thương hiệu'}...`}
                className="pl-12 h-12 text-base bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {activeTab === 'brands' && (
              <div className="relative min-w-[200px]">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  className="w-full pl-12 h-12 text-base bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                >
                  <option value="">Tất cả quốc gia</option>
                  {uniqueCountries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            )}
            
            <Button
              variant="outline"
              className="h-12 px-4 rounded-xl border-gray-200 hover:bg-gray-100"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              {sortOrder === 'desc' ? 'Mới nhất' : 'Cũ nhất'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-md rounded-xl bg-white overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <CardTitle className="text-xl font-bold text-gray-800">
            Danh sách {activeTab === 'categories' ? 'Danh mục' : 'Thương hiệu'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                {activeTab === "categories" && (
                  <TableHead className="font-bold text-gray-700">Mã</TableHead>
                )}
                <TableHead className="font-bold text-gray-700">Tên {activeTab === 'categories' ? 'danh mục' : 'thương hiệu'}</TableHead>
                {activeTab === "brands" && (
                  <TableHead className="font-bold text-gray-700">Quốc gia</TableHead>
                )}
                <TableHead className="font-bold text-gray-700">Số sản phẩm</TableHead>
                <TableHead className="font-bold text-gray-700">Thời gian tạo</TableHead>
                <TableHead className="font-bold text-gray-700">Cập nhật lần cuối</TableHead>
                <TableHead className="text-center font-bold text-gray-700">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <>
                  <TableRow key={item.id} className="hover:bg-blue-50 transition-colors border-b border-gray-100">
                    {activeTab === "categories" && (
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 font-mono font-semibold px-3 py-1">
                          {item.code || '-'}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${activeTab === 'categories' ? 'bg-gradient-to-br from-purple-100 to-purple-200' : 'bg-gradient-to-br from-blue-100 to-blue-200'
                          }`}>
                          {activeTab === 'categories' ? (
                            <FolderTree className="w-5 h-5 text-purple-600" />
                          ) : (
                            <Tag className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <button
                            onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                            className="flex items-center gap-2 text-left group"
                          >
                            <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{item.name}</span>
                            {item.description && (
                              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedRow === item.id ? 'rotate-180' : ''}`} />
                            )}
                          </button>
                          {expandedRow === item.id && item.description && (
                            <div className="mt-2 text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg animate-in slide-in-from-top-2 duration-200">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  {activeTab === "brands" && (
                    <TableCell>
                      <span className="text-gray-600">{item.country}</span>
                    </TableCell>
                  )}

                  <TableCell>
                    <Badge className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 font-semibold px-3 py-1">{productCountMap[item.id] || 0} sản phẩm</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600 text-sm">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600 text-sm">
                      {item.updatedAt ? new Date(item.updatedAt).toLocaleString('vi-VN', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(item)} title="Chỉnh sửa" className="hover:bg-blue-100 text-blue-600">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(item)} title="Xóa" className="hover:bg-red-100 text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                  </TableRow>
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all">
            <div className="relative p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === 'add' ? 'Thêm mới' : 'Chỉnh sửa'} {activeTab === 'categories' ? 'danh mục' : 'thương hiệu'}
              </h2>
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {activeTab === 'categories' && (
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Mã danh mục <span className="text-red-500">*</span></Label>
                  <Input
                    className="mt-2 h-11 text-base bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="VD: FRESH, DRINK, SNACK"
                    maxLength={50}
                  />
                </div>
              )}

              <div>
                <Label className="text-sm font-semibold text-gray-700">Tên {activeTab === 'categories' ? 'danh mục' : 'thương hiệu'} <span className="text-red-500">*</span></Label>
                <Input
                  className="mt-2 h-11 text-base bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={`Nhập tên ${activeTab === 'categories' ? 'danh mục' : 'thương hiệu'}`}
                />
              </div>

              {activeTab === 'brands' && (
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Quốc gia</Label>
                  <Input
                    className="mt-2 h-11 text-base bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.country || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    placeholder="VD: Việt Nam, Mỹ, Thái Lan..."
                  />
                </div>
              )}

              <div>
                <Label className="text-sm font-semibold text-gray-700">Mô tả</Label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 mt-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Nhập mô tả chi tiết..."
                />
              </div>

            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
              <Button variant="outline" className="flex-1 h-11 rounded-xl font-semibold" onClick={() => setShowModal(false)}>
                Hủy
              </Button>
              <Button className="flex-1 h-11 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md" onClick={handleSave}>
                {modalMode === 'add' ? 'Thêm mới' : 'Cập nhật'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-t-2xl">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                Xác nhận xóa {activeTab === 'categories' ? 'danh mục' : 'thương hiệu'}
              </h3>
              <p className="text-center text-gray-600 mb-3">
                Bạn có chắc muốn xóa <span className="font-bold text-gray-900">{selectedItem?.name}</span>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                <p className="text-sm text-red-700 font-medium">
                  ⚠️ {activeTab === 'categories' ? 'Danh mục' : 'Thương hiệu'} này đang có{' '}
                  <span className="font-bold">{productCountMap[selectedItem?.id] || 0} sản phẩm</span>
                </p>
              </div>
            </div>
            <div className="p-6 bg-gray-50 rounded-b-2xl flex gap-3">
              <Button variant="outline" className="flex-1 h-11 rounded-xl font-semibold" onClick={() => setShowDeleteConfirm(false)}>
                Hủy
              </Button>
              <Button variant="danger" className="flex-1 h-11 rounded-xl font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-md" onClick={confirmDelete}>
                Xóa ngay
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category_Brand;
