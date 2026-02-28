import React, { useState, useEffect } from 'react';
import { Gift, Search, Plus, Trash2, X, Star, History, Package } from 'lucide-react';
import loyaltyService from '../../services/loyaltyService';
import ticketService from '../../services/ticketService';
import { useFetchCustomers } from '../../hooks/Customers';

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
  const [gifts, setGifts] = useState([]);
  const [loadingGifts, setLoadingGifts] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [redemptionHistory, setRedemptionHistory] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const { findByPhone } = useFetchCustomers();

  // Modal thêm quà
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [skuInput, setSkuInput] = useState('');
  const [skuVariants, setSkuVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [formData, setFormData] = useState({ name: '', requiredPoints: '', stock: '' });
  const [savingGift, setSavingGift] = useState(false);

  useEffect(() => { fetchGifts(); }, []);

  const fetchGifts = async () => {
    try {
      setLoadingGifts(true);
      const data = await loyaltyService.getAllGifts();
      setGifts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGifts(false);
    }
  };

  const handleSearchCustomer = async (e) => {
    if (e) e.preventDefault();
    if (!searchPhone) return;
    try {
      setSearchingCustomer(true);
      setSearchError('');
      let customer = findByPhone(searchPhone);
      if (!customer) customer = await loyaltyService.getCustomerByPhone(searchPhone);
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
      alert(`Không đủ điểm! Cần ${gift.requiredPoints} điểm.`); return;
    }
    if (gift.stock <= 0) { alert('Quà đã hết hàng!'); return; }
    if (window.confirm(`Xác nhận đổi [${gift.name}] cho ${currentCustomer.name}? Trừ ${gift.requiredPoints} điểm.`)) {
      try {
        await loyaltyService.redeemGift(currentCustomer.id, gift.id);
        alert('Đổi quà thành công!');
        await fetchGifts();
        await handleSearchCustomer();
      } catch (err) {
        alert('Lỗi: ' + (err?.response?.data?.message || err.message));
      }
    }
  };

  const openModal = () => {
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
      alert('Lỗi khi tìm sản phẩm');
    } finally {
      setLoadingVariants(false);
    }
  };

  const handleSubmitGift = async (e) => {
    e.preventDefault();
    if (!selectedVariant) { alert('Vui lòng chọn sản phẩm!'); return; }
    try {
      setSavingGift(true);
      await loyaltyService.createGift({
        variantId: selectedVariant.id,
        name: formData.name,
        requiredPoints: parseInt(formData.requiredPoints),
        stock: parseInt(formData.stock),
      });
      alert('Thêm quà thành công!');
      setIsModalOpen(false);
      await fetchGifts();
    } catch (err) {
      alert('Lỗi: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSavingGift(false);
    }
  };

  const handleDeleteGift = async (id) => {
    if (!window.confirm('Xóa quà tặng này?')) return;
    try {
      await loyaltyService.deleteGift(id);
      await fetchGifts();
    } catch (err) {
      alert('Lỗi khi xóa');
    }
  };

  const totalPoints = gifts.reduce((s, g) => s + (g.requiredPoints || 0), 0);
  const totalStock = gifts.reduce((s, g) => s + (g.stock || 0), 0);

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Loyalty & Quà tặng</h1>
          <p className="text-slate-500 mt-1">Tra cứu điểm tích lũy và quản lý kho quà đổi thưởng.</p>
        </div>
        <button
          onClick={openModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-lg shadow-indigo-600/30 transition-all text-sm font-medium flex items-center gap-2"
        >
          <Plus size={16} /> Thêm quà tặng
        </button>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={Gift} label="Loại quà trong kho" value={gifts.length} color="bg-indigo-500" />
        <StatCard icon={Package} label="Tổng tồn kho" value={totalStock} color="bg-emerald-500" />
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
                type="text"
                placeholder="Nhập số điện thoại..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                required
              />
              <button
                type="submit"
                disabled={searchingCustomer}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60 transition-colors"
              >
                {searchingCustomer ? '...' : 'Tìm'}
              </button>
            </form>
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

          {/* Box đổi quà (chỉ khi có khách) */}
          {currentCustomer && gifts.length > 0 && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex-1">
              <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Gift size={16} className="text-emerald-500" /> Chọn quà để đổi
              </h2>
              <div className="flex flex-col gap-3">
                {gifts.map(gift => {
                  const canAfford = currentCustomer.loyaltyPoints >= gift.requiredPoints;
                  const outOfStock = gift.stock <= 0;
                  return (
                    <div
                      key={gift.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${canAfford && !outOfStock ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 opacity-70'}`}
                    >
                      <img
                        src={gift.image || 'https://placehold.co/60x60?text=Gift'}
                        alt={gift.name}
                        className="w-11 h-11 rounded-lg object-cover border border-slate-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{gift.name}</p>
                        <p className="text-xs text-slate-500">
                          <span className="text-orange-500 font-bold">{gift.requiredPoints} pts</span> · Tồn: {gift.stock}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRedeemGift(gift)}
                        disabled={!canAfford || outOfStock}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${outOfStock ? 'bg-red-100 text-red-500 cursor-not-allowed' : !canAfford ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                      >
                        {outOfStock ? 'Hết' : !canAfford ? 'Thiếu điểm' : 'Đổi ngay'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* CỘT PHẢI: BẢNG KHO QUÀ */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 text-base">Kho quà tặng</h2>
            <span className="text-xs text-slate-500">{gifts.length} loại</span>
          </div>

          {loadingGifts ? (
            <div className="p-10 text-center text-slate-400 text-sm">Đang tải...</div>
          ) : gifts.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <Gift size={40} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Kho quà đang trống. Thêm quà để bắt đầu!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600">Ảnh</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600">Tên quà tặng</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600">Điểm yêu cầu</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600">Tồn kho</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-600">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {gifts.map(gift => (
                    <tr key={gift.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <img
                          src={gift.image || 'https://placehold.co/80x80?text=Gift'}
                          alt={gift.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-100"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800 text-sm">{gift.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{gift.sku}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold">
                          {gift.requiredPoints} pts
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${gift.stock > 10 ? 'bg-emerald-50 text-emerald-700' : gift.stock > 0 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                          {gift.stock}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleDeleteGift(gift.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
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