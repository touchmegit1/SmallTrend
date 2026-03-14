import React, { useState, useEffect } from 'react';
import { X, History, CheckCircle2, XCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { getVariantPriceHistory, toggleVariantPriceStatus } from '../../../hooks/useVariantPrices';

const PriceHistoryModal = ({ isOpen, onClose, variant, onStatusChanged }) => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    if (isOpen && variant?.id) {
      fetchHistory();
    }
  }, [isOpen, variant?.id]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getVariantPriceHistory(variant.id);
      setPrices(data);
    } catch (err) {
      console.error('Error fetching price history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (priceId) => {
    setToggling(priceId);
    try {
      await toggleVariantPriceStatus(priceId);
      await fetchHistory();
      onStatusChanged && onStatusChanged();
    } catch (err) {
      console.error('Error toggling price status:', err);
    } finally {
      setToggling(null);
    }
  };

  if (!isOpen) return null;

  const formatVND = (val) =>
    val != null
      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
      : '—';

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-white text-lg font-bold flex items-center gap-2">
              <History size={20} /> Lịch sử giá
            </h2>
            <p className="text-purple-100 text-sm mt-0.5">
              {variant?.name || variant?.sku || 'Variant'}
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            </div>
          ) : prices.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <History size={48} className="mx-auto mb-3 opacity-50" />
              <p>Chưa có lịch sử giá nào.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">#</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Giá nhập</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Giá bán</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Thuế (%)</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Ngày hiệu lực</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Trạng thái</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Ngày tạo</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((price, idx) => (
                  <tr
                    key={price.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                      price.status === 'ACTIVE' ? 'bg-emerald-50/50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatVND(price.purchasePrice)}</td>
                    <td className="px-4 py-3 text-right font-bold text-blue-700">
                      {formatVND(price.sellingPrice)}
                    </td>
                    <td className="px-4 py-3 text-right">{price.taxPercent ?? 0}%</td>
                    <td className="px-4 py-3 text-center">{formatDate(price.effectiveDate)}</td>
                    <td className="px-4 py-3 text-center">
                      {price.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                          <CheckCircle2 size={12} /> Kích hoạt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                          <XCircle size={12} /> Đã tắt kích hoạt
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-400 text-xs">
                      {formatDate(price.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggle(price.id)}
                        disabled={toggling === price.id}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          price.status === 'ACTIVE'
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        } disabled:opacity-50`}
                        title={price.status === 'ACTIVE' ? 'Tắt kích hoạt' : 'Kích hoạt'}
                      >
                        {toggling === price.id ? (
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : price.status === 'ACTIVE' ? (
                          <><ToggleRight size={14} /> Tắt kích hoạt</>
                        ) : (
                          <><ToggleLeft size={14} /> Kích hoạt</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-3 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceHistoryModal;
