import React, { useState } from 'react';

const GiftRewardManagement = () => {
  // --- MOCK DATA ---
  // Danh sách sản phẩm trong kho (để chọn làm quà)
  const availableProducts = [
    { id: 101, name: 'Cà phê Sữa đá', price: 29000 },
    { id: 102, name: 'Trà đào cam sả', price: 35000 },
    { id: 103, name: 'Bánh Croissant', price: 25000 },
    { id: 999, name: 'Cốc sứ LocalStore (Sản phẩm độc quyền)', price: 0 },
  ];

  // Cơ sở dữ liệu khách hàng (Mô phỏng)
  const [customers, setCustomers] = useState([
    { phone: '0901234567', name: 'Nguyễn Văn A', points: 550 },
    { phone: '0987654321', name: 'Trần Thị B', points: 120 },
  ]);

  // Danh sách quà tặng đang có
  const [gifts, setGifts] = useState([
    { id: 1, productId: 999, name: 'Cốc sứ LocalStore', requiredPoints: 500, stock: 20, image: 'https://placehold.co/100x100?text=Coc+Su' },
    { id: 2, productId: 101, name: 'Cà phê Sữa đá (Miễn phí)', requiredPoints: 150, stock: 50, image: 'https://placehold.co/100x100?text=Cafe' },
  ]);

  // --- STATES THAO TÁC ---
  const [searchPhone, setSearchPhone] = useState('');
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [searchError, setSearchError] = useState('');

  // Modal Quản lý kho quà
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ productId: '', name: '', requiredPoints: '', stock: '', image: null });

  // --- LOGIC: TRA CỨU & ĐỔI QUÀ ---
  const handleSearchCustomer = (e) => {
    e.preventDefault();
    setSearchError('');
    const customer = customers.find(c => c.phone === searchPhone);
    if (customer) {
      setCurrentCustomer(customer);
    } else {
      setCurrentCustomer(null);
      setSearchError('Không tìm thấy khách hàng với số điện thoại này!');
    }
  };

  const handleRedeemGift = (gift) => {
    if (!currentCustomer) return;
    
    if (currentCustomer.points < gift.requiredPoints) {
      alert(`Khách hàng không đủ điểm! Cần ${gift.requiredPoints} điểm.`);
      return;
    }

    if (gift.stock <= 0) {
      alert('Quà tặng này đã hết hàng trong kho!');
      return;
    }

    if (window.confirm(`Xác nhận đổi [${gift.name}] cho khách ${currentCustomer.name}? Sẽ trừ ${gift.requiredPoints} điểm.`)) {
      // 1. Trừ điểm khách hàng
      const updatedCustomers = customers.map(c => 
        c.phone === currentCustomer.phone ? { ...c, points: c.points - gift.requiredPoints } : c
      );
      setCustomers(updatedCustomers);
      setCurrentCustomer(updatedCustomers.find(c => c.phone === currentCustomer.phone)); // Cập nhật lại UI

      // 2. Trừ tồn kho quà tặng
      setGifts(gifts.map(g => 
        g.id === gift.id ? { ...g, stock: g.stock - 1 } : g
      ));

      alert('Đổi quà thành công!');
    }
  };

  // --- LOGIC: QUẢN LÝ KHO QUÀ (CRUD) ---
  const openModal = () => {
    setFormData({ productId: '', name: '', requiredPoints: '', stock: '', image: null });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  // Khi chọn 1 sản phẩm từ kho, tự động điền tên
  const handleProductSelect = (e) => {
    const prodId = parseInt(e.target.value);
    const selectedProd = availableProducts.find(p => p.id === prodId);
    setFormData({
      ...formData,
      productId: prodId,
      name: selectedProd ? selectedProd.name : ''
    });
  };

  const handleSubmitGift = (e) => {
    e.preventDefault();
    const newGift = {
      ...formData,
      id: Date.now(),
      requiredPoints: parseInt(formData.requiredPoints),
      stock: parseInt(formData.stock)
    };
    setGifts([...gifts, newGift]);
    closeModal();
  };

  const handleDeleteGift = (id) => {
    if (window.confirm('Xóa quà tặng này khỏi kho?')) {
      setGifts(gifts.filter(g => g.id !== id));
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
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium">
              Tìm
            </button>
          </form>
          {searchError && <p className="text-red-500 text-sm mt-2">{searchError}</p>}

          {/* Thông tin khách hàng */}
          {currentCustomer && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 text-sm">Khách hàng:</span>
                <span className="font-bold text-gray-800">{currentCustomer.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Điểm hiện tại:</span>
                <span className="font-bold text-blue-600 text-2xl">{currentCustomer.points}</span>
              </div>
            </div>
          )}
        </div>

        {/* Box Danh sách quà có thể đổi (Chỉ hiện khi có khách hàng) */}
        {currentCustomer && (
          <div className="bg-white p-6 rounded-lg shadow flex-1">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Chọn Quà Để Đổi</h2>
            <div className="flex flex-col gap-4">
              {gifts.map(gift => {
                const canAfford = currentCustomer.points >= gift.requiredPoints;
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
                      className={`px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-colors ${
                        !canAfford ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 
                        isOutOfStock ? 'bg-red-100 text-red-600 cursor-not-allowed' : 
                        'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {isOutOfStock ? 'Hết hàng' : !canAfford ? 'Thiếu điểm' : 'Đổi ngay'}
                    </button>
                  </div>
                );
              })}
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
              {gifts.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-6 text-gray-500">Chưa có quà tặng nào trong kho.</td></tr>
              ) : (
                gifts.map((gift) => (
                  <tr key={gift.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <img src={gift.image || 'https://placehold.co/100x100'} alt={gift.name} className="w-10 h-10 object-cover rounded border" />
                    </td>
                    <td className="px-4 py-4 font-medium">{gift.name}</td>
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
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Thêm Quà Tặng Mới</h2>
            
            <form onSubmit={handleSubmitGift}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Chọn sản phẩm từ kho *</label>
                <select 
                  value={formData.productId} 
                  onChange={handleProductSelect}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {availableProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tên hiển thị quà tặng *</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    onChange={(e) => setFormData({...formData, requiredPoints: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: 200" required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Số lượng kho *</label>
                  <input 
                    type="number" min="1"
                    value={formData.stock} 
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: 50" required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Lưu vào kho</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftRewardManagement;