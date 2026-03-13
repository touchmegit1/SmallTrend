import React, { useState } from 'react';
import { X, DollarSign, Calendar, Percent, TrendingUp } from 'lucide-react';
import { createVariantPrice } from '../../../hooks/useVariantPrices';

const CreatePriceModal = ({ isOpen, onClose, variant, onPriceCreated }) => {
  const [formData, setFormData] = useState({
    purchasePrice: variant?.activePurchasePrice || variant?.costPrice || 0,
    sellingPrice: variant?.activeSellingPrice || variant?.sellPrice || '',
    taxPercent: variant?.activeTaxPercent || variant?.taxRate || '10',
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDateFocused, setIsDateFocused] = useState(false);
  const [isExpiryDateFocused, setIsExpiryDateFocused] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Tính lợi nhuận preview
  const purchasePrice = parseFloat(formData.purchasePrice) || 0;
  const sellingPrice = parseFloat(formData.sellingPrice) || 0;
  const taxPercent = parseFloat(formData.taxPercent) || 0;
  const taxAmount = sellingPrice * (taxPercent / 100);
  const profit = sellingPrice - purchasePrice - taxAmount;
  const profitPercent = purchasePrice > 0 ? ((profit / purchasePrice) * 100).toFixed(1) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) {
      setError('Giá bán phải lớn hơn 0.');
      return;
    }
    if (!formData.effectiveDate) {
      setError('Ngày hiệu lực là bắt buộc.');
      return;
    }

    setLoading(true);
    try {
      await createVariantPrice(variant.id, {
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        sellingPrice: parseFloat(formData.sellingPrice),
        taxPercent: parseFloat(formData.taxPercent) || 0,
        effectiveDate: formData.effectiveDate,
        expiryDate: formData.expiryDate || null,
      });
      onPriceCreated && onPriceCreated();
      onClose(true); // Pass true to indicate successful creation
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tạo giá mới.');
    } finally {
      setLoading(false);
    }
  };

  const formatVND = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white text-lg font-bold flex items-center gap-2">
              <DollarSign size={20} /> Tạo giá mới
            </h2>
            <p className="text-blue-100 text-sm mt-0.5">
              {variant?.name || variant?.sku || 'Variant'}
            </p>
          </div>
          <button type="button" onClick={() => onClose(false)} className="text-white/80 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          {/* Giá nhập */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá nhập (VNĐ)
            </label>
            <div className="relative">
              <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="purchasePrice"
                value={formData.purchasePrice}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed"
                placeholder="0"
                readOnly
              />
            </div>
          </div>

          {/* Thuế % */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thuế (%)</label>
            <div className="relative">
              <Percent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="taxPercent"
                value={formData.taxPercent}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="10"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>

          {/* Giá bán */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá bán (VNĐ) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="0"
                min="0"
                step="100"
                required
              />
            </div>
          </div>

          {/* Ngày hiệu lực */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày hiệu lực <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={isDateFocused ? "date" : "text"}
                name="effectiveDate"
                value={isDateFocused ? formData.effectiveDate : (formData.effectiveDate ? (() => { const [y, m, d] = formData.effectiveDate.split('-'); return `${d}/${m}/${y.slice(-2)}`; })() : '')}
                onChange={handleChange}
                onFocus={() => setIsDateFocused(true)}
                onBlur={() => setIsDateFocused(false)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition cursor-pointer"
                required
              />
            </div>
          </div>

          {/* Ngày hết hiệu lực */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày hết hiệu lực <span className="text-gray-400 text-xs">(tuỳ chọn)</span>
            </label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={isExpiryDateFocused ? "date" : "text"}
                name="expiryDate"
                value={isExpiryDateFocused ? formData.expiryDate : (formData.expiryDate ? (() => { const [y, m, d] = formData.expiryDate.split('-'); return `${d}/${m}/${y.slice(-2)}`; })() : '')}
                onChange={handleChange}
                onFocus={() => setIsExpiryDateFocused(true)}
                onBlur={() => setIsExpiryDateFocused(false)}
                placeholder="Không giới hạn"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition cursor-pointer"
              />
            </div>
          </div>
          {(purchasePrice > 0 || sellingPrice > 0) && (
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">Xem trước lợi nhuận</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Thuế:</span>
                  <span className="ml-2 font-medium">{formatVND(taxAmount)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Lợi nhuận:</span>
                  <span className={`ml-2 font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatVND(profit)} ({profitPercent}%)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang tạo...
                </>
              ) : (
                'Tạo giá mới'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePriceModal;
