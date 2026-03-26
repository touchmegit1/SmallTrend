import React, { useMemo, useState } from 'react';
import { X, DollarSign, Calendar, Percent, TrendingUp } from 'lucide-react';
import { createVariantPrice } from '../../../hooks/useVariantPrices';
import { useFetchTaxRates } from '../../../hooks/taxRates';
import { calculatePriceBreakdown, formatCurrency } from '../../../utils/priceCalculation';

/**
 * Modal tạo bản ghi giá mới cho một variant.
 * Khi tạo thành công, callback sẽ được gọi để màn hình cha tải lại dữ liệu.
 */
const CreatePriceModal = ({ isOpen, onClose, variant, onPriceCreated }) => {
  const [formData, setFormData] = useState({
    purchasePrice: variant?.costPrice || 0,
    baseSellingPrice: variant?.activeBaseSellingPrice || variant?.activeSellingPrice || variant?.sellPrice || '',
    taxPercent: variant?.activeTaxPercent || variant?.taxRate || '10',
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDateFocused, setIsDateFocused] = useState(false);
  const [isExpiryDateFocused, setIsExpiryDateFocused] = useState(false);
  const { taxRates } = useFetchTaxRates();

  const taxPercentValue = String(Number(formData.taxPercent) || 0);

  const taxRateOptions = useMemo(() => {
    const source = Array.isArray(taxRates)
      ? taxRates.filter((tax) => tax?.active !== false)
      : [];

    const mapped = source.map((tax) => ({
      id: tax.id,
      rate: String(Number(tax.rate) || 0),
      label: `${tax.name} (${Number(tax.rate) || 0}%)`,
    }));

    const hasCurrentRate = mapped.some((option) => option.rate === taxPercentValue);
    if (!hasCurrentRate) {
      mapped.unshift({
        id: 'current-tax',
        rate: taxPercentValue,
        label: `Thuế hiện tại (${taxPercentValue}%)`,
      });
    }

    return mapped;
  }, [taxRates, taxPercentValue]);


  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'baseSellingPrice') {
      const sanitized = value.replace(/\D/g, '');
      setFormData((prev) => ({ ...prev, [name]: sanitized }));
      return;
    }

    if (name === 'taxPercent') {
      const normalized = value.replace(',', '.').replace(/[^\d.]/g, '');
      const firstDotIndex = normalized.indexOf('.');
      const sanitized = firstDotIndex === -1
        ? normalized
        : `${normalized.slice(0, firstDotIndex + 1)}${normalized.slice(firstDotIndex + 1).replace(/\./g, '')}`;
      setFormData((prev) => ({ ...prev, [name]: sanitized }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatVND = (val) => formatCurrency(val);

  const purchasePrice = parseFloat(formData.purchasePrice) || 0;
  const baseSellingPrice = parseFloat(formData.baseSellingPrice) || 0;
  const taxPercent = parseFloat(formData.taxPercent) || 0;

  const breakdown = calculatePriceBreakdown({
    purchasePrice,
    baseSellingPrice,
    taxPercent,
    roundStep: 100,
  });

  const finalSellingPrice = breakdown.sellingPrice;
  const vatAmount = breakdown.vatAmount;
  const profit = breakdown.profit;
  const hasValidCostForProfit = purchasePrice > 0;
  const profitValueDisplay = hasValidCostForProfit ? formatVND(profit) : '-';
  const marginPercentDisplay = hasValidCostForProfit && Number.isFinite(breakdown.marginPercent)
    ? `${breakdown.marginPercent.toFixed(1)}%`
    : '-';
  const profitToneClass = hasValidCostForProfit
    ? (profit >= 0 ? 'text-emerald-600' : 'text-red-600')
    : 'text-gray-500';

  const isExpiryBeforeEffective =
    !!formData.expiryDate &&
    !!formData.effectiveDate &&
    formData.expiryDate < formData.effectiveDate;

  const isBasePriceBelowCost =
    Number.isFinite(baseSellingPrice) && baseSellingPrice > 0 && baseSellingPrice < purchasePrice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.baseSellingPrice || baseSellingPrice <= 0) {
      setError('Giá bán trước VAT phải lớn hơn 0.');
      return;
    }

    if (taxPercent < 0 || taxPercent > 100) {
      setError('Thuế suất phải nằm trong khoảng từ 0 đến 100.');
      return;
    }

    if (!formData.effectiveDate) {
      setError('Ngày hiệu lực là bắt buộc.');
      return;
    }

    if (isExpiryBeforeEffective) {
      setError('Ngày hết hiệu lực phải lớn hơn hoặc bằng ngày hiệu lực.');
      return;
    }

    if (isBasePriceBelowCost) {
      setError('Giá bán trước VAT không được thấp hơn giá nhập.');
      return;
    }

    setLoading(true);
    try {
      await createVariantPrice(variant.id, {
        purchasePrice,
        baseSellingPrice,
        taxPercent,
        effectiveDate: formData.effectiveDate,
        expiryDate: formData.expiryDate || null,
      });
      onPriceCreated && onPriceCreated();
      onClose(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tạo giá mới.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !loading && !isExpiryBeforeEffective && !isBasePriceBelowCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col">
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
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto">
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
              <select
                name="taxPercent"
                value={taxPercentValue}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
              >
                {taxRateOptions.map((tax) => (
                  <option key={tax.id} value={tax.rate}>
                    {tax.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Giá bán trước VAT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá bán trước VAT (VNĐ) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="baseSellingPrice"
                value={formData.baseSellingPrice}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="0"
                min="0"
                step="100"
                required
              />
            </div>
          </div>

          {isBasePriceBelowCost && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              Giá bán trước VAT không được thấp hơn giá nhập.
            </div>
          )}

          {isExpiryBeforeEffective && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              Ngày hết hiệu lực phải lớn hơn hoặc bằng ngày hiệu lực.
            </div>
          )}

          {(purchasePrice > 0 || baseSellingPrice > 0) && (
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">Xem trước nghiệp vụ giá</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">Giá trước VAT:</span> <span className="font-medium">{formatVND(baseSellingPrice)}</span></div>
                <div><span className="text-gray-500">VAT:</span> <span className="font-medium">{formatVND(vatAmount)}</span></div>
                <div><span className="text-gray-500">Giá bán cuối (làm tròn 100đ):</span> <span className="font-bold text-gray-900">{formatVND(finalSellingPrice)}</span></div>
                <div>
                  <span className="text-gray-500">Lợi nhuận:</span>
                  <span className={`ml-1 font-bold ${profitToneClass}`}>
                    {profitValueDisplay} ({marginPercentDisplay})
                  </span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán cuối cho khách (đã gồm VAT)</label>
            <div className="relative">
              <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formatVND(finalSellingPrice)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-gray-100 text-gray-700 rounded-lg cursor-not-allowed"
                readOnly
              />
            </div>
          </div>

          <div className="text-xs text-gray-500 -mt-2">Giá bán cuối được hệ thống tự tính từ giá trước VAT + thuế và làm tròn theo bội số 100đ.</div>


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
              disabled={!canSubmit}
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
