import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, CheckCircle2, Plus, X } from 'lucide-react';
import { shiftService } from '../../services/shiftService';
import { shiftTicketService } from '../../services/shiftTicketService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import CustomSelect from '../../components/common/CustomSelect';

const defaultTicketForm = {
    ticketMode: 'SWAP',
    assignmentId: '',
    targetUserId: '',
    assignedToUserId: '',
    reason: '',
};

const ShiftCalendarPage = () => {
    const { user } = useAuth();

    const role = String(user?.role || '').toUpperCase();
    const isAdmin = role === 'ADMIN' || role === 'ROLE_ADMIN';
    const isManager = role === 'MANAGER' || role === 'ROLE_MANAGER';

    const currentUserId = user?.id || user?.userId || null;

    const [calendarView, setCalendarView] = useState('week');
    const [anchorDate, setAnchorDate] = useState(new Date());
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [ticketForm, setTicketForm] = useState(defaultTicketForm);
    const [ticketSubmitting, setTicketSubmitting] = useState(false);
    const [ticketError, setTicketError] = useState('');
    const [ticketModalLoading, setTicketModalLoading] = useState(false);
    const [myAssignments, setMyAssignments] = useState([]);
    const [managerUsers, setManagerUsers] = useState([]);

    useEffect(() => {
        loadAssignments();
    }, [calendarView, anchorDate, currentUserId, isAdmin, isManager]);

    const loadAssignments = async () => {
        try {
            setLoading(true);
            const { startDate, endDate } = getRange(calendarView, anchorDate);
            const params = {
                startDate: toDateInput(startDate),
                endDate: toDateInput(endDate),
            };

            if (!isAdmin && !isManager && currentUserId) {
                params.userId = currentUserId;
            }

            const data = await shiftService.getAssignments(params);
            setAssignments(Array.isArray(data) ? data : []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải lịch làm việc.');
            setAssignments([]);
        } finally {
            setLoading(false);
        }
    };

    const assignmentsByDate = useMemo(() => {
        return assignments.reduce((acc, item) => {
            const key = item.shiftDate;
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});
    }, [assignments]);

    const handleQuickAttendance = async (assignment) => {
        try {
            const assignmentUserId = assignment?.user?.id;
            if (!assignmentUserId || !assignment?.shiftDate) {
                setError('Thiếu thông tin ca để chấm công.');
                return;
            }

            if (Number(assignmentUserId) !== Number(currentUserId)) {
                setError('Bạn chỉ có thể chấm công cho ca của chính mình.');
                return;
            }

            const now = new Date();
            const hh = String(now.getHours()).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');

            await shiftService.upsertAttendance({
                userId: assignmentUserId,
                date: assignment.shiftDate,
                timeIn: `${hh}:${mm}`,
                status: 'PRESENT',
            });

            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể chấm công từ lịch.');
        }
    };

    const openCreateTicketModal = async () => {
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
                const roleName = String(entry?.role?.name || entry?.role || '').toUpperCase();
                return roleName === 'ADMIN' || roleName === 'ROLE_ADMIN' || roleName === 'MANAGER' || roleName === 'ROLE_MANAGER';
            });

            const rows = Array.isArray(assignmentData) ? assignmentData : [];
            setMyAssignments(rows);
            setManagerUsers(managers);

            setTicketForm({
                ...defaultTicketForm,
                assignedToUserId: managers[0]?.id ? String(managers[0].id) : '',
            });
        } catch (err) {
            setTicketError(err.response?.data?.message || 'Khong the tai du lieu tao ticket.');
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
        } catch (err) {
            setTicketError(err.response?.data?.message || 'Khong the tao ticket.');
        } finally {
            setTicketSubmitting(false);
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                        <CalendarDays size={24} className="text-indigo-600" />
                        Lịch làm việc
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Trang lịch ca riêng, tách biệt khỏi quản lý ca.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={openCreateTicketModal}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-300"
                    >
                        <Plus size={14} />
                        Tạo ticket
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCalendarView('week')}
                            className={`rounded-lg px-3 py-2 text-xs font-medium ${calendarView === 'week' ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600'}`}
                        >
                            Tuần
                        </button>
                        <button
                            onClick={() => setCalendarView('month')}
                            className={`rounded-lg px-3 py-2 text-xs font-medium ${calendarView === 'month' ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600'}`}
                        >
                            Tháng
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => shiftAnchor(calendarView, anchorDate, -1, setAnchorDate)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600"
                        >
                            <ChevronLeft size={14} /> Trước
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
                <div className="text-slate-500">Đang tải lịch làm việc...</div>
            ) : calendarView === 'week' ? (
                <div className="grid grid-cols-7 gap-3">
                    {weekDays(anchorDate).map((date) => (
                        <CalendarColumn
                            key={date.toISOString()}
                            date={date}
                            assignments={assignmentsByDate[toDateInput(date)] || []}
                            onQuickAttendance={handleQuickAttendance}
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
                            onQuickAttendance={handleQuickAttendance}
                        />
                    ))}
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Tao ticket tu lich lam viec</h2>
                                <p className="text-xs text-slate-500">Tao yeu cau doi ca/nghi ca ngay tai man hinh lich.</p>
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
                                        <label className="text-xs font-medium text-slate-600">Loai ticket</label>
                                        <CustomSelect
                                            value={ticketForm.ticketMode}
                                            onChange={(value) => setTicketForm((prev) => ({ ...prev, ticketMode: value, targetUserId: '' }))}
                                            options={[
                                                { value: 'SWAP', label: 'Yeu cau doi ca' },
                                                { value: 'CANCEL', label: 'Yeu cau nghi ca' },
                                            ]}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-600">Ca can xu ly</label>
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
                                            <label className="text-xs font-medium text-slate-600">Nguoi doi ca</label>
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
                                        <label className="text-xs font-medium text-slate-600">Nguoi tiep nhan</label>
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
                                        <label className="text-xs font-medium text-slate-600">Ly do</label>
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

const CalendarColumn = ({ date, assignments, onQuickAttendance }) => (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-3">
            <p className="text-xs uppercase tracking-wide text-slate-400">{weekdayLabel(date)}</p>
            <p className="text-lg font-semibold text-slate-900">{date.getDate()}</p>
        </div>
        <div className="space-y-2">
            {assignments.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                    <div className="font-semibold text-slate-800">{item.user?.fullName || 'Unknown'}</div>
                    <div className="text-slate-500">
                        {item.shift?.shiftName} ({formatTime(item.shift?.startTime)} - {formatTime(item.shift?.endTime)})
                    </div>
                    <button
                        type="button"
                        onClick={() => onQuickAttendance(item)}
                        className="mt-2 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                        <CheckCircle2 size={12} /> Chấm công
                    </button>
                </div>
            ))}
            {assignments.length === 0 && <div className="text-xs text-slate-400">Không có phân công</div>}
        </div>
    </div>
);

const CalendarTile = ({ date, inMonth, assignments, onQuickAttendance }) => (
    <div className={`min-h-[140px] rounded-xl border border-slate-200 bg-white p-3 shadow-sm ${inMonth ? '' : 'opacity-50'}`}>
        <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900">{date.getDate()}</span>
            <span className="text-[10px] uppercase tracking-wide text-slate-400">{weekdayLabel(date)}</span>
        </div>
        <div className="mt-2 space-y-1">
            {assignments.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-700">
                    <div>{item.shift?.shiftName} - {item.user?.fullName || 'Unknown'}</div>
                    <button
                        type="button"
                        onClick={() => onQuickAttendance(item)}
                        className="mt-1 inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                        <CheckCircle2 size={10} /> Chấm công
                    </button>
                </div>
            ))}
            {assignments.length > 3 && <div className="text-[11px] text-slate-400">+{assignments.length - 3} more</div>}
        </div>
    </div>
);

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

export default ShiftCalendarPage;
