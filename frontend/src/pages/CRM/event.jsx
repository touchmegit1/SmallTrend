import React, { useState } from 'react';
import eventService from '../../services/eventService';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useVouchers } from '../../hooks/useVouchers';
import { useProductVariants } from '../../hooks/useProductVariants';

// ─── ICONS ────────────────────────────────────────────────────────────────────
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const IconDelete = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>;
const IconPin = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="17" x2="12" y2="22" /><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" /></svg>;
const IconUnpin = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="2" y1="2" x2="22" y2="22" /><line x1="12" y1="17" x2="12" y2="22" /><path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h12" /><path d="M15 9.34V6h1a2 2 0 0 0 0-4H7.89" /></svg>;
const IconSearch = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const IconApply = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>;
const IconRemove = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;

// ─── STATUS BADGE ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    ACTIVE: 'bg-green-100 text-green-700',
    DRAFT: 'bg-gray-100 text-gray-600',
    COMPLETED: 'bg-blue-100 text-blue-700',
    CANCELLED: 'bg-red-100 text-red-600',
    EXPIRED: 'bg-orange-100 text-orange-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
};

// ─── VOUCHER TYPE LABEL ─────────────────────────────────────────────────────────
const voucherTypeLabel = (type) => ({
  PERCENTAGE: 'Giảm %',
  FIXED_AMOUNT: 'Giảm tiền cố định',
  FREE_SHIPPING: 'Miễn phí vận chuyển',
  BUY_X_GET_Y: 'Mua X tặng Y',
}[type] || type);

const voucherTypeBadge = (type) => ({
  PERCENTAGE: 'bg-purple-100 text-purple-700',
  FIXED_AMOUNT: 'bg-blue-100 text-blue-700',
  FREE_SHIPPING: 'bg-teal-100 text-teal-700',
  BUY_X_GET_Y: 'bg-orange-100 text-orange-700',
}[type] || 'bg-gray-100 text-gray-600');

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
const EventManagement = () => {
  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns' | 'vouchers' | 'products'

  // ── Campaigns ──
  const { campaigns, loading: loadingCampaigns, refetch: refetchCampaigns } = useCampaigns();
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const initialCampaignForm = {
    campaignCode: '', campaignName: '', campaignType: 'PROMOTION', description: '',
    bannerImageUrl: '', startDate: '', endDate: '', status: 'DRAFT',
    budget: '', minPurchaseAmount: '', isPublic: true,
  };
  const [campaignForm, setCampaignForm] = useState(initialCampaignForm);
  const [savingCampaign, setSavingCampaign] = useState(false);

  // ── Vouchers ──
  const { vouchers, loading: loadingVouchers, refetch: refetchVouchers } = useVouchers();
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const initialVoucherForm = {
    voucherCode: '', voucherName: '', description: '', voucherType: 'PERCENTAGE',
    discountPercent: '', discountAmount: '', maxDiscountAmount: '',
    minPurchaseAmount: '', startDate: '', endDate: '',
    totalUsageLimit: '', usagePerCustomer: '', campaignId: '', status: 'DRAFT',
  };
  const [voucherForm, setVoucherForm] = useState(initialVoucherForm);
  const [savingVoucher, setSavingVoucher] = useState(false);

  // ── Products tab ──
  const { variants, loading: loadingVariants, refetch: refetchVariants } = useProductVariants();
  const [variantSearch, setVariantSearch] = useState('');
  const [savingVariant, setSavingVariant] = useState(null); // sku đang được lưu

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const filteredVariants = variants.filter(v => {
    const kw = variantSearch.toLowerCase().trim();
    if (!kw) return true;
    return v.name?.toLowerCase().includes(kw) || v.sku?.toLowerCase().includes(kw);
  });

  const activeVouchers = vouchers.filter(c => c.status === 'ACTIVE');

  // ── Campaign handlers ─────────────────────────────────────────────────────────
  const openCampaignModal = (campaign = null) => {
    if (campaign) {
      setCampaignForm({
        ...initialCampaignForm,
        ...campaign,
        startDate: campaign.startDate || '',
        endDate: campaign.endDate || '',
        budget: campaign.budget ?? '',
        minPurchaseAmount: campaign.minPurchaseAmount ?? '',
      });
      setEditingCampaign(campaign.id);
    } else {
      setCampaignForm(initialCampaignForm);
      setEditingCampaign(null);
    }
    setIsCampaignModalOpen(true);
  };

  const handleCampaignSubmit = async (e) => {
    e.preventDefault();
    setSavingCampaign(true);
    try {
      const payload = {
        ...campaignForm,
        budget: campaignForm.budget ? Number(campaignForm.budget) : null,
        minPurchaseAmount: campaignForm.minPurchaseAmount ? Number(campaignForm.minPurchaseAmount) : null,
      };
      if (editingCampaign) {
        await eventService.updateCampaign(editingCampaign, payload);
      } else {
        await eventService.createCampaign(payload);
      }
      setIsCampaignModalOpen(false);
      await refetchCampaigns();
    } catch (err) {
      alert('Lỗi: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSavingCampaign(false);
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm('Xóa sự kiện này?')) return;
    try {
      await eventService.deleteCampaign(id);
      await refetchCampaigns();
    } catch (err) {
      alert('Lỗi khi xóa: ' + (err?.response?.data?.message || err.message));
    }
  };

  // ── Voucher handlers ───────────────────────────────────────────────────────────
  const openVoucherModal = (voucher = null) => {
    if (voucher) {
      setVoucherForm({
        ...initialVoucherForm,
        ...voucher,
        discountPercent: voucher.discountPercent ?? '',
        discountAmount: voucher.discountAmount ?? '',
        maxDiscountAmount: voucher.maxDiscountAmount ?? '',
        minPurchaseAmount: voucher.minPurchaseAmount ?? '',
        totalUsageLimit: voucher.totalUsageLimit ?? '',
        usagePerCustomer: voucher.usagePerCustomer ?? '',
        campaignId: voucher.campaignId ?? '',
        startDate: voucher.startDate || '',
        endDate: voucher.endDate || '',
      });
      setEditingVoucher(voucher.id);
    } else {
      setVoucherForm(initialVoucherForm);
      setEditingVoucher(null);
    }
    setIsVoucherModalOpen(true);
  };

  const handleVoucherSubmit = async (e) => {
    e.preventDefault();
    setSavingVoucher(true);
    try {
      const payload = {
        ...voucherForm,
        discountPercent: voucherForm.discountPercent ? Number(voucherForm.discountPercent) : null,
        discountAmount: voucherForm.discountAmount ? Number(voucherForm.discountAmount) : null,
        maxDiscountAmount: voucherForm.maxDiscountAmount ? Number(voucherForm.maxDiscountAmount) : null,
        minPurchaseAmount: voucherForm.minPurchaseAmount ? Number(voucherForm.minPurchaseAmount) : null,
        totalUsageLimit: voucherForm.totalUsageLimit ? Number(voucherForm.totalUsageLimit) : null,
        usagePerCustomer: voucherForm.usagePerCustomer ? Number(voucherForm.usagePerCustomer) : null,
        campaignId: voucherForm.campaignId ? Number(voucherForm.campaignId) : null,
      };
      if (editingVoucher) {
        await eventService.updateVoucher(editingVoucher, payload);
      } else {
        await eventService.createVoucher(payload);
      }
      setIsVoucherModalOpen(false);
      await refetchVouchers();
    } catch (err) {
      alert('Lỗi: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSavingVoucher(false);
    }
  };

  const handleDeleteVoucher = async (id) => {
    if (!window.confirm('Xóa voucher này?')) return;
    try {
      await eventService.deleteVoucher(id);
      await refetchVouchers();
    } catch (err) {
      alert('Lỗi khi xóa: ' + (err?.response?.data?.message || err.message));
    }
  };

  // ── Product voucher apply ───────────────────────────────────────────────────────
  const handleApplyVoucher = async (sku, voucherId) => {
    setSavingVariant(sku);
    try {
      if (voucherId) {
        await eventService.applyVoucherToVariant(sku, voucherId);
      } else {
        await eventService.removeVoucherFromVariant(sku);
      }
      await refetchVariants(); // Sync lại từ DB
    } catch (err) {
      alert('Lỗi áp dụng voucher: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSavingVariant(null);
    }
  };

  // ─── TABS ──────────────────────────────────────────────────────────────────────
  const tabs = [
    { key: 'campaigns', label: 'Sự kiện / Chiến dịch' },
    { key: 'vouchers', label: 'Voucher' },
    { key: 'products', label: 'Áp dụng theo Sản phẩm' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Sự kiện &amp; Khuyến Mãi</h1>
          <p className="text-slate-500 mt-1">Quản lý chính sách khuyến mãi, sự kiện và voucher.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'campaigns' && (
            <button onClick={() => openCampaignModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-lg shadow-indigo-600/30 transition-all text-sm font-medium">
              + Thêm Sự kiện
            </button>
          )}
          {activeTab === 'vouchers' && (
            <button onClick={() => openVoucherModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-lg shadow-indigo-600/30 transition-all text-sm font-medium">
              + Thêm Voucher
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 font-medium text-sm transition-colors border-b-2 ${activeTab === tab.key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ TAB 1: CAMPAIGNS / SỰ KIỆN ═══ */}
      {activeTab === 'campaigns' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {loadingCampaigns ? (
            <div className="text-center py-12 text-slate-400">Đang tải...</div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-2">🎯</div>
              <p>Chưa có sự kiện nào. Tạo sự kiện đầu tiên!</p>
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600">Mã / Tên Sự kiện</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600">Loại</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600">Thời gian</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600">Trạng thái</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600">Ngân sách</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-600">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {c.bannerImageUrl ? (
                          <img src={c.bannerImageUrl} alt={c.campaignName} className="w-10 h-10 object-cover rounded border flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 bg-blue-50 rounded border flex items-center justify-center text-blue-300 text-lg flex-shrink-0">🎯</div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-800">{c.campaignName}</div>
                          <div className="text-xs text-gray-400 font-mono">{c.campaignCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">{c.campaignType || '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      <div>{c.startDate} →</div>
                      <div>{c.endDate}</div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-gray-700">
                      {c.budget ? Number(c.budget).toLocaleString('vi-VN') + 'đ' : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openCampaignModal(c)}
                          title="Sửa"
                          className="p-1.5 rounded text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          <IconEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(c.id)}
                          title="Xóa"
                          className="p-1.5 rounded text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                        >
                          <IconDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ═══ TAB 2: VOUCHERS ═══ */}
      {activeTab === 'vouchers' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loadingVouchers ? (
            <div className="text-center py-12 text-gray-500">Đang tải...</div>
          ) : vouchers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">🎟️</div>
              <p>Chưa có voucher nào. Tạo voucher đầu tiên!</p>
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Mã Voucher</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Tên / Mô tả</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Loại</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Giá trị giảm</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Thời hạn</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Đã dùng / Tối đa</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Trạng thái</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map(c => (
                  <tr key={c.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">{c.voucherCode}</span>
                      {c.campaignName && (
                        <div className="text-xs text-gray-400 mt-0.5">📌 {c.campaignName}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{c.voucherName}</div>
                      {c.description && <div className="text-xs text-gray-400 truncate max-w-[160px]">{c.description}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${voucherTypeBadge(c.voucherType)}`}>
                        {voucherTypeLabel(c.voucherType)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-red-500">
                      {c.voucherType === 'PERCENTAGE' && c.discountPercent != null
                        ? `-${c.discountPercent}%`
                        : c.voucherType === 'FIXED_AMOUNT' && c.discountAmount != null
                          ? `-${Number(c.discountAmount).toLocaleString('vi-VN')}đ`
                          : c.voucherType === 'FREE_SHIPPING'
                            ? 'Miễn phí ship'
                            : '-'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      <div>{c.startDate || '-'}</div>
                      <div>→ {c.endDate || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      <span className="font-semibold">{c.currentUsageCount ?? 0}</span>
                      <span className="text-gray-400"> / {c.totalUsageLimit ?? '∞'}</span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openVoucherModal(c)}
                          title="Sửa"
                          className="p-1.5 rounded text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          <IconEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteVoucher(c.id)}
                          title="Xóa"
                          className="p-1.5 rounded text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                        >
                          <IconDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ═══ TAB 3: ÁP DỤNG THEO SẢN PHẨM ═══ */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {/* Search bar */}
          <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IconSearch /></span>
              <input
                type="text"
                placeholder="Tìm sản phẩm theo tên hoặc SKU..."
                value={variantSearch}
                onChange={e => setVariantSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <span className="text-sm text-gray-500">{filteredVariants.length} sản phẩm</span>
          </div>

          {loadingVariants ? (
            <div className="text-center py-12 text-gray-500">Đang tải sản phẩm...</div>
          ) : filteredVariants.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">📦</div>
              <p>Không tìm thấy sản phẩm nào.</p>
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">SKU</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Tên sản phẩm</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Giá bán</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600" style={{ minWidth: 200 }}>
                    Áp dụng Voucher
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredVariants.map(v => {
                  const isSaving = savingVariant === v.sku;
                  return (
                    <tr key={v.sku} className={`border-t hover:bg-gray-50 ${isSaving ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {v.imageUrl ? (
                            <img src={v.imageUrl} alt={v.name} className="w-10 h-10 object-cover rounded border flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center text-gray-300 flex-shrink-0">📦</div>
                          )}
                          <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{v.sku}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{v.name}</td>
                      <td className="px-4 py-3">
                        {v.voucherId && v.discountedPrice != null ? (
                          <div>
                            <span className="line-through text-gray-400 text-xs mr-1">
                              {Number(v.sellPrice).toLocaleString('vi-VN')}đ
                            </span>
                            <span className="font-bold text-red-500">
                              {Number(v.discountedPrice).toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-gray-700">
                            {v.sellPrice ? Number(v.sellPrice).toLocaleString('vi-VN') + 'đ' : '-'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={v.voucherId || ''}
                          disabled={isSaving}
                          onChange={e => handleApplyVoucher(v.sku, e.target.value ? Number(e.target.value) : null)}
                          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full disabled:bg-gray-100"
                        >
                          <option value="">-- Không áp dụng --</option>
                          {activeVouchers.map(c => (
                            <option key={c.id} value={c.id}>
                              [{c.voucherCode}] {c.voucherName}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {isSaving ? (
                            <span className="text-xs text-blue-500 animate-pulse">Đang lưu...</span>
                          ) : v.voucherId ? (
                            <>
                              <span className="text-xs text-green-600 font-medium mr-1 bg-green-50 px-2 py-0.5 rounded">
                                {v.voucherType === 'PERCENTAGE' ? `-${v.discountPercent}%` : ''}
                                {v.voucherType === 'FIXED_AMOUNT' ? `-${Number(v.discountAmount).toLocaleString('vi-VN')}đ` : ''}
                                {v.voucherType === 'FREE_SHIPPING' ? 'Free ship' : ''}
                              </span>
                              <button
                                onClick={() => handleApplyVoucher(v.sku, null)}
                                title="Bỏ áp dụng"
                                className="p-1.5 rounded text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <IconRemove />
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Chưa áp dụng</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}


      {/* ═══ MODAL: CAMPAIGN ═══ */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">
                {editingCampaign ? '✏️ Chỉnh sửa Sự kiện' : '➕ Thêm Sự kiện mới'}
              </h2>
              <button onClick={() => setIsCampaignModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleCampaignSubmit} className="p-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Mã chiến dịch *</label>
                <input type="text" required value={campaignForm.campaignCode} onChange={e => setCampaignForm({ ...campaignForm, campaignCode: e.target.value })}
                  disabled={!!editingCampaign}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tên sự kiện *</label>
                <input type="text" required value={campaignForm.campaignName} onChange={e => setCampaignForm({ ...campaignForm, campaignName: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Loại</label>
                <select value={campaignForm.campaignType} onChange={e => setCampaignForm({ ...campaignForm, campaignType: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="PROMOTION">PROMOTION</option>
                  <option value="EVENT">EVENT</option>
                  <option value="FLASH_SALE">FLASH_SALE</option>
                  <option value="SEASONAL">SEASONAL</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Trạng thái</label>
                <select value={campaignForm.status} onChange={e => setCampaignForm({ ...campaignForm, status: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="DRAFT">DRAFT</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày bắt đầu *</label>
                <input type="date" required value={campaignForm.startDate} onChange={e => setCampaignForm({ ...campaignForm, startDate: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày kết thúc *</label>
                <input type="date" required value={campaignForm.endDate} onChange={e => setCampaignForm({ ...campaignForm, endDate: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Ngân sách (đ)</label>
                <input type="number" min="0" value={campaignForm.budget} onChange={e => setCampaignForm({ ...campaignForm, budget: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Đơn hàng tối thiểu (đ)</label>
                <input type="number" min="0" value={campaignForm.minPurchaseAmount} onChange={e => setCampaignForm({ ...campaignForm, minPurchaseAmount: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">URL Banner</label>
                <input type="url" value={campaignForm.bannerImageUrl} onChange={e => setCampaignForm({ ...campaignForm, bannerImageUrl: e.target.value })}
                  placeholder="https://..." className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {campaignForm.bannerImageUrl && (
                  <img src={campaignForm.bannerImageUrl} alt="Preview" className="mt-2 h-24 rounded-lg object-cover w-full" onError={e => e.target.style.display = 'none'} />
                )}
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Mô tả</label>
                <textarea rows={2} value={campaignForm.description} onChange={e => setCampaignForm({ ...campaignForm, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="isPublic" checked={campaignForm.isPublic} onChange={e => setCampaignForm({ ...campaignForm, isPublic: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded" />
                <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">Hiển thị công khai</label>
              </div>
              <div className="col-span-2 flex justify-end gap-3 pt-2 border-t">
                <button type="button" onClick={() => setIsCampaignModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 text-sm font-medium">Hủy</button>
                <button type="submit" disabled={savingCampaign}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-75">
                  {savingCampaign ? 'Đang lưu...' : 'Lưu Sự kiện'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ MODAL: VOUCHER ═══ */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">
                {editingVoucher ? '✏️ Chỉnh sửa Voucher' : '➕ Thêm Voucher mới'}
              </h2>
              <button onClick={() => setIsVoucherModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleVoucherSubmit} className="p-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Mã Voucher *</label>
                <input type="text" required value={voucherForm.voucherCode} onChange={e => setVoucherForm({ ...voucherForm, voucherCode: e.target.value })}
                  disabled={!!editingVoucher}
                  placeholder="SUMMER2024" className="w-full border rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tên Voucher *</label>
                <input type="text" required value={voucherForm.voucherName} onChange={e => setVoucherForm({ ...voucherForm, voucherName: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Loại Voucher</label>
                <select value={voucherForm.voucherType} onChange={e => setVoucherForm({ ...voucherForm, voucherType: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="PERCENTAGE">Giảm theo %</option>
                  <option value="FIXED_AMOUNT">Giảm tiền cố định</option>
                  <option value="FREE_SHIPPING">Miễn phí vận chuyển</option>
                  <option value="BUY_X_GET_Y">Mua X tặng Y</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Trạng thái</label>
                <select value={voucherForm.status} onChange={e => setVoucherForm({ ...voucherForm, status: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="DRAFT">DRAFT</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="EXPIRED">EXPIRED</option>
                </select>
              </div>

              {voucherForm.voucherType === 'PERCENTAGE' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Giảm % *</label>
                    <input type="number" min="0" max="100" step="0.01" required value={voucherForm.discountPercent}
                      onChange={e => setVoucherForm({ ...voucherForm, discountPercent: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Giảm tối đa (đ)</label>
                    <input type="number" min="0" value={voucherForm.maxDiscountAmount}
                      onChange={e => setVoucherForm({ ...voucherForm, maxDiscountAmount: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </>
              )}
              {voucherForm.voucherType === 'FIXED_AMOUNT' && (
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Số tiền giảm (đ) *</label>
                  <input type="number" min="0" required value={voucherForm.discountAmount}
                    onChange={e => setVoucherForm({ ...voucherForm, discountAmount: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              )}
              {voucherForm.voucherType === 'BUY_X_GET_Y' && (
                <div className="col-span-2 p-3 bg-orange-50 rounded-lg border border-orange-200 text-sm text-orange-700">
                  ℹ️ Cấu hình Buy X Get Y sẽ được xử lý khi áp dụng vào đơn hàng.
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Đơn hàng tối thiểu (đ)</label>
                <input type="number" min="0" value={voucherForm.minPurchaseAmount}
                  onChange={e => setVoucherForm({ ...voucherForm, minPurchaseAmount: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Thuộc Sự kiện</label>
                <select value={voucherForm.campaignId} onChange={e => setVoucherForm({ ...voucherForm, campaignId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">-- Độc lập --</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.campaignName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày bắt đầu</label>
                <input type="date" value={voucherForm.startDate} onChange={e => setVoucherForm({ ...voucherForm, startDate: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày hết hạn *</label>
                <input type="date" required value={voucherForm.endDate} onChange={e => setVoucherForm({ ...voucherForm, endDate: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tổng lượt dùng tối đa</label>
                <input type="number" min="1" value={voucherForm.totalUsageLimit}
                  onChange={e => setVoucherForm({ ...voucherForm, totalUsageLimit: e.target.value })}
                  placeholder="Để trống = không giới hạn"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Số lần dùng / khách</label>
                <input type="number" min="1" value={voucherForm.usagePerCustomer}
                  onChange={e => setVoucherForm({ ...voucherForm, usagePerCustomer: e.target.value })}
                  placeholder="Để trống = không giới hạn"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Mô tả</label>
                <textarea rows={2} value={voucherForm.description} onChange={e => setVoucherForm({ ...voucherForm, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
              </div>
              <div className="col-span-2 flex justify-end gap-3 pt-2 border-t">
                <button type="button" onClick={() => setIsVoucherModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 text-sm font-medium">Hủy</button>
                <button type="submit" disabled={savingVoucher}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium disabled:opacity-75">
                  {savingVoucher ? 'Đang lưu...' : 'Lưu Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;