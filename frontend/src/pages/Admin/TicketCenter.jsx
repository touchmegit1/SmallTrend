import React, { useState, useEffect } from 'react';
import {
  FileText, Plus, Search, Filter, Clock, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, Eye, Pencil, Trash2, X, Tag,
  MessageSquare, CalendarDays, UserCircle, Loader2, AlertCircle,
  AlertTriangle, ArrowUp, ArrowDown, Save, RotateCcw
} from 'lucide-react';
import ticketService from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_ROLES, MANAGER_ROLES, hasAnyRole } from '../../utils/rolePermissions';
import { useToast, ToastContainer } from '../../hooks/useToast';
import ConfirmModal from '../../components/ui/ConfirmModal';

const PAGE_SIZE = 8;

const STATUS_CONFIG = {
  OPEN: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  IN_PROGRESS: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-700', icon: Loader2 },
  RESOLVED: { label: 'Đã giải quyết', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  CLOSED: { label: 'Đã đóng', color: 'bg-gray-100 text-gray-600', icon: XCircle },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: AlertTriangle }
};

const PRIORITY_CONFIG = {
  LOW: { label: 'Thấp', color: 'bg-gray-100 text-gray-600', icon: ArrowDown },
  NORMAL: { label: 'Bình thường', color: 'bg-blue-100 text-blue-700', icon: Clock },
  HIGH: { label: 'Cao', color: 'bg-orange-100 text-orange-700', icon: ArrowUp },
  URGENT: { label: 'Khẩn cấp', color: 'bg-red-100 text-red-700', icon: AlertCircle }
};

const TYPE_CONFIG = {
  ORDER: { label: 'Vấn đề đơn hàng' },
  REFUND: { label: 'Yêu cầu hoàn trả' },
  ISSUE: { label: 'Chất lượng sản phẩm' },
  SUPPLIER: { label: 'Dịch vụ / Thái độ' },
  AI_SUGGESTION: { label: 'Góp ý khác' }
};

const RELATED_ENTITY_TYPES = [
  { value: 'Order', label: 'Đơn hàng' },
  { value: 'Product', label: 'Sản phẩm' }
];

const TicketCenter = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [detailTicket, setDetailTicket] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const { user } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const isAdmin = hasAnyRole(user, ADMIN_ROLES);
  const isManager = hasAnyRole(user, MANAGER_ROLES);
  const canEdit = isAdmin || isManager;
  const canDelete = isAdmin;

  const [form, setForm] = useState({
    ticketType: 'ORDER',
    title: '',
    description: '',
    priority: 'NORMAL',
    status: 'OPEN',
    relatedEntityType: '',
    relatedEntityId: '',
    assignedToUserId: '',
    resolution: ''
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
    if (filterType !== 'ALL' && t.ticketType !== filterType) return false;
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        (t.ticketCode || '').toLowerCase().includes(term) ||
        (t.title || '').toLowerCase().includes(term) ||
        (t.description || '').toLowerCase().includes(term) ||
        (t.createdByName || '').toLowerCase().includes(term)
      );
    }
    return true;
  });

  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length,
    closed: tickets.filter(t => t.status === 'CLOSED').length
  };

  // Reset form
  const resetForm = () => {
    setForm({
      ticketType: 'ORDER',
      title: '',
      description: '',
      priority: 'NORMAL',
      status: 'OPEN',
      relatedEntityType: '',
      relatedEntityId: '',
      assignedToUserId: '',
      resolution: ''
    });
    setEditingTicket(null);
  };

  // Open create
  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  // Open edit
  const openEdit = (ticket) => {
    setEditingTicket(ticket);
    setForm({
      ticketType: ticket.ticketType || 'ORDER',
      title: ticket.title || '',
      description: ticket.description || '',
      priority: ticket.priority || 'NORMAL',
      status: ticket.status || 'OPEN',
      relatedEntityType: ticket.relatedEntityType || '',
      relatedEntityId: ticket.relatedEntityId || '',
      assignedToUserId: ticket.assignedToUserId || '',
      resolution: ticket.resolution || ''
    });
    setShowModal(true);
  };

  // Handle save (create or update)
  const handleSave = async () => {
    try {
      setSaving(true);

      const userStr = localStorage.getItem('user');
      let currentUserId = null;
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          currentUserId = parsed.userId || parsed.id;
        } catch (e) { }
      }

      if (editingTicket) {
        await ticketService.updateTicket(editingTicket.id, {
          title: form.title,
          description: form.description,
          priority: form.priority,
          status: form.status,
          assignedToUserId: form.assignedToUserId || currentUserId,
          resolution: form.resolution
        });
        showToast('Cập nhật ticket thành công!', 'success');
      } else {
        await ticketService.createTicket({
          ticketType: form.ticketType,
          title: form.title,
          description: form.description,
          priority: form.priority,
          status: 'OPEN',
          relatedEntityType: form.relatedEntityType || null,
          relatedEntityId: form.relatedEntityId ? Number(form.relatedEntityId) : null,
          createdById: currentUserId
        });
        showToast('Tạo ticket thành công!', 'success');
      }
      setShowModal(false);
      resetForm();
      setPage(1);
      await fetchTickets();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.message || 'Lỗi không xác định';
      showToast('Lỗi khi lưu ticket: ' + (typeof msg === 'string' ? msg : JSON.stringify(msg)), 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!canDelete) return;
    try {
      await ticketService.deleteTicket(id);
      setShowDeleteConfirm(null);
      showToast('Đã xóa ticket', 'success');
      await fetchTickets();
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi xóa ticket', 'error');
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Status badge
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

  // Priority badge
  const PriorityBadge = ({ priority }) => {
    const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.NORMAL;
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
        <Icon size={11} />
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
            <h1 className="text-2xl font-semibold text-gray-900">Ticket Center</h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý tickets và hỗ trợ khách hàng</p>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { key: 'ALL', label: 'Tổng', value: stats.total, borderActive: 'border-indigo-500 ring-2 ring-indigo-200', bg: 'bg-indigo-100', text: 'text-indigo-600', icon: FileText },
            { key: 'OPEN', label: 'Chờ xử lý', value: stats.open, borderActive: 'border-yellow-500 ring-2 ring-yellow-200', bg: 'bg-yellow-100', text: 'text-yellow-600', icon: Clock },
            { key: 'IN_PROGRESS', label: 'Đang xử lý', value: stats.inProgress, borderActive: 'border-blue-500 ring-2 ring-blue-200', bg: 'bg-blue-100', text: 'text-blue-600', icon: Loader2 },
            { key: 'RESOLVED', label: 'Đã giải quyết', value: stats.resolved, borderActive: 'border-green-500 ring-2 ring-green-200', bg: 'bg-green-100', text: 'text-green-600', icon: CheckCircle2 },
            { key: 'CLOSED', label: 'Đã đóng', value: stats.closed, borderActive: 'border-gray-500 ring-2 ring-gray-200', bg: 'bg-gray-100', text: 'text-gray-600', icon: XCircle }
          ].map(item => (
            <div
              key={item.key}
              onClick={() => { setFilterStatus(item.key); setPage(1); }}
              className={`cursor-pointer bg-white border ${filterStatus === item.key ? item.borderActive : 'border-gray-200'} rounded-xl p-4 hover:shadow-md transition-all`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className={`text-2xl font-bold ${item.text} mt-1`}>{loading ? '—' : item.value}</p>
                </div>
                <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center`}>
                  <item.icon className={item.text} size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Tìm theo mã, tiêu đề, nội dung, người tạo..."
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
                value={filterType}
                onChange={e => { setFilterType(e.target.value); setPage(1); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Tất cả loại</option>
                {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
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
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Mã Ticket</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Loại</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Tiêu đề</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Trạng thái</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Ưu tiên</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Người tạo</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Ngày tạo</th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-600">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paged.map(ticket => (
                      <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {ticket.ticketCode}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                            <Tag size={11} />
                            {TYPE_CONFIG[ticket.ticketType]?.label || ticket.ticketType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 truncate max-w-[240px]">{ticket.title}</p>
                          {ticket.description && (
                            <p className="text-xs text-gray-500 truncate max-w-[240px] mt-0.5">
                              {ticket.description}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={ticket.status} /></td>
                        <td className="px-4 py-3"><PriorityBadge priority={ticket.priority} /></td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {ticket.createdByName || '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {formatDate(ticket.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setDetailTicket(ticket)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Xem chi tiết"
                            >
                              <Eye size={16} />
                            </button>
                            {canEdit && (
                              <button
                                onClick={() => openEdit(ticket)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                title="Sửa ticket"
                              >
                                <Pencil size={16} />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => setShowDeleteConfirm(ticket)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Xóa ticket"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
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
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${p === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-white text-gray-600'}`}
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
          <div className="bg-white w-[560px] max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingTicket ? 'Chỉnh sửa ticket' : 'Tạo ticket mới'}
              </h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[65vh]">
              {/* Ticket Type (create only) */}
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

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                <input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="VD: Sản phẩm bị lỗi, đơn hàng giao chậm..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  placeholder="Mô tả chi tiết vấn đề..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ ưu tiên</label>
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

              {/* Status (edit only) */}
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

              {/* Related entity (create only) */}
              {!editingTicket && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại liên kết</label>
                    <select
                      value={form.relatedEntityType}
                      onChange={e => setForm({ ...form, relatedEntityType: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Chọn --</option>
                      {RELATED_ENTITY_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID liên kết</label>
                    <input
                      type="number"
                      value={form.relatedEntityId}
                      onChange={e => setForm({ ...form, relatedEntityId: e.target.value })}
                      placeholder="VD: 123"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Resolution (edit only) */}
              {editingTicket && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giải pháp / Ghi chú xử lý</label>
                  <textarea
                    value={form.resolution}
                    onChange={e => setForm({ ...form, resolution: e.target.value })}
                    rows={3}
                    placeholder="Ghi nhận giải pháp xử lý..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              )}

              {/* Assignee info (edit only) */}
              {editingTicket && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                        <UserCircle size={12} /> Người tạo
                      </label>
                      <input
                        type="text"
                        disabled
                        value={editingTicket.createdByName || '—'}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                        <UserCircle size={12} /> Người xử lý
                      </label>
                      <input
                        type="text"
                        disabled
                        value={editingTicket.assignedToName || '—'}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  {editingTicket.resolvedByName && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-green-500" /> Người giải quyết
                      </label>
                      <input
                        type="text"
                        disabled
                        value={editingTicket.resolvedByName}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-green-50 text-green-700 cursor-not-allowed"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <RotateCcw size={14} />
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim()}
                className="px-5 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {editingTicket ? 'Lưu thay đổi' : 'Tạo ticket'}
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
              <h3 className="text-lg font-semibold text-gray-900">Chi tiết ticket</h3>
              <button onClick={() => setDetailTicket(null)} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="flex items-center gap-3 flex-wrap">
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
                    <p className="text-sm font-medium">
                      {TYPE_CONFIG[detailTicket.ticketType]?.label || detailTicket.ticketType}
                    </p>
                  </div>
                </div>

                {detailTicket.description && (
                  <div className="flex items-start gap-3">
                    <MessageSquare size={16} className="text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Mô tả</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg mt-1 border border-gray-100">
                        {detailTicket.description}
                      </p>
                    </div>
                  </div>
                )}

                {detailTicket.relatedEntityType && (
                  <div className="flex items-start gap-3">
                    <FileText size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Liên kết</p>
                      <p className="text-sm font-medium">
                        {detailTicket.relatedEntityType} #{detailTicket.relatedEntityId}
                      </p>
                    </div>
                  </div>
                )}

                {detailTicket.resolution && (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Giải pháp</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap bg-green-50 p-3 rounded-lg mt-1 border border-green-100">
                        {detailTicket.resolution}
                      </p>
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
                {canEdit && (
                  <button
                    onClick={() => { setDetailTicket(null); openEdit(detailTicket); }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Pencil size={14} /> Chỉnh sửa
                  </button>
                )}
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
      <ConfirmModal
        isOpen={!!showDeleteConfirm}
        title="Xác nhận xóa"
        message={showDeleteConfirm ? `Bạn có chắc muốn xóa ticket ${showDeleteConfirm.ticketCode}?` : ''}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        onCancel={() => setShowDeleteConfirm(null)}
        onConfirm={() => showDeleteConfirm && handleDelete(showDeleteConfirm.id)}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default TicketCenter;
