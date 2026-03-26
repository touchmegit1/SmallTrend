import { useState, useEffect, useMemo } from 'react';
import { X, History, CheckCircle2, XCircle, ToggleLeft, ToggleRight, Trash2, AlertTriangle } from 'lucide-react';
import { getVariantPriceHistory, toggleVariantPriceStatus, deleteVariantPrice, updateVariantPriceExpiry } from '../../../hooks/useVariantPrices';

const PriceHistoryModal = ({ isOpen, onClose, variant, onStatusChanged }) => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [confirmDeletePrice, setConfirmDeletePrice] = useState(null);
  const [confirmActivatePrice, setConfirmActivatePrice] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [editingExpiryPriceId, setEditingExpiryPriceId] = useState(null);
  const [expiryInput, setExpiryInput] = useState('');
  const [editingEffectiveDate, setEditingEffectiveDate] = useState('');
  const [updatingExpiry, setUpdatingExpiry] = useState(false);
  const [expiryError, setExpiryError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expiryFilter, setExpiryFilter] = useState('ALL');
  const [auditLogs, setAuditLogs] = useState([]);

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

  const performToggle = async (priceId) => {
    setToggling(priceId);
    try {
      const targetPrice = prices.find((item) => item.id === priceId);
      await toggleVariantPriceStatus(priceId);
      addAuditLog(targetPrice?.status === 'ACTIVE' ? 'Tắt kích hoạt' : 'Kích hoạt', targetPrice);
      await fetchHistory();
      onStatusChanged && onStatusChanged();
    } catch (err) {
      console.error('Error toggling price status:', err);
      window.alert(err.response?.data?.message || 'Không thể thay đổi trạng thái giá.');
    } finally {
      setToggling(null);
      setConfirmActivatePrice(null);
    }
  };

  const handleToggle = async (price) => {
    if (price.status === 'ACTIVE') {
      await performToggle(price.id);
      return;
    }

    const currentActivePrice = prices.find((item) => item.status === 'ACTIVE');
    const currentPurchasePrice = [
      currentActivePrice?.purchasePrice,
      variant?.costPrice,
      variant?.activePurchasePrice,
      variant?.purchasePrice,
    ]
      .map((val) => Number(val))
      .find((val) => Number.isFinite(val) && val > 0) ?? 0;
    const targetSellingPrice = Number(price?.sellingPrice);

    if (currentPurchasePrice > 0 && Number.isFinite(targetSellingPrice) && targetSellingPrice < currentPurchasePrice) {
      setConfirmActivatePrice(price);
      return;
    }

    await performToggle(price.id);
  };

  const handleDelete = (price) => {
    if (price.status === 'ACTIVE') return;
    setDeleteError('');
    setConfirmDeletePrice(price);
  };

  const confirmDelete = async () => {
    if (!confirmDeletePrice) return;

    setDeleting(confirmDeletePrice.id);
    setDeleteError('');
    try {
      await deleteVariantPrice(confirmDeletePrice.id);
      addAuditLog('Xóa', confirmDeletePrice);
      setConfirmDeletePrice(null);
      await fetchHistory();
      onStatusChanged && onStatusChanged();
    } catch (err) {
      console.error('Error deleting price:', err);
      setDeleteError(err.response?.data?.message || 'Không thể xoá bản ghi giá.');
    } finally {
      setDeleting(null);
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

  const isSellingBelowPurchase = (price) => {
    const sellingPrice = Number(price?.sellingPrice);
    const purchasePrice = Number(price?.purchasePrice);

    if (!Number.isFinite(sellingPrice) || !Number.isFinite(purchasePrice)) return false;
    return sellingPrice < purchasePrice;
  };

  const toInputDate = (dateStr) => (dateStr ? String(dateStr).split('T')[0] : '');
  const getTodayInputDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getMinAllowedExpiryDate = () => {
    const today = getTodayInputDate();
    if (!editingEffectiveDate) return today;
    return editingEffectiveDate > today ? editingEffectiveDate : today;
  };

  const startEditExpiry = (price) => {
    setExpiryError('');
    setEditingExpiryPriceId(price.id);
    setExpiryInput(toInputDate(price.expiryDate));
    setEditingEffectiveDate(toInputDate(price.effectiveDate));
  };

  const cancelEditExpiry = () => {
    if (updatingExpiry) return;
    setEditingExpiryPriceId(null);
    setExpiryInput('');
    setEditingEffectiveDate('');
    setExpiryError('');
  };

  const addAuditLog = (action, price, details = '') => {
    setAuditLogs((prev) => [
      {
        id: Date.now() + Math.random(),
        action,
        details,
        priceLabel: formatVND(price?.sellingPrice),
        at: new Date(),
      },
      ...prev,
    ].slice(0, 8));
  };

  const saveExpiry = async () => {
    if (!editingExpiryPriceId || !variant?.id) return;

    const minAllowedExpiryDate = getMinAllowedExpiryDate();
    if (expiryInput && expiryInput < minAllowedExpiryDate) {
      setExpiryError('Ngày hết hiệu lực phải lớn hơn hoặc bằng ngày hiệu lực và không nhỏ hơn ngày hiện tại.');
      return;
    }

    setUpdatingExpiry(true);
    setExpiryError('');
    try {
      const editedPrice = prices.find((item) => item.id === editingExpiryPriceId);
      await updateVariantPriceExpiry(editingExpiryPriceId, expiryInput || null);
      addAuditLog('Gia hạn', editedPrice, `Ngày hết hiệu lực mới: ${expiryInput || 'Không giới hạn'}`);
      setEditingExpiryPriceId(null);
      setExpiryInput('');
      setEditingEffectiveDate('');
      await fetchHistory();
      onStatusChanged && onStatusChanged();
    } catch (err) {
      console.error('Error updating expiry date:', err);
      setExpiryError(err.response?.data?.message || 'Không thể cập nhật ngày hết hiệu lực.');
    } finally {
      setUpdatingExpiry(false);
    }
  };


  const filteredPrices = useMemo(() => {
    const today = getTodayInputDate();
    return prices.filter((price) => {
      if (statusFilter !== 'ALL' && price.status !== statusFilter) return false;

      if (expiryFilter === 'EXPIRED') {
        return Boolean(price.expiryDate) && toInputDate(price.expiryDate) < today;
      }
      if (expiryFilter === 'NOT_EXPIRED') {
        return !price.expiryDate || toInputDate(price.expiryDate) >= today;
      }
      if (expiryFilter === 'NO_EXPIRY') {
        return !price.expiryDate;
      }
      return true;
    });
  }, [prices, statusFilter, expiryFilter]);

  const formatDateTime = (date) => {
    if (!date) return '—';
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden max-h-[85vh] flex flex-col relative">
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

        <div className="overflow-auto flex-1 p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1 text-xs"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang kích hoạt</option>
              <option value="INACTIVE">Đã tắt kích hoạt</option>
            </select>
            <select
              value={expiryFilter}
              onChange={(e) => setExpiryFilter(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1 text-xs"
            >
              <option value="ALL">Tất cả hết hiệu lực</option>
              <option value="EXPIRED">Đã hết hiệu lực</option>
              <option value="NOT_EXPIRED">Chưa hết hiệu lực</option>
              <option value="NO_EXPIRY">Không giới hạn</option>
            </select>
          </div>

          {auditLogs.length > 0 && (
            <div className="mb-3 rounded-lg border border-violet-200 bg-violet-50 p-3">
              <h4 className="text-xs font-semibold text-violet-800 mb-2">Nhật ký thao tác gần đây</h4>
              <div className="space-y-1">
                {auditLogs.map((log) => (
                  <div key={log.id} className="text-xs text-violet-900">
                    <span className="font-medium">{log.action}</span> · {log.priceLabel}
                    {log.details ? ` · ${log.details}` : ''}
                    <span className="text-violet-600"> · {formatDateTime(log.at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            </div>
          ) : filteredPrices.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <History size={48} className="mx-auto mb-3 opacity-50" />
              <p>Không có bản ghi phù hợp bộ lọc.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">#</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Giá bán</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Thuế (%)</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Ngày hiệu lực</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Ngày tạo</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Ngày hết hiệu lực</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Trạng thái</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrices.map((price, idx) => (
                  <tr
                    key={price.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                      price.status === 'ACTIVE' ? 'bg-emerald-50/50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                    <td className={`px-4 py-3 text-right font-bold ${isSellingBelowPurchase(price) ? 'text-red-600' : 'text-blue-700'}`}>
                      {formatVND(price.sellingPrice)}
                    </td>
                    <td className="px-4 py-3 text-right">{price.taxPercent ?? 0}%</td>
                    <td className="px-4 py-3 text-center">{formatDate(price.effectiveDate)}</td>
                    <td className="px-4 py-3 text-center text-gray-400 text-xs">
                      {formatDate(price.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {price.status === 'ACTIVE' && editingExpiryPriceId === price.id ? (
                        <div className="flex flex-col items-center gap-2">
                          <input
                            type="date"
                            value={expiryInput}
                            min={getMinAllowedExpiryDate()}
                            onChange={(e) => {
                              setExpiryInput(e.target.value);
                              if (expiryError) setExpiryError('');
                            }}
                            disabled={updatingExpiry}
                            className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                          />
                          <div className="flex items-center gap-1">
                            <button
                              onClick={saveExpiry}
                              disabled={updatingExpiry}
                              className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-xs font-medium disabled:opacity-50"
                            >
                              {updatingExpiry ? 'Đang lưu...' : 'Lưu'}
                            </button>
                            <button
                              onClick={cancelEditExpiry}
                              disabled={updatingExpiry}
                              className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium disabled:opacity-50"
                            >
                              Hủy
                            </button>
                          </div>
                          {expiryError && (
                            <div className="text-xs text-red-600 max-w-[180px] leading-4">{expiryError}</div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <span>{formatDate(price.expiryDate)}</span>
                          <button
                            onClick={() => startEditExpiry(price)}
                            disabled={Boolean(toggling) || Boolean(deleting) || updatingExpiry}
                            className="text-xs text-violet-600 hover:text-violet-700 font-medium disabled:opacity-50"
                          >
                            Sửa
                          </button>
                        </div>
                      )}
                    </td>
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
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(price)}
                          disabled={toggling === price.id || deleting === price.id}
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

                        <button
                          onClick={() => handleDelete(price)}
                          disabled={price.status === 'ACTIVE' || deleting === price.id || toggling === price.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                          title={price.status === 'ACTIVE' ? 'Không thể xoá giá đang kích hoạt' : 'Xoá bản ghi giá'}
                        >
                          {deleting === price.id ? (
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <><Trash2 size={14} /> Xoá</>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {confirmActivatePrice && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 p-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-amber-100 p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-amber-500">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Cảnh báo giá bán thấp hơn giá nhập</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Giá bán <span className="font-semibold text-gray-900">{formatVND(confirmActivatePrice.sellingPrice)}</span> đang thấp hơn giá nhập hiện tại.
                    Bạn vẫn muốn kích hoạt giá này?
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setConfirmActivatePrice(null)}
                  disabled={Boolean(toggling)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => performToggle(confirmActivatePrice.id)}
                  disabled={toggling === confirmActivatePrice.id}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg disabled:opacity-50"
                >
                  {toggling === confirmActivatePrice.id ? (
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  ) : null}
                  Vẫn kích hoạt
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmDeletePrice && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 p-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-red-100 p-5">
              <h3 className="text-base font-semibold text-gray-900">Xác nhận xoá bản ghi giá</h3>
              <p className="mt-2 text-sm text-gray-600">
                Bạn có chắc muốn xoá bản ghi giá <span className="font-semibold text-gray-900">{formatVND(confirmDeletePrice.sellingPrice)}</span> không?
              </p>
              {deleteError && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {deleteError}
                </div>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => {
                    if (deleting) return;
                    setConfirmDeletePrice(null);
                    setDeleteError('');
                  }}
                  disabled={Boolean(deleting)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting === confirmDeletePrice.id}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
                >
                  {deleting === confirmDeletePrice.id ? (
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Xoá
                </button>
              </div>
            </div>
          </div>
        )}

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
