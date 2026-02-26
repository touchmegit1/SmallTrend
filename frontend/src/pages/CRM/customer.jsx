import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Search, X, Plus, LogIn } from "lucide-react";
import { useFetchCustomers } from "../../hooks/Customers";
import { useAuth } from "../../context/AuthContext";
import customerService from "../../services/customerService";

export default function CustomerManagement() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { customers, loading, error, refetch } = useFetchCustomers();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
  });
  const [addForm, setAddForm] = useState({
    name: "",
    phone: "",
  });

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  const totalCustomers = customers.length;

  const handleDelete = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa khách hàng này?")) {
      try {
        setIsSubmitting(true);
        await customerService.deleteCustomer(id);
        await refetch();
        alert("Xóa khách hàng thành công");
      } catch (err) {
        alert("Lỗi: " + (err.response?.data?.message || err.message || "Không thể xóa khách hàng"));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setEditForm({
      name: customer.name,
      phone: customer.phone,
    });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (!editForm.name.trim() || !editForm.phone.trim()) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }
    try {
      setIsSubmitting(true);
      await customerService.updateCustomer(
        selectedCustomer.id,
        editForm.name,
        editForm.phone
      );
      await refetch();
      setShowEditModal(false);
      setSelectedCustomer(null);
      alert("Cập nhật khách hàng thành công");
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message || "Không thể cập nhật khách hàng"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedCustomer(null);
  };

  const handleAddNew = () => {
    setAddForm({ name: "", phone: "" });
    setShowAddModal(true);
  };

  const saveAdd = async () => {
    if (!addForm.name.trim() || !addForm.phone.trim()) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }
    try {
      setIsSubmitting(true);
      await customerService.createCustomer(addForm.name, addForm.phone);
      await refetch();
      setShowAddModal(false);
      setAddForm({ name: "", phone: "" });
      alert("Thêm khách hàng thành công");
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message || "Không thể thêm khách hàng"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setAddForm({ name: "", phone: "" });
  };

  return (
    <div className="space-y-6">
      {/* Show Login Page if Not Authenticated */}
      {!isAuthenticated ? (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                <LogIn size={32} className="text-indigo-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800">Chào mừng!</h1>
              <p className="text-slate-500 mt-2">Vui lòng đăng nhập để quản lý khách hàng</p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-indigo-600/30 transition-all"
            >
              Đăng nhập ngay
            </button>
            <p className="text-xs text-slate-400 mt-4">
              Sử dụng thông tin đăng nhập của bạn để tiếp tục
            </p>
          </div>
        </div>
      ) : (
        <>
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Khách hàng</h1>
          <p className="text-slate-500 mt-1">Danh sách và thông tin chi tiết khách hàng.</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-lg shadow-indigo-600/30 transition-all text-sm font-medium flex items-center gap-2"
        >
          <Plus size={18} /> Thêm khách hàng
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500">Tổng khách hàng</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-2">{totalCustomers}</h3>
          <p className="text-xs text-slate-400 mt-4">Khách hàng đã đăng ký</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500">Tỷ lệ Loyalty</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-2">10,000</h3>
          <p className="text-xs text-slate-400 mt-4">VNĐ / điểm</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          Lỗi: {error}
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="pl-10 w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="Tìm theo tên hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">Không có khách hàng nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Tên khách hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Số điện thoại</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Điểm Loyalty</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{c.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{c.phone}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                        {c.loyaltyPoints}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button 
                          onClick={() => handleEdit(c)}
                          className="p-2 hover:bg-indigo-100 rounded-lg transition-colors text-indigo-600 disabled:opacity-50"
                          title="Chỉnh sửa"
                          disabled={isSubmitting}
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(c.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 disabled:opacity-50"
                          title="Xóa"
                          disabled={isSubmitting}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Chỉnh sửa khách hàng</h2>
              <button 
                onClick={closeEditModal}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tên khách hàng</label>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-slate-100">
              <button
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium py-2.5 rounded-lg transition-colors text-sm"
                onClick={closeEditModal}
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm disabled:bg-indigo-400"
                onClick={saveEdit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Thêm khách hàng mới</h2>
              <button 
                onClick={closeAddModal}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tên khách hàng</label>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Nhập tên khách hàng"
                  value={addForm.name}
                  onChange={(e) =>
                    setAddForm({ ...addForm, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Nhập số điện thoại"
                  value={addForm.phone}
                  onChange={(e) =>
                    setAddForm({ ...addForm, phone: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-slate-100">
              <button
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium py-2.5 rounded-lg transition-colors text-sm"
                onClick={closeAddModal}
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm disabled:bg-indigo-400"
                onClick={saveAdd}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang thêm..." : "Thêm"}
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
