import React, { useEffect, useMemo, useState } from 'react';
import { Check, XCircle, RefreshCw, CalendarX2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { shiftTicketService } from '../../services/shiftTicketService';
import { useAuth } from '../../context/AuthContext';

const ShiftLeaveTicketsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const roleName = String(user?.role?.name || user?.role || '').toUpperCase();
    const isManagerOrAdmin = roleName === 'MANAGER' || roleName === 'ROLE_MANAGER' || roleName === 'ADMIN' || roleName === 'ROLE_ADMIN';
    const currentUserId = Number(user?.id || user?.userId || 0);

    useEffect(() => {
        if (!currentUserId) {
            return;
        }
        loadData();
    }, [currentUserId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const ticketData = await shiftTicketService.getShiftTickets();

            const allTickets = Array.isArray(ticketData) ? ticketData : [];
            const leaveTickets = allTickets.filter((ticket) => {
                const title = String(ticket?.title || '').toLowerCase();
                return title.includes('nghỉ ca') || title.includes('xin nghỉ');
            });

            setTickets(leaveTickets);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải ticket xin nghỉ ca.');
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };

    const visibleTickets = useMemo(() => {
        return tickets.filter((ticket) => {
            if (isManagerOrAdmin) {
                return true;
            }
            return Number(ticket?.createdByUserId || ticket?.requesterUserId || 0) === currentUserId;
        });
    }, [tickets, isManagerOrAdmin, currentUserId]);

    const handleProcessLeaveTicket = (ticket) => {
        navigate('/hr/shifts', {
            state: {
                ticketContext: {
                    ticketId: ticket.id,
                    ticketCode: ticket.ticketCode,
                    assignmentId: ticket.relatedEntityId,
                    requesterUserId: ticket.createdByUserId || ticket.requesterUserId || null,
                },
            },
        });
    };

    const handleRejectLeaveTicket = async (ticketId) => {
        try {
            await shiftTicketService.rejectTicket(ticketId, 'Từ chối yêu cầu nghỉ ca');
            await loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể từ chối yêu cầu nghỉ ca.');
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                        <CalendarX2 size={24} className="text-indigo-600" />
                        Ticket yêu cầu nghỉ ca
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Manager bấm V để vào trang chỉnh ca xử lý, bấm X để từ chối nhanh.</p>
                </div>
                <button
                    type="button"
                    onClick={loadData}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
                >
                    <RefreshCw size={16} /> Tải lại
                </button>
            </div>

            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
            )}

            {loading ? (
                <div className="text-slate-500">Đang tải ticket xin nghỉ ca...</div>
            ) : visibleTickets.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Chưa có ticket nghỉ ca phù hợp.</div>
            ) : (
                <div className="space-y-3">
                    {visibleTickets.map((ticket) => (
                        <div key={ticket.id} className="rounded-xl border border-slate-200 bg-white p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">{ticket.title || 'Yêu cầu nghỉ ca'}</p>
                                    <p className="text-xs text-slate-500 mt-1">{ticket.ticketCode} • {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('vi-VN') : '-'}</p>
                                    <p className="text-sm text-slate-700 mt-2">{ticket.description || 'Không có mô tả'}</p>
                                </div>
                                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{ticket.status || 'OPEN'}</span>
                            </div>

                            {isManagerOrAdmin && String(ticket.status || '').toUpperCase() === 'OPEN' && (
                                <div className="mt-3 flex gap-2 border-t border-slate-200 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => handleProcessLeaveTicket(ticket)}
                                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                                    >
                                        <Check size={14} /> V
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRejectLeaveTicket(ticket.id)}
                                        className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700"
                                    >
                                        <XCircle size={14} /> X
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ShiftLeaveTicketsPage;
