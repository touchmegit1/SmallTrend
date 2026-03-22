import React, { useState } from 'react';
import { Gift, Search, Plus, Trash2, X, Star, History, Package, Pencil, Check } from 'lucide-react';
import loyaltyService from '../../services/loyaltyService';
import ticketService from '../../services/ticketService';
import { useFetchCustomers } from '../../hooks/Customers';
import { useToast, ToastContainer } from '../../hooks/useToast.jsx';
import { useGifts } from '../../hooks/useGifts';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { CASHIER_ROLES, hasAnyRole } from '../../utils/rolePermissions';

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const GiftRewardManagement = () => {
  const { user } = useAuth();
  const isCashier = hasAnyRole(user, CASHIER_ROLES);
  const { gifts, loading: loadingGifts, refetch: refetchGifts } = useGifts();
  const [searchPhone, setSearchPhone] = useState('');
  const [giftSearch, setGiftSearch] = useState('');
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [redemptionHistory, setRedemptionHistory] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const { findByPhone } = useFetchCustomers();
  const { toasts, showToast, removeToast } = useToast();

  // Modal thêm quà
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [skuInput, setSkuInput] = useState('');
  const [skuVariants, setSkuVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [formData, setFormData] = useState({ name: '', requiredPoints: '', stock: '' });
  const [savingGift, setSavingGift] = useState(false);
  const [editingGiftId, setEditingGiftId] = useState(null);
  const [editGiftForm, setEditGiftForm] = useState({ name: '', requiredPoints: '', stock: '' });
  const [savingGiftUpdate, setSavingGiftUpdate] = useState(false);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null, payload: null });

  const normalizePhone = (value) => (value || '').replace(/\D/g, '').slice(0, 11);
  const isValidPhone = (value) => /^0\d{9,10}$/.test(value || '');

  const handleSearchCustomer = async (e) => {
    if (e) e.preventDefault();
    const normalizedPhone = normalizePhone(searchPhone);
    setSearchPhone(normalizedPhone);

    if (!normalizedPhone) {
      setCurrentCustomer(null);
      setRedemptionHistory([]);
      setSearchError('Vui lòng nhập số điện thoại.');
      return;
    }

    if (!isValidPhone(normalizedPhone)) {
      setCurrentCustomer(null);
      setRedemptionHistory([]);
      setSearchError('Số điện thoại không hợp lệ. Vui lòng nhập 10-11 số và bắt đầu bằng 0.');
      return;
    }

    try {
      setSearchingCustomer(true);
      setSearchError('');
      let customer = findByPhone(normalizedPhone);
      if (!customer) customer = await loyaltyService.getCustomerByPhone(normalizedPhone);
      if (!customer) throw new Error('Không tìm thấy khách hàng!');
      setCurrentCustomer(customer);
      const history = await loyaltyService.getCustomerHistory(customer.id);
      setRedemptionHistory(history);
    } catch (err) {
      setCurrentCustomer(null);
      setRedemptionHistory([]);
      setSearchError(err?.response?.data?.message || err?.message || 'Không tìm thấy khách hàng!');
    } finally {
      setSearchingCustomer(false);
    }
  };

  const handleRedeemGift = async (gift) => {
    if (!currentCustomer) return;
    if (currentCustomer.loyaltyPoints < gift.requiredPoints) {
      showToast(`Không đủ điểm! Cần ${gift.requiredPoints} điểm.`, 'warning'); return;
    }
    if (gift.stock <= 0) { showToast('Quà đã hết hàng!', 'warning'); return; }
    setConfirmDialog({ open: true, type: 'redeem', payload: gift });
  };

  const executeRedeem = async (gift) => {
    try {
      await loyaltyService.redeemGift(currentCustomer.id, gift.id);
      showToast('Đổi quà thành công!');
      await refetchGifts();
      await handleSearchCustomer();
    } catch (err) {
      showToast('Lỗi: ' + (err?.response?.data?.message || err.message), 'error');
    }
  };

  const openModal = () => {
    if (isCashier) return;
    setSkuInput(''); setSkuVariants([]); setSelectedVariant(null);
    setFormData({ name: '', requiredPoints: '', stock: '' });
    setIsModalOpen(true);
  };

  const handleSearchVariant = async () => {
    if (!skuInput.trim()) return;
    try {
      setLoadingVariants(true);
      const result = await ticketService.getVariantBySku(skuInput.trim());
      setSkuVariants(result);
      setSelectedVariant(null);
    } catch (err) {
      showToast('Lỗi khi tìm sản phẩm', 'error');
    } finally {
      setLoadingVariants(false);
    }
  };

  const handleSubmitGift = async (e) => {
    e.preventDefault();
    if (isCashier) return;
    if (!selectedVariant) { showToast('Vui lòng chọn sản phẩm!', 'warning'); return; }
    try {
      setSavingGift(true);
      await loyaltyService.createGift({
        variantId: selectedVariant.id,
        name: formData.name,
        requiredPoints: parseInt(formData.requiredPoints),
        stock: parseInt(formData.stock),
      });
      showToast('Thêm quà thành công!');
      setIsModalOpen(false);
      await refetchGifts();
    } catch (err) {
      showToast('Lỗi: ' + (err?.response?.data?.message || err.message), 'error');
    } finally {
      setSavingGift(false);
    }
  };

  const handleDeleteGift = async (id) => {
    if (isCashier) return;
    setConfirmDialog({ open: true, type: 'delete', payload: id });
  };

  const startEditGift = (gift) => {
    if (isCashier) return;
    setEditingGiftId(gift.id);
    setEditGiftForm({
      name: gift.name || '',
      requiredPoints: gift.requiredPoints ?? '',
      stock: gift.stock ?? '',
    });
  };

  const cancelEditGift = () => {
    setEditingGiftId(null);
    setEditGiftForm({ name: '', requiredPoints: '', stock: '' });
  };

  const saveEditGift = async (giftId) => {
    if (isCashier) return;
    if (!editGiftForm.name.trim()) {
      showToast('Tên quà tặng không được để trống', 'warning');
      return;
    }
    if (editGiftForm.requiredPoints === '' || Number(editGiftForm.requiredPoints) <= 0) {
      showToast('Điểm yêu cầu phải lớn hơn 0', 'warning');
      return;
    }
    if (editGiftForm.stock === '' || Number(editGiftForm.stock) < 0) {
      showToast('Số lượng còn lại không được âm', 'warning');
      return;
    }

    try {
      setSavingGiftUpdate(true);
      await loyaltyService.updateGift(giftId, {
        name: editGiftForm.name.trim(),
        requiredPoints: Number(editGiftForm.requiredPoints),
        stock: Number(editGiftForm.stock),
      });
      showToast('Cập nhật quà tặng thành công');
      cancelEditGift();
      await refetchGifts();
    } catch (err) {
      showToast('Lỗi: ' + (err?.response?.data?.message || err.message), 'error');
    } finally {
      setSavingGiftUpdate(false);
    }
  };

  const executeDeleteGift = async (id) => {
    if (isCashier) return;
    try {
      await loyaltyService.deleteGift(id);
      await refetchGifts();
    } catch (err) {
      showToast('Lỗi khi xóa quà tặng', 'error');
    }
  };

  const handleConfirm = () => {
    const { type, payload } = confirmDialog;
    setConfirmDialog({ open: false, type: null, payload: null });
    if (type === 'redeem') executeRedeem(payload);
    if (type === 'delete') executeDeleteGift(payload);
  };

  const handleCancelConfirm = () => {
    setConfirmDialog({ open: false, type: null, payload: null });
  };

  const totalPoints = gifts.reduce((s, g) => s + (g.requiredPoints || 0), 0);
  const totalStock = gifts.reduce((s, g) => s + (g.stock || 0), 0);
  const filteredGifts = gifts.filter((gift) => {
    const keyword = giftSearch.trim().toLowerCase();
    if (!keyword) return true;
    return (
      (gift.name || '').toLowerCase().includes(keyword) ||
      (gift.sku || '').toLowerCase().includes(keyword)
    );
  });
  const canSearchCustomer = isValidPhone(searchPhone) && !searchingCustomer;

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ConfirmDialog
        open={confirmDialog.open}
        title={
          confirmDialog.type === 'redeem'
            ? 'Đổi quà tặng'
            : 'Xóa quà tặng'
        }
        message={
          confirmDialog.type === 'redeem' && confirmDialog.payload
            ? `Xác nhận đổi [${confirmDialog.payload.name}] cho ${currentCustomer?.name}? Sẽ trừ ${confirmDialog.payload.requiredPoints} điểm từ tài khoản.`
            : 'Bạn chắc chắn muốn xóa quà tặng này khỏi kho?'
        }
        confirmText={confirmDialog.type === 'redeem' ? 'Đổi ngay' : 'Xóa'}
        cancelText="Hủy"
        variant={confirmDialog.type === 'redeem' ? 'info' : 'danger'}
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirm}
      />
      {/* ── HEADER ── */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Loyalty & Quà tặng</h1>
        </div>
        {!isCashier && (
          <button
            onClick={openModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-lg shadow-indigo-600/30 transition-all text-sm font-medium flex items-center gap-2"
          >
            <Plus size={16} /> Thêm quà tặng
          </button>
        )}
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={Gift} label="Loại quà trong kho" value={gifts.length} color="bg-indigo-500" />
        <StatCard icon={Package} label="Số lượng quà tặng" value={totalStock} color="bg-emerald-500" />
        <StatCard icon={Star} label="Điểm TB yêu cầu" value={gifts.length ? Math.round(totalPoints / gifts.length) : 0} color="bg-amber-500" />
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* CỘT TRÁI: TRA CỨU */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          {/* Box tra cứu */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Search size={16} className="text-indigo-500" /> Tra cứu điểm tích lũy
            </h2>
            <form onSubmit={handleSearchCustomer} className="flex gap-2">
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="Nhập số điện thoại (10-11 số)"
                value={searchPhone}
                onChange={(e) => {
                  setSearchPhone(normalizePhone(e.target.value));
                  if (searchError) setSearchError('');
                }}
                className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ${searchPhone && !isValidPhone(searchPhone)
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500'}`}
                required
              />
              <button
                type="submit"
                disabled={!canSearchCustomer}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {searchingCustomer ? '...' : 'Tìm'}
              </button>
            </form>
            {searchPhone && !isValidPhone(searchPhone) && (
              <p className="text-red-500 text-xs mt-2">Số điện thoại phải có 10-11 số và bắt đầu bằng 0.</p>
            )}
            {searchError && (
              <p className="text-red-500 text-xs mt-2 bg-red-50 px-3 py-2 rounded-lg">{searchError}</p>
            )}

            {/* Thông tin khách hàng */}
            {currentCustomer && (
              <div className="mt-4 space-y-3">
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <p className="text-xs text-slate-500 mb-1">Khách hàng</p>
                  <p className="font-bold text-slate-800">{currentCustomer.name}</p>
                  <p className="text-xs text-slate-500">{currentCustomer.phone}</p>
                  <div className="mt-3 pt-3 border-t border-indigo-100 flex justify-between items-baseline">
                    <span className="text-xs text-slate-500">Điểm hiện tại</span>
                    <span className="text-3xl font-black text-indigo-600">
                      {currentCustomer.loyaltyPoints}
                      <span className="text-sm font-normal ml-1 text-indigo-400">pts</span>
                    </span>
                  </div>
                </div>

                {/* Lịch sử đổi quà */}
                {redemptionHistory.length > 0 && (
                  <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
                      <History size={14} className="text-slate-500" />
                      <span className="text-xs font-semibold text-slate-600">Lịch sử đổi quà</span>
                    </div>
                    <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
                      {redemptionHistory.map(h => (
                        <div key={h.id} className="px-4 py-2.5 flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-slate-800 truncate max-w-[140px]">{h.giftName}</p>
                            <p className="text-xs text-slate-400">{new Date(h.redeemedAt).toLocaleDateString('vi-VN')}</p>
                          </div>
                          <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                            -{h.pointsUsed} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* CỘT PHẢI: BẢNG KHO QUÀ */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 text-base">Kho quà tặng</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={giftSearch}
                  onChange={(e) => setGiftSearch(e.target.value)}
                  placeholder="Tìm quà..."
                  className="w-44 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <span className="text-xs text-slate-500">{filteredGifts.length}/{gifts.length} loại</span>
            </div>
          </div>

          {loadingGifts ? (
            <div className="p-10 text-center text-slate-400 text-sm">Đang tải...</div>
          ) : gifts.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <Gift size={40} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Kho quà đang trống. Thêm quà để bắt đầu!</p>
            </div>
          ) : filteredGifts.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <Search size={34} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Không tìm thấy quà phù hợp với từ khóa.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600">Ảnh</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600">Tên quà tặng</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600">Điểm yêu cầu</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600">Còn lại</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-600">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGifts.map(gift => {
                    const canAfford = currentCustomer ? currentCustomer.loyaltyPoints >= gift.requiredPoints : false;
                    const outOfStock = gift.stock <= 0;

                    const isEditing = editingGiftId === gift.id;

                    return (
                    <tr key={gift.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <img
                          src={gift.image || 'https://placehold.co/80x80?text=Gift'}
                          alt={gift.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-100"
                        />
                      </td>
                      <td className="px-5 py-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editGiftForm.name}
                            onChange={(e) => setEditGiftForm((prev) => ({ ...prev, name: e.target.value }))}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          />
                        ) : (
                          <p className="font-medium text-slate-800 text-sm">{gift.name}</p>
                        )}
                        <p className="text-xs text-slate-400 font-mono">{gift.sku}</p>
                      </td>
                      <td className="px-5 py-4">
                        {isEditing ? (
                          <div className="relative max-w-28">
                            <input
                              type="number"
                              min="1"
                              value={editGiftForm.requiredPoints}
                              onChange={(e) => setEditGiftForm((prev) => ({ ...prev, requiredPoints: e.target.value }))}
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 pr-9 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">pts</span>
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold">
                            {gift.requiredPoints} pts
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={editGiftForm.stock}
                            onChange={(e) => setEditGiftForm((prev) => ({ ...prev, stock: e.target.value }))}
                            className="w-24 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          />
                        ) : (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${gift.stock > 10 ? 'bg-emerald-50 text-emerald-700' : gift.stock > 0 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                            {gift.stock}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleRedeemGift(gift)}
                            disabled={!currentCustomer || !canAfford || outOfStock}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              !currentCustomer
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : outOfStock
                                  ? 'bg-red-100 text-red-500 cursor-not-allowed'
                                  : !canAfford
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                            title={!currentCustomer ? 'Hãy nhập khách hàng trước khi đổi quà' : 'Đổi quà'}
                          >
                            {!currentCustomer ? 'Nhập khách hàng' : outOfStock ? 'Hết' : !canAfford ? 'Thiếu điểm' : 'Đổi ngay'}
                          </button>
                          {!isCashier && (isEditing ? (
                            <>
                              <button
                                onClick={() => saveEditGift(gift.id)}
                                disabled={savingGiftUpdate}
                                className="p-2 hover:bg-emerald-50 rounded-lg transition-colors text-emerald-600 disabled:opacity-50"
                                title="Lưu"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={cancelEditGift}
                                disabled={savingGiftUpdate}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 disabled:opacity-50"
                                title="Hủy"
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => startEditGift(gift)}
                              className="p-2 hover:bg-indigo-50 rounded-lg transition-colors text-indigo-600"
                              title="Sửa"
                            >
                              <Pencil size={16} />
                            </button>
                          ))}
                          {!isCashier && (
                            <button
                              onClick={() => handleDeleteGift(gift.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                              title="Xóa"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL THÊM QUÀ ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Thêm quà tặng mới</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Tìm SKU */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-2">Tìm sản phẩm theo SKU</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={skuInput}
                    onChange={e => setSkuInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearchVariant()}
                    placeholder="Nhập SKU (VD: SP001)..."
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleSearchVariant}
                    disabled={loadingVariants}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60 transition-colors"
                  >
                    {loadingVariants ? '...' : 'Tìm'}
                  </button>
                </div>
                {skuVariants.length > 0 && (
                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl divide-y bg-white">
                    {skuVariants.map(v => (
                      <div
                        key={v.id}
                        onClick={() => { setSelectedVariant(v); setFormData(f => ({ ...f, name: `${v.productName} (Đổi điểm)` })); }}
                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-indigo-50 transition-colors ${selectedVariant?.id === v.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}`}
                      >
                        <img src={v.imageUrl || 'https://placehold.co/40x40'} className="w-10 h-10 rounded-lg object-cover" alt="" />
                        <div>
                          <p className="text-sm font-medium text-slate-800">{v.productName}</p>
                          <p className="text-xs text-slate-400 font-mono">SKU: {v.sku}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form chi tiết */}
              {selectedVariant && (
                <form onSubmit={handleSubmitGift} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên hiển thị *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Điểm yêu cầu *</label>
                      <input type="number" min="1" value={formData.requiredPoints}
                        onChange={e => setFormData(f => ({ ...f, requiredPoints: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Số lượng tồn *</label>
                      <input type="number" min="1" value={formData.stock}
                        onChange={e => setFormData(f => ({ ...f, stock: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500" required />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2 border-t border-slate-100">
                    <button type="button" onClick={() => setIsModalOpen(false)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-lg text-sm transition-colors">
                      Hủy
                    </button>
                    <button type="submit" disabled={savingGift}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-60 transition-colors">
                      {savingGift ? 'Đang lưu...' : 'Lưu vào kho'}
                    </button>
                  </div>
                </form>
              )}
              {!selectedVariant && (
                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button onClick={() => setIsModalOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                    Đóng
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftRewardManagement;