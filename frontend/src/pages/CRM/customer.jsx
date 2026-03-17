import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Search, X, Plus, LogIn, Crown, ChevronRight, Check, AlertCircle } from "lucide-react";
import { useFetchCustomers } from "../../hooks/Customers";
import { useAuth } from "../../context/AuthContext";
import customerService from "../../services/customerService";
import customerTierService from "../../services/customerTierService";
import { useCustomerTiers } from "../../hooks/useCustomerTiers";
import { useToast, ToastContainer } from "../../hooks/useToast.jsx";
import ConfirmDialog from "../../components/common/ConfirmDialog";

// ─── Tier badge color mapper ──────────────────────────────────────────────────
const TIER_GRADIENT = {
  BRONZE: 'from-amber-700 to-amber-500',
  SILVER: 'from-slate-500 to-slate-400',
  GOLD: 'from-yellow-500 to-amber-400',
  PLATINUM: 'from-slate-400 to-slate-300',
  DIAMOND: 'from-cyan-500 to-blue-400',
};

const TIER_BG = {
  BRONZE: 'bg-amber-50 border-amber-200',
  SILVER: 'bg-slate-50 border-slate-200',
  GOLD: 'bg-yellow-50 border-yellow-200',
  PLATINUM: 'bg-slate-50 border-slate-300',
  DIAMOND: 'bg-cyan-50 border-cyan-200',
};

const TIER_TEXT = {
  BRONZE: 'text-amber-700',
  SILVER: 'text-slate-600',
  GOLD: 'text-yellow-700',
  PLATINUM: 'text-slate-700',
  DIAMOND: 'text-cyan-700',
};

// ─── Tier Management Modal ────────────────────────────────────────────────────
function TierManagementModal({ onClose, showToast }) {
  const { tiers, loading, refetch: loadTiers } = useCustomerTiers();
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({});

  const startEdit = (tier) => {
    setEditingId(tier.id);
    setEditForm({
      tierName: tier.tierName || '',
      minSpending: tier.minSpending ?? '',
      pointsMultiplier: tier.pointsMultiplier ?? '',
      color: tier.color || '#6366f1',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id) => {
    try {
      setSaving(true);
      await customerTierService.updateTier(id, {
        tierName: editForm.tierName,
        minSpending: editForm.minSpending !== '' ? Number(editForm.minSpending) : null,
        pointsMultiplier: editForm.pointsMultiplier !== '' ? Number(editForm.pointsMultiplier) : null,
        color: editForm.color,
      });
      showToast('Cập nhật hạng thành viên thành công');
      setEditingId(null);
      await loadTiers();
    } catch (err) {
      showToast('Lỗi: ' + (err?.response?.data?.message || err.message), 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        style={{ animation: 'tierModalIn 0.2s ease-out' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Crown size={18} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Quản lý Hạng thành viên</h2>
              <p className="text-xs text-slate-500 mt-0.5">Chỉnh sửa điều kiện và quyền lợi từng hạng</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {tiers.map(tier => {
                const isEditing = editingId === tier.id;
                const gradient = TIER_GRADIENT[tier.tierCode] || 'from-indigo-500 to-purple-500';
                const bgCls = TIER_BG[tier.tierCode] || 'bg-indigo-50 border-indigo-200';
                const textCls = TIER_TEXT[tier.tierCode] || 'text-indigo-700';

                return (
                  <div
                    key={tier.id}
                    className={`border rounded-2xl overflow-hidden transition-all ${isEditing ? 'ring-2 ring-indigo-400 border-indigo-300' : bgCls}`}
                  >
                    {/* Tier header bar */}
                    <div className={`bg-gradient-to-r ${gradient} px-5 py-3 flex items-center justify-between`}>
                      <div className="flex items-center gap-3">
                        <Crown size={16} className="text-white/80" />
                        <span className="text-white font-bold text-sm tracking-wide">
                          {tier.tierCode}
                          {isEditing
                            ? <input
                              className="ml-2 bg-white/20 text-white placeholder-white/60 border border-white/30 rounded-lg px-2 py-0.5 text-sm font-semibold focus:outline-none w-32"
                              value={editForm.tierName}
                              onChange={e => setEditForm({ ...editForm, tierName: e.target.value })}
                            />
                            : <span className="ml-2 font-normal opacity-90">— {tier.tierName}</span>
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={cancelEdit}
                              className="text-white/80 hover:text-white text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={() => saveEdit(tier.id)}
                              disabled={saving}
                              className="text-white text-xs px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 font-semibold flex items-center gap-1 transition-colors disabled:opacity-60"
                            >
                              <Check size={13} />
                              {saving ? 'Đang lưu...' : 'Lưu'}
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => startEdit(tier)}
                            className="text-white/80 hover:text-white text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1"
                          >
                            <Pencil size={12} /> Chỉnh sửa
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Tier details */}
                    <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Chi tiêu tố thiểu — editable */}
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">Chi tiêu tối thiểu để đạt hạng</p>
                        {isEditing ? (
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              className={inputCls}
                              value={editForm.minSpending}
                              onChange={e => setEditForm({ ...editForm, minSpending: e.target.value })}
                              placeholder="0"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">đ</span>
                          </div>
                        ) : (
                          <p className={`text-sm font-bold ${textCls}`}>
                            {tier.minSpending != null
                              ? Number(tier.minSpending).toLocaleString('vi-VN') + 'đ'
                              : '—'}
                          </p>
                        )}
                      </div>

                      {/* Hệ số nhân điểm — editable */}
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">Hệ số nhân điểm</p>
                        {isEditing ? (
                          <div className="relative">
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              className={inputCls}
                              value={editForm.pointsMultiplier}
                              onChange={e => setEditForm({ ...editForm, pointsMultiplier: e.target.value })}
                              placeholder="1.0"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">×</span>
                          </div>
                        ) : (
                          <p className={`text-sm font-bold ${textCls}`}>
                            ×{Number(tier.pointsMultiplier).toFixed(1)}
                          </p>
                        )}
                      </div>

                    </div>

                    {/* Color picker row — only when editing */}
                    {isEditing && (
                      <div className="px-5 pb-4 flex items-center gap-3 border-t border-slate-100 pt-3">
                        <label className="text-xs font-medium text-slate-500">Màu hiển thị:</label>
                        <input
                          type="color"
                          value={editForm.color}
                          onChange={e => setEditForm({ ...editForm, color: e.target.value })}
                          className="w-8 h-8 rounded-lg border-2 border-slate-200 cursor-pointer"
                        />
                        <span className="text-xs text-slate-400 font-mono">{editForm.color}</span>
                        <div className="ml-auto flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg">
                          <AlertCircle size={12} />
                          Chỉ có thể chỉnh sửa ngưỡng điểm từ trang cấu hình hệ thống
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-slate-400">
            <ChevronRight size={12} className="inline mr-1" />
            Ngưỡng điểm tích lũy (minPoints / maxPoints) được quản lý bởi hệ thống.
          </p>
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>

      <style>{`
        @keyframes tierModalIn {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to   { opacity: 1; transform: scale(1)   translateY(0);     }
        }
      `}</style>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CustomerManagement() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { customers, loading, error, refetch } = useFetchCustomers();
  const { toasts, showToast, removeToast } = useToast();
  const { tiers } = useCustomerTiers();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "" });
  const [addForm, setAddForm] = useState({ name: "", phone: "" });

  const normalizePhone = (value) => (value || '').replace(/\D/g, '').slice(0, 11);
  const isValidPhone = (value) => /^0\d{9,10}$/.test(value || '');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  const totalCustomers = customers.length;

  // ─── Tính hạng từ spentAmount ──────────────────────
  const getTier = (spentAmount) => {
    if (!tiers || tiers.length === 0) return null;
    return [...tiers]
      .sort((a, b) => Number(b.minSpending) - Number(a.minSpending))
      .find(tier => spentAmount >= Number(tier.minSpending)) || null;
  };

  // ─── Báo cáo phân bổ tier ──────────────────────────
  const tierReport = tiers.map(tier => ({
    ...tier,
    count: customers.filter(c => getTier(c.spentAmount || 0)?.id === tier.id).length,
  }));

  const handleDelete = (id) => setConfirmDelete(id);

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    try {
      setIsSubmitting(true);
      await customerService.deleteCustomer(confirmDelete);
      await refetch();
      showToast('Xóa khách hàng thành công');
    } catch (err) {
      showToast('Lỗi: ' + (err.response?.data?.message || err.message || 'Không thể xóa khách hàng'), 'error');
    } finally {
      setIsSubmitting(false);
      setConfirmDelete(null);
    }
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setEditForm({ name: customer.name, phone: customer.phone });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (!editForm.name.trim() || !editForm.phone.trim()) {
      showToast('Vui lòng điền đầy đủ thông tin', 'warning');
      return;
    }
    try {
      setIsSubmitting(true);
      await customerService.updateCustomer(selectedCustomer.id, editForm.name, editForm.phone);
      await refetch();
      setShowEditModal(false);
      setSelectedCustomer(null);
      showToast('Cập nhật khách hàng thành công');
    } catch (err) {
      showToast('Lỗi: ' + (err.response?.data?.message || err.message || 'Không thể cập nhật khách hàng'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNew = () => {
    setAddForm({ name: "", phone: "" });
    setShowAddModal(true);
  };

  const saveAdd = async () => {
    const normalizedPhone = normalizePhone(addForm.phone);

    if (!addForm.name.trim() || !normalizedPhone) {
      showToast('Vui lòng điền đầy đủ thông tin', 'warning');
      return;
    }

    if (!isValidPhone(normalizedPhone)) {
      showToast('Số điện thoại không hợp lệ. Vui lòng nhập 10-11 số và bắt đầu bằng 0.', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      await customerService.createCustomer(addForm.name.trim(), normalizedPhone);
      await refetch();
      setShowAddModal(false);
      setAddForm({ name: '', phone: '' });
      showToast('Thêm khách hàng thành công');
    } catch (err) {
      showToast('Lỗi: ' + (err.response?.data?.message || err.message || 'Không thể thêm khách hàng'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAddPhoneInvalid = addForm.phone.length > 0 && !isValidPhone(addForm.phone);

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ConfirmDialog
        open={!!confirmDelete}
        title="Xóa khách hàng"
        message="Bạn chắc chắn muốn xóa khách hàng này? Thao tác này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Tier Management Modal */}
      {showTierModal && (
        <TierManagementModal
          onClose={() => setShowTierModal(false)}
          showToast={showToast}
        />
      )}

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
            <div className="flex gap-2">
              <button
                onClick={() => setShowTierModal(true)}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 shadow-sm"
              >
                <Crown size={16} className="text-amber-500" />
                Hạng thành viên
              </button>
              <button
                onClick={handleAddNew}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-lg shadow-indigo-600/30 transition-all text-sm font-medium flex items-center gap-2"
              >
                <Plus size={18} /> Thêm khách hàng
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-sm font-medium text-slate-500">Tổng khách hàng</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{totalCustomers}</h3>
              <p className="text-xs text-slate-400 mt-4">Khách hàng đã đăng ký</p>
            </div>
            <div
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:border-amber-300 hover:shadow-md transition-all"
              onClick={() => setShowTierModal(true)}
            >
              <p className="text-sm font-medium text-slate-500">Hạng thành viên</p>
              <div className="flex items-center gap-2 mt-2">
                <h3 className="text-3xl font-bold text-slate-800">4</h3>
                <div className="flex gap-1 ml-2">
                  {['#CD7F32', '#C0C0C0', '#FFD700', '#E5E4E2'].map((c, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <p className="text-xs text-amber-600 mt-4 flex items-center gap-1">
                <Crown size={11} /> Nhấn để quản lý hạng thành viên
              </p>
            </div>
          </div>

          {/* Tier Report Section */}
          {!loading && tiers.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Crown size={16} className="text-amber-500" />
                <h2 className="text-sm font-bold text-slate-700">Phân bổ khách hàng theo hạng</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tierReport.map(tier => {
                  const gradient = TIER_GRADIENT[tier.tierCode] || 'from-indigo-500 to-purple-500';
                  const pct = totalCustomers > 0 ? Math.round((tier.count / totalCustomers) * 100) : 0;
                  return (
                    <div key={tier.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${gradient}`}
                        >
                          <Crown size={9} />{tier.tierName}
                        </span>
                        <span className="text-xs font-bold text-slate-700">{tier.count}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400">
                        {pct}% · Chi tiêu ≥ {Number(tier.minSpending).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Chi tiêu</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Hạng</th>
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
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                            {(c.spentAmount || 0).toLocaleString('vi-VN')}đ
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {(() => {
                            const tier = getTier(c.spentAmount || 0);
                            if (!tier) return <span className="text-xs text-slate-400">—</span>;
                            const gradient = TIER_GRADIENT[tier.tierCode];
                            return (
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${gradient}`}
                                title={`Chi tiêu ≥ ${Number(tier.minSpending).toLocaleString('vi-VN')}đ`}
                              >
                                <Crown size={10} />
                                {tier.tierName}
                              </span>
                            );
                          })()}
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
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-800">Chỉnh sửa khách hàng</h2>
                  <button onClick={() => { setShowEditModal(false); setSelectedCustomer(null); }} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                    <X size={20} className="text-slate-600" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tên khách hàng</label>
                    <input type="text" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại</label>
                    <input type="tel" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-3 p-6 border-t border-slate-100">
                  <button className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium py-2.5 rounded-lg transition-colors text-sm" onClick={() => { setShowEditModal(false); setSelectedCustomer(null); }} disabled={isSubmitting}>Hủy</button>
                  <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm disabled:bg-indigo-400" onClick={saveEdit} disabled={isSubmitting}>{isSubmitting ? "Đang lưu..." : "Lưu"}</button>
                </div>
              </div>
            </div>
          )}

          {/* Add Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-lg max-w-md w-full">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-800">Thêm khách hàng mới</h2>
                  <button onClick={() => { setShowAddModal(false); setAddForm({ name: "", phone: "" }); }} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                    <X size={20} className="text-slate-600" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tên khách hàng</label>
                    <input type="text" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Nhập tên khách hàng" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      className={`w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 ${isAddPhoneInvalid
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500'}`}
                      placeholder="Nhập số điện thoại (10-11 số)"
                      value={addForm.phone}
                      onChange={(e) => setAddForm({ ...addForm, phone: normalizePhone(e.target.value) })}
                    />
                    {isAddPhoneInvalid && (
                      <p className="text-xs text-red-500 mt-1.5">Số điện thoại phải có 10-11 số và bắt đầu bằng 0.</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 p-6 border-t border-slate-100">
                  <button className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium py-2.5 rounded-lg transition-colors text-sm" onClick={() => { setShowAddModal(false); setAddForm({ name: "", phone: "" }); }} disabled={isSubmitting}>Hủy</button>
                  <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm disabled:bg-indigo-400" onClick={saveAdd} disabled={isSubmitting || isAddPhoneInvalid}>{isSubmitting ? "Đang thêm..." : "Thêm"}</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
