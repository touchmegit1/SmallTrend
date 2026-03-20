import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarClock, Clock3, Settings, UserRoundCheck, Wallet, X } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { shiftService } from '../../services/shiftService';
import CustomSelect from '../../components/common/CustomSelect';

const defaultSalaryForm = {
    salaryType: 'MONTHLY',
    baseSalary: '',
    hourlyRate: '',
    minRequiredShifts: '',
    countLateAsPresent: true,
    workingHoursPerMonth: 208,
};

const EmployeeDetailPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const { user: currentUser } = useAuth();

    const roleName = String(currentUser?.role?.name || currentUser?.role || '').toUpperCase();
    const isAdmin = roleName === 'ADMIN' || roleName === 'ROLE_ADMIN';
    const isManager = isAdmin || roleName === 'MANAGER' || roleName === 'ROLE_MANAGER';

    const [loading, setLoading] = useState(true);
    const [savingSalary, setSavingSalary] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [employee, setEmployee] = useState(null);
    const [payrollRow, setPayrollRow] = useState(null);
    const [attendanceRows, setAttendanceRows] = useState([]);
    const [hasUnpaidPayrollHistory, setHasUnpaidPayrollHistory] = useState(false);

    const [filters, setFilters] = useState(() => {
        const queryMonth = new URLSearchParams(location.search).get('month');
        if (queryMonth && /^\d{4}-\d{2}$/.test(queryMonth)) {
            return { month: queryMonth };
        }

        const now = new Date();
        return {
            month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
        };
    });

    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [salaryForm, setSalaryForm] = useState(defaultSalaryForm);
    const [salaryErrors, setSalaryErrors] = useState({});

    const targetUserId = Number(id || 0);

    const monthRange = useMemo(() => {
        const [year, month] = String(filters.month || '').split('-').map(Number);
        if (!year || !month) {
            return { startDate: null, endDate: null };
        }
        const lastDay = new Date(year, month, 0).getDate();
        return {
            startDate: `${year}-${String(month).padStart(2, '0')}-01`,
            endDate: `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
        };
    }, [filters.month]);

    useEffect(() => {
        if (!targetUserId) {
            setError('Khong tim thay nhan vien.');
            setLoading(false);
            return;
        }
        loadData();
    }, [targetUserId, filters.month]);

    const loadData = async () => {
        try {
            setLoading(true);
            const now = new Date();
            const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

            const [userData, payrollData, attendanceData, payrollHistory] = await Promise.all([
                userService.getById(targetUserId),
                shiftService.getPayrollSummary({ month: filters.month, userId: targetUserId }),
                shiftService.getAttendance({
                    userId: targetUserId,
                    startDate: monthRange.startDate,
                    endDate: monthRange.endDate,
                }),
                shiftService.getPayrollSummary({
                    fromMonth: '2020-01',
                    toMonth: currentMonth,
                    userId: targetUserId,
                }),
            ]);

            const row = Array.isArray(payrollData?.rows) && payrollData.rows.length > 0 ? payrollData.rows[0] : null;
            const monthRows = Array.isArray(attendanceData) ? attendanceData : [];
            const historyRows = Array.isArray(payrollHistory?.rows) ? payrollHistory.rows : [];

            setEmployee(userData || null);
            setPayrollRow(row);
            setAttendanceRows(
                monthRows
                    .filter((entry) => String(entry.date || '').startsWith(filters.month))
                    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
            );
            setHasUnpaidPayrollHistory(historyRows.some((entry) => entry && entry.isPaid === false));
            setError('');
        } catch (loadError) {
            setEmployee(null);
            setPayrollRow(null);
            setAttendanceRows([]);
            setError(extractErrorMessage(loadError, 'Khong the tai thong tin nhan vien.'));
        } finally {
            setLoading(false);
        }
    };

    const openSalaryModal = () => {
        setSalaryForm({
            salaryType: employee?.salaryType || payrollRow?.salaryType || 'MONTHLY',
            baseSalary: employee?.baseSalary ?? payrollRow?.baseSalary ?? '',
            hourlyRate: employee?.hourlyRate ?? payrollRow?.hourlyRate ?? '',
            minRequiredShifts: employee?.minRequiredShifts ?? payrollRow?.minRequiredShifts ?? '',
            countLateAsPresent: employee?.countLateAsPresent ?? true,
            workingHoursPerMonth: employee?.workingHoursPerMonth ?? 208,
        });
        setSalaryErrors({});
        setShowSalaryModal(true);
    };

    const handleSaveSalary = async () => {
        const nextErrors = validateSalaryForm(salaryForm);
        setSalaryErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0 || !employee?.id) {
            return;
        }

        if (hasUnpaidPayrollHistory) {
            setSalaryErrors({
                general: 'Can thanh toan het bang luong cu truoc khi thay doi cau hinh luong co ban.',
            });
            return;
        }

        try {
            setSavingSalary(true);
            await userService.update(employee.id, {
                fullName: employee.fullName,
                email: employee.email,
                phone: employee.phone || undefined,
                address: employee.address || undefined,
                roleId: employee.role?.id,
                status: employee.status,
                ...buildSalaryPayload(salaryForm),
            });
            setMessage('Da cap nhat cau hinh luong.');
            setShowSalaryModal(false);
            await loadData();
        } catch (saveError) {
            setSalaryErrors({
                general: extractErrorMessage(saveError, 'Khong the cap nhat cau hinh luong.'),
            });
        } finally {
            setSavingSalary(false);
        }
    };

    if (loading) {
        return <div className="text-slate-500">Dang tai thong tin nhan vien...</div>;
    }

    if (!employee) {
        return (
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300"
                    >
                        <ArrowLeft size={14} /> Quay lai trang truoc
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/hr/workforce')}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300"
                    >
                        <ArrowLeft size={14} /> Nhân Sự Tổng Hợp
                    </button>
                </div>
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error || 'Khong tim thay nhan vien.'}</div>
            </div>
        );
    }

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
                            onClick={() => navigate('/hr/workforce')}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300"
                        >
                            <ArrowLeft size={14} /> Nhân Sự Tổng Hợp
                        </button>
                    </div>
                    <h1 className="text-2xl font-semibold text-slate-900">Chi tiet nhan vien: {employee.fullName || `User #${employee.id}`}</h1>
                    <p className="mt-1 text-sm text-slate-500">Dashboard ca lam, check-in/out va thong tin luong theo thang.</p>
                </div>
                {isAdmin && (
                    <button
                        type="button"
                        disabled={hasUnpaidPayrollHistory}
                        onClick={openSalaryModal}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 disabled:opacity-60"
                        title={hasUnpaidPayrollHistory ? 'Can thanh toan het bang luong cu truoc khi cap nhat.' : 'Sua cau hinh luong'}
                    >
                        <Settings size={16} /> Sua luong
                    </button>
                )}
            </div>

            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
            )}

            {message && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>
            )}

            {hasUnpaidPayrollHistory && isAdmin && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    Nhan vien nay con ky luong chua thanh toan. Vui long thanh toan het luong cu truoc khi thay doi cau hinh luong.
                </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="grid gap-3 md:grid-cols-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Thang</label>
                        <input
                            type="month"
                            value={filters.month}
                            onChange={(event) => setFilters((prev) => ({ ...prev, month: event.target.value }))}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                    </div>
                    <StatCard title="Tong ca" value={payrollRow?.totalShifts ?? 0} icon={CalendarClock} />
                    <StatCard title="Ca da lam" value={payrollRow?.workedShifts ?? 0} icon={UserRoundCheck} />
                    <StatCard title="Buoi nghi" value={payrollRow?.absentShifts ?? 0} icon={Clock3} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <InfoCard label="Email" value={employee.email || '-'} />
                <InfoCard label="So dien thoai" value={employee.phone || '-'} />
                <InfoCard label="Vai tro" value={employee.role?.name || '-'} />
                <InfoCard label="Che do luong" value={formatSalaryType(payrollRow?.salaryType || employee.salaryType)} />
                <InfoCard label="Luong co ban" value={formatCurrency(payrollRow?.baseSalary ?? employee.baseSalary ?? 0)} />
                <InfoCard label="Don gia/ gio" value={`${formatCurrency(payrollRow?.hourlyRate ?? employee.hourlyRate ?? 0)}/gio`} />
                <InfoCard label="Gio cong" value={`${Number(payrollRow?.workedHours || 0).toFixed(1)} gio`} />
                <InfoCard label="Tang ca" value={`${Number(payrollRow?.overtimeHours || 0).toFixed(1)} gio`} />
                <InfoCard label="Luong thuc nhan" value={formatCurrency(payrollRow?.netPay || 0)} emphasize />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="grid grid-cols-5 gap-2 border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <div>Ngay</div>
                    <div>Trang thai</div>
                    <div>Ca lam</div>
                    <div>Gio vao</div>
                    <div>Gio ra</div>
                </div>
                {attendanceRows.map((item) => (
                    <div key={item.id} className="grid grid-cols-5 gap-2 border-b border-slate-100 px-4 py-3 text-sm text-slate-700">
                        <div>{item.date || '-'}</div>
                        <div>
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColorClass(item.status)}`}>
                                {formatAttendanceStatus(item.status)}
                            </span>
                        </div>
                        <div>{item.shiftName || '-'}</div>
                        <div>{item.timeIn || '-'}</div>
                        <div>{item.timeOut || '-'}</div>
                    </div>
                ))}
                {attendanceRows.length === 0 && (
                    <div className="px-4 py-6 text-sm text-slate-500">Khong co du lieu cham cong trong thang da chon.</div>
                )}
            </div>

            {showSalaryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Cap nhat cau hinh luong</h2>
                                <p className="text-xs text-slate-500">Chi admin duoc phep cap nhat va phai tat toan luong cu truoc.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowSalaryModal(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4 p-6">
                            {salaryErrors.general && (
                                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{salaryErrors.general}</div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">Che do luong <span className="text-rose-500">*</span></label>
                                <CustomSelect
                                    value={salaryForm.salaryType}
                                    onChange={(value) => setSalaryForm((prev) => ({ ...prev, salaryType: value }))}
                                    options={[
                                        { value: 'MONTHLY', label: 'Theo thang' },
                                        { value: 'MONTHLY_MIN_SHIFTS', label: 'Theo thang (du so ca)' },
                                        { value: 'HOURLY', label: 'Theo gio' },
                                    ]}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Luong co ban (VND) <span className="text-rose-500">*</span></label>
                                    <input
                                        type="number"
                                        value={salaryForm.baseSalary}
                                        onChange={(event) => setSalaryForm((prev) => ({ ...prev, baseSalary: event.target.value }))}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    />
                                    {salaryErrors.baseSalary && <p className="text-xs text-rose-600">{salaryErrors.baseSalary}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Don gia gio (VND) <span className="text-rose-500">*</span></label>
                                    <input
                                        type="number"
                                        value={salaryForm.hourlyRate}
                                        onChange={(event) => setSalaryForm((prev) => ({ ...prev, hourlyRate: event.target.value }))}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    />
                                    {salaryErrors.hourlyRate && <p className="text-xs text-rose-600">{salaryErrors.hourlyRate}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">So ca toi thieu/ thang <span className="text-rose-500">*</span></label>
                                    <input
                                        type="number"
                                        value={salaryForm.minRequiredShifts}
                                        onChange={(event) => setSalaryForm((prev) => ({ ...prev, minRequiredShifts: event.target.value }))}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    />
                                    {salaryErrors.minRequiredShifts && <p className="text-xs text-rose-600">{salaryErrors.minRequiredShifts}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Gio chuan/ thang <span className="text-rose-500">*</span></label>
                                    <input
                                        type="number"
                                        value={salaryForm.workingHoursPerMonth}
                                        onChange={(event) => setSalaryForm((prev) => ({ ...prev, workingHoursPerMonth: event.target.value }))}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    />
                                    {salaryErrors.workingHoursPerMonth && <p className="text-xs text-rose-600">{salaryErrors.workingHoursPerMonth}</p>}
                                </div>
                            </div>

                            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={Boolean(salaryForm.countLateAsPresent)}
                                    onChange={(event) => setSalaryForm((prev) => ({ ...prev, countLateAsPresent: event.target.checked }))}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                                />
                                Tinh di tre la co mat (de xet du so ca)
                            </label>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setShowSalaryModal(false)}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700"
                            >
                                Huy
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveSalary}
                                disabled={savingSalary || hasUnpaidPayrollHistory}
                                className="rounded-lg border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                            >
                                {savingSalary ? 'Dang luu...' : 'Luu'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon }) => (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
            {Icon ? <Icon size={16} className="text-indigo-500" /> : null}
        </div>
        <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    </div>
);

const InfoCard = ({ label, value, emphasize = false }) => (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
        <p className={`mt-2 text-base font-semibold ${emphasize ? 'text-indigo-700' : 'text-slate-900'}`}>{value}</p>
    </div>
);

const toNullableNumber = (value) => {
    if (value === '' || value === null || value === undefined) {
        return null;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
};

const buildSalaryPayload = (salaryForm) => ({
    salaryType: String(salaryForm.salaryType || 'MONTHLY').toUpperCase(),
    baseSalary: toNullableNumber(salaryForm.baseSalary),
    hourlyRate: toNullableNumber(salaryForm.hourlyRate),
    minRequiredShifts: toNullableNumber(salaryForm.minRequiredShifts),
    countLateAsPresent: Boolean(salaryForm.countLateAsPresent),
    workingHoursPerMonth: toNullableNumber(salaryForm.workingHoursPerMonth),
});

const validateSalaryForm = (salaryForm) => {
    const errors = {};
    const salaryType = String(salaryForm.salaryType || '').toUpperCase();
    const baseSalary = Number(salaryForm.baseSalary);
    const hourlyRate = Number(salaryForm.hourlyRate);
    const minRequiredShifts = Number(salaryForm.minRequiredShifts);
    const workingHoursPerMonth = Number(salaryForm.workingHoursPerMonth);

    if (!salaryType) {
        errors.salaryType = 'Vui long chon che do luong.';
    }

    if ((salaryType === 'MONTHLY' || salaryType === 'MONTHLY_MIN_SHIFTS')
        && (salaryForm.baseSalary === '' || Number.isNaN(baseSalary) || baseSalary < 0)) {
        errors.baseSalary = 'Luong co ban phai lon hon hoac bang 0.';
    }

    if ((salaryType === 'HOURLY' || salaryType === 'MONTHLY' || salaryType === 'MONTHLY_MIN_SHIFTS')
        && (salaryForm.hourlyRate === '' || Number.isNaN(hourlyRate) || hourlyRate < 0)) {
        errors.hourlyRate = 'Don gia gio phai lon hon hoac bang 0.';
    }

    if ((salaryType === 'MONTHLY' || salaryType === 'MONTHLY_MIN_SHIFTS')
        && (salaryForm.workingHoursPerMonth === '' || Number.isNaN(workingHoursPerMonth) || workingHoursPerMonth <= 0)) {
        errors.workingHoursPerMonth = 'Gio chuan/thang phai lon hon 0.';
    }

    if (salaryType === 'MONTHLY_MIN_SHIFTS'
        && (salaryForm.minRequiredShifts === '' || Number.isNaN(minRequiredShifts) || minRequiredShifts < 0)) {
        errors.minRequiredShifts = 'So ca toi thieu phai lon hon hoac bang 0.';
    }

    return errors;
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);
};

const formatSalaryType = (salaryType) => {
    if (salaryType === 'HOURLY') return 'Theo gio';
    if (salaryType === 'MONTHLY_MIN_SHIFTS') return 'Theo thang (du ca)';
    if (salaryType === 'MONTHLY') return 'Theo thang';
    return '-';
};

const formatAttendanceStatus = (status) => {
    if (!status) return '-';
    if (status === 'PRESENT') return 'Co mat';
    if (status === 'LATE') return 'Di tre';
    if (status === 'ABSENT') return 'Vang';
    return status;
};

const getStatusColorClass = (status) => {
    switch (status) {
        case 'PRESENT':
            return 'bg-emerald-100 text-emerald-700';
        case 'LATE':
            return 'bg-amber-100 text-amber-700';
        case 'ABSENT':
            return 'bg-rose-100 text-rose-700';
        case 'PENDING':
            return 'bg-slate-100 text-slate-700';
        default:
            return 'bg-slate-100 text-slate-700';
    }
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

export default EmployeeDetailPage;
