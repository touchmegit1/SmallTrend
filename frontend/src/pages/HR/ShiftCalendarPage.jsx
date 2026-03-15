import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { shiftService } from '../../services/shiftService';
import { useAuth } from '../../context/AuthContext';

const ShiftCalendarPage = () => {
    const navigate = useNavigate();
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
                        onClick={() => navigate('/hr/shift-tickets')}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-300"
                    >
                        Ticket đổi ca
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
