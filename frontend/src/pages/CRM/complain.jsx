import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  X,
  Tag,
  MessageSquare,
  CalendarDays,
  UserCircle,
  Loader2,
  AlertCircle,
  CircleDot,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';
import ticketService from '../../services/ticketService';

const PAGE_SIZE = 5;

const STATUS_CONFIG = {
  OPEN: { label: 'Mở', color: 'bg-blue-100 text-blue-700', icon: CircleDot },
  IN_PROGRESS: { label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  RESOLVED: { label: 'Đã giải quyết', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  CLOSED: { label: 'Đã đóng', color: 'bg-gray-100 text-gray-600', icon: XCircle }
};

const PRIORITY_CONFIG = {
  LOW: { label: 'Thấp', color: 'bg-gray-100 text-gray-600', icon: ArrowDownCircle },
  NORMAL: { label: 'Bình thường', color: 'bg-blue-100 text-blue-700', icon: CircleDot },
  HIGH: { label: 'Cao', color: 'bg-orange-100 text-orange-700', icon: ArrowUpCircle },
  URGENT: { label: 'Khẩn cấp', color: 'bg-red-100 text-red-700', icon: AlertTriangle }
};

const TYPE_CONFIG = {
  REFUND: { label: 'Hoàn trả' },
  SHIFT_CHANGE: { label: 'Đổi ca' },
  ISSUE: { label: 'Sự cố' },
  SUPPLIER: { label: 'Nhà cung cấp' },
  ORDER: { label: 'Đơn hàng' },
  AI_SUGGESTION: { label: 'AI Gợi ý' }
};

const RELATED_ENTITY_TYPES = [
  { value: 'WorkShift', label: 'Ca làm việc' },
  { value: 'CashRegister', label: 'Quầy thu ngân' },
  { value: 'Order', label: 'Đơn hàng' },
  { value: 'Product', label: 'Sản phẩm' }
];

export default function CustomerComplaintSystem() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [detailTicket, setDetailTicket] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  // Lookup states
  const [roleIdInput, setRoleIdInput] = useState('');
  const [roleUsers, setRoleUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [skuInput, setSkuInput] = useState('');
  const [skuVariants, setSkuVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loadingVariants, setLoadingVariants] = useState(false);

  const [form, setForm] = useState({
    ticketType: 'REFUND',
    title: '',
    description: '',
    priority: 'NORMAL',
    relatedEntityType: '',
    relatedEntityId: 1,
    assignedToUserId: '',
    status: 'OPEN',
    resolution: '',
    sku: '',
    refundQuantity: 1
  });

  // Fetch tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getAllTickets();
      setTickets(data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách ticket');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Filter & search
  const filtered = tickets.filter(t => {
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    if (filterType !== 'ALL' && t.ticketType !== filterType) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        (t.ticketCode || '').toLowerCase().includes(term) ||
        (t.title || '').toLowerCase().includes(term) ||
        (t.description || '').toLowerCase().includes(term)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length
  };

  // Reset form
  const resetForm = () => {
    setForm({
      ticketType: 'REFUND',
      title: '',
      description: '',
      priority: 'NORMAL',
      relatedEntityType: '',
      relatedEntityId: 1,
      assignedToUserId: '',
      status: 'OPEN',
      resolution: '',
      sku: '',
      refundQuantity: 1
    });
    setEditingTicket(null);
    setRoleIdInput('');
    setRoleUsers([]);
    setSkuInput('');
    setSkuVariants([]);
    setSelectedVariant(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (ticket) => {
    setEditingTicket(ticket);
    setForm({
      ticketType: ticket.ticketType || 'ORDER',
      title: ticket.title || '',
      description: ticket.description || '',
      priority: ticket.priority || 'NORMAL',
      relatedEntityType: ticket.relatedEntityType || '',
      relatedEntityId: ticket.relatedEntityId || '',
      assignedToUserId: ticket.assignedToUserId || '',
      status: ticket.status || 'OPEN',
      resolution: ticket.resolution || '',
      sku: '',
      refundQuantity: 1
    });
    setRoleIdInput('');
    setRoleUsers([]);
    setSkuInput('');
    setSkuVariants([]);
    setSelectedVariant(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editingTicket) {
        await ticketService.updateTicket(editingTicket.id, {
          title: form.title,
          description: form.description,
          priority: form.priority,
          status: form.status,
          assignedToUserId: form.assignedToUserId ? Number(form.assignedToUserId) : null,
          resolution: form.resolution
        });
      } else {
        await ticketService.createTicket({
          ticketType: form.ticketType,
          title: form.title,
          description: form.description,
          priority: form.priority,
          relatedEntityType: form.relatedEntityType || null,
          relatedEntityId: form.relatedEntityId ? Number(form.relatedEntityId) : null,
          assignedToUserId: form.assignedToUserId ? Number(form.assignedToUserId) : null,
          sku: form.sku || null,
          refundQuantity: form.refundQuantity ? Number(form.refundQuantity) : null
        });
      }
      setShowModal(false);
      resetForm();
      setPage(1);
      await fetchTickets();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.response?.data || err?.message || 'Lỗi không xác định';
      alert('Lỗi khi lưu ticket: ' + (typeof msg === 'string' ? msg : JSON.stringify(msg)));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await ticketService.deleteTicket(id);
      setShowDeleteConfirm(null);
      await fetchTickets();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi xóa ticket');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.OPEN;
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
        <Icon size={13} />
        {cfg.label}
      </span>
    );
  };

  const PriorityBadge = ({ priority }) => {
    const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.NORMAL;
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
        <Icon size={13} />
        {cfg.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Quản lý Ticket Khiếu nại
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Theo dõi và xử lý các ticket khiếu nại, yêu cầu
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Tạo ticket mới
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng ticket</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FileText className="text-indigo-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Đang mở</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.open}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CircleDot className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Đang xử lý</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.inProgress}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Đã giải quyết</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.resolved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Tìm theo mã ticket, tiêu đề..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Tất cả trạng thái</option>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
              <select
                value={filterPriority}
                onChange={e => { setFilterPriority(e.target.value); setPage(1); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Tất cả ưu tiên</option>
                {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
              <select
                value={filterType}
                onChange={e => { setFilterType(e.target.value); setPage(1); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Tất cả loại</option>
                {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Ticket Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <span className="ml-3 text-gray-500">Đang tải...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20 text-red-500">
              <AlertCircle size={24} />
              <span className="ml-2">{error}</span>
              <button onClick={fetchTickets} className="ml-4 text-blue-600 underline text-sm">Thử lại</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <FileText size={48} />
              <p className="mt-3 text-sm">Không có ticket nào</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">Mã Ticket</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">Loại</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">Tiêu đề</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">Ưu tiên</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">Trạng thái</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">Ngày tạo</th>
                      <th className="text-center px-5 py-3 font-semibold text-gray-600">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paged.map(ticket => (
                      <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {ticket.ticketCode}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                            <Tag size={12} />
                            {TYPE_CONFIG[ticket.ticketType]?.label || ticket.ticketType}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-900 truncate max-w-[260px]">{ticket.title}</p>
                          {ticket.description && (
                            <p className="text-xs text-gray-500 truncate max-w-[260px] mt-0.5">{ticket.description}</p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <PriorityBadge priority={ticket.priority} />
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={ticket.status} />
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                          {formatDate(ticket.createdAt)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setDetailTicket(ticket)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Xem chi tiết"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => openEdit(ticket)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(ticket)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Xóa"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500">
                  Hiển thị {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length} ticket
                </p>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="p-1.5 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${p === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-white text-gray-600'
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    disabled={page === totalPages || totalPages === 0}
                    onClick={() => setPage(page + 1)}
                    className="p-1.5 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[520px] max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingTicket ? 'Chỉnh sửa Ticket' : 'Tạo Ticket mới'}
              </h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[65vh]">
              {/* Ticket Type (only on create) */}
              {!editingTicket && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại ticket *</label>
                  <select
                    value={form.ticketType}
                    onChange={e => setForm({ ...form, ticketType: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                <input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="VD: Hoàn tiền đơn hàng ORD-2026-001"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Mô tả chi tiết vấn đề..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mức ưu tiên</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </div>

                {editingTicket && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                    <select
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key}>{cfg.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {!editingTicket && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại liên kết</label>
                    <select
                      value={form.relatedEntityType}
                      onChange={e => setForm({ ...form, relatedEntityType: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Chọn loại --</option>
                      {RELATED_ENTITY_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Assign user by Role ID lookup */}
              {!editingTicket && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhập Role ID để chọn người xử lý</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={roleIdInput}
                      onChange={e => setRoleIdInput(e.target.value)}
                      placeholder="VD: 1, 2, 3..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!roleIdInput) return;
                        try {
                          setLoadingUsers(true);
                          const users = await ticketService.getUsersByRole(roleIdInput);
                          setRoleUsers(users);
                        } catch (err) {
                          console.error(err);
                          setRoleUsers([]);
                        } finally {
                          setLoadingUsers(false);
                        }
                      }}
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      {loadingUsers ? 'Đang tải...' : 'Tìm'}
                    </button>
                  </div>
                  {roleUsers.length > 0 && (
                    <div className="mt-2 border border-gray-200 rounded-lg max-h-[150px] overflow-y-auto">
                      {roleUsers.map(u => (
                        <div
                          key={u.id}
                          onClick={() => setForm({ ...form, assignedToUserId: u.id })}
                          className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm transition-colors ${form.assignedToUserId === u.id ? 'bg-blue-50 border-l-2 border-blue-600' : ''
                            }`}
                        >
                          <div>
                            <p className="font-medium text-gray-900">{u.fullName}</p>
                            <p className="text-xs text-gray-500">{u.username} • {u.roleName}</p>
                          </div>
                          {form.assignedToUserId === u.id && (
                            <CheckCircle2 size={16} className="text-blue-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {form.assignedToUserId && (
                    <p className="mt-1 text-xs text-green-600">Đã chọn User ID: {form.assignedToUserId}</p>
                  )}
                </div>
              )}

              {/* Refund-specific fields */}
              {!editingTicket && form.ticketType === 'REFUND' && (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs text-green-700 font-medium flex items-center gap-1.5">
                      <CheckCircle2 size={14} />
                      Ticket hoàn trả sẽ tự động xử lý: sản phẩm được nhập kho lại và ticket được đánh dấu đã giải quyết.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nhập SKU sản phẩm *</label>
                    <div className="flex gap-2">
                      <input
                        value={skuInput}
                        onChange={e => setSkuInput(e.target.value)}
                        placeholder="VD: SP001, SKU-TNGD..."
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!skuInput.trim()) return;
                          try {
                            setLoadingVariants(true);
                            const variants = await ticketService.getVariantBySku(skuInput.trim());
                            setSkuVariants(variants);
                            if (variants.length === 1) {
                              setSelectedVariant(variants[0]);
                              setForm({ ...form, sku: variants[0].sku });
                            }
                          } catch (err) {
                            console.error(err);
                            setSkuVariants([]);
                          } finally {
                            setLoadingVariants(false);
                          }
                        }}
                        className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                      >
                        {loadingVariants ? 'Đang tải...' : 'Tìm SKU'}
                      </button>
                    </div>
                    {skuVariants.length > 0 && (
                      <div className="mt-2 border border-gray-200 rounded-lg max-h-[180px] overflow-y-auto">
                        {skuVariants.map(v => (
                          <div
                            key={v.id}
                            onClick={() => {
                              setSelectedVariant(v);
                              setForm({ ...form, sku: v.sku });
                            }}
                            className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm transition-colors ${selectedVariant?.id === v.id ? 'bg-blue-50 border-l-2 border-blue-600' : ''
                              }`}
                          >
                            <div>
                              <p className="font-medium text-gray-900">{v.productName}</p>
                              <p className="text-xs text-gray-500">
                                SKU: {v.sku} • Giá: {v.sellPrice?.toLocaleString('vi-VN')}đ • Tồn kho: <b>{v.totalStock}</b>
                              </p>
                            </div>
                            {selectedVariant?.id === v.id && (
                              <CheckCircle2 size={16} className="text-blue-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {skuVariants.length === 0 && skuInput && !loadingVariants && (
                      <p className="mt-1 text-xs text-gray-400">Nhấn "Tìm SKU" để tra cứu sản phẩm</p>
                    )}
                    {selectedVariant && (
                      <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                        <p className="text-xs text-blue-700">
                          Đã chọn: <b>{selectedVariant.productName}</b> (SKU: {selectedVariant.sku}) — Tồn kho hiện tại: <b>{selectedVariant.totalStock}</b>
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng hoàn *</label>
                    <input
                      type="number"
                      min="1"
                      value={form.refundQuantity}
                      onChange={e => setForm({ ...form, refundQuantity: e.target.value })}
                      placeholder="VD: 1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {editingTicket && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giải pháp</label>
                  <textarea
                    value={form.resolution}
                    onChange={e => setForm({ ...form, resolution: e.target.value })}
                    rows={2}
                    placeholder="Ghi nhận giải pháp xử lý..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim()}
                className="px-5 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editingTicket ? 'Cập nhật' : 'Tạo ticket'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {detailTicket && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50">
          <div className="bg-white w-[480px] h-full shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">Chi tiết Ticket</h3>
              <button onClick={() => setDetailTicket(null)} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">
                  {detailTicket.ticketCode}
                </span>
                <StatusBadge status={detailTicket.status} />
                <PriorityBadge priority={detailTicket.priority} />
              </div>

              <div>
                <h4 className="text-xl font-semibold text-gray-900">{detailTicket.title}</h4>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Tag size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Loại</p>
                    <p className="text-sm font-medium">{TYPE_CONFIG[detailTicket.ticketType]?.label || detailTicket.ticketType}</p>
                  </div>
                </div>

                {detailTicket.description && (
                  <div className="flex items-start gap-3">
                    <MessageSquare size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Mô tả</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{detailTicket.description}</p>
                    </div>
                  </div>
                )}

                {detailTicket.relatedEntityType && (
                  <div className="flex items-start gap-3">
                    <FileText size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Liên kết</p>
                      <p className="text-sm font-medium">{detailTicket.relatedEntityType} #{detailTicket.relatedEntityId}</p>
                    </div>
                  </div>
                )}

                <hr className="border-gray-100" />

                <div className="flex items-start gap-3">
                  <UserCircle size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Người tạo</p>
                    <p className="text-sm font-medium">{detailTicket.createdByName || '—'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <UserCircle size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Người xử lý</p>
                    <p className="text-sm font-medium">{detailTicket.assignedToName || '—'}</p>
                  </div>
                </div>

                {detailTicket.resolvedByName && (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Người giải quyết</p>
                      <p className="text-sm font-medium">{detailTicket.resolvedByName}</p>
                    </div>
                  </div>
                )}

                {detailTicket.resolution && (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Giải pháp</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{detailTicket.resolution}</p>
                    </div>
                  </div>
                )}

                <hr className="border-gray-100" />

                <div className="flex items-start gap-3">
                  <CalendarDays size={16} className="text-gray-400 mt-0.5" />
                  <div className="space-y-1">
                    <div>
                      <p className="text-xs text-gray-500">Ngày tạo</p>
                      <p className="text-sm">{formatDate(detailTicket.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Cập nhật lần cuối</p>
                      <p className="text-sm">{formatDate(detailTicket.updatedAt)}</p>
                    </div>
                    {detailTicket.resolvedAt && (
                      <div>
                        <p className="text-xs text-gray-500">Ngày giải quyết</p>
                        <p className="text-sm">{formatDate(detailTicket.resolvedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { setDetailTicket(null); openEdit(detailTicket); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Pencil size={14} /> Chỉnh sửa
                </button>
                <button
                  onClick={() => setDetailTicket(null)}
                  className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[400px] rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Xác nhận xóa</h4>
                <p className="text-sm text-gray-500">Bạn có chắc muốn xóa ticket <b>{showDeleteConfirm.ticketCode}</b>?</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm.id)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Xóa ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
