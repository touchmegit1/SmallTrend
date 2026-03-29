import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, CheckCircle2, LogOut, Plus, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { shiftService } from '../../services/shiftService';
import { shiftTicketService } from '../../services/shiftTicketService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import CustomSelect from '../../components/common/CustomSelect';
import { RequiredLegend, RequiredMark } from '../../components/common/RequiredFieldLegend';

const defaultTicketForm = {
    ticketMode: 'SWAP',
    assignmentId: '',
    targetUserId: '',
    assignedToUserId: '',
    reason: '',
};

const defaultQuickAssignForm = {
    shiftDate: '',
    userId: '',
    shiftId: '',
    notes: '',
};

const LATE_GRACE_MINUTES = 15;

const ShiftCalendarPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const roleName = String(user?.role?.name || user?.role || '').toUpperCase();
    const isAdmin = roleName === 'ADMIN' || roleName === 'ROLE_ADMIN';
    const isManager = roleName === 'MANAGER' || roleName === 'ROLE_MANAGER';
    const canQuickAssign = isManager || isAdmin;
    const workforceHomePath = canQuickAssign ? '/hr/workforce' : '/hr/my-payroll';

    const currentUserId = user?.id || user?.userId || null;

    const [calendarView, setCalendarView] = useState('week');
    const [anchorDate, setAnchorDate] = useState(new Date());
    const [assignments, setAssignments] = useState([]);
    const [attendanceMap, setAttendanceMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [ticketForm, setTicketForm] = useState(defaultTicketForm);
    const [ticketSubmitting, setTicketSubmitting] = useState(false);
    const [ticketError, setTicketError] = useState('');
    const [ticketModalLoading, setTicketModalLoading] = useState(false);
    const [myAssignments, setMyAssignments] = useState([]);
    const [managerUsers, setManagerUsers] = useState([]);

    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignForm, setAssignForm] = useState(defaultQuickAssignForm);
    const [assignModalLoading, setAssignModalLoading] = useState(false);
    const [assignSubmitting, setAssignSubmitting] = useState(false);
    const [assignError, setAssignError] = useState('');
    const [quickAssignUsers, setQuickAssignUsers] = useState([]);
    const [quickAssignShifts, setQuickAssignShifts] = useState([]);

    useEffect(() => {
        loadAssignments();
    }, [calendarView, anchorDate]);

    const loadAssignments = async () => {
        try {
            setLoading(true);
            const { startDate, endDate } = getRange(calendarView, anchorDate);
            const params = {
                startDate: toDateInput(startDate),
                endDate: toDateInput(endDate),
            };

            const [assignmentData, attendanceData] = await Promise.all([
                shiftService.getAssignments(params),
                shiftService.getAttendance(params),
            ]);

            const assignmentRows = Array.isArray(assignmentData) ? assignmentData : [];
            const attendanceRows = Array.isArray(attendanceData) ? attendanceData : [];

            setAssignments(assignmentRows);
            setAttendanceMap(indexAttendance(attendanceRows));
            setError('');
        } catch (err) {
            setError(extractErrorMessage(err, 'Khong the tai lich lam viec.'));
            setAssignments([]);
            setAttendanceMap({});
        } finally {
            setLoading(false);
        }
    };

    const openAssignModal = async (date) => {
        if (!canQuickAssign) {
            return;
        }

        setAssignError('');
        setShowAssignModal(true);
        setAssignForm((prev) => ({
            ...prev,
            shiftDate: toDateInput(date),
        }));

        if (quickAssignUsers.length > 0 && quickAssignShifts.length > 0) {
            return;
        }

        try {
            setAssignModalLoading(true);
            const [userRes, shiftRes] = await Promise.all([
                userService.getAll({ page: 0, size: 100 }),
                shiftService.getShifts({ page: 0, size: 100 }),
            ]);

            const usersPayload = Array.isArray(userRes?.content) ? userRes.content : (Array.isArray(userRes) ? userRes : []);
            const shiftsPayload = Array.isArray(shiftRes?.content) ? shiftRes.content : (Array.isArray(shiftRes) ? shiftRes : []);

            setQuickAssignUsers(usersPayload);
            setQuickAssignShifts(shiftsPayload);
            setAssignForm((prev) => ({
                ...prev,
                userId: prev.userId || (usersPayload[0]?.id ? String(usersPayload[0].id) : ''),
                shiftId: prev.shiftId || (shiftsPayload[0]?.id ? String(shiftsPayload[0].id) : ''),
            }));
        } catch (err) {
            setAssignError(extractErrorMessage(err, 'Khong the tai du lieu phan ca nhanh.'));
        } finally {
            setAssignModalLoading(false);
        }
    };

    const handleSubmitQuickAssign = async (event) => {
        event.preventDefault();
        setAssignError('');

        if (!assignForm.shiftDate) {
            setAssignError('Vui long chon ngay lam viec.');
            return;
        }

        if (!assignForm.userId || !assignForm.shiftId) {
            setAssignError('Vui long chon nhan vien va ca lam.');
            return;
        }

        try {
            setAssignSubmitting(true);
            await shiftService.createAssignment({
                workShiftId: Number(assignForm.shiftId),
                userId: Number(assignForm.userId),
                shiftDate: assignForm.shiftDate,
                status: 'ASSIGNED',
                notes: assignForm.notes?.trim() || null,
            });

            setShowAssignModal(false);
            setAssignForm(defaultQuickAssignForm);
            setMessage('Da tao phan cong ca lam.');
            await loadAssignments();
        } catch (err) {
            setAssignError(extractErrorMessage(err, 'Khong the phan ca nhanh.'));
        } finally {
            setAssignSubmitting(false);
        }
    };

    const handleDayPlusClick = (date) => {
        if (canQuickAssign) {
            openAssignModal(date);
            return;
        }

        const normalizedDate = toDateInput(date);
        const prefilledAssignment = (assignmentsByDate[normalizedDate] || [])
            .find((entry) => Number(entry?.user?.id || 0) === Number(currentUserId || 0));

        navigate('/hr/ticket-processing', {
            state: {
                ticketPrefill: {
                    prefillDate: normalizedDate,
                    prefillAssignmentId: prefilledAssignment?.id ? String(prefilledAssignment.id) : '',
                },
            },
        });
    };

    const assignmentsByDate = useMemo(() => {
        return assignments.reduce((acc, item) => {
            const key = item.shiftDate;
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});
    }, [assignments]);

    const handleQuickCheckIn = async (assignment) => {
        try {
            const assignmentUserId = assignment?.user?.id;
            if (!assignmentUserId || !assignment?.shiftDate) {
                setError('Thieu thong tin ca de cham vao.');
                return;
            }

            if (Number(assignmentUserId) !== Number(currentUserId)) {
                setError('Ban chi co the cham cong cho ca cua chinh minh.');
                return;
            }

            const now = new Date();
            const hm = formatHourMinute(now);
            const checkInStatus = resolveCheckInStatus(assignment, hm);

            await shiftService.upsertAttendance({
                userId: assignmentUserId,
                date: assignment.shiftDate,
                timeIn: hm,
                status: checkInStatus,
            });

            setError('');
            setMessage(checkInStatus === 'LATE' ? 'Da cham vao, he thong da gan co di muon.' : 'Da cham vao dung gio.');
            await loadAssignments();
        } catch (err) {
            setError(extractErrorMessage(err, 'Khong the cham vao tu lich.'));
        }
    };

    const handleQuickCheckOut = async (assignment) => {
        try {
            const assignmentUserId = assignment?.user?.id;
            if (!assignmentUserId || !assignment?.shiftDate) {
                setError('Thieu thong tin ca de cham ra.');
                return;
            }

            if (Number(assignmentUserId) !== Number(currentUserId)) {
                setError('Ban chi co the cham cong cho ca cua chinh minh.');
                return;
            }

            const attendance = attendanceMap[getAttendanceKey(assignmentUserId, assignment.shiftDate)];
            if (!attendance?.timeIn) {
                setError('Can cham vao truoc khi cham ra.');
                return;
            }

            const now = new Date();
            const hm = formatHourMinute(now);
            const checkInStatus = resolveCheckInStatus(assignment, String(attendance.timeIn).slice(0, 5));

            await shiftService.upsertAttendance({
                userId: assignmentUserId,
                date: assignment.shiftDate,
                timeIn: String(attendance.timeIn).slice(0, 5),
                timeOut: hm,
                status: checkInStatus,
            });

            setError('');
            setMessage('Da cham ra thanh cong.');
            await loadAssignments();
        } catch (err) {
            setError(extractErrorMessage(err, 'Khong the cham ra tu lich.'));
        }
    };

    const handleDeleteAssignment = async (assignment) => {
        if (!canQuickAssign || !assignment?.id) {
            return;
        }

        const summary = `${assignment?.user?.fullName || 'Nhan vien'} - ${assignment?.shift?.shiftName || 'Ca lam'} - ${assignment?.shiftDate || ''}`;
        const accepted = window.confirm(`Xoa phan cong ca nay?\n${summary}`);
        if (!accepted) {
            return;
        }

        try {
            await shiftService.deleteAssignment(assignment.id);
            setError('');
            setMessage('Da xoa phan cong ca lam.');
            await loadAssignments();
        } catch (err) {
            setError(extractErrorMessage(err, 'Khong the xoa phan cong ca lam.'));
        }
    };

    const openCreateTicketModal = async (prefillDate = null) => {
        if (!currentUserId) {
            setError('Khong xac dinh duoc nguoi dung hien tai de tao ticket.');
            return;
        }

        setShowCreateModal(true);
        setTicketError('');
        setTicketModalLoading(true);

        try {
            const { startDate, endDate } = getRange(calendarView, anchorDate);
            const [assignmentData, userRes] = await Promise.all([
                shiftService.getAssignments({
                    userId: currentUserId,
                    startDate: toDateInput(startDate),
                    endDate: toDateInput(endDate),
                }),
                userService.getAll({ page: 0, size: 100 }),
            ]);

            const usersPayload = Array.isArray(userRes?.content) ? userRes.content : (Array.isArray(userRes) ? userRes : []);
            const managers = usersPayload.filter((entry) => {
                const entryRoleName = String(entry?.role?.name || entry?.role || '').toUpperCase();
                return entryRoleName === 'ADMIN' || entryRoleName === 'ROLE_ADMIN' || entryRoleName === 'MANAGER' || entryRoleName === 'ROLE_MANAGER';
            });

            const rows = Array.isArray(assignmentData) ? assignmentData : [];
            setMyAssignments(rows);
            setManagerUsers(managers);

            const normalizedPrefillDate = prefillDate ? toDateInput(prefillDate) : null;
            const prefilledAssignment = normalizedPrefillDate
                ? rows.find((item) => item?.shiftDate === normalizedPrefillDate)
                : null;

            setTicketForm({
                ...defaultTicketForm,
                assignmentId: prefilledAssignment?.id ? String(prefilledAssignment.id) : '',
                assignedToUserId: managers[0]?.id ? String(managers[0].id) : '',
            });
        } catch (err) {
            setTicketError(extractErrorMessage(err, 'Khong the tai du lieu tao ticket.'));
            setMyAssignments([]);
            setManagerUsers([]);
        } finally {
            setTicketModalLoading(false);
        }
    };

    const assignmentOptions = useMemo(() => {
        const todayIso = new Date().toISOString().slice(0, 10);
        return myAssignments
            .filter((item) => String(item?.shiftDate || '') >= todayIso)
            .map((item) => ({
                value: String(item.id),
                label: `${item.shiftDate} - ${item.shift?.shiftName || item.shift?.shiftCode || 'Ca lam'}`,
            }));
    }, [myAssignments]);

    const targetUserOptions = useMemo(() => {
        return assignments
            .filter((item) => Number(item?.user?.id || 0) !== Number(currentUserId || 0))
            .reduce((acc, item) => {
                const id = String(item?.user?.id || '');
                if (!id || acc.some((entry) => entry.value === id)) {
                    return acc;
                }
                acc.push({
                    value: id,
                    label: item?.user?.fullName || item?.user?.email || `User #${id}`,
                });
                return acc;
            }, []);
    }, [assignments, currentUserId]);

    const managerOptions = useMemo(() => {
        return managerUsers.map((item) => ({
            value: String(item.id),
            label: item.fullName || item.email,
        }));
    }, [managerUsers]);

    const quickAssignUserOptions = useMemo(() => {
        return quickAssignUsers.map((item) => ({
            value: String(item.id),
            label: item.fullName || item.email || `User #${item.id}`,
        }));
    }, [quickAssignUsers]);

    const quickAssignShiftOptions = useMemo(() => {
        return quickAssignShifts.map((item) => ({
            value: String(item.id),
            label: `${item.shiftName || item.shiftCode || 'Ca lam'} (${formatTime(item.startTime)} - ${formatTime(item.endTime)})`,
        }));
    }, [quickAssignShifts]);

    const handleSubmitTicket = async (event) => {
        event.preventDefault();
        setTicketError('');

        if (!ticketForm.assignmentId) {
            setTicketError('Vui long chon ca can tao ticket.');
            return;
        }

        if (!ticketForm.assignedToUserId) {
            setTicketError('Vui long chon nguoi xu ly ticket.');
            return;
        }

        if (!ticketForm.reason.trim()) {
            setTicketError('Vui long nhap ly do ticket.');
            return;
        }

        if (ticketForm.ticketMode === 'SWAP' && !ticketForm.targetUserId) {
            setTicketError('Vui long chon nguoi doi ca.');
            return;
        }

        const selectedAssignment = myAssignments.find((item) => String(item.id) === String(ticketForm.assignmentId));
        if (!selectedAssignment) {
            setTicketError('Ca duoc chon khong hop le.');
            return;
        }

        try {
            setTicketSubmitting(true);
            if (ticketForm.ticketMode === 'SWAP') {
                await shiftTicketService.createShiftSwapTicket({
                    fromDate: selectedAssignment.shiftDate,
                    reason: ticketForm.reason.trim(),
                    requesterUserId: Number(currentUserId),
                    requesterAssignmentId: Number(ticketForm.assignmentId),
                    targetUserId: Number(ticketForm.targetUserId),
                    swapMode: 'TAKE_OVER',
                    assignedToUserId: Number(ticketForm.assignedToUserId),
                });
            } else {
                await shiftTicketService.createShiftCancelTicket({
                    shiftDate: selectedAssignment.shiftDate,
                    reason: ticketForm.reason.trim(),
                    assignmentId: Number(ticketForm.assignmentId),
                    assignedToUserId: Number(ticketForm.assignedToUserId),
                });
            }

            setShowCreateModal(false);
            setTicketForm(defaultTicketForm);
            setMessage('Da tao ticket thanh cong.');
        } catch (err) {
            setTicketError(extractErrorMessage(err, 'Khong the tao ticket.'));
        } finally {
            setTicketSubmitting(false);
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
                        <CalendarDays size={24} className="text-indigo-600" />
                        Lich lam viec chung
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Lich chung toan bo nhan su, gom check-in/check-out va trang thai tu dong.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            if (canQuickAssign) {
                                openCreateTicketModal();
                                return;
                            }

                            navigate('/hr/ticket-processing', {
                                state: {
                                    ticketPrefill: {
                                        prefillDate: toDateInput(anchorDate),
                                        prefillAssignmentId: '',
                                    },
                                },
                            });
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-300"
                    >
                        <Plus size={14} />
                        Tao ticket
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            {message && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {message}
                </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCalendarView('week')}
                            className={`rounded-lg px-3 py-2 text-xs font-medium ${calendarView === 'week' ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600'}`}
                        >
                            Tuan
                        </button>
                        <button
                            onClick={() => setCalendarView('month')}
                            className={`rounded-lg px-3 py-2 text-xs font-medium ${calendarView === 'month' ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600'}`}
                        >
                            Thang
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => shiftAnchor(calendarView, anchorDate, -1, setAnchorDate)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600"
                        >
                            <ChevronLeft size={14} /> Truoc
                        </button>
                        <div className="text-sm font-medium text-slate-700">{calendarLabel(calendarView, anchorDate)}</div>
                        <button
                            onClick={() => shiftAnchor(calendarView, anchorDate, 1, setAnchorDate)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600"
                        >
                            Sau <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-slate-500">Dang tai lich lam viec...</div>
            ) : calendarView === 'week' ? (
                <div className="grid grid-cols-7 gap-3">
                    {weekDays(anchorDate).map((date) => (
                        <CalendarColumn
                            key={date.toISOString()}
                            date={date}
                            assignments={assignmentsByDate[toDateInput(date)] || []}
                            attendanceMap={attendanceMap}
                            currentUserId={currentUserId}
                            onQuickCheckIn={handleQuickCheckIn}
                            onQuickCheckOut={handleQuickCheckOut}
                            canDeleteAssignments={canQuickAssign}
                            onDeleteAssignment={handleDeleteAssignment}
                            canUseDayPlus
                            onDayPlus={handleDayPlusClick}
                        />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-7 gap-3">
                    {monthDays(anchorDate).map((date) => (
                        <CalendarTile
                            key={date.toISOString()}
                            date={date}
                            inMonth={date.getMonth() === anchorDate.getMonth()}
                            assignments={assignmentsByDate[toDateInput(date)] || []}
                            attendanceMap={attendanceMap}
                            currentUserId={currentUserId}
                            onQuickCheckIn={handleQuickCheckIn}
                            onQuickCheckOut={handleQuickCheckOut}
                            canDeleteAssignments={canQuickAssign}
                            onDeleteAssignment={handleDeleteAssignment}
                            canUseDayPlus
                            onDayPlus={handleDayPlusClick}
                        />
                    ))}
                </div>
            )}

            {showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Phan ca nhanh</h2>
                                <p className="text-xs text-slate-500">Tao phan cong truc tiep ngay tren lich, khong can roi trang.</p>
                                <RequiredLegend />
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAssignModal(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitQuickAssign} className="p-6 space-y-4">
                            {assignError && (
                                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                                    {assignError}
                                </div>
                            )}

                            {assignModalLoading ? (
                                <div className="text-sm text-slate-500">Dang tai du lieu phan ca...</div>
                            ) : (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-600">Ngay lam viec <RequiredMark type="frontendAndBackend" /></label>
                                        <input
                                            type="date"
                                            value={assignForm.shiftDate}
                                            onChange={(event) => setAssignForm((prev) => ({ ...prev, shiftDate: event.target.value }))}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-600">Nhan vien <RequiredMark type="frontendAndBackend" /></label>
                                        <CustomSelect
                                            value={assignForm.userId}
                                            onChange={(value) => setAssignForm((prev) => ({ ...prev, userId: value }))}
                                            options={[
                                                { value: '', label: 'Chon nhan vien' },
                                                ...quickAssignUserOptions,
                                            ]}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-600">Ca lam <RequiredMark type="frontendAndBackend" /></label>
                                        <CustomSelect
                                            value={assignForm.shiftId}
                                            onChange={(value) => setAssignForm((prev) => ({ ...prev, shiftId: value }))}
                                            options={[
                                                { value: '', label: 'Chon ca' },
                                                ...quickAssignShiftOptions,
                                            ]}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-600">Ghi chu</label>
                                        <textarea
                                            value={assignForm.notes}
                                            onChange={(event) => setAssignForm((prev) => ({ ...prev, notes: event.target.value }))}
                                            className="min-h-[80px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                            placeholder="Ghi chu (neu can)"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAssignModal(false)}
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700"
                                >
                                    Huy
                                </button>
                                <button
                                    type="submit"
                                    disabled={assignSubmitting || assignModalLoading}
                                    className="rounded-lg border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                                >
                                    {assignSubmitting ? 'Dang luu...' : 'Phan ca'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Tao ticket tu lich lam viec</h2>
                                <p className="text-xs text-slate-500">Tao yeu cau doi ca/nghi ca ngay tai man hinh lich.</p>
                                <RequiredLegend />
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitTicket} className="p-6 space-y-4">
                            {ticketError && (
                                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                                    {ticketError}
                                </div>
                            )}

                            {ticketModalLoading ? (
                                <div className="text-sm text-slate-500">Dang tai du lieu tao ticket...</div>
                            ) : (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-600">Loai ticket <RequiredMark type="frontendOnly" /></label>
                                        <CustomSelect
                                            value={ticketForm.ticketMode}
                                            onChange={(value) => setTicketForm((prev) => ({ ...prev, ticketMode: value, targetUserId: '' }))}
                                            options={[
                                                { value: 'SWAP', label: 'Yeu cau doi ca' },
                                            ]}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-600">Ca can xu ly <RequiredMark type="frontendAndBackend" /></label>
                                        <CustomSelect
                                            value={ticketForm.assignmentId}
                                            onChange={(value) => setTicketForm((prev) => ({ ...prev, assignmentId: value }))}
                                            options={[
                                                { value: '', label: 'Chon ca' },
                                                ...assignmentOptions,
                                            ]}
                                        />
                                    </div>

                                    {ticketForm.ticketMode === 'SWAP' && (
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-600">Nguoi doi ca <RequiredMark type="frontendAndBackend" /></label>
                                            <CustomSelect
                                                value={ticketForm.targetUserId}
                                                onChange={(value) => setTicketForm((prev) => ({ ...prev, targetUserId: value }))}
                                                options={[
                                                    { value: '', label: 'Chon nhan vien' },
                                                    ...targetUserOptions,
                                                ]}
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-600">Nguoi tiep nhan <RequiredMark type="frontendOnly" /></label>
                                        <CustomSelect
                                            value={ticketForm.assignedToUserId}
                                            onChange={(value) => setTicketForm((prev) => ({ ...prev, assignedToUserId: value }))}
                                            options={[
                                                { value: '', label: 'Chon Manager/Admin' },
                                                ...managerOptions,
                                            ]}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-600">Ly do <RequiredMark type="frontendOnly" /></label>
                                        <textarea
                                            value={ticketForm.reason}
                                            onChange={(event) => setTicketForm((prev) => ({ ...prev, reason: event.target.value }))}
                                            className="min-h-[90px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                            placeholder="Nhap ly do yeu cau"
                                        />
                                    </div>
                                </>
                            )}

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
                                    disabled={ticketSubmitting || ticketModalLoading}
                                    className="rounded-lg border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                                >
                                    {ticketSubmitting ? 'Dang tao...' : 'Tao ticket'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const CalendarColumn = ({ date, assignments, attendanceMap, currentUserId, onQuickCheckIn, onQuickCheckOut, canDeleteAssignments, onDeleteAssignment, canUseDayPlus, onDayPlus }) => (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-2">
            <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">{weekdayLabel(date)}</p>
                <p className="text-lg font-semibold text-slate-900">{date.getDate()}</p>
            </div>
            {canUseDayPlus && (
                <button
                    type="button"
                    onClick={() => onDayPlus(date)}
                    className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white p-1.5 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                    title="Tao nhanh"
                >
                    <Plus size={12} />
                </button>
            )}
        </div>
        <div className="space-y-2">
            {assignments.map((item) => {
                const visual = resolveAssignmentVisualStatus(item, attendanceMap);
                const isMyAssignment = Number(item?.user?.id || 0) === Number(currentUserId || 0);

                return (
                    <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                        <div className="font-semibold text-slate-800">{item.user?.fullName || 'Unknown'}</div>
                        <div className="text-slate-500">
                            {item.shift?.shiftName} ({formatTime(item.shift?.startTime)} - {formatTime(item.shift?.endTime)})
                        </div>
                        <div className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${visual.badgeClass}`}>
                            {visual.label}
                        </div>
                        {isMyAssignment && visual.canCheckIn && (
                            <button
                                type="button"
                                onClick={() => onQuickCheckIn(item)}
                                className="mt-2 ml-2 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
                            >
                                <CheckCircle2 size={12} /> Cham vao
                            </button>
                        )}
                        {isMyAssignment && visual.canCheckOut && (
                            <button
                                type="button"
                                onClick={() => onQuickCheckOut(item)}
                                className="mt-2 ml-2 inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100"
                            >
                                <LogOut size={12} /> Cham ra
                            </button>
                        )}
                        {canDeleteAssignments && (
                            <button
                                type="button"
                                onClick={() => onDeleteAssignment(item)}
                                className="mt-2 ml-2 inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-100"
                            >
                                <Trash2 size={12} /> Xoa
                            </button>
                        )}
                    </div>
                );
            })}
            {assignments.length === 0 && <div className="text-xs text-slate-400">Khong co phan cong</div>}
        </div>
    </div>
);

const CalendarTile = ({ date, inMonth, assignments, attendanceMap, currentUserId, onQuickCheckIn, onQuickCheckOut, canDeleteAssignments, onDeleteAssignment, canUseDayPlus, onDayPlus }) => (
    <div className={`min-h-[140px] rounded-xl border border-slate-200 bg-white p-3 shadow-sm ${inMonth ? '' : 'opacity-50'}`}>
        <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900">{date.getDate()}</span>
            <div className="flex items-center gap-1">
                {canUseDayPlus && (
                    <button
                        type="button"
                        onClick={() => onDayPlus(date)}
                        className="inline-flex items-center justify-center rounded border border-slate-200 bg-white p-1 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                        title="Tao nhanh"
                    >
                        <Plus size={10} />
                    </button>
                )}
                <span className="text-[10px] uppercase tracking-wide text-slate-400">{weekdayLabel(date)}</span>
            </div>
        </div>
        <div className="mt-2 space-y-1">
            {assignments.slice(0, 3).map((item) => {
                const visual = resolveAssignmentVisualStatus(item, attendanceMap);
                const isMyAssignment = Number(item?.user?.id || 0) === Number(currentUserId || 0);

                return (
                    <div key={item.id} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-700">
                        <div>{item.shift?.shiftName} - {item.user?.fullName || 'Unknown'}</div>
                        <div className={`mt-1 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${visual.badgeClass}`}>
                            {visual.label}
                        </div>
                        {isMyAssignment && visual.canCheckIn && (
                            <button
                                type="button"
                                onClick={() => onQuickCheckIn(item)}
                                className="mt-1 ml-1 inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 hover:bg-emerald-100"
                            >
                                <CheckCircle2 size={10} /> Vao
                            </button>
                        )}
                        {isMyAssignment && visual.canCheckOut && (
                            <button
                                type="button"
                                onClick={() => onQuickCheckOut(item)}
                                className="mt-1 ml-1 inline-flex items-center gap-1 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 hover:bg-indigo-100"
                            >
                                <LogOut size={10} /> Ra
                            </button>
                        )}
                        {canDeleteAssignments && (
                            <button
                                type="button"
                                onClick={() => onDeleteAssignment(item)}
                                className="mt-1 ml-1 inline-flex items-center gap-1 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-700 hover:bg-rose-100"
                            >
                                <Trash2 size={10} /> Xoa
                            </button>
                        )}
                    </div>
                );
            })}
            {assignments.length > 3 && <div className="text-[11px] text-slate-400">+{assignments.length - 3} more</div>}
        </div>
    </div>
);

const resolveAssignmentVisualStatus = (assignment, attendanceMap, now = new Date()) => {
    const assignmentStatus = String(assignment?.status || '').toUpperCase();

    if (assignmentStatus === 'CANCELLED') {
        return { code: 'cancelled', label: 'Da huy', badgeClass: 'bg-slate-200 text-slate-700', canCheckIn: false, canCheckOut: false };
    }

    const attendance = attendanceMap[getAttendanceKey(assignment?.user?.id, assignment?.shiftDate)];
    const range = getAssignmentDateRange(assignment);

    if (!range) {
        return { code: 'pending', label: 'Cho xu ly', badgeClass: 'bg-sky-100 text-sky-700', canCheckIn: true, canCheckOut: false };
    }

    const lateThreshold = new Date(range.startAt);
    lateThreshold.setMinutes(lateThreshold.getMinutes() + LATE_GRACE_MINUTES);

    if (attendance?.status === 'ABSENT') {
        return { code: 'absent', label: 'Vang mat', badgeClass: 'bg-rose-100 text-rose-700', canCheckIn: false, canCheckOut: false };
    }

    if (attendance?.timeIn) {
        const checkInHm = String(attendance.timeIn).slice(0, 5);
        const checkInDateTime = combineDateTime(assignment.shiftDate, checkInHm);
        const isLate = checkInDateTime > lateThreshold;

        if (attendance?.timeOut) {
            return {
                code: isLate ? 'done_late' : 'done_ontime',
                label: isLate ? 'Hoan tat - vao tre' : 'Hoan tat - dung gio',
                badgeClass: isLate ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800',
                canCheckIn: false,
                canCheckOut: false,
            };
        }

        if (now > range.endAt) {
            return {
                code: 'checkout_missing',
                label: isLate ? 'Chua cham ra - vao tre' : 'Chua cham ra',
                badgeClass: 'bg-rose-100 text-rose-700',
                canCheckIn: false,
                canCheckOut: true,
            };
        }

        return {
            code: isLate ? 'working_late' : 'working_ontime',
            label: isLate ? 'Dang lam - vao tre' : 'Dang lam - dung gio',
            badgeClass: isLate ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800',
            canCheckIn: false,
            canCheckOut: true,
        };
    }

    if (now < range.startAt) {
        return { code: 'upcoming', label: 'Sap den ca', badgeClass: 'bg-indigo-100 text-indigo-700', canCheckIn: false, canCheckOut: false };
    }

    if (now >= range.startAt && now <= range.endAt) {
        if (now > lateThreshold) {
            return { code: 'late_waiting', label: 'Muon - chua cham vao', badgeClass: 'bg-amber-100 text-amber-800', canCheckIn: true, canCheckOut: false };
        }

        return { code: 'ontime_waiting', label: 'Trong ca - cho cham vao', badgeClass: 'bg-sky-100 text-sky-700', canCheckIn: true, canCheckOut: false };
    }

    return { code: 'absent', label: 'Vang mat', badgeClass: 'bg-rose-100 text-rose-700', canCheckIn: false, canCheckOut: false };
};

const resolveCheckInStatus = (assignment, hmValue) => {
    const range = getAssignmentDateRange(assignment);
    if (!range || !hmValue) {
        return 'PRESENT';
    }

    const lateThreshold = new Date(range.startAt);
    lateThreshold.setMinutes(lateThreshold.getMinutes() + LATE_GRACE_MINUTES);

    const checkInAt = combineDateTime(assignment.shiftDate, hmValue);
    return checkInAt > lateThreshold ? 'LATE' : 'PRESENT';
};

const getAssignmentDateRange = (assignment) => {
    const date = assignment?.shiftDate;
    const start = assignment?.shift?.startTime;
    const end = assignment?.shift?.endTime;

    if (!date || !start || !end) {
        return null;
    }

    const startAt = combineDateTime(date, start);
    const endAt = combineDateTime(date, end);

    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
        return null;
    }

    if (endAt <= startAt) {
        endAt.setDate(endAt.getDate() + 1);
    }

    return { startAt, endAt };
};

const combineDateTime = (dateValue, timeValue) => {
    const datePart = typeof dateValue === 'string' ? dateValue : toDateInput(dateValue);
    const timePart = String(timeValue || '').slice(0, 5);
    return new Date(`${datePart}T${timePart}:00`);
};

const indexAttendance = (rows) => {
    return rows.reduce((acc, row) => {
        const key = getAttendanceKey(row.userId, row.date);
        acc[key] = row;
        return acc;
    }, {});
};

const getAttendanceKey = (userId, date) => `${userId || ''}-${date || ''}`;

const getRange = (view, anchor) => {
    if (view === 'month') {
        const startDate = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
        const endDate = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
        return { startDate, endDate };
    }

    const startDate = startOfWeek(anchor);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return { startDate, endDate };
};

const startOfWeek = (date) => {
    const day = date.getDay();
    const diff = (day + 6) % 7;
    const start = new Date(date);
    start.setDate(date.getDate() - diff);
    return start;
};

const weekDays = (anchor) => {
    const start = startOfWeek(anchor);
    return Array.from({ length: 7 }, (_, index) => {
        const day = new Date(start);
        day.setDate(start.getDate() + index);
        return day;
    });
};

const monthDays = (anchor) => {
    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const start = startOfWeek(first);
    return Array.from({ length: 42 }, (_, index) => {
        const day = new Date(start);
        day.setDate(start.getDate() + index);
        return day;
    });
};

const calendarLabel = (view, anchor) => {
    if (view === 'month') {
        return anchor.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
    }
    const { startDate, endDate } = getRange('week', anchor);
    return `${startDate.toLocaleDateString('vi-VN')} - ${endDate.toLocaleDateString('vi-VN')}`;
};

const shiftAnchor = (view, anchor, direction, setAnchorDate) => {
    const next = new Date(anchor);
    if (view === 'month') {
        next.setMonth(anchor.getMonth() + direction);
    } else {
        next.setDate(anchor.getDate() + direction * 7);
    }
    setAnchorDate(next);
};

const toDateInput = (value) => {
    const date = value instanceof Date ? value : new Date(value);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const weekdayLabel = (date) => date.toLocaleDateString('vi-VN', { weekday: 'short' });

const formatTime = (value) => {
    if (!value) return '--:--';
    return value.toString().slice(0, 5);
};

const formatHourMinute = (date) => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

const extractErrorMessage = (error, fallback) => {
    const data = error?.response?.data;
    if (typeof data === 'string' && data.trim()) {
        return data;
    }
    if (typeof data?.message === 'string' && data.message.trim()) {
        return data.message;
    }
    return fallback;
};

export default ShiftCalendarPage;
