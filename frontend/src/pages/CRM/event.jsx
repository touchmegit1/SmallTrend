import React, { useState } from 'react';

const PromotionManagement = () => {
  // --- STATE: QUẢN LÝ TAB ---
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'products'

  // --- STATE: DANH SÁCH KHUYẾN MÃI ---
  const [promotions, setPromotions] = useState([
    { 
      id: 1, name: 'Giảm giá mùa hè', type: 'percent', value: 15, 
      startDate: '2026-06-01', endDate: '2026-06-30', 
      minOrderValue: 200000, usageLimit: 100, usedCount: 45,
      image: 'https://placehold.co/150x150?text=Summer+Sale', showOnHome: true, status: 'Hoạt động' 
    },
    { 
      id: 2, name: 'Tặng túi Tote', type: 'gift', value: 'Túi Tote LocalStore', 
      startDate: '2026-02-21', endDate: '2026-03-01', 
      minOrderValue: 500000, usageLimit: 50, usedCount: 50,
      image: 'https://placehold.co/150x150?text=Tote+Bag', showOnHome: false, status: 'Hết lượt' 
    },
  ]);

  // --- STATE: DANH SÁCH SẢN PHẨM (Dành cho Tab 2) ---
  const [products, setProducts] = useState([
    { id: 101, name: 'Cà phê Sữa đá', price: 29000, promotionId: null },
    { id: 102, name: 'Trà đào cam sả', price: 35000, promotionId: 1 },
    { id: 103, name: 'Bánh Croissant', price: 25000, promotionId: null },
  ]);

  // --- STATE: MODAL KHUYẾN MÃI CHUNG ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    name: '', type: 'percent', value: '', startDate: '', endDate: '', 
    minOrderValue: '', usageLimit: '', image: null, imageFile: null, 
    showOnHome: false, status: 'Hoạt động'
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- XỬ LÝ: MODAL KHUYẾN MÃI ---
  const openModal = (promo = null) => {
    if (promo) {
      setFormData({ ...promo, imageFile: null });
      setEditingId(promo.id);
    } else {
      setFormData(initialFormState);
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (formData.imageFile && formData.image) URL.revokeObjectURL(formData.image);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData({ ...formData, image: previewUrl, imageFile: file }); 
    }
  };

  // Cập nhật: Đảm bảo chỉ 1 khuyến mãi được showOnHome khi Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const { imageFile, ...dataToSave } = formData; 

    let updatedPromotions = [...promotions];

    // Nếu khuyến mãi này đang được set là showOnHome = true, tắt tất cả các khuyến mãi khác
    if (dataToSave.showOnHome) {
      updatedPromotions = updatedPromotions.map(p => ({ ...p, showOnHome: false }));
    }

    if (editingId) {
      updatedPromotions = updatedPromotions.map(p => p.id === editingId ? { ...dataToSave, id: editingId, usedCount: p.usedCount } : p);
    } else {
      updatedPromotions.push({ ...dataToSave, id: Date.now(), usedCount: 0 });
    }
    setPromotions(updatedPromotions);
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) {
      setPromotions(promotions.filter(p => p.id !== id));
      // Xóa luôn áp dụng khuyến mãi ở sản phẩm nếu có
      setProducts(products.map(prod => prod.promotionId === id ? { ...prod, promotionId: null } : prod));
    }
  };

  // Cập nhật: Đảm bảo chỉ 1 khuyến mãi được showOnHome khi Toggle nhanh
  const handleToggleHome = (id) => {
    const targetPromo = promotions.find(p => p.id === id);
    const willBeOnHome = !targetPromo.showOnHome;

    setPromotions(promotions.map(p => {
      if (p.id === id) {
        return { ...p, showOnHome: willBeOnHome };
      } else {
        // Nếu cái hiện tại đang bật lên true, thì ép các cái khác về false
        return willBeOnHome ? { ...p, showOnHome: false } : p;
      }
    }));
  };

  // --- XỬ LÝ: ÁP DỤNG KHUYẾN MÃI CHO SẢN PHẨM ---
  const handleApplyPromoToProduct = (productId, promoId) => {
    setProducts(products.map(p => p.id === productId ? { ...p, promotionId: promoId ? parseInt(promoId) : null } : p));
  };

  // Helpers tính toán hiển thị
  const renderPromotionValue = (type, value) => {
    if (type === 'percent') return <span className="text-red-500 font-bold">{value}%</span>;
    if (type === 'fixed') return <span className="text-red-500 font-bold">-{Number(value).toLocaleString('vi-VN')}đ</span>;
    return <span className="text-blue-600 italic"> {value}</span>;
  };

  const calculateDiscountedPrice = (price, promoId) => {
    if (!promoId) return price;
    const promo = promotions.find(p => p.id === promoId);
    if (!promo || promo.status !== 'Hoạt động') return price;

    if (promo.type === 'percent') return price - (price * promo.value / 100);
    if (promo.type === 'fixed') return Math.max(0, price - promo.value);
    return price; // Loại quà tặng không trừ giá tiền
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Khuyến Mãi</h1>
        {activeTab === 'general' && (
          <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
            + Thêm Khuyến Mãi
          </button>
        )}
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-gray-300 mb-6">
        <button 
          onClick={() => setActiveTab('general')}
          className={`px-6 py-3 font-medium text-sm transition-colors duration-200 ${activeTab === 'general' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Khuyến mãi chung
        </button>
        <button 
          onClick={() => setActiveTab('products')}
          className={`px-6 py-3 font-medium text-sm transition-colors duration-200 ${activeTab === 'products' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Áp dụng theo Sản phẩm
        </button>
      </div>

      {/* --- TAB 1: DANH SÁCH KHUYẾN MÃI CHUNG --- */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-lg shadow overflow-x-auto animate-fade-in">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 w-16">Ảnh</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Tên CTKM</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Mức giảm / Quà tặng</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Trạng thái</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promo) => (
                <tr key={promo.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {promo.image ? (
                      <img src={promo.image} alt={promo.name} className="w-12 h-12 object-cover rounded shadow-sm border" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">Trống</div>
                    )}
                  </td>
                  <td className="px-4 py-4 font-medium">
                    {promo.name}
                    {promo.showOnHome && (
                      <span className="ml-2 inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        [Đang ghim Banner]
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">{renderPromotionValue(promo.type, promo.value)}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      promo.status === 'Hoạt động' ? 'bg-green-100 text-green-700' : 
                      promo.status === 'Hết lượt' ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {promo.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button 
                      onClick={() => handleToggleHome(promo.id)} 
                      className={`mr-3 font-medium ${promo.showOnHome ? 'text-orange-500 hover:text-orange-700' : 'text-green-600 hover:text-green-800'}`}
                    >
                      {promo.showOnHome ? 'Bỏ ghim' : 'Ghim trang chủ'}
                    </button>
                    <button onClick={() => openModal(promo)} className="text-blue-500 hover:text-blue-700 mr-3">Sửa</button>
                    <button onClick={() => handleDelete(promo.id)} className="text-red-500 hover:text-red-700">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- TAB 2: QUẢN LÝ KHUYẾN MÃI TỪNG SẢN PHẨM --- */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-lg shadow overflow-x-auto animate-fade-in">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Mã SP</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Tên Sản Phẩm</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Giá Gốc</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Giá Sau Khuyến Mãi</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Áp dụng CTKM</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const discountedPrice = calculateDiscountedPrice(product.price, product.promotionId);
                const hasDiscount = discountedPrice < product.price;

                return (
                  <tr key={product.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-4 text-gray-500">#{product.id}</td>
                    <td className="px-4 py-4 font-medium">{product.name}</td>
                    <td className={`px-4 py-4 ${hasDiscount ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {product.price.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="px-4 py-4 font-bold text-red-500">
                      {hasDiscount ? `${discountedPrice.toLocaleString('vi-VN')}đ` : '-'}
                    </td>
                    <td className="px-4 py-4">
                      <select 
                        value={product.promotionId || ''} 
                        onChange={(e) => handleApplyPromoToProduct(product.id, e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs"
                      >
                        <option value="">-- Không áp dụng --</option>
                        {promotions.filter(p => p.status === 'Hoạt động').map(promo => (
                          <option key={promo.id} value={promo.id}>
                            {promo.name} ({promo.type === 'percent' ? `-${promo.value}%` : promo.type === 'fixed' ? `-${promo.value}đ` : `Quà: ${promo.value}`})
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* --- MODAL FORM --- */}
      {/* Modal này được giữ nguyên như phiên bản trước */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl shadow-xl max-h-[90vh] overflow-y-auto">
             <h2 className="text-2xl font-bold mb-6 border-b pb-2">{editingId ? 'Chỉnh sửa' : 'Thêm mới'} Khuyến Mãi</h2>
             <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Phần nội dung form y hệt như code trước đó */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1">Tên chương trình *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Loại khuyến mãi</label>
                    <select name="type" value={formData.type} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2">
                      <option value="percent">Giảm theo phần trăm (%)</option>
                      <option value="fixed">Giảm tiền mặt (VNĐ)</option>
                      <option value="gift">Tặng sản phẩm (Quà tặng)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Trị giá *</label>
                    <input type={formData.type === 'gift' ? 'text' : 'number'} name="value" value={formData.value} onChange={handleInputChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                  </div>
                </div>

                <div className="col-span-1 bg-gray-50 p-4 rounded-lg border">
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Trạng thái</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2">
                      <option value="Hoạt động">Hoạt động</option>
                      <option value="Tạm dừng">Tạm dừng</option>
                    </select>
                  </div>
                  <div className="flex items-center mt-2">
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" name="showOnHome" checked={formData.showOnHome} onChange={handleInputChange} className="w-5 h-5 text-blue-600 rounded mr-2" />
                      <span className="text-sm font-medium">Ghim lên Trang chủ (Tối đa 1)</span>
                    </label>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-3 flex justify-end gap-3 mt-2 pt-4 border-t">
                  <button type="button" onClick={closeModal} className="px-5 py-2 bg-gray-200 text-gray-800 rounded font-medium">Hủy</button>
                  <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded font-medium">Lưu Khuyến Mãi</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionManagement;