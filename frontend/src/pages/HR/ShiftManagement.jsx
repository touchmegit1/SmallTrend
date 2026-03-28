import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, X, Pencil, Trash2, Users, UserPlus, CalendarRange } from 'lucide-react';
import api from '../../config/axiosConfig';
import { shiftService } from '../../services/shiftService';
import { shiftTicketService } from '../../services/shiftTicketService';
import CustomSelect from '../../components/common/CustomSelect';
import { useLocation, useNavigate } from 'react-router-dom';

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
    effectiveFrom: '',
    effectiveTo: '',
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

const shiftTypePresets = {
    REGULAR: {
        overtimeMultiplier: '1.0',
        nightShiftBonus: '0',
        weekendBonus: '0',
        holidayBonus: '0',
        allowEarlyClockIn: true,
        allowLateClockOut: true,
        earlyClockInMinutes: '15',
        lateClockOutMinutes: '30',
        requiresApproval: false,
        gracePeriodMinutes: '10',
    },
    NIGHT: {
        overtimeMultiplier: '1.5',
        nightShiftBonus: '15',
        weekendBonus: '0',
        holidayBonus: '0',
        allowEarlyClockIn: true,
        allowLateClockOut: true,
        earlyClockInMinutes: '10',
        lateClockOutMinutes: '20',
        requiresApproval: false,
        gracePeriodMinutes: '5',
    },
    WEEKEND: {
        overtimeMultiplier: '2.0',
        nightShiftBonus: '0',
        weekendBonus: '20',
        holidayBonus: '0',
        allowEarlyClockIn: true,
        allowLateClockOut: true,
        earlyClockInMinutes: '15',
        lateClockOutMinutes: '30',
        requiresApproval: true,
        gracePeriodMinutes: '10',
    },
    HOLIDAY: {
        overtimeMultiplier: '2.5',
        nightShiftBonus: '0',
        weekendBonus: '0',
        holidayBonus: '30',
        allowEarlyClockIn: true,
        allowLateClockOut: true,
        earlyClockInMinutes: '15',
        lateClockOutMinutes: '30',
        requiresApproval: true,
        gracePeriodMinutes: '10',
    },
    TEMPORARY: {
        overtimeMultiplier: '1.0',
        nightShiftBonus: '0',
        weekendBonus: '0',
        holidayBonus: '0',
        allowEarlyClockIn: true,
        allowLateClockOut: true,
        earlyClockInMinutes: '15',
        lateClockOutMinutes: '30',
        requiresApproval: false,
        gracePeriodMinutes: '10',
    },
};

const ShiftManagement = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('shifts');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [shifts, setShifts] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [users, setUsers] = useState([]);

    const [shiftQuery, setShiftQuery] = useState('');
    const [shiftStatus, setShiftStatus] = useState('all');
    const [includeExpiredShifts, setIncludeExpiredShifts] = useState(false);

    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
    const [editingShift, setEditingShift] = useState(null);
    const [shiftForm, setShiftForm] = useState(defaultShiftForm);
    const [shiftFormErrors, setShiftFormErrors] = useState({});
    const [showAdvancedShiftOptions, setShowAdvancedShiftOptions] = useState(false);

    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [assignmentForm, setAssignmentForm] = useState(defaultAssignmentForm);
    const [assignmentFormErrors, setAssignmentFormErrors] = useState({});

    const [assignmentFilters, setAssignmentFilters] = useState({ userId: '', shiftId: '' });
    const [processingTicket, setProcessingTicket] = useState(null);

    const shiftDurationPreview = useMemo(
        () => calculateShiftDurationPreview(shiftForm.startTime, shiftForm.endTime, shiftForm.breakStartTime, shiftForm.breakEndTime),
        [shiftForm.startTime, shiftForm.endTime, shiftForm.breakStartTime, shiftForm.breakEndTime]
    );

    const assignmentShiftOptions = useMemo(() => {
        const options = shifts.map((shift) => ({
            value: String(shift.id),
            label: `${shift.shiftName} (${formatTime(shift.startTime)} - ${formatTime(shift.endTime)})`,
        }));

        const editingShiftId = editingAssignment?.shift?.id;
        if (editingShiftId && !options.some((option) => option.value === String(editingShiftId))) {
            options.push({
                value: String(editingShiftId),
                label: `${editingAssignment?.shift?.shiftName || editingAssignment?.shift?.shiftCode || 'Ca làm'} (${formatTime(editingAssignment?.shift?.startTime)} - ${formatTime(editingAssignment?.shift?.endTime)})`,
            });
        }

        return options;
    }, [shifts, editingAssignment]);

    const assignmentUserOptions = useMemo(() => {
        const options = users.map((item) => ({
            value: String(item.id),
            label: item.fullName || item.email,
        }));

        const editingUserId = editingAssignment?.user?.id;
        if (editingUserId && !options.some((option) => option.value === String(editingUserId))) {
            options.push({
                value: String(editingUserId),
                label: editingAssignment?.user?.fullName || editingAssignment?.user?.email || `User #${editingUserId}`,
            });
        }

        return options;
    }, [users, editingAssignment]);

    useEffect(() => {
        const init = async () => {
            await Promise.all([loadShifts(), loadUsers()]);
            setLoading(false);
        };
        init();
    }, []);

    useEffect(() => {
        loadShifts();
    }, [shiftQuery, shiftStatus, includeExpiredShifts]);

    useEffect(() => {
        if (activeTab === 'assignments') {
            loadAssignments();
        }
    }, [activeTab, assignmentFilters]);

    useEffect(() => {
        const context = location.state?.ticketContext;
        if (!context?.ticketId) {
            return;
        }

        setProcessingTicket(context);
        setActiveTab('assignments');

        if (context.requesterUserId) {
            setAssignmentFilters((prev) => ({
                ...prev,
                userId: String(context.requesterUserId),
            }));
        }

        if (context.assignmentId) {
            (async () => {
                try {
                    const assignment = await shiftService.getAssignment(context.assignmentId);
                    if (assignment?.id) {
                        openAssignmentModal(assignment);
                    }
                } catch (err) {
                    setError('Không thể mở sẵn ca yêu cầu. Vui lòng chọn và xử lý thủ công.');
                }
            })();
        }

        navigate(location.pathname, { replace: true, state: null });
    }, [location.state, location.pathname, navigate]);

    useEffect(() => {
        const context = location.state?.assignmentContext;
        if (!context?.prefillDate) {
            return;
        }

        setActiveTab('assignments');
        setEditingAssignment(null);
        setAssignmentForm({
            ...defaultAssignmentForm,
            shiftDate: String(context.prefillDate),
        });
        setAssignmentFormErrors({});
        setIsAssignmentModalOpen(true);

        navigate(location.pathname, { replace: true, state: null });
    }, [location.state, location.pathname, navigate]);

    const loadShifts = async () => {
        try {
            const params = {};
            if (shiftQuery.trim()) params.query = shiftQuery.trim();
            if (shiftStatus !== 'all') params.status = shiftStatus;
            if (includeExpiredShifts) params.includeExpired = true;
            const data = await shiftService.getShifts(params);
            setShifts(Array.isArray(data) ? data : []);
            setError('');
        } catch (err) {
            setError(extractErrorMessage(err, 'Không thể tải danh sách ca'));
        }
    };

    const loadUsers = async () => {
        try {
            const res = await api.get('/users', { params: { page: 0, size: 100 } });
            const payload = res.data?.content ? res.data.content : res.data;
            setUsers(Array.isArray(payload) ? payload : []);
        } catch (err) {
            setUsers([]);
        }
    };

    const loadAssignments = async () => {
        try {
            const params = {};
            if (assignmentFilters.userId) params.userId = assignmentFilters.userId;
            if (assignmentFilters.shiftId) params.shiftId = assignmentFilters.shiftId;
            const data = await shiftService.getAssignments(params);
            setAssignments(Array.isArray(data) ? data : []);
            setError('');
        } catch (err) {
            setError(extractErrorMessage(err, 'Không thể tải danh sách phân công'));
        }
    };

    const openShiftModal = (shift = null) => {
        setEditingShift(shift);
        setShiftFormErrors({});
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
                effectiveFrom: shift.effectiveFrom ? toDateInput(shift.effectiveFrom) : '',
                effectiveTo: shift.effectiveTo ? toDateInput(shift.effectiveTo) : '',
                requiresApproval: !!shift.requiresApproval,
                description: shift.description || '',
            });
            setShowAdvancedShiftOptions(true);
        } else {
            setShiftForm(defaultShiftForm);
            setShowAdvancedShiftOptions(false);
        }
        setIsShiftModalOpen(true);
    };

    const openAssignmentModal = (assignment = null) => {
        setEditingAssignment(assignment);
        setAssignmentFormErrors({});
        if (assignment) {
            setAssignmentForm({
                workShiftId: assignment.shift?.id ? String(assignment.shift.id) : '',
                userId: assignment.user?.id ? String(assignment.user.id) : '',
                shiftDate: assignment.shiftDate || '',
                status: 'ASSIGNED',
                notes: assignment.notes || '',
            });
        } else {
            setAssignmentForm(defaultAssignmentForm);
        }
        setIsAssignmentModalOpen(true);
    };

    const handleShiftSubmit = async (event) => {
        event.preventDefault();
        const errors = validateShiftForm(shiftForm);
        setShiftFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            setError(Object.values(errors)[0]);
            return;
        }
        try {
            const shiftCode = String(shiftForm.shiftCode || '').trim();
            if (shiftCode) {
                const matchedShifts = await shiftService.getShifts({ query: shiftCode, includeExpired: true });
                const duplicateShift = (Array.isArray(matchedShifts) ? matchedShifts : []).find(
                    (item) =>
                        String(item.shiftCode || '').trim().toLowerCase() === shiftCode.toLowerCase()
                        && String(item.id) !== String(editingShift?.id || ''),
                );

                if (duplicateShift) {
                    setShiftFormErrors({ shiftCode: 'Mã ca đã tồn tại.' });
                    setError('Mã ca đã tồn tại. Vui lòng chọn mã khác.');
                    return;
                }
            }

            const payload = buildShiftPayload(shiftForm);
            if (editingShift) {
                await shiftService.updateShift(editingShift.id, payload);
            } else {
                await shiftService.createShift(payload);
            }
            setIsShiftModalOpen(false);
            await loadShifts();
        } catch (err) {
            setError(extractErrorMessage(err, 'Không thể lưu ca làm'));
        }
    };

    const handleShiftTypeChange = (value) => {
        const preset = shiftTypePresets[value] || shiftTypePresets.REGULAR;
        setShiftForm((prev) => ({
            ...prev,
            shiftType: value,
            effectiveFrom: value === 'TEMPORARY' ? prev.effectiveFrom : '',
            effectiveTo: value === 'TEMPORARY' ? prev.effectiveTo : '',
            ...preset,
        }));
    };

    const handleAssignmentSubmit = async (event) => {
        event.preventDefault();
        const errors = validateAssignmentForm(assignmentForm, assignmentShiftOptions, assignmentUserOptions);
        setAssignmentFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            setError(Object.values(errors)[0]);
            return;
        }
        try {
            const userId = Number(assignmentForm.userId);
            const workShiftId = Number(assignmentForm.workShiftId);
            const shiftDate = assignmentForm.shiftDate;

            const rowsOnDate = await shiftService.getAssignments({
                userId,
                startDate: shiftDate,
                endDate: shiftDate,
            });

            const duplicateAssignment = (Array.isArray(rowsOnDate) ? rowsOnDate : []).find(
                (item) =>
                    Number(item?.user?.id) === userId
                    && Number(item?.shift?.id) === workShiftId
                    && String(item?.shiftDate || '') === String(shiftDate)
                    && String(item?.id) !== String(editingAssignment?.id || ''),
            );

            if (duplicateAssignment) {
                const duplicateErrors = { workShiftId: 'Phân công này đã tồn tại cho nhân viên trong ngày đã chọn.' };
                setAssignmentFormErrors(duplicateErrors);
                setError(duplicateErrors.workShiftId);
                return;
            }

            const payload = buildAssignmentPayload(assignmentForm);
            if (editingAssignment) {
                await shiftService.updateAssignment(editingAssignment.id, payload);
            } else {
                await shiftService.createAssignment(payload);
            }
            setIsAssignmentModalOpen(false);
            await loadAssignments();
        } catch (err) {
            setError(extractErrorMessage(err, 'Không thể lưu phân công'));
        }
    };

    const handleDeleteShift = async (shiftId) => {
        if (!window.confirm('Ngưng hiệu lực ca này? Dữ liệu lịch sử vẫn được giữ lại.')) return;
        try {
            await shiftService.deleteShift(shiftId);
            await loadShifts();
        } catch (err) {
            setError(extractErrorMessage(err, 'Không thể ngưng hiệu lực ca làm'));
        }
    };

    const handleDeleteAssignment = async (assignmentId) => {
        if (!window.confirm('Ngưng hiệu lực phân công này?')) return;
        try {
            await shiftService.deleteAssignment(assignmentId);
            await loadAssignments();
        } catch (err) {
            setError(extractErrorMessage(err, 'Không thể ngưng hiệu lực phân công'));
        }
    };

    const handleCompleteLeaveTicket = async () => {
        if (!processingTicket?.ticketId) {
            return;
        }

        try {
            await shiftTicketService.approveTicket(
                processingTicket.ticketId,
                'Manager đã xử lý tại trang chỉnh ca và hoàn tất yêu cầu nghỉ ca.'
            );
            setProcessingTicket(null);
            await loadAssignments();
        } catch (err) {
            setError(extractErrorMessage(err, 'Không thể hoàn tất ticket nghỉ ca.'));
        }
    };

    const handleRejectLeaveTicket = async () => {
        if (!processingTicket?.ticketId) {
            return;
        }

        try {
            await shiftTicketService.rejectTicket(
                processingTicket.ticketId,
                'Manager từ chối yêu cầu nghỉ ca.'
            );
            setProcessingTicket(null);
            await loadAssignments();
        } catch (err) {
            setError(extractErrorMessage(err, 'Không thể từ chối ticket nghỉ ca.'));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh] text-slate-500">
                Đang tải dữ liệu ca làm...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                        <CalendarRange size={24} className="text-indigo-600" />
                        Quản lý ca làm
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Quản trị mẫu ca và phân ca nhân sự.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/hr/ticket-processing?tab=swap')}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-300"
                    >
                        Xử lý ticket
                    </button>
                    <button
                        onClick={() => openShiftModal()}
                        className="inline-flex items-center gap-2 rounded-lg border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                    >
                        <Plus size={16} />
                        Tạo ca mới
                    </button>
                    <button
                        onClick={() => openAssignmentModal()}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-300"
                    >
                        <UserPlus size={16} />
                        Phân ca
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            {processingTicket?.ticketId && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    <p className="font-semibold">Đang xử lý ticket nghỉ ca {processingTicket.ticketCode || ''}</p>
                    <p className="mt-1">Bạn có thể chỉnh ca/phân công cho nhân viên, sau đó bấm Hoàn tất để đánh dấu Done.</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={handleCompleteLeaveTicket}
                            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                            Hoàn tất ticket
                        </button>
                        <button
                            type="button"
                            onClick={handleRejectLeaveTicket}
                            className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                        >
                            Từ chối ticket
                        </button>
                        <button
                            type="button"
                            onClick={() => setProcessingTicket(null)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Bỏ liên kết ticket
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
                {['shifts', 'assignments'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === tab
                            ? 'bg-slate-900 text-white'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                            }`}
                    >
                        {tab === 'shifts' ? 'Danh sách ca' : 'Phân công'}
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
                                placeholder="Tìm theo mã hoặc tên ca"
                                className="w-64 rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                            />
                        </div>
                        <CustomSelect
                            value={shiftStatus}
                            onChange={setShiftStatus}
                            variant="status"
                            options={[
                                { value: 'all', label: 'Tất cả trạng thái' },
                                { value: 'ACTIVE', label: 'Hoạt động' },
                                { value: 'INACTIVE', label: 'Ngưng hoạt động' },
                            ]}
                        />
                        <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
                            <input
                                type="checkbox"
                                checked={includeExpiredShifts}
                                onChange={(event) => setIncludeExpiredShifts(event.target.checked)}
                            />
                            Hiển thị cả ca đã hết hạn
                        </label>
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
                                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${shift.status === 'ACTIVE'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-rose-100 text-rose-700'
                                        }`}>
                                        {shift.status}
                                    </span>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500">
                                    <div>Type: {shift.shiftType || 'REGULAR'}</div>
                                    <div>Staff: {shift.minimumStaffRequired ?? '-'} - {shift.maximumStaffAllowed ?? '-'}</div>
                                    <div>Break: {formatTime(shift.breakStartTime)} - {formatTime(shift.breakEndTime)}</div>
                                    <div>Approval: {shift.requiresApproval ? 'Yes' : 'No'}</div>
                                    <div className="col-span-2">Hiệu lực: {formatDate(shift.effectiveFrom)} - {formatDate(shift.effectiveTo)}</div>
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <button
                                        onClick={() => openShiftModal(shift)}
                                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteShift(shift.id)}
                                        className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {shifts.length === 0 && (
                            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                                Chưa có mẫu ca nào.
                            </div>
                        )}
                    </div>
                </section>
            )}

            {activeTab === 'assignments' && (
                <section className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <CustomSelect
                            value={assignmentFilters.userId}
                            onChange={(value) => setAssignmentFilters((prev) => ({ ...prev, userId: value }))}
                            options={[
                                { value: '', label: 'Tất cả nhân viên' },
                                ...users.map((user) => ({ value: String(user.id), label: user.fullName || user.email }))
                            ]}
                        />
                        <CustomSelect
                            value={assignmentFilters.shiftId}
                            onChange={(value) => setAssignmentFilters((prev) => ({ ...prev, shiftId: value }))}
                            options={[
                                { value: '', label: 'Tất cả ca' },
                                ...shifts.map((shift) => ({ value: String(shift.id), label: shift.shiftName }))
                            ]}
                        />
                        <button
                            onClick={() => openAssignmentModal()}
                            className="inline-flex items-center gap-2 rounded-lg border border-indigo-600 bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700"
                        >
                            <Plus size={14} />
                            Tạo phân công
                        </button>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="grid grid-cols-12 gap-2 border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            <div className="col-span-2">Ngày</div>
                            <div className="col-span-3">Nhân viên</div>
                            <div className="col-span-3">Ca</div>
                            <div className="col-span-2">Trạng thái</div>
                            <div className="col-span-2">Thao tác</div>
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
                                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusPillClass(assignment.status)}`}>
                                        {assignment.status}
                                    </span>
                                </div>
                                <div className="col-span-2 flex gap-2">
                                    <button
                                        onClick={() => openAssignmentModal(assignment)}
                                        className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                                    >
                                        <Pencil size={12} /> Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAssignment(assignment.id)}
                                        className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100"
                                    >
                                        <Trash2 size={12} /> Ngưng
                                    </button>
                                </div>
                            </div>
                        ))}
                        {assignments.length === 0 && (
                            <div className="px-4 py-6 text-sm text-slate-500">Không có phân công trong khoảng thời gian này.</div>
                        )}
                    </div>
                </section>
            )}

            {isShiftModalOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) setIsShiftModalOpen(false); }}>
                    <div className="w-full max-w-2xl my-4 flex flex-col rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 shrink-0">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    {editingShift ? 'Cập nhật ca' : 'Tạo ca mới'}
                                </h2>
                                <p className="text-xs text-slate-500">Nhập thông tin cơ bản trước, tùy chọn nâng cao có thể mở thêm khi cần.</p>
                            </div>
                            <button onClick={() => setIsShiftModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleShiftSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Mã ca</label>
                                    <input
                                        value={shiftForm.shiftCode}
                                        onChange={(event) => setShiftForm({ ...shiftForm, shiftCode: event.target.value })}
                                        placeholder="Nhập mã ca"
                                        className={`w-full rounded-lg border px-3 py-2 text-sm ${shiftFormErrors.shiftCode ? 'border-rose-400' : 'border-slate-200'}`}
                                        required
                                    />
                                    {shiftFormErrors.shiftCode && <p className="text-xs text-rose-600">{shiftFormErrors.shiftCode}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Tên ca</label>
                                    <input
                                        value={shiftForm.shiftName}
                                        onChange={(event) => setShiftForm({ ...shiftForm, shiftName: event.target.value })}
                                        placeholder="Nhập tên ca"
                                        className={`w-full rounded-lg border px-3 py-2 text-sm ${shiftFormErrors.shiftName ? 'border-rose-400' : 'border-slate-200'}`}
                                        required
                                    />
                                    {shiftFormErrors.shiftName && <p className="text-xs text-rose-600">{shiftFormErrors.shiftName}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Giờ bắt đầu</label>
                                    <input
                                        type="time"
                                        value={shiftForm.startTime}
                                        onChange={(event) => setShiftForm({ ...shiftForm, startTime: event.target.value })}
                                        className={`w-full rounded-lg border px-3 py-2 text-sm ${shiftFormErrors.startTime ? 'border-rose-400' : 'border-slate-200'}`}
                                        required
                                    />
                                    {shiftFormErrors.startTime && <p className="text-xs text-rose-600">{shiftFormErrors.startTime}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Giờ kết thúc</label>
                                    <input
                                        type="time"
                                        value={shiftForm.endTime}
                                        onChange={(event) => setShiftForm({ ...shiftForm, endTime: event.target.value })}
                                        className={`w-full rounded-lg border px-3 py-2 text-sm ${shiftFormErrors.endTime ? 'border-rose-400' : 'border-slate-200'}`}
                                        required
                                    />
                                    {shiftFormErrors.endTime && <p className="text-xs text-rose-600">{shiftFormErrors.endTime}</p>}
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-medium text-slate-600">Số giờ làm việc tự động</label>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                                        {shiftDurationPreview.label}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Bắt đầu nghỉ giữa ca</label>
                                    <input
                                        type="time"
                                        value={shiftForm.breakStartTime}
                                        onChange={(event) => setShiftForm({ ...shiftForm, breakStartTime: event.target.value })}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Kết thúc nghỉ giữa ca</label>
                                    <input
                                        type="time"
                                        value={shiftForm.breakEndTime}
                                        onChange={(event) => setShiftForm({ ...shiftForm, breakEndTime: event.target.value })}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Loại ca</label>
                                    <CustomSelect
                                        value={shiftForm.shiftType}
                                        onChange={handleShiftTypeChange}
                                        options={[
                                            { value: 'REGULAR', label: 'Thường' },
                                            { value: 'TEMPORARY', label: 'Tạm thời' },
                                            { value: 'WEEKEND', label: 'Cuối tuần' },
                                            { value: 'HOLIDAY', label: 'Ngày lễ' },
                                            { value: 'NIGHT', label: 'Ca đêm' },
                                        ]}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Trạng thái</label>
                                    <CustomSelect
                                        value={shiftForm.status}
                                        onChange={(value) => setShiftForm({ ...shiftForm, status: value })}
                                        variant="status"
                                        options={[
                                            { value: 'ACTIVE', label: 'Hoạt động' },
                                            { value: 'INACTIVE', label: 'Ngưng hoạt động' },
                                        ]}
                                    />
                                </div>
                                {shiftForm.shiftType === 'TEMPORARY' && (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-600">Hiệu lực từ ngày</label>
                                            <input
                                                type="date"
                                                value={shiftForm.effectiveFrom}
                                                onChange={(event) => setShiftForm({ ...shiftForm, effectiveFrom: event.target.value })}
                                                className={`w-full rounded-lg border px-3 py-2 text-sm ${shiftFormErrors.effectiveFrom ? 'border-rose-400' : 'border-slate-200'}`}
                                                required
                                            />
                                            {shiftFormErrors.effectiveFrom && <p className="text-xs text-rose-600">{shiftFormErrors.effectiveFrom}</p>}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-600">Hiệu lực đến ngày</label>
                                            <input
                                                type="date"
                                                value={shiftForm.effectiveTo}
                                                onChange={(event) => setShiftForm({ ...shiftForm, effectiveTo: event.target.value })}
                                                className={`w-full rounded-lg border px-3 py-2 text-sm ${shiftFormErrors.effectiveTo ? 'border-rose-400' : 'border-slate-200'}`}
                                                required
                                            />
                                            {shiftFormErrors.effectiveTo && <p className="text-xs text-rose-600">{shiftFormErrors.effectiveTo}</p>}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Nhân sự tối thiểu</label>
                                    <input
                                        type="number"
                                        value={shiftForm.minimumStaffRequired}
                                        onChange={(event) => setShiftForm({ ...shiftForm, minimumStaffRequired: event.target.value })}
                                        placeholder="Nhập số lượng"
                                        className={`w-full rounded-lg border px-3 py-2 text-sm ${shiftFormErrors.minimumStaffRequired ? 'border-rose-400' : 'border-slate-200'}`}
                                    />
                                    {shiftFormErrors.minimumStaffRequired && <p className="text-xs text-rose-600">{shiftFormErrors.minimumStaffRequired}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Nhân sự tối đa</label>
                                    <input
                                        type="number"
                                        value={shiftForm.maximumStaffAllowed}
                                        onChange={(event) => setShiftForm({ ...shiftForm, maximumStaffAllowed: event.target.value })}
                                        placeholder="Nhập số lượng"
                                        className={`w-full rounded-lg border px-3 py-2 text-sm ${shiftFormErrors.maximumStaffAllowed ? 'border-rose-400' : 'border-slate-200'}`}
                                    />
                                    {shiftFormErrors.maximumStaffAllowed && <p className="text-xs text-rose-600">{shiftFormErrors.maximumStaffAllowed}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Thời gian ân hạn (phút)</label>
                                    <input
                                        type="number"
                                        value={shiftForm.gracePeriodMinutes}
                                        onChange={(event) => setShiftForm({ ...shiftForm, gracePeriodMinutes: event.target.value })}
                                        placeholder="Nhập phút"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="rounded-lg border border-slate-200 px-3 py-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAdvancedShiftOptions((prev) => !prev)}
                                    className="w-full text-left text-sm font-medium text-slate-700"
                                >
                                    {showAdvancedShiftOptions ? 'Ẩn thiết lập nâng cao' : 'Mở thiết lập nâng cao'}
                                </button>
                            </div>

                            {showAdvancedShiftOptions && (
                                <>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-600">Hệ số tăng ca</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={shiftForm.overtimeMultiplier}
                                                onChange={(event) => setShiftForm({ ...shiftForm, overtimeMultiplier: event.target.value })}
                                                placeholder="Ví dụ: 1.5"
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-600">Phụ cấp ca đêm (%)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={shiftForm.nightShiftBonus}
                                                onChange={(event) => setShiftForm({ ...shiftForm, nightShiftBonus: event.target.value })}
                                                placeholder="Nhập phần trăm"
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-600">Phụ cấp cuối tuần (%)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={shiftForm.weekendBonus}
                                                onChange={(event) => setShiftForm({ ...shiftForm, weekendBonus: event.target.value })}
                                                placeholder="Nhập phần trăm"
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-600">Phụ cấp ngày lễ (%)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={shiftForm.holidayBonus}
                                                onChange={(event) => setShiftForm({ ...shiftForm, holidayBonus: event.target.value })}
                                                placeholder="Nhập phần trăm"
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-600">Vào sớm tối đa (phút)</label>
                                            <input
                                                type="number"
                                                value={shiftForm.earlyClockInMinutes}
                                                onChange={(event) => setShiftForm({ ...shiftForm, earlyClockInMinutes: event.target.value })}
                                                placeholder="Nhập phút"
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-600">Ra muộn tối đa (phút)</label>
                                            <input
                                                type="number"
                                                value={shiftForm.lateClockOutMinutes}
                                                onChange={(event) => setShiftForm({ ...shiftForm, lateClockOutMinutes: event.target.value })}
                                                placeholder="Nhập phút"
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <label className="flex items-center gap-2 text-sm text-slate-600">
                                            <input
                                                type="checkbox"
                                                checked={shiftForm.allowEarlyClockIn}
                                                onChange={(event) => setShiftForm({ ...shiftForm, allowEarlyClockIn: event.target.checked })}
                                            />
                                            Cho phép vào sớm
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-slate-600">
                                            <input
                                                type="checkbox"
                                                checked={shiftForm.allowLateClockOut}
                                                onChange={(event) => setShiftForm({ ...shiftForm, allowLateClockOut: event.target.checked })}
                                            />
                                            Cho phép ra muộn
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-slate-600">
                                            <input
                                                type="checkbox"
                                                checked={shiftForm.requiresApproval}
                                                onChange={(event) => setShiftForm({ ...shiftForm, requiresApproval: event.target.checked })}
                                            />
                                            Cần duyệt trước
                                        </label>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-600">Ghi chú ca làm</label>
                                        <textarea
                                            value={shiftForm.description}
                                            onChange={(event) => setShiftForm({ ...shiftForm, description: event.target.value })}
                                            placeholder="Nhập ghi chú"
                                            className="min-h-[90px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsShiftModalOpen(false)}
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-lg border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                                >
                                    Lưu ca
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isAssignmentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={(e) => { if (e.target === e.currentTarget) setIsAssignmentModalOpen(false); }}>
                    <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    {editingAssignment ? 'Cập nhật phân công' : 'Tạo phân công'}
                                </h2>
                                <p className="text-xs text-slate-500">Gán nhân viên vào ca theo ngày làm việc.</p>
                            </div>
                            <button onClick={() => setIsAssignmentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleAssignmentSubmit} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">Ca làm</label>
                                <CustomSelect
                                    value={assignmentForm.workShiftId}
                                    onChange={(value) => setAssignmentForm({ ...assignmentForm, workShiftId: value })}
                                    className={`w-full ${assignmentFormErrors.workShiftId ? 'ring-1 ring-rose-400 rounded-xl' : ''}`}
                                    options={[
                                        { value: '', label: 'Chọn ca' },
                                        ...assignmentShiftOptions
                                    ]}
                                />
                                {assignmentFormErrors.workShiftId && <p className="text-xs text-rose-600">{assignmentFormErrors.workShiftId}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">Nhân viên</label>
                                <CustomSelect
                                    value={assignmentForm.userId}
                                    onChange={(value) => setAssignmentForm({ ...assignmentForm, userId: value })}
                                    className={`w-full ${assignmentFormErrors.userId ? 'ring-1 ring-rose-400 rounded-xl' : ''}`}
                                    options={[
                                        { value: '', label: 'Chọn nhân viên' },
                                        ...assignmentUserOptions
                                    ]}
                                />
                                {assignmentFormErrors.userId && <p className="text-xs text-rose-600">{assignmentFormErrors.userId}</p>}
                            </div>
                            <div className="grid gap-4 md:grid-cols-1">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Ngày làm việc</label>
                                    <input
                                        type="date"
                                        value={assignmentForm.shiftDate}
                                        onChange={(event) => setAssignmentForm({ ...assignmentForm, shiftDate: event.target.value })}
                                        className={`w-full rounded-lg border px-3 py-2 text-sm ${assignmentFormErrors.shiftDate ? 'border-rose-400' : 'border-slate-200'}`}
                                        required
                                    />
                                    {assignmentFormErrors.shiftDate && <p className="text-xs text-rose-600">{assignmentFormErrors.shiftDate}</p>}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">Ghi chú phân công</label>
                                <textarea
                                    value={assignmentForm.notes}
                                    onChange={(event) => setAssignmentForm({ ...assignmentForm, notes: event.target.value })}
                                    placeholder="Nhập ghi chú"
                                    className="min-h-[80px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAssignmentModalOpen(false)}
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-lg border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                                >
                                    Lưu phân công
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const formatTime = (value) => {
    if (!value) return '--:--';
    return value.toString().slice(0, 5);
};

const formatDate = (value) => {
    if (!value) return 'Không giới hạn';
    return new Date(value).toLocaleDateString('vi-VN');
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

const buildShiftPayload = (form) => {
    const isTemporary = String(form.shiftType || '').toUpperCase() === 'TEMPORARY';
    return {
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
        effectiveFrom: isTemporary ? (form.effectiveFrom || null) : null,
        effectiveTo: isTemporary ? (form.effectiveTo || null) : null,
        requiresApproval: form.requiresApproval,
        description: form.description || null,
    };
};

const validateShiftForm = (form) => {
    const errors = {};
    const isTemporary = String(form.shiftType || '').toUpperCase() === 'TEMPORARY';

    if (!form.shiftCode?.trim()) {
        errors.shiftCode = 'Vui lòng nhập mã ca.';
    }

    if (!form.shiftName?.trim()) {
        errors.shiftName = 'Vui lòng nhập tên ca.';
    }

    if (!form.startTime) {
        errors.startTime = 'Vui lòng chọn giờ bắt đầu.';
    }

    if (!form.endTime) {
        errors.endTime = 'Vui lòng chọn giờ kết thúc.';
    }

    if (form.startTime && form.endTime && form.startTime === form.endTime) {
        errors.endTime = 'Giờ kết thúc không được trùng giờ bắt đầu.';
    }

    if ((form.breakStartTime && !form.breakEndTime) || (!form.breakStartTime && form.breakEndTime)) {
        errors.breakEndTime = 'Vui lòng nhập đầy đủ giờ bắt đầu và kết thúc nghỉ giữa ca.';
    }

    if (form.breakStartTime && form.breakEndTime) {
        if (form.breakStartTime === form.breakEndTime) {
            errors.breakEndTime = 'Giờ nghỉ bắt đầu và kết thúc không được trùng nhau.';
        } else if (form.startTime && form.endTime && !isTimeRangeInsideShift(form.startTime, form.endTime, form.breakStartTime, form.breakEndTime)) {
            errors.breakEndTime = 'Khoảng nghỉ phải nằm trong khung giờ của ca.';
        }
    }

    if (isTemporary) {
        if (!form.effectiveFrom) {
            errors.effectiveFrom = 'Vui lòng chọn ngày bắt đầu hiệu lực cho ca tạm thời.';
        }
        if (!form.effectiveTo) {
            errors.effectiveTo = 'Vui lòng chọn ngày kết thúc hiệu lực cho ca tạm thời.';
        }
        if (form.effectiveFrom && form.effectiveTo && form.effectiveTo < form.effectiveFrom) {
            errors.effectiveTo = 'Ngày kết thúc hiệu lực phải sau hoặc bằng ngày bắt đầu hiệu lực.';
        }
    }

    const minStaff = form.minimumStaffRequired === '' ? null : Number(form.minimumStaffRequired);
    const maxStaff = form.maximumStaffAllowed === '' ? null : Number(form.maximumStaffAllowed);

    if (minStaff !== null && (Number.isNaN(minStaff) || minStaff < 0)) {
        errors.minimumStaffRequired = 'Số lượng tối thiểu phải lớn hơn hoặc bằng 0.';
    }

    if (maxStaff !== null && (Number.isNaN(maxStaff) || maxStaff < 0)) {
        errors.maximumStaffAllowed = 'Số lượng tối đa phải lớn hơn hoặc bằng 0.';
    }

    if (minStaff !== null && maxStaff !== null && minStaff > maxStaff) {
        errors.maximumStaffAllowed = 'Số lượng tối đa phải lớn hơn hoặc bằng số lượng tối thiểu.';
    }

    return errors;
};

const buildAssignmentPayload = (form) => ({
    workShiftId: form.workShiftId ? Number(form.workShiftId) : null,
    userId: form.userId ? Number(form.userId) : null,
    shiftDate: form.shiftDate || null,
    status: 'ASSIGNED',
    notes: form.notes || null,
});

const validateAssignmentForm = (form, shiftOptions = [], userOptions = []) => {
    const errors = {};

    if (!form.workShiftId) {
        errors.workShiftId = 'Vui lòng chọn ca làm.';
    } else if (!shiftOptions.some((option) => option.value === String(form.workShiftId))) {
        errors.workShiftId = 'Ca làm đã chọn không hợp lệ hoặc đã hết hiệu lực.';
    }

    if (!form.userId) {
        errors.userId = 'Vui lòng chọn nhân viên.';
    } else if (!userOptions.some((option) => option.value === String(form.userId))) {
        errors.userId = 'Nhân viên đã chọn không hợp lệ.';
    }

    if (!form.shiftDate) {
        errors.shiftDate = 'Vui lòng chọn ngày làm việc.';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(String(form.shiftDate))) {
        errors.shiftDate = 'Ngày làm việc không đúng định dạng.';
    }

    return errors;
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

const isTimeRangeInsideShift = (shiftStart, shiftEnd, rangeStart, rangeEnd) => {
    const shiftRanges = expandTimeRange(shiftStart, shiftEnd);
    const candidateRanges = expandTimeRange(rangeStart, rangeEnd);

    return candidateRanges.every((candidate) =>
        shiftRanges.some((shiftRange) => candidate.start >= shiftRange.start && candidate.end <= shiftRange.end)
    );
};

const expandTimeRange = (startHm, endHm) => {
    const dayMinutes = 24 * 60;
    const start = hmToMinutes(startHm);
    const end = hmToMinutes(endHm);

    if (start === null || end === null) {
        return [];
    }

    if (end <= start) {
        return [
            { start, end: end + dayMinutes },
            { start: start - dayMinutes, end },
        ];
    }

    return [
        { start, end },
        { start: start + dayMinutes, end: end + dayMinutes },
    ];
};

const hmToMinutes = (hm) => {
    if (!hm || !/^\d{2}:\d{2}$/.test(String(hm))) {
        return null;
    }

    const [hours, minutes] = String(hm).split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        return null;
    }

    return (hours * 60) + minutes;
};

const calculateShiftDurationPreview = (startTime, endTime, breakStart, breakEnd) => {
    const startMinutes = hmToMinutes(startTime);
    const endMinutes = hmToMinutes(endTime);

    if (startMinutes === null || endMinutes === null) {
        return { minutes: 0, label: 'Nhập giờ bắt đầu và kết thúc để xem số giờ làm việc.' };
    }

    const dayMinutes = 24 * 60;
    let plannedMinutes = endMinutes - startMinutes;
    if (plannedMinutes <= 0) {
        plannedMinutes += dayMinutes;
    }

    let breakMinutes = 0;
    const breakStartMinutes = hmToMinutes(breakStart);
    const breakEndMinutes = hmToMinutes(breakEnd);
    if (breakStartMinutes !== null && breakEndMinutes !== null) {
        breakMinutes = breakEndMinutes - breakStartMinutes;
        if (breakMinutes <= 0) {
            breakMinutes += dayMinutes;
        }
    }

    const workingMinutes = Math.max(plannedMinutes - breakMinutes, 0);
    const hours = (workingMinutes / 60).toFixed(2);

    return {
        minutes: workingMinutes,
        label: `${hours} giờ (${workingMinutes} phút) - Tổng ca ${plannedMinutes} phút${breakMinutes > 0 ? `, nghỉ ${breakMinutes} phút` : ''}`,
    };
};

const statusPillClass = (status) => {
    switch ((status || '').toUpperCase()) {
        case 'ASSIGNED':
            return 'bg-indigo-100 text-indigo-700';
        case 'CONFIRMED':
        case 'COMPLETED':
        case 'ACTIVE':
        case 'PRESENT':
            return 'bg-emerald-100 text-emerald-700';
        case 'PENDING':
        case 'LATE':
            return 'bg-amber-100 text-amber-700';
        case 'INACTIVE':
        case 'CANCELLED':
        case 'ABSENT':
            return 'bg-rose-100 text-rose-700';
        case 'ON_LEAVE':
            return 'bg-blue-100 text-blue-700';
        default:
            return 'bg-slate-100 text-slate-700';
    }
};

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

export default ShiftManagement;
