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
            setError(extractErrorMessage(err, 'Khong the tai danh sach ticket xu ly.'));
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
            label: `${item.shiftDate} - ${item.shift?.shiftName || item.shift?.shiftCode || 'Ca lam'}`,
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

    useEffect(() => {
        if (!showCreateModal || createForm.assignedToUserId || managerOptions.length === 0) {
            return;
        }

        setCreateForm((prev) => ({
            ...prev,
            assignedToUserId: managerOptions[0].value,
        }));
    }, [showCreateModal, createForm.assignedToUserId, managerOptions]);

    const openCreateModal = async (prefill = {}) => {
        setCreateError('');
        setShowCreateModal(true);

        const { prefillDate, prefillAssignmentId } = prefill;
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

            const defaultAssignee = managerOptions[0]?.value || '';
            setCreateForm({
                ...defaultCreateForm,
                assignmentId: resolvedAssignmentId,
                assignedToUserId: defaultAssignee,
            });
        } catch (err) {
            setMyAssignments([]);
            setCreateError(extractErrorMessage(err, 'Khong the tai du lieu tao ticket.'));
        }
    };

    const handleSubmitCreateTicket = async (event) => {
        event.preventDefault();
        setCreateError('');
        setMessage('');

        if (!createForm.assignmentId) {
            setCreateError('Vui long chon ca can tao ticket.');
            return;
        }

        if (!createForm.assignedToUserId) {
            setCreateError('Vui long chon nguoi tiep nhan ticket.');
            return;
        }

        if (!createForm.reason.trim()) {
            setCreateError('Vui long nhap ly do.');
            return;
        }

        if (createForm.ticketMode === 'SWAP' && !createForm.targetUserId) {
            setCreateError('Vui long chon nguoi doi ca.');
            return;
        }

        const selectedAssignment = myAssignments.find((entry) => String(entry.id) === String(createForm.assignmentId));
        if (!selectedAssignment) {
            setCreateError('Khong tim thay ca da chon.');
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
                    assignedToUserId: Number(createForm.assignedToUserId),
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
            setMessage('Da tao ticket moi thanh cong.');
            await loadData();
        } catch (err) {
            setCreateError(extractErrorMessage(err, 'Khong the tao ticket moi.'));
        } finally {
            setCreateSubmitting(false);
        }
    };

    const handleQuickApproveSwap = async (ticket) => {
        try {
            const requesterAssignmentId = extractSwapId(ticket?.description, 'SWAP_REQUESTER_ASSIGNMENT_ID');
            const targetAssignmentId = extractSwapId(ticket?.description, 'SWAP_TARGET_ASSIGNMENT_ID');

            if (!requesterAssignmentId) {
                setError('Ticket doi ca thieu assignment nguoi gui.');
                return;
            }

            await shiftService.executeSwap({
                requesterAssignmentId,
                targetAssignmentId: targetAssignmentId || null,
                accepterUserId: currentUserId,
                ticketId: ticket.id,
                note: 'Xu ly doi ca tu trung tam ticket',
            });

            await shiftTicketService.approveTicket(ticket.id, 'Da xu ly doi ca thanh cong.');
            setMessage('Da xu ly doi ca thanh cong.');
            await loadData();
        } catch (err) {
            setError(extractErrorMessage(err, 'Khong the xu ly doi ca.'));
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
            setProcessError('Khong xac dinh duoc ticket can xu ly.');
            return;
        }

        if (!processForm.assignmentId || !processForm.userId || !processForm.shiftId || !processForm.shiftDate) {
            setProcessError('Vui long dien day du thong tin phan lai ca.');
            return;
        }

        try {
            setProcessingAction(true);
            await shiftService.updateAssignment(Number(processForm.assignmentId), {
                userId: Number(processForm.userId),
                workShiftId: Number(processForm.shiftId),
                shiftDate: processForm.shiftDate,
                status: 'ASSIGNED',
                notes: processForm.notes?.trim() || null,
            });

            await shiftTicketService.approveTicket(processingTicket.id, 'Da cap nhat phan cong va hoan tat ticket.');
            setShowProcessModal(false);
            setProcessingTicket(null);
            setMessage('Da cap nhat phan cong va hoan tat ticket.');
            await loadData();
        } catch (err) {
            setProcessError(extractErrorMessage(err, 'Khong the hoan tat xu ly ticket.'));
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
            await shiftTicketService.rejectTicket(processingTicket.id, 'Manager tu choi yeu cau, giu nguyen phan cong hien tai.');
            setShowProcessModal(false);
            setProcessingTicket(null);
            setMessage('Da tu choi ticket va giu nguyen phan cong hien tai.');
            await loadData();
        } catch (err) {
            setProcessError(extractErrorMessage(err, 'Khong the tu choi ticket.'));
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
                            <ArrowLeft size={14} /> Quay lai trang truoc
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
                        Trung tam ticket ca lam
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Bảng Yêu Cầu Xử Lý Của Toàn Bộ Nhân Sự Trong Hệ Thống
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => openCreateModal()}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
                    >
                        <Plus size={16} /> Tao ticket moi
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
                                <th className="px-4 py-3 text-left">Loai yeu cau</th>
                                <th className="px-4 py-3 text-left">Ly do</th>
                                <th className="px-4 py-3 text-left">Trang thai</th>
                                <th className="px-4 py-3 text-center">Xu ly</th>
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
                                        <td className="px-4 py-3">{ticket.createdByName || 'He thong'}</td>
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
                                                        onClick={() => handleQuickApproveSwap(ticket)}
                                                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                                        title="Nhan doi ca"
                                                    >
                                                        <Check size={13} />
                                                    </button>
                                                )}

                                                {canOpenManagerProcess && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openProcessModal(ticket)}
                                                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                                                        title="Xu ly nhanh"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
                    <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Tao ticket moi</h2>
                                <p className="text-xs text-slate-500">Tao yeu cau moi tai trung tam ticket va xu ly tap trung.</p>
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
                                <label className="text-xs font-medium text-slate-600">Loai ticket <span className="text-rose-500">*</span></label>
                                <CustomSelect
                                    value={createForm.ticketMode}
                                    onChange={(value) => setCreateForm((prev) => ({ ...prev, ticketMode: value, targetUserId: '' }))}
                                    options={[
                                        { value: 'SWAP', label: 'Yeu cau doi ca' },
                                        { value: 'CANCEL', label: 'Yeu cau nghi ca' },
                                        { value: 'UPDATE', label: 'Yeu cau cap nhat ca' },
                                    ]}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">Ca can xu ly <span className="text-rose-500">*</span></label>
                                <CustomSelect
                                    value={createForm.assignmentId}
                                    onChange={(value) => setCreateForm((prev) => ({ ...prev, assignmentId: value }))}
                                    options={[
                                        { value: '', label: 'Chon ca' },
                                        ...assignmentOptions,
                                    ]}
                                />
                            </div>

                            {createForm.ticketMode === 'SWAP' && (
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Nguoi doi ca <span className="text-rose-500">*</span></label>
                                    <CustomSelect
                                        value={createForm.targetUserId}
                                        onChange={(value) => setCreateForm((prev) => ({ ...prev, targetUserId: value }))}
                                        options={[
                                            { value: '', label: 'Chon nhan vien' },
                                            ...coworkerOptions,
                                        ]}
                                    />
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">Nguoi tiep nhan <span className="text-rose-500">*</span></label>
                                <CustomSelect
                                    value={createForm.assignedToUserId}
                                    onChange={(value) => setCreateForm((prev) => ({ ...prev, assignedToUserId: value }))}
                                    options={[
                                        { value: '', label: 'Chon manager/admin' },
                                        ...managerOptions,
                                    ]}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">Ly do <span className="text-rose-500">*</span></label>
                                <textarea
                                    value={createForm.reason}
                                    onChange={(event) => setCreateForm((prev) => ({ ...prev, reason: event.target.value }))}
                                    className="min-h-[90px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    placeholder="Nhap ly do yeu cau"
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
                                    {createSubmitting ? 'Dang tao...' : 'Tao ticket'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showProcessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
                    <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Xu ly ticket nhanh</h2>
                                <p className="text-xs text-slate-500">Cap nhat phan cong va hoan tat, hoac tu choi de giu nguyen thong tin hien tai.</p>
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
                                        onChange={(event) => setProcessForm((prev) => ({ ...prev, assignmentId: event.target.value }))}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                        placeholder="Id phan cong"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Ngay ca <span className="text-rose-500">*</span></label>
                                    <input
                                        type="date"
                                        value={processForm.shiftDate}
                                        onChange={(event) => setProcessForm((prev) => ({ ...prev, shiftDate: event.target.value }))}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Nhan vien moi <span className="text-rose-500">*</span></label>
                                    <CustomSelect
                                        value={processForm.userId}
                                        onChange={(value) => setProcessForm((prev) => ({ ...prev, userId: value }))}
                                        options={[
                                            { value: '', label: 'Chon nhan vien' },
                                            ...userOptions,
                                        ]}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Ca moi <span className="text-rose-500">*</span></label>
                                    <CustomSelect
                                        value={processForm.shiftId}
                                        onChange={(value) => setProcessForm((prev) => ({ ...prev, shiftId: value }))}
                                        options={[
                                            { value: '', label: 'Chon ca' },
                                            ...shiftOptions,
                                        ]}
                                    />
                                </div>

                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-medium text-slate-600">Ghi chu cap nhat</label>
                                    <textarea
                                        value={processForm.notes}
                                        onChange={(event) => setProcessForm((prev) => ({ ...prev, notes: event.target.value }))}
                                        className="min-h-[90px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                        placeholder="Ghi chu sau khi phan lai"
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
                                <XCircle size={14} /> Tu choi
                            </button>
                            <button
                                type="button"
                                onClick={handleCompleteProcessing}
                                disabled={processingAction}
                                className="inline-flex items-center gap-2 rounded-lg border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                            >
                                <Check size={14} /> Hoan tat
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

    if (relatedType === 'SHIFT_SWAP' || title.includes('doi ca')) {
        return 'SWAP';
    }

    if (title.includes('nghi ca') || title.includes('xin nghi')) {
        return 'LEAVE';
    }

    if (title.includes('cap nhat')) {
        return 'UPDATE';
    }

    return 'OTHER';
};

const formatRequestTypeLabel = (requestType) => {
    if (requestType === 'SWAP') {
        return 'Doi ca';
    }
    if (requestType === 'LEAVE') {
        return 'Nghi ca';
    }
    if (requestType === 'UPDATE') {
        return 'Cap nhat ca';
    }
    return 'Yeu cau ca lam';
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
