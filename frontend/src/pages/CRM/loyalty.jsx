import React, { useState, useEffect } from 'react';
import loyaltyService from '../../services/loyaltyService';
import ticketService from '../../services/ticketService'; // Reuse variant lookup
import { useFetchCustomers } from '../../hooks/Customers';

const GiftRewardManagement = () => {
  // --- STATES THAO TÁC ---
  const [gifts, setGifts] = useState([]);
  const [loadingGifts, setLoadingGifts] = useState(false);

  const [searchPhone, setSearchPhone] = useState('');
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [redemptionHistory, setRedemptionHistory] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [searchingCustomer, setSearchingCustomer] = useState(false);

  // Hook lấy danh sách customer để tìm kiếm local theo SĐT
  const { findByPhone } = useFetchCustomers();

  // Modal Quản lý kho quà
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [skuInput, setSkuInput] = useState('');
  const [skuVariants, setSkuVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loadingVariants, setLoadingVariants] = useState(false);

  const [formData, setFormData] = useState({ name: '', requiredPoints: '', stock: '' });
  const [savingGift, setSavingGift] = useState(false);

  // --- HOOKS ---
  useEffect(() => {
    fetchGifts();
  }, []);

  const fetchGifts = async () => {
    try {
      setLoadingGifts(true);
      const data = await loyaltyService.getAllGifts();
      setGifts(data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách quà tặng:', err);
    } finally {
      setLoadingGifts(false);
    }
  };

  // --- LOGIC: TRA CỨU & ĐỔI QUÀ ---
  const handleSearchCustomer = async (e) => {
    if (e) e.preventDefault();
    if (!searchPhone) return;

    try {
      setSearchingCustomer(true);
      setSearchError('');

      // Ưu tiên tìm trong danh sách đã fetch từ hook (nhanh, không tốn thêm API call)
      let customer = findByPhone(searchPhone);

      // Nếu không tìm thấy local, fallback gọi API trực tiếp
      if (!customer) {
        customer = await loyaltyService.getCustomerByPhone(searchPhone);
      }

      if (!customer) {
        throw new Error('Không tìm thấy khách hàng với số điện thoại này!');
      }

      setCurrentCustomer(customer);

      // Lấy lịch sử đổi quà
      const history = await loyaltyService.getCustomerHistory(customer.id);
      setRedemptionHistory(history);
    } catch (err) {
      setCurrentCustomer(null);
      setRedemptionHistory([]);
      setSearchError(
        err?.response?.data?.message ||
        err?.message ||
        'Không tìm thấy khách hàng với số điện thoại này!'
      );
    } finally {
      setSearchingCustomer(false);
    }
  };

  const handleRedeemGift = async (gift) => {
    if (!currentCustomer) return;

    if (currentCustomer.loyaltyPoints < gift.requiredPoints) {
      alert(`Khách hàng không đủ điểm! Cần ${gift.requiredPoints} điểm.`);
      return;
    }

    if (gift.stock <= 0) {
      alert('Quà tặng này đã hết hàng trong kho!');
      return;
    }

    if (window.confirm(`Xác nhận đổi [${gift.name}] cho khách ${currentCustomer.name}? Sẽ trừ ${gift.requiredPoints} điểm.`)) {
      try {
        await loyaltyService.redeemGift(currentCustomer.id, gift.id);
        alert('Đổi quà thành công!');

        // Refresh data (gifts, customer info, and history)
        await fetchGifts();
        await handleSearchCustomer();

      } catch (err) {
        console.error(err);
        alert('Lỗi khi đổi quà: ' + (err?.response?.data?.message || err.message));
      }
    }
  };

  // --- LOGIC: QUẢN LÝ KHO QUÀ (CRUD) ---
  const openModal = () => {
    setSkuInput('');
    setSkuVariants([]);
    setSelectedVariant(null);
    setFormData({ name: '', requiredPoints: '', stock: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  // Tìm Product Variant theo SKU
  const handleSearchVariant = async () => {
    if (!skuInput.trim()) return;
    try {
      setLoadingVariants(true);
      const variants = await ticketService.getVariantBySku(skuInput.trim());
      setSkuVariants(variants);
      setSelectedVariant(null);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi tìm sản phẩm');
    } finally {
      setLoadingVariants(false);
    }
  };

  const handleSelectVariant = (variant) => {
    setSelectedVariant(variant);
    // Auto-fill gift name
    setFormData({
      ...formData,
      name: `${variant.productName} (Đổi điểm)`
    });
  };

  const handleSubmitGift = async (e) => {
    e.preventDefault();
    if (!selectedVariant) {
      alert('Vui lòng chọn một sản phẩm từ kho!');
      return;
    }

    try {
      setSavingGift(true);
      await loyaltyService.createGift({
        variantId: selectedVariant.id,
        name: formData.name,
        requiredPoints: parseInt(formData.requiredPoints),
        stock: parseInt(formData.stock)
      });
      alert('Thêm quà tặng thành công!');
      closeModal();
      await fetchGifts();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi lưu quà tặng: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSavingGift(false);
    }
  };

  const handleDeleteGift = async (id) => {
    if (window.confirm('Xóa quà tặng này khỏi kho?')) {
      try {
        await loyaltyService.deleteGift(id);
        await fetchGifts();
      } catch (err) {
        console.error(err);
        alert('Lỗi khi xóa quà tặng');
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* CỘT TRÁI: TRA CỨU KHÁCH HÀNG & ĐỔI QUÀ */}
      <div className="lg:col-span-1 flex flex-col gap-6">

        {/* Box Tra cứu */}
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-600">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Tra Cứu Điểm Tích Lũy</h2>
          <form onSubmit={handleSearchCustomer} className="flex gap-2">
            <input
              type="text"
              placeholder="Nhập SĐT khách hàng..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <button
              type="submit"
              disabled={searchingCustomer}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium disabled:opacity-75"
            >
              {searchingCustomer ? 'Đang tìm...' : 'Tìm'}
            </button>
          </form>
          {searchError && <p className="text-red-500 text-sm mt-2">{searchError}</p>}

          {/* Thông tin khách hàng */}
          {currentCustomer && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm">Khách hàng:</span>
                  <span className="font-bold text-gray-800">{currentCustomer.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Điểm hiện tại:</span>
                  <span className="font-bold text-blue-600 text-2xl">{currentCustomer.loyaltyPoints}</span>
                </div>
              </div>

              {/* Lịch sử đổi quà */}
              {redemptionHistory.length > 0 && (
                <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <h3 className="text-sm font-bold text-gray-700 mb-3 border-b pb-2">Lịch sử đổi quà gần đây</h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {redemptionHistory.map(hist => (
                      <div key={hist.id} className="text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-gray-800 truncate pr-2">{hist.giftName}</span>
                          <span className="text-orange-500 font-bold whitespace-nowrap">-{hist.pointsUsed} pts</span>
                        </div>
                        <div className="text-xs text-gray-500 text-right">
                          {new Date(hist.redeemedAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Box Danh sách quà có thể đổi (Chỉ hiện khi có khách hàng) */}
        {currentCustomer && (
          <div className="bg-white p-6 rounded-lg shadow flex-1">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Chọn Quà Để Đổi</h2>
            <div className="flex flex-col gap-4">
              {gifts.map(gift => {
                const canAfford = currentCustomer.loyaltyPoints >= gift.requiredPoints;
                const isOutOfStock = gift.stock <= 0;

                return (
                  <div key={gift.id} className={`flex items-center p-3 border rounded-lg ${canAfford && !isOutOfStock ? 'border-green-200 bg-green-50' : 'border-gray-200 opacity-75'}`}>
                    <img src={gift.image || 'https://placehold.co/100x100?text=Gift'} alt={gift.name} className="w-12 h-12 object-cover rounded mr-3" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{gift.name}</h3>
                      <p className="text-xs text-gray-500">Cần: <span className="font-bold text-orange-500">{gift.requiredPoints} điểm</span> | Tồn: {gift.stock}</p>
                    </div>
                    <button
                      onClick={() => handleRedeemGift(gift)}
                      disabled={!canAfford || isOutOfStock}
                      className={`px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-colors ${!canAfford ? 'bg-gray-200 text-gray-500 cursor-not-allowed' :
                        isOutOfStock ? 'bg-red-100 text-red-600 cursor-not-allowed' :
                          'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                      {isOutOfStock ? 'Hết hàng' : !canAfford ? 'Thiếu điểm' : 'Đổi ngay'}
                    </button>
                  </div>
                );
              })}
              {gifts.length === 0 && (
                <p className="text-gray-500 text-sm italic">Kho quà hiện đang trống.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CỘT PHẢI: QUẢN LÝ KHO QUÀ TẶNG */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Quản Lý Kho Quà Tặng</h2>
          <button onClick={openModal} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-medium text-sm">
            + Thêm Quà Tặng
          </button>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 w-16">Ảnh</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Tên Quà Tặng</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Điểm Yêu Cầu</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Tồn Kho</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loadingGifts ? (
                <tr><td colSpan="5" className="text-center py-6 text-gray-500">Đang tải danh sách...</td></tr>
              ) : gifts.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-6 text-gray-500">Chưa có quà tặng nào trong kho.</td></tr>
              ) : (
                gifts.map((gift) => (
                  <tr key={gift.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <img src={gift.image || 'https://placehold.co/100x100'} alt={gift.name} className="w-10 h-10 object-cover rounded border" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{gift.name}</div>
                      <div className="text-xs text-gray-500">SKU: {gift.sku}</div>
                    </td>
                    <td className="px-4 py-4 font-bold text-orange-500">{gift.requiredPoints} pts</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${gift.stock > 10 ? 'bg-green-100 text-green-700' : gift.stock > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                        {gift.stock}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button onClick={() => handleDeleteGift(gift.id)} className="text-red-500 hover:text-red-700 font-medium">Xóa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL THÊM QUÀ TẶNG --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Thêm Quà Tặng Mới</h2>

            <div className="mb-6 bg-gray-50 p-4 rounded-lg border">
              <label className="block text-sm font-medium mb-2">Tìm Sản phẩm bằng mã SKU</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={skuInput}
                  onChange={e => setSkuInput(e.target.value)}
                  placeholder="Nhập SKU sản phẩm (VD: SP001)..."
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleSearchVariant}
                  disabled={loadingVariants}
                  className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 disabled:opacity-75"
                >
                  {loadingVariants ? 'Đang tìm...' : 'Tìm kiếm'}
                </button>
              </div>

              {/* Danh sách kết quả Variant */}
              {skuVariants.length > 0 && (
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded divide-y bg-white">
                  {skuVariants.map(v => (
                    <div
                      key={v.id}
                      className={`p-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center ${selectedVariant?.id === v.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
                      onClick={() => handleSelectVariant(v)}
                    >
                      <div className="flex items-center gap-2">
                        <img src={v.imageUrl || 'https://placehold.co/40x40'} className="w-10 h-10 object-cover rounded" alt="variant" />
                        <div>
                          <div className="text-sm font-medium">{v.productName}</div>
                          <div className="text-xs text-gray-500">SKU: {v.sku}</div>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">Chọn</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedVariant && (
              <form onSubmit={handleSubmitGift}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Tên hiển thị quà tặng *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: Cà phê sữa đá (Đổi điểm)"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Điểm yêu cầu *</label>
                    <input
                      type="number" min="1"
                      value={formData.requiredPoints}
                      onChange={(e) => setFormData({ ...formData, requiredPoints: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: 200" required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Số lượng kho *</label>
                    <input
                      type="number" min="1"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: 50" required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Hủy</button>
                  <button type="submit" disabled={savingGift} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-75">
                    {savingGift ? 'Đang lưu...' : 'Lưu vào kho'}
                  </button>
                </div>
              </form>
            )}

            {!selectedVariant && (
              <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Đóng</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftRewardManagement;