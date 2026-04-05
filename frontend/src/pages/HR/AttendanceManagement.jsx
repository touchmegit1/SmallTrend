import React, { useEffect, useMemo, useState } from 'react';
import { shiftService } from '../../services/shiftService';
import { userService } from '../../services/userService';
import { ClipboardCheck, CalendarDays, Users, Clock3, TriangleAlert, RotateCcw } from 'lucide-react';
import CustomSelect from '../../components/common/CustomSelect';

const AttendanceManagement = ({ viewMode = 'full', initialFilters = null }) => {
    const isSummaryOnly = viewMode === 'summary';
    const isDetailOnly = viewMode === 'detail';
    const showHeader = !isDetailOnly;
    const showSummary = !isDetailOnly;
    const showDetailTable = !isSummaryOnly;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [records, setRecords] = useState([]);
    const [rowErrors, setRowErrors] = useState({});
    const [filterErrors, setFilterErrors] = useState({});

    const [filters, setFilters] = useState({
        scope: 'DAY',
        date: toDateInput(new Date()),
        month: toMonthInput(new Date()),
        userId: '',
        status: 'ALL',
    });

    useEffect(() => {
        if (!initialFilters) {
            return;
        }

        setFilters((prev) => ({
            ...prev,
            ...initialFilters,
        }));
    }, [initialFilters]);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        loadAttendance();
    }, [filters.scope, filters.date, filters.month, filters.userId, filters.status]);

    const loadUsers = async () => {
        try {
            const userRes = await userService.getAll();
            const usersPayload = userRes?.content ? userRes.content : userRes;
            setUsers(Array.isArray(usersPayload) ? usersPayload : []);
        } catch (err) {
            setUsers([]);
        }
    };

    const loadAttendance = async () => {
        const validationErrors = validateAttendanceFilters(filters);
        setFilterErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            setError(Object.values(validationErrors)[0]);
            setRecords([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const params = {
                status: filters.status,
            };

            if (filters.scope === 'DAY') {
                params.date = filters.date;
            } else if (filters.scope === 'MONTH') {
                const range = monthToDateRange(filters.month);
                params.startDate = range.startDate;
                params.endDate = range.endDate;
            }

            if (filters.userId) {
                params.userId = filters.userId;
            }
            const data = await shiftService.getAttendance(params);
            setRecords(Array.isArray(data) ? data.map((item) => ({
                ...item,
                key: `${item.userId}-${item.date}`,
                checkIn: item.timeIn ? item.timeIn.slice(0, 5) : '',
                checkOut: item.timeOut ? item.timeOut.slice(0, 5) : '',
                note: item.notes || '',
                shiftTime: `${formatTime(item.shiftStartTime)} - ${formatTime(item.shiftEndTime)}`,
                policyWarningMessage: item.policyWarningMessage || '',
                policyWarningCode: item.policyWarningCode || '',
                policySummary: item.policySummary || '',
            })) : []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải dữ liệu chấm công');
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    const summary = useMemo(() => {
        const total = records.length;
        const present = records.filter((r) => r.status === 'PRESENT').length;
        const late = records.filter((r) => r.status === 'LATE').length;
        const absent = records.filter((r) => r.status === 'ABSENT').length;
        const onLeave = records.filter((r) => r.status === 'ON_LEAVE').length;
        return { total, present, late, absent, onLeave };
    }, [records]);

    const updateAttendance = async (record, patch) => {
        const validationMessage = validateAttendancePatch(record, patch);
        if (validationMessage) {
            setRowErrors((prev) => ({ ...prev, [record.key]: validationMessage }));
            setError(validationMessage);
            return;
        }

        setRowErrors((prev) => {
            if (!prev[record.key]) return prev;
            const next = { ...prev };
            delete next[record.key];
            return next;
        });

        try {
            const next = {
                ...record,
                ...patch,
            };

            if (record.shiftId && record.date) {
                const preview = await shiftService.getAttendancePolicyPreview({
                    shiftId: record.shiftId,
                    shiftDate: record.date,
                    timeIn: next.checkIn || undefined,
                    timeOut: next.checkOut || undefined,
                });

                const violationMessages = Array.isArray(preview?.violationMessages) ? preview.violationMessages : [];
                if (violationMessages.length > 0) {
                    const violation = violationMessages[0];
                    setRowErrors((prev) => ({ ...prev, [record.key]: violation }));
                    setError(violation);
                    return;
                }
            }

            const updated = await shiftService.upsertAttendance({
                userId: record.userId,
                date: record.date,
                timeIn: next.checkIn || null,
                timeOut: next.checkOut || null,
                status: next.status,
            });

            const hydrated = {
                ...next,
                status: updated?.status || next.status,
                checkIn: updated?.timeIn ? String(updated.timeIn).slice(0, 5) : (next.checkIn || ''),
                checkOut: updated?.timeOut ? String(updated.timeOut).slice(0, 5) : (next.checkOut || ''),
                policyWarningMessage: updated?.policyWarningMessage || '',
                policyWarningCode: updated?.policyWarningCode || '',
                policySummary: updated?.policySummary || next.policySummary || '',
            };

            setRecords((prev) => prev.map((item) => item.key === record.key ? hydrated : item));
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể cập nhật chấm công');
        }
    };

    if (loading) {
        return <div className="text-slate-500">Đang tải dữ liệu chấm công...</div>;
    }

    return (
        <div className="space-y-5">
            {showHeader && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                            <ClipboardCheck size={24} className="text-indigo-600" />
                            Chấm công
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Theo dõi trạng thái đi làm theo phân ca.</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            {showSummary && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <StatCard title="Tổng ca" value={summary.total} icon={CalendarDays} />
                    <StatCard title="Có mặt" value={summary.present} icon={Users} />
                    <StatCard title="Đi muộn" value={summary.late} icon={Clock3} />
                    <StatCard title="Vắng (không phép)" value={summary.absent} icon={TriangleAlert} />
                    <StatCard title="Nghỉ phép" value={summary.onLeave} icon={CalendarDays} color="blue" />
                </div>
            )}

            {!showDetailTable && <div className="hidden" />}

            {showDetailTable && (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="grid gap-3 md:grid-cols-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600">Phạm vi</label>
                            <CustomSelect
                                value={filters.scope}
                                onChange={(value) => setFilters((prev) => ({ ...prev, scope: value }))}
                                options={[
                                    { value: 'DAY', label: 'Theo ngày' },
                                    { value: 'MONTH', label: 'Theo tháng' },
                                ]}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600">
                                {filters.scope === 'MONTH' ? 'Tháng chấm công' : 'Ngày chấm công'}
                            </label>
                            {filters.scope === 'MONTH' ? (
                                <input
                                    type="month"
                                    value={filters.month}
                                    onChange={(event) => setFilters((prev) => ({ ...prev, month: event.target.value }))}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm ${filterErrors.month ? 'border-rose-400' : 'border-slate-200'}`}
                                />
                            ) : (
                                <input
                                    type="date"
                                    value={filters.date}
                                    onChange={(event) => setFilters((prev) => ({ ...prev, date: event.target.value }))}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm ${filterErrors.date ? 'border-rose-400' : 'border-slate-200'}`}
                                />
                            )}
                            {filterErrors.date && <p className="text-xs text-rose-600">{filterErrors.date}</p>}
                            {filterErrors.month && <p className="text-xs text-rose-600">{filterErrors.month}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600">Nhân viên</label>
                            <CustomSelect
                                value={filters.userId}
                                onChange={(value) => setFilters((prev) => ({ ...prev, userId: value }))}
                                options={[
                                    { value: '', label: 'Tất cả nhân viên' },
                                    ...users.map((user) => ({ value: String(user.id), label: user.fullName || user.email }))
                                ]}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600">Trạng thái chấm công</label>
                            <CustomSelect
                                value={filters.status}
                                onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                                variant="status"
                                options={[
                                    { value: 'ALL', label: 'Tất cả trạng thái' },
                                    { value: 'PENDING', label: 'Chưa chấm' },
                                    { value: 'PRESENT', label: 'Có mặt' },
                                    { value: 'LATE', label: 'Đi muộn' },
                                    { value: 'ABSENT', label: 'Vắng (không phép)' },
                                    { value: 'ON_LEAVE', label: 'Nghỉ phép (có phép)' },
                                ]}
                            />
                        </div>
                        <button
                            onClick={() => setFilters({ scope: 'DAY', date: toDateInput(new Date()), month: toMonthInput(new Date()), userId: '', status: 'ALL' })}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                            <RotateCcw size={14} />
                            Đặt lại bộ lọc
                        </button>
                    </div>
                </div>
            )}

            {showDetailTable && (
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <div className="col-span-2">Ngày</div>
                        <div className="col-span-2">Nhân viên</div>
                        <div className="col-span-2">Ca làm</div>
                        <div className="col-span-2">Giờ vào/ra</div>
                        <div className="col-span-1">Trạng thái</div>
                        <div className="col-span-2">Cảnh báo policy</div>
                        <div className="col-span-1">Ghi chú</div>
                    </div>

                    {records.map((record) => (
                        <div key={record.key} className="grid grid-cols-12 gap-2 px-4 py-3 text-sm border-b border-slate-100">
                            <div className="col-span-2 text-slate-700">{formatDate(record.date)}</div>
                            <div className="col-span-2 text-slate-900 font-medium">{record.userName}</div>
                            <div className="col-span-2">
                                <div className="text-slate-900">{record.shiftName || 'N/A'}</div>
                                <div className="text-xs text-slate-500">{record.shiftTime}</div>
                            </div>
                            <div className="col-span-2 flex gap-2">
                                <input
                                    type="time"
                                    value={record.checkIn}
                                    onChange={(event) => updateAttendance(record, { checkIn: event.target.value })}
                                    className={`w-full rounded-md border px-2 py-1 text-xs ${rowErrors[record.key] ? 'border-rose-400' : 'border-slate-200'}`}
                                />
                                <input
                                    type="time"
                                    value={record.checkOut}
                                    onChange={(event) => updateAttendance(record, { checkOut: event.target.value })}
                                    className={`w-full rounded-md border px-2 py-1 text-xs ${rowErrors[record.key] ? 'border-rose-400' : 'border-slate-200'}`}
                                />
                            </div>
                            <div className="col-span-1">
                                <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${attendanceStatusClass(record.status)}`}>
                                    {formatAttendanceStatus(record.status)}
                                </span>
                            </div>
                            <div className="col-span-2">
                                {record.policyWarningMessage ? (
                                    <div className={`rounded-md border px-2 py-1 text-xs ${policyWarningClass(record.policyWarningCode)}`}>
                                        <p className="font-medium">{record.policyWarningMessage}</p>
                                        {record.policySummary && <p className="mt-0.5 text-[11px] opacity-80">{record.policySummary}</p>}
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-400">Không có</span>
                                )}
                            </div>
                            <div className="col-span-1">
                                <input
                                    value={record.note}
                                    onChange={(event) => updateAttendance(record, { note: event.target.value })}
                                    placeholder="Ghi chú"
                                    className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs"
                                />
                            </div>
                            {rowErrors[record.key] && (
                                <div className="col-span-12 text-xs text-rose-600">{rowErrors[record.key]}</div>
                            )}
                        </div>
                    ))}

                    {records.length === 0 && (
                        <div className="px-4 py-6 text-sm text-slate-500">Không có dữ liệu chấm công theo bộ lọc hiện tại.</div>
                    )}
                </div>
            )}
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color = 'indigo' }) => (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
            {Icon ? <Icon size={16} className={`text-${color}-500`} /> : null}
        </div>
        <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
);

const toDateInput = (value) => {
    const date = value instanceof Date ? value : new Date(value);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('vi-VN');
};

const formatTime = (value) => {
    if (!value) return '--:--';
    return value.toString().slice(0, 5);
};

const formatAttendanceStatus = (status) => {
    const normalized = String(status || '').toUpperCase();
    if (normalized === 'PRESENT') return 'Có mặt';
    if (normalized === 'LATE') return 'Đi muộn';
    if (normalized === 'ABSENT') return 'Vắng (không phép)';
    if (normalized === 'ON_LEAVE') return 'Nghỉ phép';
    if (normalized === 'MISSING_CLOCK_OUT') return 'Thiếu giờ ra';
    return 'Chưa chấm';
};

const attendanceStatusClass = (status) => {
    const normalized = String(status || '').toUpperCase();
    if (normalized === 'PRESENT') return 'bg-emerald-100 text-emerald-700';
    if (normalized === 'LATE') return 'bg-amber-100 text-amber-700';
    if (normalized === 'ABSENT') return 'bg-rose-100 text-rose-700';
    if (normalized === 'ON_LEAVE') return 'bg-blue-100 text-blue-700';
    if (normalized === 'MISSING_CLOCK_OUT') return 'bg-orange-100 text-orange-700';
    return 'bg-slate-100 text-slate-700';
};

const validateAttendancePatch = (record, patch) => {
    const nextCheckIn = patch.checkIn !== undefined ? patch.checkIn : record.checkIn;
    const nextCheckOut = patch.checkOut !== undefined ? patch.checkOut : record.checkOut;
    const overnightShift = isOvernightShift(record.shiftStartTime, record.shiftEndTime);

    if (!overnightShift && nextCheckIn && nextCheckOut && nextCheckOut <= nextCheckIn) {
        return 'Giờ ra phải sau giờ vào.';
    }

    return '';
};

const isOvernightShift = (start, end) => {
    const startText = formatTime(start);
    const endText = formatTime(end);
    if (startText === '--:--' || endText === '--:--') {
        return false;
    }

    return endText <= startText;
};

const policyWarningClass = (code) => {
    const normalized = String(code || '').toUpperCase();

    if (!normalized) {
        return 'border-slate-200 bg-slate-50 text-slate-700';
    }

    if (normalized === 'CLOCK_OUT_BEFORE_CLOCK_IN'
        || normalized === 'TIME_OUT_WITHOUT_TIME_IN'
        || normalized === 'CHECK_IN_AFTER_SHIFT_END') {
        return 'border-rose-200 bg-rose-50 text-rose-800';
    }

    if (normalized === 'EARLY_CLOCK_IN_OUT_OF_WINDOW'
        || normalized === 'LATE_CLOCK_OUT_OUT_OF_WINDOW'
        || normalized === 'CLOCK_OUT_BEFORE_SHIFT_END') {
        return 'border-amber-200 bg-amber-50 text-amber-800';
    }

    return 'border-blue-200 bg-blue-50 text-blue-800';
};

const validateAttendanceFilters = (filters) => {
    const errors = {};

    if (filters.scope === 'MONTH' && !filters.month) {
        errors.month = 'Vui lòng chọn tháng chấm công.';
    }

    if (filters.scope !== 'MONTH' && !filters.date) {
        errors.date = 'Vui lòng chọn ngày chấm công.';
    }

    return errors;
};

const toMonthInput = (value) => {
    const date = value instanceof Date ? value : new Date(value);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    return `${year}-${month}`;
};

const monthToDateRange = (month) => {
    const [year, monthValue] = String(month || '').split('-').map(Number);
    if (!year || !monthValue) {
        return { startDate: null, endDate: null };
    }
    const lastDay = new Date(year, monthValue, 0).getDate();
    return {
        startDate: `${year}-${String(monthValue).padStart(2, '0')}-01`,
        endDate: `${year}-${String(monthValue).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
    };
};

export default AttendanceManagement;
