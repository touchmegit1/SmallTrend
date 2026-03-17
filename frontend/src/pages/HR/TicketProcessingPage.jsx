import React, { useEffect, useMemo, useState } from 'react';
import { Check, XCircle, RefreshCw, Layers } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { shiftTicketService } from '../../services/shiftTicketService';
import { shiftService } from '../../services/shiftService';
import { useAuth } from '../../context/AuthContext';

const TAB_SWAP = 'swap';
const TAB_OTHER = 'other';

const TicketProcessingPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuth();

    const roleName = String(user?.role?.name || user?.role || '').toUpperCase();
    const isManagerOrAdmin = roleName === 'MANAGER' || roleName === 'ROLE_MANAGER' || roleName === 'ADMIN' || roleName === 'ROLE_ADMIN';
    const currentUserId = Number(user?.id || user?.userId || 0);

    const [tickets, setTickets] = useState([]);
    const [assignmentMap, setAssignmentMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const activeTab = useMemo(() => {
        const incoming = String(searchParams.get('tab') || TAB_SWAP).toLowerCase();
        if (!isManagerOrAdmin) {
            return TAB_SWAP;
        }
        return incoming === TAB_OTHER ? TAB_OTHER : TAB_SWAP;
    }, [searchParams, isManagerOrAdmin]);

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
            const rows = Array.isArray(ticketData) ? ticketData : [];
            setTickets(rows);

            const relatedAssignmentIds = rows
                .map((ticket) => getRelatedAssignmentId(ticket))
                .filter((id) => Number.isInteger(id) && id > 0);
            const uniqueAssignmentIds = [...new Set(relatedAssignmentIds)];

            if (uniqueAssignmentIds.length > 0) {
                const detailPairs = await Promise.all(
                    uniqueAssignmentIds.map(async (assignmentId) => {
                        try {
                            const detail = await shiftService.getAssignment(assignmentId);
                            return [assignmentId, detail];
                        } catch (detailError) {
                            return [assignmentId, null];
                        }
                    })
                );

                const nextMap = detailPairs.reduce((acc, [assignmentId, detail]) => {
                    acc[String(assignmentId)] = detail;
                    return acc;
                }, {});
                setAssignmentMap(nextMap);
            } else {
                setAssignmentMap({});
            }

            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Khong the tai danh sach ticket xu ly.');
            setTickets([]);
            setAssignmentMap({});
        } finally {
            setLoading(false);
        }
    };

    const swapTickets = useMemo(() => {
        return tickets
            .filter((ticket) => String(ticket?.relatedEntityType || '').toUpperCase() === 'SHIFT_SWAP')
            .filter((ticket) => {
                if (isManagerOrAdmin) {
                    return true;
                }
                const assignedToCurrentUser = Number(ticket?.assignedToUserId || 0) === currentUserId;
                const createdByCurrentUser = Number(ticket?.createdByUserId || ticket?.requesterUserId || 0) === currentUserId;
                return assignedToCurrentUser || createdByCurrentUser;
            });
    }, [tickets, isManagerOrAdmin, currentUserId]);

    const otherTickets = useMemo(() => {
        if (!isManagerOrAdmin) {
            return [];
        }
        return tickets.filter((ticket) => String(ticket?.relatedEntityType || '').toUpperCase() !== 'SHIFT_SWAP');
    }, [tickets, isManagerOrAdmin]);

    const displayTickets = activeTab === TAB_SWAP ? swapTickets : otherTickets;

    const handleQuickApproveSwap = async (ticket) => {
        try {
            const requesterAssignmentId = extractSwapId(ticket?.description, 'SWAP_REQUESTER_ASSIGNMENT_ID');
            const targetAssignmentId = extractSwapId(ticket?.description, 'SWAP_TARGET_ASSIGNMENT_ID');

            if (requesterAssignmentId) {
                await shiftService.executeSwap({
                    requesterAssignmentId,
                    targetAssignmentId: targetAssignmentId || null,
                    accepterUserId: currentUserId,
                    ticketId: ticket.id,
                    note: 'Duyet doi ca tai bang xu ly ticket',
                });
            }

            await shiftTicketService.approveTicket(ticket.id, 'Da duyet va he thong tu dong xu ly doi ca.');
            await loadData();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Khong the duyet ticket doi ca.');
        }
    };

    const handleQuickRejectSwap = async (ticketId) => {
        try {
            await shiftTicketService.rejectTicket(ticketId, 'Tu choi yeu cau doi ca.');
            await loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Khong the tu choi ticket doi ca.');
        }
    };

    const handleProcessOtherTicket = (ticket) => {
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

    const handleRejectOtherTicket = async (ticketId) => {
        try {
            await shiftTicketService.rejectTicket(ticketId, 'Tu choi yeu cau ticket ca lam.');
            await loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Khong the tu choi ticket.');
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                        <Layers size={24} className="text-indigo-600" />
                        Xu ly ticket
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Bang ticket uu tien thong tin de de theo doi doi ca: ngay, ca, nguoi tao va nguoi tiep nhan.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={loadData}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
                >
                    <RefreshCw size={16} /> Tai lai
                </button>
            </div>

            <div className="flex items-center gap-2 border-b border-slate-200">
                <button
                    type="button"
                    onClick={() => setSearchParams({ tab: TAB_SWAP })}
                    className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === TAB_SWAP ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
                >
                    Ticket doi ca ({swapTickets.length})
                </button>
                {isManagerOrAdmin && (
                    <button
                        type="button"
                        onClick={() => setSearchParams({ tab: TAB_OTHER })}
                        className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === TAB_OTHER ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
                    >
                        Ticket khac ({otherTickets.length})
                    </button>
                )}
            </div>

            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
            )}

            {loading ? (
                <div className="text-slate-500">Dang tai ticket...</div>
            ) : displayTickets.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Khong co ticket phu hop.</div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-4 py-3 text-left">Ma ticket</th>
                                <th className="px-4 py-3 text-left">Ngay ca</th>
                                <th className="px-4 py-3 text-left">Ca</th>
                                <th className="px-4 py-3 text-left">Nguoi tao</th>
                                <th className="px-4 py-3 text-left">Nguoi tiep nhan</th>
                                <th className="px-4 py-3 text-left">Ly do</th>
                                <th className="px-4 py-3 text-left">Trang thai</th>
                                <th className="px-4 py-3 text-center">Hanh dong</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {displayTickets.map((ticket) => {
                                const assignmentId = getRelatedAssignmentId(ticket);
                                const assignment = assignmentMap[String(assignmentId)] || null;
                                const shiftDate = assignment?.shiftDate || '-';
                                const shiftLabel = assignment?.shift
                                    ? `${assignment.shift.shiftName || assignment.shift.shiftCode || 'Ca'} (${formatTime(assignment.shift.startTime)} - ${formatTime(assignment.shift.endTime)})`
                                    : '-';
                                const reason = sanitizeTicketReason(ticket?.description);
                                const status = String(ticket?.status || 'OPEN').toUpperCase();

                                return (
                                    <tr key={ticket.id}>
                                        <td className="px-4 py-3 font-medium text-slate-900">{ticket.ticketCode || `#${ticket.id}`}</td>
                                        <td className="px-4 py-3">{shiftDate}</td>
                                        <td className="px-4 py-3">{shiftLabel}</td>
                                        <td className="px-4 py-3">{ticket.createdByName || 'He thong'}</td>
                                        <td className="px-4 py-3">{ticket.assignedToName || '-'}</td>
                                        <td className="px-4 py-3 max-w-[340px] truncate" title={reason}>{reason || '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{status}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {status === 'OPEN' && activeTab === TAB_SWAP && (
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuickApproveSwap(ticket)}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                                                    >
                                                        <Check size={12} /> Duyet
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuickRejectSwap(ticket.id)}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                                                    >
                                                        <XCircle size={12} /> Tu choi
                                                    </button>
                                                </div>
                                            )}

                                            {status === 'OPEN' && activeTab === TAB_OTHER && isManagerOrAdmin && (
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleProcessOtherTicket(ticket)}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                                                    >
                                                        <Check size={12} /> Xu ly
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRejectOtherTicket(ticket.id)}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                                                    >
                                                        <XCircle size={12} /> Tu choi
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const formatTime = (value) => {
    if (!value) {
        return '--:--';
    }
    return String(value).slice(0, 5);
};

const sanitizeTicketReason = (description) => {
    return String(description || '')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith('['))
        .join(' ');
};

const extractSwapId = (description, key) => {
    const regex = new RegExp(`\\[${key}=(\\d+)\\]`);
    const matched = String(description || '').match(regex);
    if (!matched || !matched[1]) {
        return null;
    }
    return Number(matched[1]);
};

const getRelatedAssignmentId = (ticket) => {
    const relatedType = String(ticket?.relatedEntityType || '').toUpperCase();
    if (relatedType === 'SHIFT_SWAP') {
        return extractSwapId(ticket?.description, 'SWAP_REQUESTER_ASSIGNMENT_ID') || Number(ticket?.relatedEntityId || 0) || null;
    }

    if (relatedType === 'SHIFT_ASSIGNMENT') {
        const value = Number(ticket?.relatedEntityId || 0);
        return Number.isInteger(value) && value > 0 ? value : null;
    }

    return null;
};

export default TicketProcessingPage;
