import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Plus, Search, X, Pencil, Trash2, Users } from 'lucide-react';
import api from '../../config/axiosConfig';
import { shiftService } from '../../services/shiftService';

const defaultShiftForm = {
    shiftCode: '',
    shiftName: '',
    startTime: '',
    endTime: '',
    breakStartTime: '',
    breakEndTime: '',
    shiftType: 'REGULAR',
    overtimeMultiplier: '1.0',
    nightShiftBonus: '0',
    weekendBonus: '0',
    holidayBonus: '0',
    minimumStaffRequired: '',
    maximumStaffAllowed: '',
    allowEarlyClockIn: false,
    allowLateClockOut: false,
    earlyClockInMinutes: '',
    lateClockOutMinutes: '',
    gracePeriodMinutes: '',
    status: 'ACTIVE',
    requiresApproval: false,
    description: '',
};

const defaultAssignmentForm = {
    workShiftId: '',
    userId: '',
    shiftDate: '',
    status: 'ASSIGNED',
    notes: '',
};

const ShiftManagement = () => {
    const [activeTab, setActiveTab] = useState('shifts');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [shifts, setShifts] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [users, setUsers] = useState([]);

    const [shiftQuery, setShiftQuery] = useState('');
    const [shiftStatus, setShiftStatus] = useState('all');

    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
    const [editingShift, setEditingShift] = useState(null);
    const [shiftForm, setShiftForm] = useState(defaultShiftForm);

    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [assignmentForm, setAssignmentForm] = useState(defaultAssignmentForm);

    const [calendarView, setCalendarView] = useState('week');
    const [anchorDate, setAnchorDate] = useState(new Date());
    const [assignmentFilters, setAssignmentFilters] = useState({ userId: '', shiftId: '' });

    useEffect(() => {
        const init = async () => {
            await Promise.all([loadShifts(), loadUsers()]);
            setLoading(false);
        };
        init();
    }, []);

    useEffect(() => {
        loadShifts();
    }, [shiftQuery, shiftStatus]);

    useEffect(() => {
        if (activeTab === 'assignments' || activeTab === 'calendar') {
            loadAssignments();
        }
    }, [activeTab, calendarView, anchorDate, assignmentFilters]);

    const loadShifts = async () => {
        try {
            const params = {};
            if (shiftQuery.trim()) params.query = shiftQuery.trim();
            if (shiftStatus !== 'all') params.status = shiftStatus;
            const data = await shiftService.getShifts(params);
            setShifts(Array.isArray(data) ? data : []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load shifts');
        }
    };

    const loadUsers = async () => {
        try {
            const res = await api.get('/users', { params: { page: 0, size: 200 } });
            const payload = res.data?.content ? res.data.content : res.data;
            setUsers(Array.isArray(payload) ? payload : []);
        } catch (err) {
            setUsers([]);
        }
    };

    const loadAssignments = async () => {
        try {
            const { startDate, endDate } = getRange(calendarView, anchorDate);
            const params = {
                startDate: toDateInput(startDate),
                endDate: toDateInput(endDate),
            };
            if (assignmentFilters.userId) params.userId = assignmentFilters.userId;
            if (assignmentFilters.shiftId) params.shiftId = assignmentFilters.shiftId;
            const data = await shiftService.getAssignments(params);
            setAssignments(Array.isArray(data) ? data : []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load assignments');
        }
    };

    const openShiftModal = (shift = null) => {
        setEditingShift(shift);
        if (shift) {
            setShiftForm({
                shiftCode: shift.shiftCode || '',
                shiftName: shift.shiftName || '',
                startTime: toTimeInput(shift.startTime),
                endTime: toTimeInput(shift.endTime),
                breakStartTime: toTimeInput(shift.breakStartTime),
                breakEndTime: toTimeInput(shift.breakEndTime),
                shiftType: shift.shiftType || 'REGULAR',
                overtimeMultiplier: shift.overtimeMultiplier ?? '1.0',
                nightShiftBonus: shift.nightShiftBonus ?? '0',
                weekendBonus: shift.weekendBonus ?? '0',
                holidayBonus: shift.holidayBonus ?? '0',
                minimumStaffRequired: shift.minimumStaffRequired ?? '',
                maximumStaffAllowed: shift.maximumStaffAllowed ?? '',
                allowEarlyClockIn: !!shift.allowEarlyClockIn,
                allowLateClockOut: !!shift.allowLateClockOut,
                earlyClockInMinutes: shift.earlyClockInMinutes ?? '',
                lateClockOutMinutes: shift.lateClockOutMinutes ?? '',
                gracePeriodMinutes: shift.gracePeriodMinutes ?? '',
                status: shift.status || 'ACTIVE',
                requiresApproval: !!shift.requiresApproval,
                description: shift.description || '',
            });
        } else {
            setShiftForm(defaultShiftForm);
        }
        setIsShiftModalOpen(true);
    };

    const openAssignmentModal = (assignment = null) => {
        setEditingAssignment(assignment);
        if (assignment) {
            setAssignmentForm({
                workShiftId: assignment.shift?.id || '',
                userId: assignment.user?.id || '',
                shiftDate: assignment.shiftDate || '',
                status: assignment.status || 'ASSIGNED',
                notes: assignment.notes || '',
            });
        } else {
            setAssignmentForm(defaultAssignmentForm);
        }
        setIsAssignmentModalOpen(true);
    };

    const handleShiftSubmit = async (event) => {
        event.preventDefault();
        try {
            const payload = buildShiftPayload(shiftForm);
            if (editingShift) {
                await shiftService.updateShift(editingShift.id, payload);
            } else {
                await shiftService.createShift(payload);
            }
            setIsShiftModalOpen(false);
            await loadShifts();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save shift');
        }
    };

    const handleAssignmentSubmit = async (event) => {
        event.preventDefault();
        try {
            const payload = buildAssignmentPayload(assignmentForm);
            if (editingAssignment) {
                await shiftService.updateAssignment(editingAssignment.id, payload);
            } else {
                await shiftService.createAssignment(payload);
            }
            setIsAssignmentModalOpen(false);
            await loadAssignments();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save assignment');
        }
    };

    const handleDeleteShift = async (shiftId) => {
        if (!window.confirm('Delete this shift?')) return;
        try {
            await shiftService.deleteShift(shiftId);
            await loadShifts();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete shift');
        }
    };

    const handleDeleteAssignment = async (assignmentId) => {
        if (!window.confirm('Delete this assignment?')) return;
        try {
            await shiftService.deleteAssignment(assignmentId);
            await loadAssignments();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete assignment');
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh] text-slate-500">
                Loading shift center...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Shift Center</h1>
                    <p className="text-sm text-slate-500 mt-1">Shifts, assignments, and weekly planning in one place.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => openShiftModal()}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                        <Plus size={16} />
                        New shift
                    </button>
                    <button
                        onClick={() => openAssignmentModal()}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-300"
                    >
                        <Users size={16} />
                        Assign staff
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
                {['shifts', 'assignments', 'calendar'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                            activeTab === tab
                                ? 'bg-slate-900 text-white'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        {tab === 'shifts' ? 'Shift templates' : tab === 'assignments' ? 'Assignments' : 'Calendar'}
                    </button>
                ))}
            </div>

            {activeTab === 'shifts' && (
                <section className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={shiftQuery}
                                onChange={(event) => setShiftQuery(event.target.value)}
                                placeholder="Search shift name or code"
                                className="w-64 rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                            />
                        </div>
                        <select
                            value={shiftStatus}
                            onChange={(event) => setShiftStatus(event.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        >
                            <option value="all">All status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                        {shifts.map((shift) => (
                            <div key={shift.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-slate-400">{shift.shiftCode}</p>
                                        <h3 className="text-lg font-semibold text-slate-900">{shift.shiftName}</h3>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                                        </p>
                                    </div>
                                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                        shift.status === 'ACTIVE'
                                            ? 'bg-slate-900 text-white'
                                            : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        {shift.status}
                                    </span>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500">
                                    <div>Type: {shift.shiftType || 'REGULAR'}</div>
                                    <div>Staff: {shift.minimumStaffRequired ?? '-'} / {shift.maximumStaffAllowed ?? '-'}</div>
                                    <div>Break: {formatTime(shift.breakStartTime)} - {formatTime(shift.breakEndTime)}</div>
                                    <div>Approval: {shift.requiresApproval ? 'Yes' : 'No'}</div>
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <button
                                        onClick={() => openShiftModal(shift)}
                                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:border-slate-300"
                                    >
                                        <Pencil size={14} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteShift(shift.id)}
                                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-rose-600 hover:border-rose-200"
                                    >
                                        <Trash2 size={14} />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                        {shifts.length === 0 && (
                            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                                No shift templates yet.
                            </div>
                        )}
                    </div>
                </section>
            )}

            {activeTab === 'assignments' && (
                <section className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={assignmentFilters.userId}
                            onChange={(event) => setAssignmentFilters((prev) => ({ ...prev, userId: event.target.value }))}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        >
                            <option value="">All staff</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>{user.fullName || user.email}</option>
                            ))}
                        </select>
                        <select
                            value={assignmentFilters.shiftId}
                            onChange={(event) => setAssignmentFilters((prev) => ({ ...prev, shiftId: event.target.value }))}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        >
                            <option value="">All shifts</option>
                            {shifts.map((shift) => (
                                <option key={shift.id} value={shift.id}>{shift.shiftName}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => openAssignmentModal()}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-900 bg-slate-900 px-4 py-2 text-xs font-medium text-white"
                        >
                            <Plus size={14} />
                            New assignment
                        </button>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="grid grid-cols-12 gap-2 border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            <div className="col-span-2">Date</div>
                            <div className="col-span-3">Staff</div>
                            <div className="col-span-3">Shift</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-2">Actions</div>
                        </div>
                        {assignments.map((assignment) => (
                            <div key={assignment.id} className="grid grid-cols-12 gap-2 px-4 py-3 text-sm text-slate-700 border-b border-slate-100">
                                <div className="col-span-2">{formatDate(assignment.shiftDate)}</div>
                                <div className="col-span-3">
                                    <div className="font-medium text-slate-900">{assignment.user?.fullName || 'Unknown'}</div>
                                    <div className="text-xs text-slate-400">{assignment.user?.email || ''}</div>
                                </div>
                                <div className="col-span-3">
                                    <div className="font-medium text-slate-900">{assignment.shift?.shiftName}</div>
                                    <div className="text-xs text-slate-400">
                                        {formatTime(assignment.shift?.startTime)} - {formatTime(assignment.shift?.endTime)}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                                        {assignment.status}
                                    </span>
                                </div>
                                <div className="col-span-2 flex gap-2">
                                    <button
                                        onClick={() => openAssignmentModal(assignment)}
                                        className="text-xs font-medium text-slate-600 hover:text-slate-900"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAssignment(assignment.id)}
                                        className="text-xs font-medium text-rose-600 hover:text-rose-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                        {assignments.length === 0 && (
                            <div className="px-4 py-6 text-sm text-slate-500">No assignments for this range.</div>
                        )}
                    </div>
                </section>
            )}

            {activeTab === 'calendar' && (
                <section className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCalendarView('week')}
                                className={`rounded-lg px-3 py-2 text-xs font-medium ${
                                    calendarView === 'week' ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600'
                                }`}
                            >
                                Week
                            </button>
                            <button
                                onClick={() => setCalendarView('month')}
                                className={`rounded-lg px-3 py-2 text-xs font-medium ${
                                    calendarView === 'month' ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600'
                                }`}
                            >
                                Month
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => shiftAnchor(calendarView, anchorDate, -1, setAnchorDate)}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600"
                            >
                                Prev
                            </button>
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <CalendarDays size={16} />
                                {calendarLabel(calendarView, anchorDate)}
                            </div>
                            <button
                                onClick={() => shiftAnchor(calendarView, anchorDate, 1, setAnchorDate)}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600"
                            >
                                Next
                            </button>
                        </div>
                    </div>

                    {calendarView === 'week' ? (
                        <div className="grid grid-cols-7 gap-3">
                            {weekDays(anchorDate).map((date) => (
                                <CalendarColumn
                                    key={date.toISOString()}
                                    date={date}
                                    assignments={assignmentsByDate[toDateInput(date)] || []}
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
                                />
                            ))}
                        </div>
                    )}
                </section>
            )}

            {isShiftModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    {editingShift ? 'Edit shift' : 'Create shift'}
                                </h2>
                                <p className="text-xs text-slate-500">Define time ranges, staff limits, and policy.</p>
                            </div>
                            <button onClick={() => setIsShiftModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleShiftSubmit} className="p-6 space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <input
                                    value={shiftForm.shiftCode}
                                    onChange={(event) => setShiftForm({ ...shiftForm, shiftCode: event.target.value })}
                                    placeholder="Shift code"
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    required
                                />
                                <input
                                    value={shiftForm.shiftName}
                                    onChange={(event) => setShiftForm({ ...shiftForm, shiftName: event.target.value })}
                                    placeholder="Shift name"
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    required
                                />
                                <input
                                    type="time"
                                    value={shiftForm.startTime}
                                    onChange={(event) => setShiftForm({ ...shiftForm, startTime: event.target.value })}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    required
                                />
                                <input
                                    type="time"
                                    value={shiftForm.endTime}
                                    onChange={(event) => setShiftForm({ ...shiftForm, endTime: event.target.value })}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    required
                                />
                                <input
                                    type="time"
                                    value={shiftForm.breakStartTime}
                                    onChange={(event) => setShiftForm({ ...shiftForm, breakStartTime: event.target.value })}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                />
                                <input
                                    type="time"
                                    value={shiftForm.breakEndTime}
                                    onChange={(event) => setShiftForm({ ...shiftForm, breakEndTime: event.target.value })}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                />
                                <select
                                    value={shiftForm.shiftType}
                                    onChange={(event) => setShiftForm({ ...shiftForm, shiftType: event.target.value })}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                >
                                    <option value="REGULAR">Regular</option>
                                    <option value="WEEKEND">Weekend</option>
                                    <option value="HOLIDAY">Holiday</option>
                                    <option value="NIGHT">Night</option>
                                </select>
                                <select
                                    value={shiftForm.status}
                                    onChange={(event) => setShiftForm({ ...shiftForm, status: event.target.value })}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <input
                                    type="number"
                                    value={shiftForm.minimumStaffRequired}
                                    onChange={(event) => setShiftForm({ ...shiftForm, minimumStaffRequired: event.target.value })}
                                    placeholder="Min staff"
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                />
                                <input
                                    type="number"
                                    value={shiftForm.maximumStaffAllowed}
                                    onChange={(event) => setShiftForm({ ...shiftForm, maximumStaffAllowed: event.target.value })}
                                    placeholder="Max staff"
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                />
                                <input
                                    type="number"
                                    value={shiftForm.gracePeriodMinutes}
                                    onChange={(event) => setShiftForm({ ...shiftForm, gracePeriodMinutes: event.target.value })}
                                    placeholder="Grace period (min)"
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <input
                                    type="number"
                                    step="0.1"
                                    value={shiftForm.overtimeMultiplier}
                                    onChange={(event) => setShiftForm({ ...shiftForm, overtimeMultiplier: event.target.value })}
                                    placeholder="Overtime x"
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                />
                                <input
                                    type="number"
                                    step="0.1"
                                    value={shiftForm.nightShiftBonus}
                                    onChange={(event) => setShiftForm({ ...shiftForm, nightShiftBonus: event.target.value })}
                                    placeholder="Night bonus %"
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                />
                                <input
                                    type="number"
                                    step="0.1"
                                    value={shiftForm.weekendBonus}
                                    onChange={(event) => setShiftForm({ ...shiftForm, weekendBonus: event.target.value })}
                                    placeholder="Weekend bonus %"
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <input
                                    type="number"
                                    step="0.1"
                                    value={shiftForm.holidayBonus}
                                    onChange={(event) => setShiftForm({ ...shiftForm, holidayBonus: event.target.value })}
                                    placeholder="Holiday bonus %"
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                />
                                <input
                                    type="number"
                                    value={shiftForm.earlyClockInMinutes}
                                    onChange={(event) => setShiftForm({ ...shiftForm, earlyClockInMinutes: event.target.value })}
                                    placeholder="Early clock-in (min)"
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                />
                                <input
                                    type="number"
                                    value={shiftForm.lateClockOutMinutes}
                                    onChange={(event) => setShiftForm({ ...shiftForm, lateClockOutMinutes: event.target.value })}
                                    placeholder="Late clock-out (min)"
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <label className="flex items-center gap-2 text-sm text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={shiftForm.allowEarlyClockIn}
                                        onChange={(event) => setShiftForm({ ...shiftForm, allowEarlyClockIn: event.target.checked })}
                                    />
                                    Allow early clock-in
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={shiftForm.allowLateClockOut}
                                        onChange={(event) => setShiftForm({ ...shiftForm, allowLateClockOut: event.target.checked })}
                                    />
                                    Allow late clock-out
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={shiftForm.requiresApproval}
                                        onChange={(event) => setShiftForm({ ...shiftForm, requiresApproval: event.target.checked })}
                                    />
                                    Requires approval
                                </label>
                            </div>

                            <textarea
                                value={shiftForm.description}
                                onChange={(event) => setShiftForm({ ...shiftForm, description: event.target.value })}
                                placeholder="Notes"
                                className="min-h-[90px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsShiftModalOpen(false)}
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-lg border border-slate-900 bg-slate-900 px-4 py-2 text-sm text-white"
                                >
                                    Save shift
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isAssignmentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    {editingAssignment ? 'Edit assignment' : 'Create assignment'}
                                </h2>
                                <p className="text-xs text-slate-500">Assign staff to a shift and date.</p>
                            </div>
                            <button onClick={() => setIsAssignmentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleAssignmentSubmit} className="p-6 space-y-4">
                            <select
                                value={assignmentForm.workShiftId}
                                onChange={(event) => setAssignmentForm({ ...assignmentForm, workShiftId: event.target.value })}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                required
                            >
                                <option value="">Select shift</option>
                                {shifts.map((shift) => (
                                    <option key={shift.id} value={shift.id}>
                                        {shift.shiftName} ({formatTime(shift.startTime)} - {formatTime(shift.endTime)})
                                    </option>
                                ))}
                            </select>
                            <select
                                value={assignmentForm.userId}
                                onChange={(event) => setAssignmentForm({ ...assignmentForm, userId: event.target.value })}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                required
                            >
                                <option value="">Select staff</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.fullName || user.email}
                                    </option>
                                ))}
                            </select>
                            <div className="grid gap-4 md:grid-cols-2">
                                <input
                                    type="date"
                                    value={assignmentForm.shiftDate}
                                    onChange={(event) => setAssignmentForm({ ...assignmentForm, shiftDate: event.target.value })}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    required
                                />
                                <select
                                    value={assignmentForm.status}
                                    onChange={(event) => setAssignmentForm({ ...assignmentForm, status: event.target.value })}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                >
                                    <option value="ASSIGNED">Assigned</option>
                                    <option value="CONFIRMED">Confirmed</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>
                            <textarea
                                value={assignmentForm.notes}
                                onChange={(event) => setAssignmentForm({ ...assignmentForm, notes: event.target.value })}
                                placeholder="Notes"
                                className="min-h-[80px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAssignmentModalOpen(false)}
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-lg border border-slate-900 bg-slate-900 px-4 py-2 text-sm text-white"
                                >
                                    Save assignment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const CalendarColumn = ({ date, assignments }) => {
    return (
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
                    </div>
                ))}
                {assignments.length === 0 && (
                    <div className="text-xs text-slate-400">No assignments</div>
                )}
            </div>
        </div>
    );
};

const CalendarTile = ({ date, inMonth, assignments }) => {
    return (
        <div className={`min-h-[140px] rounded-xl border border-slate-200 bg-white p-3 shadow-sm ${
            inMonth ? '' : 'opacity-50'
        }`}>
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">{date.getDate()}</span>
                <span className="text-[10px] uppercase tracking-wide text-slate-400">{weekdayLabel(date)}</span>
            </div>
            <div className="mt-2 space-y-1">
                {assignments.slice(0, 3).map((item) => (
                    <div key={item.id} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-700">
                        {item.shift?.shiftName} - {item.user?.fullName || 'Unknown'}
                    </div>
                ))}
                {assignments.length > 3 && (
                    <div className="text-[11px] text-slate-400">+{assignments.length - 3} more</div>
                )}
            </div>
        </div>
    );
};

const weekdayLabel = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
};

const formatTime = (value) => {
    if (!value) return '--:--';
    return value.toString().slice(0, 5);
};

const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('en-GB');
};

const toTimeInput = (value) => {
    if (!value) return '';
    return value.toString().slice(0, 5);
};

const toDateInput = (value) => {
    const date = value instanceof Date ? value : new Date(value);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const buildShiftPayload = (form) => ({
    shiftCode: form.shiftCode.trim(),
    shiftName: form.shiftName.trim(),
    startTime: form.startTime || null,
    endTime: form.endTime || null,
    breakStartTime: form.breakStartTime || null,
    breakEndTime: form.breakEndTime || null,
    shiftType: form.shiftType,
    overtimeMultiplier: form.overtimeMultiplier !== '' ? Number(form.overtimeMultiplier) : null,
    nightShiftBonus: form.nightShiftBonus !== '' ? Number(form.nightShiftBonus) : null,
    weekendBonus: form.weekendBonus !== '' ? Number(form.weekendBonus) : null,
    holidayBonus: form.holidayBonus !== '' ? Number(form.holidayBonus) : null,
    minimumStaffRequired: form.minimumStaffRequired !== '' ? Number(form.minimumStaffRequired) : null,
    maximumStaffAllowed: form.maximumStaffAllowed !== '' ? Number(form.maximumStaffAllowed) : null,
    allowEarlyClockIn: form.allowEarlyClockIn,
    allowLateClockOut: form.allowLateClockOut,
    earlyClockInMinutes: form.earlyClockInMinutes !== '' ? Number(form.earlyClockInMinutes) : null,
    lateClockOutMinutes: form.lateClockOutMinutes !== '' ? Number(form.lateClockOutMinutes) : null,
    gracePeriodMinutes: form.gracePeriodMinutes !== '' ? Number(form.gracePeriodMinutes) : null,
    status: form.status,
    requiresApproval: form.requiresApproval,
    description: form.description || null,
});

const buildAssignmentPayload = (form) => ({
    workShiftId: form.workShiftId ? Number(form.workShiftId) : null,
    userId: form.userId ? Number(form.userId) : null,
    shiftDate: form.shiftDate || null,
    status: form.status,
    notes: form.notes || null,
});

const getRange = (view, anchor) => {
    if (view === 'month') {
        const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
        const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
        return { startDate: start, endDate: end };
    }
    const start = startOfWeek(anchor);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { startDate: start, endDate: end };
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
        return anchor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    const { startDate, endDate } = getRange('week', anchor);
    return `${startDate.toLocaleDateString('en-GB')} - ${endDate.toLocaleDateString('en-GB')}`;
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

export default ShiftManagement;
