import React, { useState, useEffect, useContext } from 'react';
import { X, Check, XCircle, Clock, AlertCircle, FileText, Users } from 'lucide-react';
import { shiftTicketService } from '../../services/shiftTicketService';
import { AuthContext } from '../../context/AuthContext';

const TicketCard = ({ ticket, onApprove, onReject, isManager }) => {
    const getPriorityColor = (priority) => {
        const colors = {
            LOW: 'bg-blue-100 text-blue-800',
            NORMAL: 'bg-gray-100 text-gray-800',
            HIGH: 'bg-orange-100 text-orange-800',
            URGENT: 'bg-red-100 text-red-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    const getStatusColor = (status) => {
        const colors = {
            OPEN: 'bg-yellow-100 text-yellow-800',
            IN_PROGRESS: 'bg-blue-100 text-blue-800',
            RESOLVED: 'bg-green-100 text-green-800',
            CLOSED: 'bg-red-100 text-red-800',
            CANCELLED: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-indigo-500">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-slate-900">{ticket.title}</h3>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                        </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{ticket.description}</p>
                    <div className="text-xs text-slate-500 space-y-1">
                        <div>Ticket Code: <span className="font-mono font-semibold">{ticket.ticketCode}</span></div>
                        <div>Created: {new Date(ticket.createdAt).toLocaleString('vi-VN')}</div>
                        {ticket.createdBy && (
                            <div>From: <span className="font-semibold">{ticket.createdBy.fullName}</span></div>
                        )}
                    </div>
                </div>
            </div>

            {/* Action buttons - only show if ticket is open and user is assigned to it or is manager */}
            {ticket.status === 'OPEN' && (
                <div className="flex gap-2 pt-3 border-t border-slate-200">
                    <button
                        onClick={() => onApprove(ticket.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                    >
                        <Check size={16} /> Approve
                    </button>
                    <button
                        onClick={() => onReject(ticket.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                    >
                        <XCircle size={16} /> Reject
                    </button>
                </div>
            )}

            {ticket.resolution && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Resolution:</p>
                    <p className="text-sm text-slate-700">{ticket.resolution}</p>
                </div>
            )}
        </div>
    );
};

const ShiftTicketCenter = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('pending'); // pending, approved, rejected
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    const isManager = user?.role?.name === 'MANAGER' || user?.role?.name === 'ADMIN';

    useEffect(() => {
        loadTickets();
    }, []);

    useEffect(() => {
        filterTickets();
    }, [tickets, activeTab, search]);

    const loadTickets = async () => {
        try {
            setLoading(true);
            const data = await shiftTicketService.getShiftTickets({ limit: 100 });
            setTickets(Array.isArray(data) ? data : data.content || []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải danh sách tickets');
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };

    const filterTickets = () => {
        let filtered = tickets;

        // Filter by tab (status)
        if (activeTab === 'pending') {
            filtered = filtered.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS');
        } else if (activeTab === 'approved') {
            filtered = filtered.filter(t => t.status === 'RESOLVED');
        } else if (activeTab === 'rejected') {
            filtered = filtered.filter(t => t.status === 'CLOSED' || t.status === 'CANCELLED');
        }

        // Filter by search
        if (search.trim()) {
            const query = search.toLowerCase();
            filtered = filtered.filter(t =>
                t.ticketCode.toLowerCase().includes(query) ||
                t.title.toLowerCase().includes(query) ||
                t.description?.toLowerCase().includes(query)
            );
        }

        setFilteredTickets(filtered);
    };

    const handleApprove = async (ticketId) => {
        try {
            const reason = prompt('Lý do phê duyệt (không bắt buộc):');
            await shiftTicketService.approveTicket(ticketId, reason);
            loadTickets();
            alert('Đã phê duyệt ticket thành công');
        } catch (err) {
            alert('Lỗi: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleReject = async (ticketId) => {
        try {
            const reason = prompt('Lý do từ chối:');
            if (!reason) return;
            await shiftTicketService.rejectTicket(ticketId, reason);
            loadTickets();
            alert('Đã từ chối ticket thành công');
        } catch (err) {
            alert('Lỗi: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <FileText size={32} className="text-indigo-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Shift Ticket Center</h1>
                        <p className="text-slate-600">Quản lý các yêu cầu đổi ca, huỷ ca, và cập nhật lịch Ca</p>
                    </div>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Tìm ticket theo mã hoặc tiêu đề..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 mb-6">
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-4 py-2 font-medium border-b-2 transition ${
                            activeTab === 'pending'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Clock size={18} />
                            Pending ({filteredTickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length})
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('approved')}
                        className={`px-4 py-2 font-medium border-b-2 transition ${
                            activeTab === 'approved'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Check size={18} />
                            Approved ({filteredTickets.filter(t => t.status === 'RESOLVED').length})
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('rejected')}
                        className={`px-4 py-2 font-medium border-b-2 transition ${
                            activeTab === 'rejected'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <XCircle size={18} />
                            Rejected ({filteredTickets.filter(t => t.status === 'CLOSED' || t.status === 'CANCELLED').length})
                        </div>
                    </button>
                </div>
            </div>

            {/* Tickets grid */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : filteredTickets.length === 0 ? (
                <div className="text-center py-12">
                    <AlertCircle size={48} className="mx-auto text-slate-400 mb-3" />
                    <p className="text-slate-600 text-lg font-medium">Không có tickets</p>
                    <p className="text-slate-500">để hiển thị</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredTickets.map(ticket => (
                        <TicketCard
                            key={ticket.id}
                            ticket={ticket}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            isManager={isManager}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ShiftTicketCenter;
