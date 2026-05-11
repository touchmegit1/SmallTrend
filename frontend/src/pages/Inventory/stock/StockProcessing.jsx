import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, ArrowLeft, Box, MinusCircle, Loader2, AlertTriangle,
  CheckCircle2, Package, CalendarDays, Hash, Layers, X, Save,
  History, ShoppingCart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDashboardProducts, getProductBatches, getSuppliers, getActiveLocations } from '../../../services/inventory/inventoryService';
import { useAuth } from '../../../context/AuthContext';
import { MANAGER_ROLES, ADMIN_ROLES, INVENTORY_ROLES, CASHIER_ROLES, hasAnyRole } from '../../../utils/rolePermissions';
import { useToast, ToastContainer } from '../../../hooks/useToast';
import ConfirmModal from '../../../components/ui/ConfirmModal';

const SPRING_API = import.meta.env.PROD ? '/api/inventory' : (import.meta.env.VITE_INVENTORY_API_BASE_URL || 'http://localhost:8081/api/inventory');

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const DEDUCTION_REASONS = [
  { value: 'POS_SALE', label: 'Bán hàng (POS)', icon: ShoppingCart },
  { value: 'DAMAGE', label: 'Hư hỏng', icon: AlertTriangle },
  { value: 'EXPIRED', label: 'Hết hạn', icon: CalendarDays },
  { value: 'ADJUSTMENT', label: 'Điều chỉnh kiểm kê', icon: CheckCircle2 },
  { value: 'OTHER', label: 'Khác', icon: MinusCircle },
];

export default function StockProcessing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canAccess = hasAnyRole(user, [...ADMIN_ROLES, ...MANAGER_ROLES, ...INVENTORY_ROLES, ...CASHIER_ROLES]);
  const { toasts, showToast, removeToast } = useToast();

  const [products, setProducts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [deductQty, setDeductQty] = useState(1);
  const [reason, setReason] = useState('POS_SALE');
  const [locationId, setLocationId] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [recentDeductions, setRecentDeductions] = useState([]);

  useEffect(() => {
    if (!canAccess) return;
    const load = async () => {
      try {
        setLoading(true);
        const [prods, batchData, locs] = await Promise.all([
          getDashboardProducts(),
          getProductBatches(),
          getActiveLocations(),
        ]);
        setProducts(prods);
        setBatches(batchData);
        setLocations(locs);
        if (locs.length > 0) setLocationId(String(locs[0].id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [canAccess]);

  const filteredProducts = products.filter(p => {
    if (!searchTerm) return p.stockQuantity > 0;
    const term = searchTerm.toLowerCase();
    return (p.sku || '').toLowerCase().includes(term) ||
      (p.name || '').toLowerCase().includes(term);
  }).slice(0, 20);

  const productBatches = useCallback((productId) => {
    return batches.filter(b => (b.product_id || b.productId) === productId);
  }, [batches]);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSelectedBatch(null);
    setDeductQty(1);
  };

  const handleSelectBatch = (batch) => {
    setSelectedBatch(batch);
    setDeductQty(Math.min(1, batch.quantity || 0));
  };

  const handleDeduct = async () => {
    if (!selectedProduct || !selectedBatch) return;
    if (deductQty < 1 || deductQty > (selectedBatch.quantity || 0)) {
      showToast('Số lượng trừ không hợp lệ', 'warning');
      return;
    }
    setConfirmModal({
      title: 'Xác nhận trừ kho',
      message: `Trừ ${deductQty} ${selectedProduct.unit || ''} sản phẩm "${selectedProduct.name}" khỏi lô ${selectedBatch.batch_code || selectedBatch.batchCode}?`,
      confirmText: 'Xác nhận trừ',
      variant: 'warning',
      onConfirm: async () => {
        setConfirmModal(null);
        await executeDeduction();
      }
    });
  };

  const executeDeduction = async () => {
    try {
      setSaving(true);
      const payload = {
        variantId: selectedProduct.id,
        batchId: selectedBatch.id || selectedBatch.batchId,
        locationId: Number(locationId),
        quantity: deductQty,
        reason: reason,
        notes: `Trừ kho POS: ${DEDUCTION_REASONS.find(r => r.value === reason)?.label || reason}`,
      };

      const response = await fetch(`${SPRING_API}/stock/adjust`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Lỗi khi trừ kho');
      }

      // Add to recent deductions
      const now = new Date();
      setRecentDeductions(prev => [{
        id: Date.now(),
        productName: selectedProduct.name,
        sku: selectedProduct.sku,
        batchCode: selectedBatch.batch_code || selectedBatch.batchCode,
        quantity: deductQty,
        reason: DEDUCTION_REASONS.find(r => r.value === reason)?.label,
        time: now.toLocaleTimeString('vi-VN'),
        date: now.toLocaleDateString('vi-VN'),
      }, ...prev].slice(0, 20));

      showToast(`Đã trừ ${deductQty} ${selectedProduct.unit || ''} thành công`, 'success');

      // Refresh data
      const [prods, batchData] = await Promise.all([
        getDashboardProducts(),
        getProductBatches(),
      ]);
      setProducts(prods);
      setBatches(batchData);

      // Reset selection
      setSelectedProduct(null);
      setSelectedBatch(null);
      setDeductQty(1);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Lỗi khi trừ kho', 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (v) => Number(v || 0).toLocaleString('vi-VN') + 'đ';

  if (!canAccess) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-50"><p className="text-slate-500">Bạn không có quyền truy cập</p></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => navigate('/inventory')} className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-500">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Xử lý hàng hóa</h1>
              <p className="text-sm text-slate-500 mt-0.5">Trừ kho sản phẩm cho POS & điều chỉnh tồn kho</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Product Search & Batch Selection */}
          <div className="lg:col-span-2 space-y-5">
            {/* Search */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Tìm sản phẩm theo tên hoặc SKU..."
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              {/* Product results */}
              {searchTerm && filteredProducts.length > 0 && (
                <div className="mt-3 border border-slate-200 rounded-xl max-h-[400px] overflow-y-auto divide-y divide-slate-100">
                  {filteredProducts.map(p => {
                    const isSelected = selectedProduct?.id === p.id;
                    return (
                      <div key={p.id}
                        onClick={() => handleSelectProduct(p)}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition hover:bg-slate-50 ${isSelected ? 'bg-indigo-50 border-l-2 border-indigo-500' : ''}`}>
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                          {p.imageUrl ? <img src={p.imageUrl} alt="" className="w-full h-full object-cover rounded-lg" /> : <Box size={18} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                          <p className="text-xs text-slate-400 truncate">SKU: {p.sku} · Tồn: <b className="text-slate-600">{Number(p.stockQuantity || 0).toLocaleString('vi-VN')}</b> {p.unit || ''}</p>
                        </div>
                        {isSelected && <CheckCircle2 size={18} className="text-indigo-600 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Batch selection (when product selected) */}
            {selectedProduct && (
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Layers size={16} className="text-indigo-600" />
                  <h3 className="text-sm font-semibold text-slate-800">
                    Chọn lô hàng · {selectedProduct.name}
                    <span className="text-xs text-slate-400 ml-2">Tồn: {Number(selectedProduct.stockQuantity || 0)} {selectedProduct.unit || ''}</span>
                  </h3>
                </div>

                {productBatches(selectedProduct.id).length === 0 ? (
                  <p className="text-xs text-slate-400">Không có lô hàng nào</p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {productBatches(selectedProduct.id).map(b => {
                      const isSelected = selectedBatch?.id === b.id || selectedBatch?.batchCode === b.batchCode;
                      return (
                        <div key={b.id || b.batch_code}
                          onClick={() => handleSelectBatch(b)}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition ${isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              <Hash size={12} className="inline mr-1" />
                              {b.batch_code || b.batchCode || '—'}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              <CalendarDays size={11} className="inline mr-1" />
                              HSD: {b.expiry_date || b.expiryDate ? new Date(b.expiry_date || b.expiryDate).toLocaleDateString('vi-VN') : '—'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-slate-900">{Number(b.quantity || 0).toLocaleString('vi-VN')}</p>
                            <p className="text-xs text-slate-400">{selectedProduct.unit || ''}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Deduction form */}
            {selectedProduct && selectedBatch && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <MinusCircle size={16} className="text-red-500" />
                  Trừ kho · Lô {selectedBatch.batch_code || selectedBatch.batchCode}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Số lượng trừ *</label>
                    <input type="number" min="1" max={selectedBatch.quantity || 0}
                      value={deductQty}
                      onChange={e => setDeductQty(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <p className="text-xs text-slate-400 mt-1">Tối đa: {selectedBatch.quantity || 0} {selectedProduct.unit || ''}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Lý do *</label>
                    <select value={reason} onChange={e => setReason(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {DEDUCTION_REASONS.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Kho / Vị trí</label>
                    <select value={locationId} onChange={e => setLocationId(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {locations.map(l => (
                        <option key={l.id} value={String(l.id)}>{l.locationName || l.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button onClick={handleDeduct} disabled={saving || deductQty < 1}
                      className="w-full px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2">
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <MinusCircle size={14} />}
                      Trừ kho {deductQty} {selectedProduct.unit || ''}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Recent Deductions */}
          <div className="space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
                <History size={16} className="text-slate-500" />
                Lịch sử trừ kho gần đây
              </h3>
              {recentDeductions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">Chưa có giao dịch nào</p>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {recentDeductions.map(d => (
                    <div key={d.id} className="border border-slate-200 rounded-lg p-3 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{d.productName}</p>
                          <p className="text-slate-400 truncate">SKU: {d.sku} · Lô: {d.batchCode}</p>
                        </div>
                        <span className="text-red-600 font-bold shrink-0">-{d.quantity}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-slate-400">{d.reason}</span>
                        <span className="text-slate-400">{d.time} · {d.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Liên kết nhanh</h3>
              <div className="space-y-2">
                <button onClick={() => navigate('/inventory/stock')}
                  className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition flex items-center gap-2">
                  <Layers size={14} /> Xem tồn kho
                </button>
                <button onClick={() => navigate('/inventory/purchase-orders')}
                  className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition flex items-center gap-2">
                  <Package size={14} /> Danh sách phiếu nhập
                </button>
                <button onClick={() => navigate('/inventory/purchase-orders/create')}
                  className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition flex items-center gap-2">
                  <Save size={14} /> Tạo phiếu nhập mới
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={!!confirmModal}
        title={confirmModal?.title || ''}
        message={confirmModal?.message || ''}
        confirmText={confirmModal?.confirmText || 'Xác nhận'}
        cancelText="Hủy"
        variant={confirmModal?.variant || 'warning'}
        onCancel={() => setConfirmModal(null)}
        onConfirm={confirmModal?.onConfirm || (() => setConfirmModal(null))}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
