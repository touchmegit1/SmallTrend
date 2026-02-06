import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../ProductComponents/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ProductComponents/table";

const Category_Brand = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [categories] = useState([
    { id: 1, name: 'Đồ uống', parent: null, productCount: 45, status: 'active' },
    { id: 2, name: 'Thực phẩm', parent: null, productCount: 78, status: 'active' },
    { id: 3, name: 'Nước ngọt', parent: 'Đồ uống', productCount: 12, status: 'active' },
  ]);

  const [brands] = useState([
    { id: 1, name: 'Coca-Cola', productCount: 15, status: 'active' },
    { id: 2, name: 'Vinamilk', productCount: 23, status: 'active' },
  ]);

  const handleAdd = () => {
    setModalMode('add');
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setModalMode('edit');
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    setSelectedItem(null);
  };

  const data = activeTab === 'categories' ? categories : brands;
  const isEmpty = data.length === 0;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Danh mục & Thương hiệu</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Thêm mới
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'categories'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Danh mục
            </button>
            <button
              onClick={() => setActiveTab('brands')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'brands'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Thương hiệu
            </button>
          </div>
        </div>

        <div className="p-6">
          {isEmpty ? (
            <div className="text-center py-12">
              <Package size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có {activeTab === 'categories' ? 'danh mục' : 'thương hiệu'}
              </h3>
              <p className="text-gray-500 mb-4">
                Bắt đầu bằng cách thêm {activeTab === 'categories' ? 'danh mục' : 'thương hiệu'} đầu tiên
              </p>
              <button
                onClick={handleAdd}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} />
                Thêm {activeTab === 'categories' ? 'danh mục' : 'thương hiệu'}
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Tên {activeTab === 'categories' ? 'danh mục' : 'thương hiệu'}</th>
                  {activeTab === 'categories' && <th className="text-left py-3 px-4">Danh mục cha</th>}
                  <th className="text-left py-3 px-4">Số sản phẩm</th>
                  <th className="text-left py-3 px-4">Trạng thái</th>
                  <th className="text-right py-3 px-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{item.name}</td>
                    {activeTab === 'categories' && (
                      <td className="py-3 px-4 text-gray-600">{item.parent || '-'}</td>
                    )}
                    <td className="py-3 px-4">{item.productCount}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Hoạt động
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 p-1 mr-2"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {modalMode === 'add' ? 'Thêm' : 'Sửa'} {activeTab === 'categories' ? 'danh mục' : 'thương hiệu'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tên {activeTab === 'categories' ? 'danh mục' : 'thương hiệu'}
                </label>
                <input
                  type="text"
                  defaultValue={selectedItem?.name}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder={`Nhập tên ${activeTab === 'categories' ? 'danh mục' : 'thương hiệu'}`}
                />
              </div>
              {activeTab === 'categories' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Danh mục cha</label>
                  <select className="w-full border rounded-lg px-3 py-2">
                    <option value="">-- Không có --</option>
                    <option value="1">Đồ uống</option>
                    <option value="2">Thực phẩm</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Trạng thái</label>
                <select className="w-full border rounded-lg px-3 py-2">
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {modalMode === 'add' ? 'Thêm' : 'Cập nhật'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">
                  Xác nhận xóa {activeTab === 'categories' ? 'danh mục' : 'thương hiệu'}
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'categories' ? 'Danh mục' : 'Thương hiệu'} này đang có{' '}
                  <span className="font-semibold">{selectedItem?.productCount} sản phẩm</span>
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category_Brand;
