import { useState } from 'react';
import { Plus, Edit, Trash2, Package, Search, CheckCircle, Tag, FolderTree } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../ProductComponents/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ProductComponents/table";
import { Badge } from "../ProductComponents/badge";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import { Label } from "../ProductComponents/label";
import { useFetchCategories } from "../../../hooks/categories";
import { useFetchBrands } from "../../../hooks/brands";

const Category_Brand = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [formData, setFormData] = useState({ name: '', parent: '', status: 'active' });

  const { categories, loading: catLoading, error: catError } = useFetchCategories();
  const { brands, loading: brandLoading, error: brandError } = useFetchBrands();

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ name: '', parent: '', status: 'active' });
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setModalMode('edit');
    setSelectedItem(item);
    setFormData({ name: item.name, parent: item.parent || '', status: item.status });
    setShowModal(true);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setToastMessage(`Xóa ${activeTab === 'categories' ? 'danh mục' : 'thương hiệu'} thành công!`);
    setTimeout(() => setToastMessage(""), 3000);
    setShowDeleteConfirm(false);
    setSelectedItem(null);
  };

  const handleSave = () => {
    setToastMessage(`${modalMode === 'add' ? 'Thêm' : 'Cập nhật'} ${activeTab === 'categories' ? 'danh mục' : 'thương hiệu'} thành công!`);
    setTimeout(() => setToastMessage(""), 3000);
    setShowModal(false);
  };

  const data = activeTab === 'categories' ? (categories || []) : (brands || []);
  const filteredData = data.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (catLoading || brandLoading) return <p>Đang tải...</p>;
  if (catError || brandError) return <p className="text-red-500">{catError || brandError}</p>;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50">
          <div className="relative flex gap-4 bg-green-50 border border-green-200 rounded-xl px-8 py-5 min-w-105 shadow-lg">
            <CheckCircle className="text-green-600 w-6 h-6" />
            <span className="text-base font-semibold text-gray-800">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Quản lý Danh mục & Thương hiệu</h1>
          <p className="text-gray-500 mt-1">Tổng số: {filteredData.length} {activeTab === 'categories' ? 'danh mục' : 'thương hiệu'}</p>
        </div>
        <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Thêm mới
        </Button>
      </div>

      {/* Tabs */}
      <Card className="border border-gray-300 rounded-lg bg-white">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'categories'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FolderTree className="w-4 h-4 inline mr-2" />
              Danh mục
            </button>
            <button
              onClick={() => setActiveTab('brands')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'brands'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Tag className="w-4 h-4 inline mr-2" />
              Thương hiệu
            </button>
          </div>
        </div>

        {/* Search */}
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={`Tìm ${activeTab === 'categories' ? 'danh mục' : 'thương hiệu'}...`}
              className="pl-9 h-10 text-md bg-gray-200 border border-gray-200 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-gray-300 rounded-lg bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Danh sách {activeTab === 'categories' ? 'Danh mục' : 'Thương hiệu'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Tên {activeTab === 'categories' ? 'danh mục' : 'thương hiệu'}</TableHead>
                {activeTab === 'categories' ? (
                  <TableHead>Danh mục cha</TableHead>
                ) : (
                  <TableHead>Quốc gia</TableHead>
                )}
                <TableHead>Số sản phẩm</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thời gian tạo</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-200">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activeTab === 'categories' ? 'bg-purple-100' : 'bg-blue-100'
                      }`}>
                        {activeTab === 'categories' ? (
                          <FolderTree className="w-5 h-5 text-purple-600" />
                        ) : (
                          <Tag className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {activeTab === 'categories' ? (
                      item.parent ? <Badge className="bg-neutral-300">{item.parent}</Badge> : '-'
                    ) : (
                      <span className="text-gray-600">{item.country}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-700">{item.productCount} sản phẩm</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-700">Hoạt động</Badge>
                  </TableCell>
                  <TableCell>{item.created_at}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(item)} title="Chỉnh sửa">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(item)} title="Xóa" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === 'add' ? 'Thêm' : 'Chỉnh sửa'} {activeTab === 'categories' ? 'danh mục' : 'thương hiệu'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label>Tên {activeTab === 'categories' ? 'danh mục' : 'thương hiệu'} <span className="text-red-600">*</span></Label>
                <Input
                  className="text-md bg-gray-200 border border-gray-200 rounded-lg mt-1"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder={`Nhập tên ${activeTab === 'categories' ? 'danh mục' : 'thương hiệu'}`}
                />
              </div>
              {activeTab === 'categories' && (
                <div>
                  <Label>Danh mục cha</Label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white mt-1"
                    value={formData.parent}
                    onChange={(e) => setFormData({...formData, parent: e.target.value})}
                  >
                    <option value="">-- Không có --</option>
                    <option value="Đồ uống">Đồ uống</option>
                    <option value="Thực phẩm">Thực phẩm</option>
                  </select>
                </div>
              )}
              {activeTab === 'brands' && (
                <div>
                  <Label>Quốc gia</Label>
                  <Input
                    className="text-md bg-gray-200 border border-gray-200 rounded-lg mt-1"
                    placeholder="VD: Việt Nam, Mỹ, Thái Lan..."
                  />
                </div>
              )}
              <div>
                <Label>Trạng thái</Label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white mt-1"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <Button variant="danger" className="flex-1" onClick={() => setShowModal(false)}>
                Hủy
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
                {modalMode === 'add' ? 'Thêm' : 'Cập nhật'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">
                Xác nhận xóa {activeTab === 'categories' ? 'danh mục' : 'thương hiệu'}
              </h3>
              <p className="text-gray-600 mb-2">
                Bạn có chắc muốn xóa <span className="font-semibold">{selectedItem?.name}</span>?
              </p>
              <p className="text-sm text-red-600">
                {activeTab === 'categories' ? 'Danh mục' : 'Thương hiệu'} này đang có{' '}
                <span className="font-semibold">{selectedItem?.productCount} sản phẩm</span>
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>
                Hủy
              </Button>
              <Button variant="danger" className="flex-1" onClick={confirmDelete}>
                Xóa
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category_Brand;
