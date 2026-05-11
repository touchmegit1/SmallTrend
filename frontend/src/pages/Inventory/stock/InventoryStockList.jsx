import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Filter, ChevronLeft, ChevronRight, Eye, Box, Package,
  AlertTriangle, CheckCircle2, Clock, Loader2, X, ChevronDown,
  ChevronUp, MapPin, CalendarDays, Hash, ArrowUpDown, Layers, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDashboardProducts, getProductBatches, getCategories, getBrands } from '../../../services/inventory/inventoryService';
import { useAuth } from '../../../context/AuthContext';
import { MANAGER_ROLES, ADMIN_ROLES, INVENTORY_ROLES, CASHIER_ROLES, hasAnyRole } from '../../../utils/rolePermissions';

const PAGE_SIZE = 10;

const STOCK_STATUS = {
  OUT: { label: 'Hết hàng', color: 'bg-red-100 text-red-700', icon: AlertTriangle, threshold: 0 },
  LOW: { label: 'Sắp hết', color: 'bg-orange-100 text-orange-700', icon: AlertTriangle, threshold: 10 },
  OK: { label: 'Còn hàng', color: 'bg-green-100 text-green-700', icon: CheckCircle2, threshold: 999999 },
};

function getStockStatus(qty, minStock) {
  if (qty <= 0) return STOCK_STATUS.OUT;
  if (qty <= (minStock || 10)) return STOCK_STATUS.LOW;
  return STOCK_STATUS.OK;
}

const BATCH_STATUS = {
  EXPIRED: { label: 'Hết hạn', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  EXPIRING_SOON: { label: 'Sắp hết hạn', color: 'bg-orange-100 text-orange-700', icon: Clock },
  SAFE: { label: 'Còn hạn', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
};

function getBatchStatus(expiryDate) {
  if (!expiryDate) return BATCH_STATUS.SAFE;
  const now = new Date();
  const exp = new Date(expiryDate);
  if (exp < now) return BATCH_STATUS.EXPIRED;
  const daysLeft = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
  if (daysLeft <= 30) return BATCH_STATUS.EXPIRING_SOON;
  return BATCH_STATUS.SAFE;
}

export default function InventoryStockList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canAccess = hasAnyRole(user, [...ADMIN_ROLES, ...MANAGER_ROLES, ...INVENTORY_ROLES, ...CASHIER_ROLES]);

  const [products, setProducts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);
  const [sortField, setSortField] = useState('stock');
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => {
    if (!canAccess) return;
    const load = async () => {
      try {
        setLoading(true);
        const [prods, batchData, cats, brandData] = await Promise.all([
          getDashboardProducts(),
          getProductBatches(),
          getCategories(),
          getBrands(),
        ]);
        setProducts(prods);
        setBatches(batchData);
        setCategories(cats);
        setBrands(brandData);
        setError(null);
      } catch (err) {
        setError('Không thể tải dữ liệu kho');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [canAccess]);

  const productBatches = useMemo(() => {
    const map = {};
    batches.forEach(b => {
      const pid = b.product_id || b.productId;
      if (!map[pid]) map[pid] = [];
      map[pid].push(b);
    });
    return map;
  }, [batches]);

  const filtered = useMemo(() => {
    let result = products.filter(p => {
      if (filterCategory !== 'ALL' && p.categoryId !== Number(filterCategory)) return false;
      if (filterStatus !== 'ALL') {
        const st = getStockStatus(p.stockQuantity || 0, p.minStock);
        if (filterStatus === 'OUT' && st !== STOCK_STATUS.OUT) return false;
        if (filterStatus === 'LOW' && st !== STOCK_STATUS.LOW) return false;
        if (filterStatus === 'OK' && st !== STOCK_STATUS.OK) return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (p.sku || '').toLowerCase().includes(term) ||
          (p.name || '').toLowerCase().includes(term) ||
          (p.categoryName || '').toLowerCase().includes(term);
      }
      return true;
    });

    result.sort((a, b) => {
      let va, vb;
      switch (sortField) {
        case 'name': va = (a.name || '').toLowerCase(); vb = (b.name || '').toLowerCase(); break;
        case 'sku': va = (a.sku || '').toLowerCase(); vb = (b.sku || '').toLowerCase(); break;
        case 'category': va = (a.categoryName || '').toLowerCase(); vb = (b.categoryName || '').toLowerCase(); break;
        case 'stock':
        default: va = Number(a.stockQuantity || 0); vb = Number(b.stockQuantity || 0); break;
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, searchTerm, filterCategory, filterStatus, sortField, sortDir]);

  const stats = useMemo(() => ({
    total: products.length,
    out: products.filter(p => (p.stockQuantity || 0) <= 0).length,
    low: products.filter(p => (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) <= (p.minStock || 10)).length,
    ok: products.filter(p => (p.stockQuantity || 0) > (p.minStock || 10)).length,
    totalBatches: batches.length,
  }), [products, batches]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
  const formatCurrency = (v) => Number(v || 0).toLocaleString('vi-VN') + 'đ';

  if (!canAccess) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-50"><p className="text-slate-500">Bạn không có quyền truy cập</p></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => navigate('/inventory')} className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-500">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Tồn kho sản phẩm</h1>
              <p className="text-sm text-slate-500 mt-0.5">Danh sách sản phẩm & lô hàng đang lưu tại kho</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Tổng SP', value: stats.total, icon: Box, color: 'indigo' },
            { label: 'Còn hàng', value: stats.ok, icon: CheckCircle2, color: 'green' },
            { label: 'Sắp hết', value: stats.low, icon: AlertTriangle, color: 'orange' },
            { label: 'Hết hàng', value: stats.out, icon: AlertTriangle, color: 'red' },
            { label: 'Tổng lô', value: stats.totalBatches, icon: Layers, color: 'purple' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className={`text-2xl font-bold text-${s.color}-600 mt-1`}>{loading ? '—' : s.value}</p>
                </div>
                <div className={`w-10 h-10 bg-${s.color}-100 rounded-xl flex items-center justify-center`}>
                  <s.icon className={`text-${s.color}-600`} size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Tìm theo tên, SKU, danh mục..." value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="ALL">Tất cả trạng thái</option>
                <option value="OK">Còn hàng</option>
                <option value="LOW">Sắp hết</option>
                <option value="OUT">Hết hàng</option>
              </select>
              <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="ALL">Tất cả danh mục</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name || c.categoryName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={32} /><span className="ml-3 text-slate-500">Đang tải...</span></div>
          ) : error ? (
            <div className="flex items-center justify-center py-20 text-red-500"><AlertTriangle size={24} /><span className="ml-2">{error}</span></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400"><Box size={48} /><p className="mt-3 text-sm">Không có sản phẩm nào</p></div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 w-10"></th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 cursor-pointer select-none" onClick={() => toggleSort('name')}>
                        <div className="flex items-center gap-1">Sản phẩm <ArrowUpDown size={12} /></div>
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 cursor-pointer select-none" onClick={() => toggleSort('sku')}>
                        <div className="flex items-center gap-1">SKU <ArrowUpDown size={12} /></div>
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Danh mục</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-600 cursor-pointer select-none" onClick={() => toggleSort('stock')}>
                        <div className="flex items-center justify-center gap-1">Tồn kho <ArrowUpDown size={12} /></div>
                      </th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-600">Trạng thái</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-600">Lô hàng</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-600">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paged.map(product => {
                      const batches = productBatches[product.id] || [];
                      const isExpanded = expandedId === product.id;
                      const st = getStockStatus(product.stockQuantity || 0, product.minStock);
                      const StatusIcon = st.icon;
                      return (
                        <React.Fragment key={product.id}>
                          <tr className={`hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-indigo-50/50' : ''}`}>
                            <td className="px-4 py-3">
                              <button onClick={() => setExpandedId(isExpanded ? null : product.id)}
                                className="p-1 rounded-lg hover:bg-slate-200 transition">
                                {isExpanded ? <ChevronUp size={16} className="text-indigo-600" /> : <ChevronDown size={16} className="text-slate-400" />}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0 overflow-hidden">
                                  {product.imageUrl ? <img src={product.imageUrl} alt="" className="w-full h-full object-cover" /> : <Box size={14} />}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                                  <p className="text-xs text-slate-400 truncate">{product.unit || ''}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3"><span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">{product.sku || '—'}</span></td>
                            <td className="px-4 py-3 text-xs text-slate-600">{product.categoryName || '—'}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="font-bold text-slate-900">{Number(product.stockQuantity || 0).toLocaleString('vi-VN')}</span>
                              {product.minStock > 0 && <span className="text-xs text-slate-400 ml-1">/ {product.minStock}</span>}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>
                                <StatusIcon size={12} />{st.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-xs font-medium text-slate-600">{batches.length} lô</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button onClick={() => navigate(`/inventory/purchase-orders/create?productId=${product.id}`)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition" title="Tạo phiếu nhập">
                                <Package size={16} />
                              </button>
                            </td>
                          </tr>
                          {/* Batch detail row */}
                          {isExpanded && (
                            <tr key={`batch-${product.id}`}>
                              <td colSpan={8} className="bg-slate-50/80 px-6 py-4 border-b border-slate-200">
                                <div className="pl-6">
                                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <Layers size={14} /> Chi tiết lô hàng ({batches.length})
                                  </p>
                                  {batches.length === 0 ? (
                                    <p className="text-xs text-slate-400">Chưa có lô hàng nào</p>
                                  ) : (
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-xs">
                                        <thead>
                                          <tr className="border-b border-slate-200">
                                            <th className="text-left px-3 py-2 font-semibold text-slate-500">Mã lô</th>
                                            <th className="text-center px-3 py-2 font-semibold text-slate-500">Số lượng</th>
                                            <th className="text-center px-3 py-2 font-semibold text-slate-500">Ngày nhập</th>
                                            <th className="text-center px-3 py-2 font-semibold text-slate-500">Hạn sử dụng</th>
                                            <th className="text-center px-3 py-2 font-semibold text-slate-500">Trạng thái</th>
                                            <th className="text-right px-3 py-2 font-semibold text-slate-500">Giá vốn</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                          {batches.map(b => {
                                            const bst = getBatchStatus(b.expiry_date || b.expiryDate);
                                            const BIcon = bst.icon;
                                            return (
                                              <tr key={b.id || b.batch_code} className="hover:bg-white/60 transition">
                                                <td className="px-3 py-2.5">
                                                  <span className="font-mono font-medium text-slate-700">{b.batch_code || '—'}</span>
                                                </td>
                                                <td className="px-3 py-2.5 text-center font-semibold text-slate-900">
                                                  {Number(b.quantity || 0).toLocaleString('vi-VN')}
                                                </td>
                                                <td className="px-3 py-2.5 text-center text-slate-500">
                                                  <span className="inline-flex items-center gap-1"><CalendarDays size={11} />{formatDate(b.received_date || b.receivedDate)}</span>
                                                </td>
                                                <td className="px-3 py-2.5 text-center text-slate-500">
                                                  {formatDate(b.expiry_date || b.expiryDate)}
                                                </td>
                                                <td className="px-3 py-2.5 text-center">
                                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${bst.color}`}>
                                                    <BIcon size={10} />{bst.label}
                                                  </span>
                                                </td>
                                                <td className="px-3 py-2.5 text-right font-medium text-slate-700">
                                                  {formatCurrency(b.cost_price || b.costPrice)}
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50">
                <p className="text-xs text-slate-500">Hiển thị {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length} SP</p>
                <div className="flex items-center gap-1">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                    className="p-1.5 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeft size={16} /></button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition ${p === page ? 'bg-indigo-600 text-white' : 'border border-slate-300 hover:bg-white text-slate-600'}`}>{p}</button>
                  ))}
                  <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)}
                    className="p-1.5 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"><ChevronRight size={16} /></button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
