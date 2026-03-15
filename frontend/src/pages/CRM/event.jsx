import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useToast, ToastContainer } from '../../hooks/useToast.jsx';
import eventService from '../../services/eventService';
import cloudinaryUploadService from '../../services/cloudinaryUploadService';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useVouchers } from '../../hooks/useVouchers';
import ConfirmDialog from '../../components/common/ConfirmDialog';

// ─── ICONS ────────────────────────────────────────────────────────────────────
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const IconDelete = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>;
const IconPin = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="17" x2="12" y2="22" /><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" /></svg>;
const IconUnpin = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="2" y1="2" x2="22" y2="22" /><line x1="12" y1="17" x2="12" y2="22" /><path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h12" /><path d="M15 9.34V6h1a2 2 0 0 0 0-4H7.89" /></svg>;
const IconSearch = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;


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
}[type] || type);

const voucherTypeBadge = (type) => ({
  PERCENTAGE: 'bg-purple-100 text-purple-700',
  FIXED_AMOUNT: 'bg-blue-100 text-blue-700',
}[type] || 'bg-gray-100 text-gray-600');

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
const EventManagement = () => {
  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns' | 'vouchers'

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
  const [uploadingCampaignImage, setUploadingCampaignImage] = useState(false);

  // ── Vouchers ──
  const { vouchers, loading: loadingVouchers, refetch: refetchVouchers } = useVouchers();
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const { toasts, showToast, removeToast } = useToast();
  const initialVoucherForm = {
    couponCode: '', couponName: '', description: '', couponType: 'PERCENTAGE',
    discountPercent: '', discountAmount: '', maxDiscountAmount: '',
    minPurchaseAmount: '', startDate: '', endDate: '',
    totalUsageLimit: '', usagePerCustomer: '', campaignId: '', status: 'DRAFT',
  };
  const [voucherForm, setVoucherForm] = useState(initialVoucherForm);
  const [savingVoucher, setSavingVoucher] = useState(false);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null, id: null, label: '' });

  // ── Helpers ──────────────────────────────────────────────────────────────────

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
        showToast('Cập nhật sự kiện thành công');
      } else {
        await eventService.createCampaign(payload);
        showToast('Tạo sự kiện mới thành công');
      }
      setIsCampaignModalOpen(false);
      await refetchCampaigns();
    } catch (err) {
      showToast('Lỗi: ' + (err?.response?.data?.message || err.message), 'error');
    } finally {
      setSavingCampaign(false);
    }
  };

  const handleDeleteCampaign = (id) => {
    setConfirmDialog({ open: true, type: 'campaign', id, label: 'sự kiện' });
  };

  const handleUploadCampaignBanner = async (file) => {
    if (!file) return;
    if (!file.type?.startsWith('image/')) {
      showToast('Vui lòng chọn file ảnh hợp lệ', 'warning');
      return;
    }

    setUploadingCampaignImage(true);
    try {
      const res = await cloudinaryUploadService.uploadImage(file, 'crm/campaigns');
      setCampaignForm((prev) => ({ ...prev, bannerImageUrl: res.url || '' }));
      showToast('Upload banner thành công');
    } catch (err) {
      showToast('Upload ảnh thất bại: ' + (err?.response?.data?.error || err.message), 'error');
    } finally {
      setUploadingCampaignImage(false);
    }
  };

  // ── Voucher handlers ───────────────────────────────────────────────────────────
  const openVoucherModal = (voucher = null) => {
    if (voucher) {
      setVoucherForm({
        ...initialVoucherForm,
        couponCode: voucher.couponCode ?? '',
        couponName: voucher.couponName ?? '',
        couponType: voucher.couponType ?? 'PERCENTAGE',
        description: voucher.description ?? '',
        discountPercent: voucher.discountPercent ?? '',
        discountAmount: voucher.discountAmount ?? '',
        maxDiscountAmount: voucher.maxDiscountAmount ?? '',
        minPurchaseAmount: voucher.minPurchaseAmount ?? '',
        totalUsageLimit: voucher.totalUsageLimit ?? '',
        usagePerCustomer: voucher.usagePerCustomer ?? '',
        campaignId: voucher.campaignId ?? '',
        startDate: voucher.startDate || '',
        endDate: voucher.endDate || '',
        status: voucher.status ?? 'DRAFT',
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
        showToast('Cập nhật voucher thành công');
      } else {
        await eventService.createVoucher(payload);
        showToast('Tạo voucher mới thành công');
      }
      setIsVoucherModalOpen(false);
      await refetchVouchers();
    } catch (err) {
      showToast('Lỗi: ' + (err?.response?.data?.message || err.message), 'error');
    } finally {
      setSavingVoucher(false);
    }
  };

  const handleDeleteVoucher = (id) => {
    setConfirmDialog({ open: true, type: 'voucher', id, label: 'voucher' });
  };

  const executeDelete = async () => {
    const { type, id } = confirmDialog;
    setConfirmDialog({ open: false, type: null, id: null, label: '' });
    try {
      if (type === 'campaign') {
        await eventService.deleteCampaign(id);
        showToast('Xóa sự kiện thành công');
        await refetchCampaigns();
      } else {
        await eventService.deleteVoucher(id);
        showToast('Xóa voucher thành công');
        await refetchVouchers();
      }
    } catch (err) {
      showToast('Lỗi khi xóa: ' + (err?.response?.data?.message || err.message), 'error');
    }
  };



  // ─── TABS ──────────────────────────────────────────────────────────────────────
  const tabs = [
    { key: 'campaigns', label: 'Sự kiện / Chiến dịch' },
    { key: 'vouchers', label: 'Voucher' },
  ];

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ConfirmDialog
        open={confirmDialog.open}
        title={`Xóa ${confirmDialog.label}`}
        message={`Bạn chắc chắn muốn xóa ${confirmDialog.label} này? Thao tác này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        onConfirm={executeDelete}
        onCancel={() => setConfirmDialog({ open: false, type: null, id: null, label: '' })}
      />
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
                        ) : null}
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
                      <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">{c.couponCode}</span>
                      {c.campaignName && (
                        <div className="text-xs text-gray-400 mt-0.5">📌 {c.campaignName}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{c.couponName}</div>
                      {c.description && <div className="text-xs text-gray-400 truncate max-w-[160px]">{c.description}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${voucherTypeBadge(c.couponType)}`}>
                        {voucherTypeLabel(c.couponType)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-red-500">
                      {c.couponType === 'PERCENTAGE' && c.discountPercent != null
                        ? `-${c.discountPercent}%`
                        : c.couponType === 'FIXED_AMOUNT' && c.discountAmount != null
                          ? `-${Number(c.discountAmount).toLocaleString('vi-VN')}đ`
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




      {/* ═══ MODAL: CAMPAIGN ═══ */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                {editingCampaign ? 'Chỉnh sửa Sự kiện' : 'Thêm Sự kiện mới'}
              </h2>
              <button
                onClick={() => setIsCampaignModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCampaignSubmit}>
              <div className="p-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mã chiến dịch *</label>
                  <input type="text" required value={campaignForm.campaignCode}
                    onChange={e => setCampaignForm({ ...campaignForm, campaignCode: e.target.value })}
                    disabled={!!editingCampaign}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tên sự kiện *</label>
                  <input type="text" required value={campaignForm.campaignName}
                    onChange={e => setCampaignForm({ ...campaignForm, campaignName: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Loại</label>
                  <select value={campaignForm.campaignType}
                    onChange={e => setCampaignForm({ ...campaignForm, campaignType: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                    <option value="PROMOTION">PROMOTION</option>
                    <option value="EVENT">EVENT</option>
                    <option value="FLASH_SALE">FLASH_SALE</option>
                    <option value="SEASONAL">SEASONAL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Trạng thái</label>
                  <select value={campaignForm.status}
                    onChange={e => setCampaignForm({ ...campaignForm, status: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                    <option value="DRAFT">DRAFT</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ngày bắt đầu *</label>
                  <input type="date" required value={campaignForm.startDate}
                    onChange={e => setCampaignForm({ ...campaignForm, startDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ngày kết thúc *</label>
                  <input type="date" required value={campaignForm.endDate}
                    onChange={e => setCampaignForm({ ...campaignForm, endDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ngân sách (đ)</label>
                  <input type="number" min="0" value={campaignForm.budget}
                    onChange={e => setCampaignForm({ ...campaignForm, budget: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Đơn hàng tối thiểu (đ)</label>
                  <input type="number" min="0" value={campaignForm.minPurchaseAmount}
                    onChange={e => setCampaignForm({ ...campaignForm, minPurchaseAmount: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Banner sự kiện</label>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-sm font-medium text-slate-700 cursor-pointer whitespace-nowrap transition-colors">
                        {uploadingCampaignImage ? 'Đang up...' : 'Upload ảnh'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingCampaignImage}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            handleUploadCampaignBanner(file);
                            e.target.value = '';
                          }}
                        />
                      </label>
                      {campaignForm.bannerImageUrl && (
                        <button
                          type="button"
                          onClick={() => setCampaignForm({ ...campaignForm, bannerImageUrl: '' })}
                          className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-sm font-medium text-slate-600 transition-colors"
                        >
                          Xóa ảnh
                        </button>
                      )}
                    </div>
                  </div>
                  {campaignForm.bannerImageUrl && (
                    <img src={campaignForm.bannerImageUrl} alt="Preview" className="mt-2 h-24 rounded-lg object-cover w-full border border-slate-200" onError={e => e.target.style.display = 'none'} />
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mô tả</label>
                  <textarea rows={2} value={campaignForm.description}
                    onChange={e => setCampaignForm({ ...campaignForm, description: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none" />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="isPublic" checked={campaignForm.isPublic}
                    onChange={e => setCampaignForm({ ...campaignForm, isPublic: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300" />
                  <label htmlFor="isPublic" className="text-sm font-medium text-slate-700">Hiển thị công khai</label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 p-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsCampaignModalOpen(false)}
                  disabled={savingCampaign}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium py-2.5 rounded-lg transition-colors text-sm">
                  Hủy
                </button>
                <button type="submit" disabled={savingCampaign}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm disabled:bg-indigo-400">
                  {savingCampaign ? 'Đang lưu...' : editingCampaign ? 'Lưu thay đổi' : 'Thêm Sự kiện'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ MODAL: VOUCHER ═══ */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                {editingVoucher ? 'Chỉnh sửa Voucher' : 'Thêm Voucher mới'}
              </h2>
              <button
                onClick={() => setIsVoucherModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleVoucherSubmit}>
              <div className="p-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mã Voucher *</label>
                  <input type="text" required value={voucherForm.couponCode}
                    onChange={e => setVoucherForm({ ...voucherForm, couponCode: e.target.value })}
                    disabled={!!editingVoucher}
                    placeholder="SUMMER2024"
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm uppercase font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tên Voucher *</label>
                  <input type="text" required value={voucherForm.couponName}
                    onChange={e => setVoucherForm({ ...voucherForm, couponName: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Loại Voucher</label>
                  <select value={voucherForm.couponType}
                    onChange={e => setVoucherForm({ ...voucherForm, couponType: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                    <option value="PERCENTAGE">Giảm theo %</option>
                    <option value="FIXED_AMOUNT">Giảm tiền cố định</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Trạng thái</label>
                  <select value={voucherForm.status}
                    onChange={e => setVoucherForm({ ...voucherForm, status: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                    <option value="DRAFT">DRAFT</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="EXPIRED">EXPIRED</option>
                  </select>
                </div>

                {voucherForm.couponType === 'PERCENTAGE' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Giảm % *</label>
                      <input type="number" min="0" max="100" step="0.01" required value={voucherForm.discountPercent}
                        onChange={e => setVoucherForm({ ...voucherForm, discountPercent: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Giảm tối đa (đ)</label>
                      <input type="number" min="0" value={voucherForm.maxDiscountAmount}
                        onChange={e => setVoucherForm({ ...voucherForm, maxDiscountAmount: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                    </div>
                  </>
                )}
                {voucherForm.couponType === 'FIXED_AMOUNT' && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Số tiền giảm (đ) *</label>
                    <input type="number" min="0" required value={voucherForm.discountAmount}
                      onChange={e => setVoucherForm({ ...voucherForm, discountAmount: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Đơn hàng tối thiểu (đ)</label>
                  <input type="number" min="0" value={voucherForm.minPurchaseAmount}
                    onChange={e => setVoucherForm({ ...voucherForm, minPurchaseAmount: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Thuộc Sự kiện</label>
                  <select value={voucherForm.campaignId}
                    onChange={e => setVoucherForm({ ...voucherForm, campaignId: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                    <option value="">-- Độc lập --</option>
                    {campaigns.map(c => (
                      <option key={c.id} value={c.id}>{c.campaignName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ngày bắt đầu</label>
                  <input type="date" value={voucherForm.startDate}
                    onChange={e => setVoucherForm({ ...voucherForm, startDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ngày hết hạn *</label>
                  <input type="date" required value={voucherForm.endDate}
                    onChange={e => setVoucherForm({ ...voucherForm, endDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tổng lượt dùng tối đa</label>
                  <input type="number" min="1" value={voucherForm.totalUsageLimit}
                    onChange={e => setVoucherForm({ ...voucherForm, totalUsageLimit: e.target.value })}
                    placeholder="Để trống = không giới hạn"
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Số lần dùng / khách</label>
                  <input type="number" min="1" value={voucherForm.usagePerCustomer}
                    onChange={e => setVoucherForm({ ...voucherForm, usagePerCustomer: e.target.value })}
                    placeholder="Để trống = không giới hạn"
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mô tả</label>
                  <textarea rows={2} value={voucherForm.description}
                    onChange={e => setVoucherForm({ ...voucherForm, description: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none" />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 p-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsVoucherModalOpen(false)}
                  disabled={savingVoucher}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium py-2.5 rounded-lg transition-colors text-sm">
                  Hủy
                </button>
                <button type="submit" disabled={savingVoucher}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm disabled:bg-indigo-400">
                  {savingVoucher ? 'Đang lưu...' : editingVoucher ? 'Lưu thay đổi' : 'Thêm Voucher'}
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