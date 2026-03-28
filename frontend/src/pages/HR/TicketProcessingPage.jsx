import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Layers, Plus, RefreshCw, Settings2, X, XCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { shiftTicketService } from '../../services/shiftTicketService';
import { shiftService } from '../../services/shiftService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import CustomSelect from '../../components/common/CustomSelect';

const defaultProcessForm = {
    assignmentId: '',
    userId: '',
    shiftId: '',
    shiftDate: '',
    notes: '',
};

const defaultCreateForm = {
    ticketMode: 'SWAP',
    assignmentId: '',
    targetUserId: '',
    assignedToUserId: '',
    reason: '',
};

const defaultSwapAcceptForm = {
    targetAssignmentId: '',
    confirmTakeOver: false,
};

const TicketProcessingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const roleName = String(user?.role?.name || user?.role || '').toUpperCase();
    const isManagerOrAdmin = roleName === 'MANAGER' || roleName === 'ROLE_MANAGER' || roleName === 'ADMIN' || roleName === 'ROLE_ADMIN';
    const currentUserId = Number(user?.id || user?.userId || 0);
    const workforceHomePath = isManagerOrAdmin ? '/hr/workforce' : '/hr/my-payroll';

    const [tickets, setTickets] = useState([]);
    const [assignmentMap, setAssignmentMap] = useState({});
    const [users, setUsers] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [showProcessModal, setShowProcessModal] = useState(false);
    const [processingTicket, setProcessingTicket] = useState(null);
    const [processForm, setProcessForm] = useState(defaultProcessForm);
    const [processError, setProcessError] = useState('');
    const [processingAction, setProcessingAction] = useState(false);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState(defaultCreateForm);
    const [createError, setCreateError] = useState('');
    const [createSubmitting, setCreateSubmitting] = useState(false);
    const [myAssignments, setMyAssignments] = useState([]);

    const [showSwapAcceptModal, setShowSwapAcceptModal] = useState(false);
    const [swapAcceptTicket, setSwapAcceptTicket] = useState(null);
    const [swapRequesterAssignment, setSwapRequesterAssignment] = useState(null);
    const [swapAcceptAssignments, setSwapAcceptAssignments] = useState([]);
    const [swapAcceptForm, setSwapAcceptForm] = useState(defaultSwapAcceptForm);
    const [swapAcceptLoading, setSwapAcceptLoading] = useState(false);
    const [swapAcceptSubmitting, setSwapAcceptSubmitting] = useState(false);
    const [swapAcceptError, setSwapAcceptError] = useState('');

    useEffect(() => {
        if (!currentUserId) {
            return;
        }
        loadData();
    }, [currentUserId]);

    useEffect(() => {
        const ticketPrefill = location.state?.ticketPrefill;
        if (!ticketPrefill || !currentUserId) {
            return;
        }

        openCreateModal(ticketPrefill);
        navigate(location.pathname, { replace: true, state: null });
    }, [location.state, location.pathname, currentUserId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [ticketData, userRes, shiftRes] = await Promise.all([
                shiftTicketService.getShiftTickets(),
                userService.getAll({ page: 0, size: 100 }),
                shiftService.getShifts({ includeExpired: true }),
            ]);
            const rows = Array.isArray(ticketData) ? ticketData : [];
            setTickets(rows);
            setUsers(Array.isArray(userRes?.content) ? userRes.content : (Array.isArray(userRes) ? userRes : []));
            setShifts(Array.isArray(shiftRes) ? shiftRes : []);

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
            setError(extractErrorMessage(err, 'Không thể tải danh sách ticket xử lý.'));
            setTickets([]);
            setAssignmentMap({});
        } finally {
            setLoading(false);
        }
    };

    const displayTickets = useMemo(() => {
        return [...tickets].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }, [tickets]);

    const userOptions = useMemo(() => {
        return users.map((entry) => ({
            value: String(entry.id),
            label: entry.fullName || entry.email || `User #${entry.id}`,
        }));
    }, [users]);

    const shiftOptions = useMemo(() => {
        return shifts
            .filter((entry) => String(entry?.status || 'ACTIVE').toUpperCase() === 'ACTIVE')
            .map((entry) => ({
                value: String(entry.id),
                label: `${entry.shiftName || entry.shiftCode || 'Ca'} (${formatTime(entry.startTime)} - ${formatTime(entry.endTime)})`,
            }));
    }, [shifts]);

    const assignmentOptions = useMemo(() => {
        return myAssignments.map((item) => ({
            value: String(item.id),
            label: `${item.shiftDate} - ${item.shift?.shiftName || item.shift?.shiftCode || 'Ca làm'}`,
        }));
    }, [myAssignments]);

    const coworkerOptions = useMemo(() => {
        return users
            .filter((entry) => Number(entry?.id || 0) !== currentUserId)
            .map((entry) => ({
                value: String(entry.id),
                label: entry.fullName || entry.email || `User #${entry.id}`,
            }));
    }, [users, currentUserId]);

    const managerOptions = useMemo(() => {
        return users
            .filter((entry) => {
                const entryRoleName = String(entry?.role?.name || entry?.role || '').toUpperCase();
                return entryRoleName === 'ADMIN' || entryRoleName === 'ROLE_ADMIN' || entryRoleName === 'MANAGER' || entryRoleName === 'ROLE_MANAGER';
            })
            .map((entry) => ({
                value: String(entry.id),
                label: entry.fullName || entry.email || `User #${entry.id}`,
            }));
    }, [users]);

    const defaultAssigneeId = useMemo(() => {
        const currentManager = managerOptions.find((option) => Number(option.value) === currentUserId);
        if (currentManager) {
            return currentManager.value;
        }
        return managerOptions[0]?.value || '';
    }, [managerOptions, currentUserId]);

    useEffect(() => {
        if (!showCreateModal || createForm.ticketMode === 'SWAP' || createForm.assignedToUserId || !defaultAssigneeId) {
            return;
        }

        setCreateForm((prev) => ({
            ...prev,
            assignedToUserId: defaultAssigneeId,
        }));
    }, [showCreateModal, createForm.ticketMode, createForm.assignedToUserId, defaultAssigneeId]);

    const openCreateModal = async (prefill = {}) => {
        setCreateError('');
        setShowCreateModal(true);

        const { prefillDate, prefillAssignmentId, prefillTargetUserId } = prefill;
        const { startDate, endDate } = resolveMonthRange(prefillDate);

        try {
            const assignmentData = await shiftService.getAssignments({
                userId: currentUserId,
                startDate,
                endDate,
            });

            const rows = Array.isArray(assignmentData) ? assignmentData : [];
            setMyAssignments(rows);

            let resolvedAssignmentId = '';
            if (prefillAssignmentId && rows.some((entry) => String(entry.id) === String(prefillAssignmentId))) {
                resolvedAssignmentId = String(prefillAssignmentId);
            } else if (prefillDate) {
                const sameDateAssignment = rows.find((entry) => entry?.shiftDate === prefillDate);
                resolvedAssignmentId = sameDateAssignment?.id ? String(sameDateAssignment.id) : '';
            }

            setCreateForm({
                ...defaultCreateForm,
                assignmentId: resolvedAssignmentId,
                targetUserId: prefillTargetUserId ? String(prefillTargetUserId) : '',
                assignedToUserId: defaultAssigneeId,
            });
        } catch (err) {
            setMyAssignments([]);
            setCreateError(extractErrorMessage(err, 'Không thể tải dữ liệu tạo ticket.'));
        }
    };

    const handleSubmitCreateTicket = async (event) => {
        event.preventDefault();
        setCreateError('');
        setMessage('');

        if (!createForm.assignmentId) {
            setCreateError('Vui lòng chọn ca cần tạo ticket.');
            return;
        }

        if (createForm.ticketMode !== 'SWAP' && !createForm.assignedToUserId) {
            setCreateError('Vui lòng chọn người tiếp nhận ticket.');
            return;
        }

        if (!createForm.reason.trim()) {
            setCreateError('Vui lòng nhập lý do.');
            return;
        }

        if (createForm.ticketMode === 'SWAP' && !createForm.targetUserId) {
            setCreateError('Vui lòng chọn nhân viên đổi ca.');
            return;
        }

        const selectedAssignment = myAssignments.find((entry) => String(entry.id) === String(createForm.assignmentId));
        if (!selectedAssignment) {
            setCreateError('Không tìm thấy ca đã chọn.');
            return;
        }

        try {
            setCreateSubmitting(true);

            if (createForm.ticketMode === 'SWAP') {
                await shiftTicketService.createShiftSwapTicket({
                    fromDate: selectedAssignment.shiftDate,
                    reason: createForm.reason.trim(),
                    requesterUserId: Number(currentUserId),
                    requesterAssignmentId: Number(createForm.assignmentId),
                    targetUserId: Number(createForm.targetUserId),
                    swapMode: 'TAKE_OVER',
                });
            } else if (createForm.ticketMode === 'UPDATE') {
                await shiftTicketService.createShiftUpdateTicket({
                    assignmentId: Number(createForm.assignmentId),
                    shiftDate: selectedAssignment.shiftDate,
                    assignedToUserId: Number(createForm.assignedToUserId),
                    reason: createForm.reason.trim(),
                    priority: 'NORMAL',
                });
            } else {
                await shiftTicketService.createShiftCancelTicket({
                    assignmentId: Number(createForm.assignmentId),
                    shiftDate: selectedAssignment.shiftDate,
                    assignedToUserId: Number(createForm.assignedToUserId),
                    reason: createForm.reason.trim(),
                });
            }

            setShowCreateModal(false);
            setCreateForm(defaultCreateForm);
            setMessage('Đã tạo ticket mới thành công.');
            await loadData();
        } catch (err) {
            setCreateError(extractErrorMessage(err, 'Không thể tạo ticket mới.'));
        } finally {
            setCreateSubmitting(false);
        }
    };

    const openSwapAcceptModal = async (ticket) => {
        setSwapAcceptError('');
        setSwapAcceptTicket(ticket);
        setSwapAcceptForm(defaultSwapAcceptForm);
        setSwapAcceptAssignments([]);
        setSwapRequesterAssignment(null);
        setShowSwapAcceptModal(true);

        const requesterAssignmentId = extractSwapId(ticket?.description, 'SWAP_REQUESTER_ASSIGNMENT_ID');
        if (!requesterAssignmentId) {
            setSwapAcceptError('Ticket đổi ca thiếu ca làm của người yêu cầu.');
            return;
        }

        try {
            setSwapAcceptLoading(true);

            const requesterAssignment = assignmentMap[String(requesterAssignmentId)]
                || await shiftService.getAssignment(requesterAssignmentId);
            setSwapRequesterAssignment(requesterAssignment || null);

            const { startDate, endDate } = resolveMonthRange(requesterAssignment?.shiftDate || null);
            const myAssignmentRows = await shiftService.getAssignments({
                userId: currentUserId,
                startDate,
                endDate,
            });

            const targetAssignments = (Array.isArray(myAssignmentRows) ? myAssignmentRows : [])
                .filter((entry) => entry?.id && String(entry.id) !== String(requesterAssignmentId))
                .filter((entry) => isFutureOrToday(entry?.shiftDate));

            const ticketTargetAssignmentId = extractSwapId(ticket?.description, 'SWAP_TARGET_ASSIGNMENT_ID');
            const prefillTargetAssignmentId = targetAssignments.some((entry) => String(entry.id) === String(ticketTargetAssignmentId))
                ? String(ticketTargetAssignmentId)
                : '';

            setSwapAcceptAssignments(targetAssignments);
            setSwapAcceptForm({
                targetAssignmentId: prefillTargetAssignmentId,
                confirmTakeOver: false,
            });
        } catch (err) {
            setSwapAcceptError(extractErrorMessage(err, 'Không thể tải dữ liệu chấp nhận đổi ca.'));
        } finally {
            setSwapAcceptLoading(false);
        }
    };

    const closeSwapAcceptModal = () => {
        setShowSwapAcceptModal(false);
        setSwapAcceptTicket(null);
        setSwapRequesterAssignment(null);
        setSwapAcceptAssignments([]);
        setSwapAcceptForm(defaultSwapAcceptForm);
        setSwapAcceptError('');
    };

    const handleConfirmAcceptSwap = async () => {
        if (!swapAcceptTicket?.id) {
            setSwapAcceptError('Không xác định được ticket đổi ca.');
            return;
        }

        const requesterAssignmentId = extractSwapId(swapAcceptTicket?.description, 'SWAP_REQUESTER_ASSIGNMENT_ID');
        if (!requesterAssignmentId) {
            setSwapAcceptError('Ticket đổi ca thiếu ca làm của người yêu cầu.');
            return;
        }

        const hasCounterShifts = swapAcceptAssignments.length > 0;
        if (hasCounterShifts && !swapAcceptForm.targetAssignmentId) {
            setSwapAcceptError('Vui lòng chọn ca của bạn để đổi.');
            return;
        }

        if (!hasCounterShifts && !swapAcceptForm.confirmTakeOver) {
            setSwapAcceptError('Vui lòng xác nhận nhận ca thay tự động.');
            return;
        }

        try {
            setSwapAcceptSubmitting(true);

            await shiftService.executeSwap({
                requesterAssignmentId,
                targetAssignmentId: hasCounterShifts ? Number(swapAcceptForm.targetAssignmentId) : null,
                accepterUserId: currentUserId,
                ticketId: swapAcceptTicket.id,
                note: hasCounterShifts
                    ? 'Xử lý đổi ca từ trung tâm ticket (đổi hai chiều)'
                    : 'Xử lý đổi ca từ trung tâm ticket (nhận ca thay tự động)',
            });

            await shiftTicketService.approveTicket(swapAcceptTicket.id, 'Đã xử lý đổi ca thành công.');
            closeSwapAcceptModal();
            setMessage('Đã xử lý đổi ca thành công.');
            await loadData();
        } catch (err) {
            setSwapAcceptError(extractErrorMessage(err, 'Không thể xử lý đổi ca.'));
        } finally {
            setSwapAcceptSubmitting(false);
        }
    };

    const openProcessModal = (ticket) => {
        const assignmentId = getRelatedAssignmentId(ticket);
        const assignment = assignmentMap[String(assignmentId)] || null;
        const fallbackUserId = assignment?.user?.id ? String(assignment.user.id) : '';
        const fallbackShiftId = assignment?.shift?.id ? String(assignment.shift.id) : '';
        const fallbackShiftDate = assignment?.shiftDate || '';

        setProcessingTicket(ticket);
        setProcessForm({
            assignmentId: assignmentId ? String(assignmentId) : '',
            userId: fallbackUserId,
            shiftId: fallbackShiftId,
            shiftDate: fallbackShiftDate,
            notes: assignment?.notes || '',
        });
        setProcessError('');
        setShowProcessModal(true);
    };

    const handleCompleteProcessing = async () => {
        setProcessError('');
        setMessage('');

        if (!processingTicket?.id) {
            setProcessError('Không xác định được ticket cần xử lý.');
            return;
        }

        if (!processForm.assignmentId) {
            setProcessError('Không xác định được assignment của ticket.');
            return;
        }

        try {
            setProcessingAction(true);
            const assignment = assignmentMap[String(processForm.assignmentId)] || null;
            const shiftLabel = assignment?.shift
                ? `${assignment.shift.shiftName || assignment.shift.shiftCode || 'Ca'} (${formatTime(assignment.shift.startTime)} - ${formatTime(assignment.shift.endTime)})`
                : '-';
            const resolution = processForm.notes?.trim()
                || `Đã hoàn tất xử lý ticket cho assignment #${processForm.assignmentId}, ngày ${processForm.shiftDate || '-'}, nhân viên ${assignment?.user?.fullName || '-'}, ca ${shiftLabel}.`;

            await shiftTicketService.approveTicket(processingTicket.id, resolution);
            setShowProcessModal(false);
            setProcessingTicket(null);
            setMessage('Đã hoàn tất ticket thành công.');
            await loadData();
        } catch (err) {
            setProcessError(extractErrorMessage(err, 'Không thể hoàn tất xử lý ticket.'));
        } finally {
            setProcessingAction(false);
        }
    };

    const handleRejectProcessing = async () => {
        if (!processingTicket?.id) {
            return;
        }

        try {
            setProcessingAction(true);
            await shiftTicketService.rejectTicket(processingTicket.id, 'Manager từ chối yêu cầu, giữ nguyên phân công hiện tại.');
            setShowProcessModal(false);
            setProcessingTicket(null);
            setMessage('Đã từ chối ticket và giữ nguyên phân công hiện tại.');
            await loadData();
        } catch (err) {
            setProcessError(extractErrorMessage(err, 'Không thể từ chối ticket.'));
        } finally {
            setProcessingAction(false);
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300"
                        >
                            <ArrowLeft size={14} /> Quay lại trang trước
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(workforceHomePath)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300"
                        >
                            <ArrowLeft size={14} /> Nhân Sự Tổng Hợp
                        </button>
                    </div>
                    <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                        <Layers size={24} className="text-indigo-600" />
                        Trung tâm ticket ca làm
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Bảng yêu cầu xử lý của toàn bộ nhân sự trong hệ thống
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => openCreateModal()}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
                    >
                        <Plus size={16} /> Tạo ticket mới
                    </button>
                    <button
                        type="button"
                        onClick={loadData}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
                    >
                        <RefreshCw size={16} /> Tải lại
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
            )}

            {message && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>
            )}

            {loading ? (
                <div className="text-slate-500">Đang tải ticket...</div>
            ) : displayTickets.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Không có ticket phù hợp.</div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-4 py-3 text-left">Mã ticket</th>
                                <th className="px-4 py-3 text-left">Ngày ca</th>
                                <th className="px-4 py-3 text-left">Ca</th>
                                <th className="px-4 py-3 text-left">Người tạo</th>
                                <th className="px-4 py-3 text-left">Loại yêu cầu</th>
                                <th className="px-4 py-3 text-left">Lý do</th>
                                <th className="px-4 py-3 text-left">Trạng thái</th>
                                <th className="px-4 py-3 text-center">Xử lý</th>
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
                                const requestType = resolveRequestType(ticket);
                                const isSwapRequest = requestType === 'SWAP';
                                const canAcceptSwap = isSwapRequest
                                    && status === 'OPEN'
                                    && Number(ticket?.createdByUserId || ticket?.requesterUserId || 0) !== currentUserId;
                                const canOpenManagerProcess = isManagerOrAdmin && !isSwapRequest && status === 'OPEN';

                                return (
                                    <tr key={ticket.id}>
                                        <td className="px-4 py-3 font-medium text-slate-900">{ticket.ticketCode || `#${ticket.id}`}</td>
                                        <td className="px-4 py-3">{shiftDate}</td>
                                        <td className="px-4 py-3">{shiftLabel}</td>
                                        <td className="px-4 py-3">{ticket.createdByName || 'Hệ thống'}</td>
                                        <td className="px-4 py-3">{formatRequestTypeLabel(requestType)}</td>
                                        <td className="px-4 py-3 max-w-[340px] truncate" title={reason}>{reason || '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(status)}`}>{status}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                {canAcceptSwap && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openSwapAcceptModal(ticket)}
                                                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                                        title="Chấp nhận đổi ca"
                                                    >
                                                        <Check size={13} />
                                                    </button>
                                                )}

                                                {canOpenManagerProcess && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openProcessModal(ticket)}
                                                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                                                        title="Xử lý nhanh"
                                                    >
                                                        <Settings2 size={13} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowCreateModal(false); }}>
                    <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Tạo ticket mới</h2>
                                <p className="text-xs text-slate-500">Tạo yêu cầu mới tại trung tâm ticket và xử lý tập trung.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitCreateTicket} className="space-y-4 p-6">
                            {createError && (
                                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                                    {createError}
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">Loại ticket <span className="text-rose-500">*</span></label>
                                <CustomSelect
                                    value={createForm.ticketMode}
                                    onChange={(value) => setCreateForm((prev) => ({
                                        ...prev,
                                        ticketMode: value,
                                        targetUserId: '',
                                        assignedToUserId: value === 'SWAP' ? '' : (prev.assignedToUserId || defaultAssigneeId),
                                    }))}
                                    options={[
                                        { value: 'SWAP', label: 'Yêu cầu đổi ca' },
                                        { value: 'CANCEL', label: 'Yêu cầu nghỉ ca' },
                                        { value: 'UPDATE', label: 'Yêu cầu cập nhật ca' },
                                    ]}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">Ca cần xử lý <span className="text-rose-500">*</span></label>
                                <CustomSelect
                                    value={createForm.assignmentId}
                                    onChange={(value) => setCreateForm((prev) => ({ ...prev, assignmentId: value }))}
                                    options={[
                                        { value: '', label: 'Chọn ca' },
                                        ...assignmentOptions,
                                    ]}
                                />
                            </div>

                            {createForm.ticketMode === 'SWAP' && (
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Nhân viên đổi ca <span className="text-rose-500">*</span></label>
                                    <CustomSelect
                                        value={createForm.targetUserId}
                                        onChange={(value) => setCreateForm((prev) => ({ ...prev, targetUserId: value }))}
                                        options={[
                                            { value: '', label: 'Chọn nhân viên' },
                                            ...coworkerOptions,
                                        ]}
                                    />
                                </div>
                            )}

                            {createForm.ticketMode !== 'SWAP' && (
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Người tiếp nhận <span className="text-rose-500">*</span></label>
                                    <CustomSelect
                                        value={createForm.assignedToUserId}
                                        onChange={(value) => setCreateForm((prev) => ({ ...prev, assignedToUserId: value }))}
                                        options={[
                                            { value: '', label: 'Chọn manager/admin' },
                                            ...managerOptions,
                                        ]}
                                    />
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">Lý do <span className="text-rose-500">*</span></label>
                                <textarea
                                    value={createForm.reason}
                                    onChange={(event) => setCreateForm((prev) => ({ ...prev, reason: event.target.value }))}
                                    className="min-h-[90px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    placeholder="Nhập lý do yêu cầu"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700"
                                >
                                    Huy
                                </button>
                                <button
                                    type="submit"
                                    disabled={createSubmitting}
                                    className="rounded-lg border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                                >
                                    {createSubmitting ? 'Đang tạo...' : 'Tạo ticket'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showSwapAcceptModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4" onClick={(e) => { if (e.target === e.currentTarget) closeSwapAcceptModal(); }}>
                    <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Chấp nhận đổi ca</h2>
                                <p className="text-xs text-slate-500">Chọn ca đối ứng của bạn hoặc xác nhận nhận ca thay tự động.</p>
                            </div>
                            <button
                                type="button"
                                onClick={closeSwapAcceptModal}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4 p-6">
                            {swapAcceptError && (
                                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                                    {swapAcceptError}
                                </div>
                            )}

                            {swapAcceptLoading ? (
                                <div className="text-sm text-slate-500">Đang tải dữ liệu ca làm của bạn...</div>
                            ) : (
                                <>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                                        <div><span className="font-medium">Ticket:</span> {swapAcceptTicket?.ticketCode || `#${swapAcceptTicket?.id || ''}`}</div>
                                        <div><span className="font-medium">Ca người yêu cầu:</span> {swapRequesterAssignment?.shiftDate || '-'} {swapRequesterAssignment?.shift ? `(${swapRequesterAssignment.shift.shiftName || swapRequesterAssignment.shift.shiftCode || 'Ca'})` : ''}</div>
                                    </div>

                                    {swapAcceptAssignments.length > 0 ? (
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-600">Ca của bạn để đổi <span className="text-rose-500">*</span></label>
                                            <CustomSelect
                                                value={swapAcceptForm.targetAssignmentId}
                                                onChange={(value) => setSwapAcceptForm((prev) => ({ ...prev, targetAssignmentId: value }))}
                                                options={[
                                                    { value: '', label: 'Chọn ca của bạn' },
                                                    ...swapAcceptAssignments.map((item) => ({
                                                        value: String(item.id),
                                                        label: `${item.shiftDate} - ${item.shift?.shiftName || item.shift?.shiftCode || 'Ca làm'} (${formatTime(item.shift?.startTime)} - ${formatTime(item.shift?.endTime)})`,
                                                    })),
                                                ]}
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
                                            <p>Hiện bạn không có ca đối ứng phù hợp để đổi hai chiều.</p>
                                            <label className="inline-flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={swapAcceptForm.confirmTakeOver}
                                                    onChange={(event) => setSwapAcceptForm((prev) => ({ ...prev, confirmTakeOver: event.target.checked }))}
                                                />
                                                <span>Xác nhận nhận ca thay và hệ thống tự động xếp ca cho tôi</span>
                                            </label>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
                            <button
                                type="button"
                                onClick={closeSwapAcceptModal}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmAcceptSwap}
                                disabled={swapAcceptSubmitting || swapAcceptLoading}
                                className="rounded-lg border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                            >
                                {swapAcceptSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showProcessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowProcessModal(false); }}>
                    <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Xử lý ticket nhanh</h2>
                                <p className="text-xs text-slate-500">Thông tin phân công chỉ đọc từ hệ thống, bạn có thể hoàn tất hoặc từ chối ticket.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowProcessModal(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <XCircle size={18} />
                            </button>
                        </div>

                        <div className="space-y-4 p-6">
                            {processError && (
                                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                                    {processError}
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Assignment ID <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        value={processForm.assignmentId}
                                        readOnly
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                                        placeholder="Id phan cong"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Ngày ca <span className="text-rose-500">*</span></label>
                                    <input
                                        type="date"
                                        value={processForm.shiftDate}
                                        readOnly
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Nhân viên</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={(assignmentMap[String(processForm.assignmentId)]?.user?.fullName) || '-'}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Ca làm</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={(() => {
                                            const shift = assignmentMap[String(processForm.assignmentId)]?.shift;
                                            if (!shift) return '-';
                                            return `${shift.shiftName || shift.shiftCode || 'Ca'} (${formatTime(shift.startTime)} - ${formatTime(shift.endTime)})`;
                                        })()}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                                    />
                                </div>

                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-medium text-slate-600">Ghi chú xử lý</label>
                                    <textarea
                                        value={processForm.notes}
                                        onChange={(event) => setProcessForm((prev) => ({ ...prev, notes: event.target.value }))}
                                        className="min-h-[90px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                        placeholder="Ghi chú khi hoàn tất ticket"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                            <button
                                type="button"
                                onClick={handleRejectProcessing}
                                disabled={processingAction}
                                className="inline-flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                            >
                                <XCircle size={14} /> Từ chối
                            </button>
                            <button
                                type="button"
                                onClick={handleCompleteProcessing}
                                disabled={processingAction}
                                className="inline-flex items-center gap-2 rounded-lg border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                            >
                                <Check size={14} /> Hoàn tất
                            </button>
                        </div>
                    </div>
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
        .map((line) => line.replace(/\[[^\]]+\]/g, '').trim())
        .filter((line) => line.length > 0)
        .join(' ');
};

const resolveRequestType = (ticket) => {
    const title = String(ticket?.title || '').toLowerCase();
    const relatedType = String(ticket?.relatedEntityType || '').toUpperCase();

    if (relatedType === 'SHIFT_SWAP' || title.includes('doi ca') || title.includes('đổi ca')) {
        return 'SWAP';
    }

    if (title.includes('nghi ca') || title.includes('nghỉ ca') || title.includes('xin nghi') || title.includes('xin nghỉ')) {
        return 'LEAVE';
    }

    if (title.includes('cap nhat') || title.includes('cập nhật')) {
        return 'UPDATE';
    }

    return 'OTHER';
};

const formatRequestTypeLabel = (requestType) => {
    if (requestType === 'SWAP') {
        return 'Đổi ca';
    }
    if (requestType === 'LEAVE') {
        return 'Nghỉ ca';
    }
    if (requestType === 'UPDATE') {
        return 'Cập nhật ca';
    }
    return 'Yêu cầu ca làm';
};

const isFutureOrToday = (dateValue) => {
    if (!dateValue) {
        return false;
    }
    const today = new Date();
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return String(dateValue) >= todayIso;
};

const statusClass = (status) => {
    if (status === 'OPEN') {
        return 'bg-amber-100 text-amber-700';
    }
    if (status === 'IN_PROGRESS') {
        return 'bg-sky-100 text-sky-700';
    }
    if (status === 'RESOLVED') {
        return 'bg-emerald-100 text-emerald-700';
    }
    if (status === 'CLOSED') {
        return 'bg-slate-200 text-slate-700';
    }
    return 'bg-slate-100 text-slate-700';
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

const resolveMonthRange = (prefillDate) => {
    const baseDate = prefillDate ? new Date(`${prefillDate}T00:00:00`) : new Date();
    if (Number.isNaN(baseDate.getTime())) {
        const now = new Date();
        return {
            startDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
            endDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()).padStart(2, '0')}`,
        };
    }

    const year = baseDate.getFullYear();
    const month = baseDate.getMonth() + 1;
    const endDay = new Date(year, month, 0).getDate();
    return {
        startDate: `${year}-${String(month).padStart(2, '0')}-01`,
        endDate: `${year}-${String(month).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`,
    };
};

const extractErrorMessage = (error, fallback) => {
    const data = error?.response?.data;
    if (typeof data === 'string' && data.trim()) {
        return data;
    }
    if (typeof data?.message === 'string' && data.message.trim()) {
        return data.message;
    }
    if (typeof error?.message === 'string' && error.message.trim()) {
        return error.message;
    }
    return fallback;
};

export default TicketProcessingPage;
