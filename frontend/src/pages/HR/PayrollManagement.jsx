import React, { useEffect, useMemo, useState } from 'react';
import { shiftService } from '../../services/shiftService';
import { userService } from '../../services/userService';
import { Wallet, Users, Clock3, BadgeDollarSign, Settings, Eye, X, CheckCircle } from 'lucide-react';
import CustomSelect from '../../components/common/CustomSelect';
import { RequiredLegend, RequiredMark } from '../../components/common/RequiredFieldLegend';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PayrollManagement = ({ embedded = false, sharedRange = null, reloadToken = 0 }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const roleName = String(user?.role?.name || user?.role || '').toUpperCase();
    const isAdmin = roleName === 'ADMIN' || roleName === 'ROLE_ADMIN';
    const isManager = roleName === 'MANAGER' || roleName === 'ROLE_MANAGER';
    const canManageSalary = isAdmin || isManager;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [payrollRows, setPayrollRows] = useState([]);
    const [summary, setSummary] = useState({ staffCount: 0, totalHours: 0, totalPayroll: 0 });
    const [filterErrors, setFilterErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [salaryModalOpen, setSalaryModalOpen] = useState(false);
    const [salaryFormErrors, setSalaryFormErrors] = useState({});
    const [salaryFormSaving, setSalaryFormSaving] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [salaryForm, setSalaryForm] = useState({
        salaryType: 'MONTHLY',
        baseSalary: '',
        hourlyRate: '',
        minRequiredShifts: '',
        countLateAsPresent: true,
        workingHoursPerMonth: 208,
    });
    const [payingPayroll, setPayingPayroll] = useState(false);
    const [payrollMessage, setPayrollMessage] = useState('');

    const [filters, setFilters] = useState(() => {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        return {
            fromMonth: currentMonth,
            toMonth: currentMonth,
            userId: '',
        };
    });

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        loadPayroll();
    }, [filters.fromMonth, filters.toMonth, filters.userId, reloadToken]);

    useEffect(() => {
        if (!sharedRange) {
            return;
        }

        setFilters((prev) => ({
            ...prev,
            fromMonth: sharedRange.fromMonth || prev.fromMonth,
            toMonth: sharedRange.toMonth || prev.toMonth,
        }));
    }, [sharedRange?.fromMonth, sharedRange?.toMonth]);

    const loadUsers = async () => {
        try {
            const userRes = await userService.getAll({ page: 0, size: 100 });
            const usersPayload = userRes?.content ? userRes.content : userRes;
            setUsers(Array.isArray(usersPayload) ? usersPayload : []);
        } catch (err) {
            setUsers([]);
        }
    };

    const loadPayroll = async () => {
        const validationErrors = validatePayrollFilters(filters);
        setFilterErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            setError(Object.values(validationErrors)[0]);
            setPayrollRows([]);
            setSummary({ staffCount: 0, totalHours: 0, totalPayroll: 0 });
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const params = {
                fromMonth: filters.fromMonth,
                toMonth: filters.toMonth,
            };

            if (filters.userId) {
                params.userId = filters.userId;
            }

            const data = await shiftService.getPayrollSummary(params);
            setPayrollRows(Array.isArray(data?.rows) ? data.rows : []);
            setSummary({
                staffCount: data?.staffCount || 0,
                totalHours: Number(data?.totalHours || 0),
                totalPayroll: Number(data?.totalPayroll || 0),
            });
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải dữ liệu tính lương');
            setPayrollRows([]);
            setSummary({ staffCount: 0, totalHours: 0, totalPayroll: 0 });
        } finally {
            setLoading(false);
        }
    };

    const userPhoneMap = useMemo(
        () => new Map(users.map((user) => [String(user.id), user.phone || ''])),
        [users]
    );

    const filteredRows = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        if (!keyword) return payrollRows;

        return payrollRows.filter((row) => {
            const name = (row.fullName || '').toLowerCase();
            const phone = (userPhoneMap.get(String(row.userId)) || '').toLowerCase();
            return name.includes(keyword) || phone.includes(keyword);
        });
    }, [payrollRows, searchTerm, userPhoneMap]);

    if (loading) {
        return <div className="text-slate-500">Đang tải dữ liệu tính lương...</div>;
    }

    return (
        <div className="space-y-5">
            {!embedded && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                            <Wallet size={24} className="text-indigo-600" />
                            Tính lương
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Tổng hợp lương theo khoảng tháng dựa trên phân ca và dữ liệu chấm công.</p>
                    </div>
                    {canManageSalary && filters.fromMonth === filters.toMonth && (
                        <button
                            type="button"
                            disabled={payingPayroll || filteredRows.length === 0}
                            onClick={handleMarkPayrollPaid}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                            <CheckCircle size={16} />
                            {payingPayroll ? 'Đang xử lý...' : `Thanh toán lương tháng ${filters.fromMonth}`}
                        </button>
                    )}
                </div>
            )}

            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            {payrollMessage && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {payrollMessage}
                </div>
            )}

            {!embedded && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <StatCard title="Nhân viên" value={summary.staffCount} icon={Users} />
                    <StatCard title="Tổng giờ công" value={Number(summary.totalHours || 0).toFixed(1)} icon={Clock3} />
                    <StatCard title="Tổng lương" value={formatCurrency(summary.totalPayroll || 0)} icon={BadgeDollarSign} />
                </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className={`grid gap-3 ${embedded ? 'md:grid-cols-2' : 'md:grid-cols-4'}`}>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Tìm kiếm (tên / SĐT)</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Nhập tên hoặc số điện thoại"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
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
                    {!embedded && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">Từ tháng</label>
                                <input
                                    type="month"
                                    value={filters.fromMonth}
                                    onChange={(event) => setFilters((prev) => ({ ...prev, fromMonth: event.target.value }))}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm ${filterErrors.fromMonth ? 'border-rose-400' : 'border-slate-200'}`}
                                />
                                {filterErrors.fromMonth && <p className="text-xs text-rose-600">{filterErrors.fromMonth}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">Đến tháng</label>
                                <input
                                    type="month"
                                    value={filters.toMonth}
                                    onChange={(event) => setFilters((prev) => ({ ...prev, toMonth: event.target.value }))}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm ${filterErrors.toMonth ? 'border-rose-400' : 'border-slate-200'}`}
                                />
                                {filterErrors.toMonth && <p className="text-xs text-rose-600">{filterErrors.toMonth}</p>}
                            </div>
                        </>
                    )}

                </div>
                {embedded && (
                    <p className="mt-2 text-xs text-slate-500">
                        Đang dùng phạm vi tháng từ dashboard phía trên: {filters.fromMonth} → {filters.toMonth}
                    </p>
                )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-[1250px] w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <th className="px-4 py-3">Nhân viên</th>
                                <th className="px-4 py-3">Số điện thoại</th>
                                <th className="px-4 py-3">Chế độ lương</th>
                                <th className="px-4 py-3">Ca làm</th>
                                <th className="px-4 py-3">Giờ công</th>
                                <th className="px-4 py-3">Muộn / Vắng / Nghỉ phép</th>
                                <th className="px-4 py-3">Khấu trừ</th>
                                <th className="px-4 py-3">Đơn giá</th>
                                <th className="px-4 py-3">Thực nhận</th>
                                <th className="px-4 py-3">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredRows.map((row) => (
                                <tr key={row.userId} className="text-sm text-slate-700 hover:bg-slate-50/60">
                                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{row.fullName}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{userPhoneMap.get(String(row.userId)) || '-'}</td>
                                    <td className="px-4 py-3 min-w-[260px]">
                                        <div>{formatSalaryType(row.salaryType)}</div>
                                        {(row.salaryType === 'MONTHLY' || row.salaryType === 'MONTHLY_MIN_SHIFTS') && (
                                            <div className="text-xs text-slate-500">Lương cơ bản: {formatCurrency(row.baseSalary || 0)}</div>
                                        )}
                                        {row.salaryType === 'MONTHLY_MIN_SHIFTS' && (
                                            <div className={`text-xs ${row.eligibleForMonthlySalary ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {row.workedShifts}/{row.minRequiredShifts || 0} ca - {row.eligibleForMonthlySalary ? 'Đủ điều kiện' : 'Chưa đủ'}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">{row.workedShifts}/{row.totalShifts}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{Number(row.workedHours || 0).toFixed(1)} giờ</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex flex-col gap-0.5">
                                            {row.lateShifts > 0 && <span className="text-amber-600">Muộn: {row.lateShifts} (-{formatCurrency(row.lateShifts * 50000)})</span>}
                                            {row.absentShifts > 0 && <span className="text-rose-600">Vắng: {row.absentShifts} (-{formatCurrency(row.absentShifts * 200000)})</span>}
                                            {(row.leaveDays || 0) > 0 && <span className="text-blue-600">Nghỉ phép: {row.leaveDays}</span>}
                                            {!row.lateShifts && !row.absentShifts && !(row.leaveDays > 0) && <span className="text-emerald-600">Tốt</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-rose-600 font-medium">
                                        {Number(row.deductions || 0) > 0 ? `-${formatCurrency(row.deductions)}` : '-'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(row.hourlyRate)}</td>
                                    <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{formatCurrency(row.netPay)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/hr/workforce/employee/${row.userId}?fromMonth=${filters.fromMonth}&toMonth=${filters.toMonth}`)}
                                                className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                            >
                                                <Eye size={13} />
                                                Xem lương
                                            </button>
                                            {canManageSalary && (
                                                <button
                                                    type="button"
                                                    onClick={() => openSalaryModal(row)}
                                                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                                >
                                                    <Settings size={13} />
                                                    Sửa lương
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredRows.length === 0 && (
                    <div className="px-4 py-6 text-sm text-slate-500">Không có dữ liệu lương cho bộ lọc hiện tại.</div>
                )}
            </div>

            {salaryModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) closeSalaryModal(); }}>
                    <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Cấu hình lương nhân viên</h3>
                                <p className="text-sm text-slate-500 mt-1">{selectedEmployee?.fullName || ''}</p>
                                <RequiredLegend className="mt-1" />
                            </div>
                            <button
                                type="button"
                                onClick={closeSalaryModal}
                                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Chế độ lương <RequiredMark type="frontendAndBackend" /></label>
                                <div className="mt-1">
                                    <CustomSelect
                                        value={salaryForm.salaryType}
                                        onChange={(value) => setSalaryForm((prev) => ({ ...prev, salaryType: value }))}
                                        options={[
                                            { value: 'MONTHLY', label: 'Theo tháng' },
                                            { value: 'MONTHLY_MIN_SHIFTS', label: 'Theo tháng (đủ số ca)' },
                                            { value: 'HOURLY', label: 'Theo giờ' },
                                        ]}
                                    />
                                </div>
                                {salaryFormErrors.salaryType && <p className="mt-1 text-xs text-rose-600">{salaryFormErrors.salaryType}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Lương cơ bản (VND) <RequiredMark type="frontendAndBackend" /></label>
                                    <input
                                        type="number"
                                        value={salaryForm.baseSalary}
                                        onChange={(event) => setSalaryForm((prev) => ({ ...prev, baseSalary: event.target.value }))}
                                        min="0"
                                        className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${salaryFormErrors.baseSalary ? 'border-rose-400' : 'border-slate-200'}`}
                                        placeholder="7000000"
                                    />
                                    {salaryFormErrors.baseSalary && <p className="mt-1 text-xs text-rose-600">{salaryFormErrors.baseSalary}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Đơn giá giờ (VND) <RequiredMark type="frontendAndBackend" /></label>
                                    <input
                                        type="number"
                                        value={salaryForm.hourlyRate}
                                        onChange={(event) => setSalaryForm((prev) => ({ ...prev, hourlyRate: event.target.value }))}
                                        min="0"
                                        className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${salaryFormErrors.hourlyRate ? 'border-rose-400' : 'border-slate-200'}`}
                                        placeholder="30000"
                                    />
                                    {salaryFormErrors.hourlyRate && <p className="mt-1 text-xs text-rose-600">{salaryFormErrors.hourlyRate}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Số ca tối thiểu/tháng <RequiredMark type="frontendAndBackend" /></label>
                                    <input
                                        type="number"
                                        value={salaryForm.minRequiredShifts}
                                        onChange={(event) => setSalaryForm((prev) => ({ ...prev, minRequiredShifts: event.target.value }))}
                                        min="0"
                                        className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${salaryFormErrors.minRequiredShifts ? 'border-rose-400' : 'border-slate-200'}`}
                                        placeholder="20"
                                    />
                                    {salaryFormErrors.minRequiredShifts && <p className="mt-1 text-xs text-rose-600">{salaryFormErrors.minRequiredShifts}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Giờ chuẩn/tháng <RequiredMark type="frontendAndBackend" /></label>
                                    <input
                                        type="number"
                                        value={salaryForm.workingHoursPerMonth}
                                        onChange={(event) => setSalaryForm((prev) => ({ ...prev, workingHoursPerMonth: event.target.value }))}
                                        min="1"
                                        className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${salaryFormErrors.workingHoursPerMonth ? 'border-rose-400' : 'border-slate-200'}`}
                                        placeholder="208"
                                    />
                                    {salaryFormErrors.workingHoursPerMonth && <p className="mt-1 text-xs text-rose-600">{salaryFormErrors.workingHoursPerMonth}</p>}
                                </div>
                            </div>

                            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={Boolean(salaryForm.countLateAsPresent)}
                                    onChange={(event) => setSalaryForm((prev) => ({ ...prev, countLateAsPresent: event.target.checked }))}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                Tính đi trễ là có mặt (để xét đủ ca)
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
                            <button
                                type="button"
                                onClick={closeSalaryModal}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                disabled={salaryFormSaving}
                                onClick={handleSaveSalaryConfig}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
                            >
                                {salaryFormSaving ? 'Đang lưu...' : 'Lưu cấu hình'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    function openSalaryModal(row) {
        if (!canManageSalary) {
            return;
        }
        const user = users.find((entry) => String(entry.id) === String(row.userId));
        setSelectedEmployee({
            id: row.userId,
            fullName: row.fullName,
            user,
        });
        setSalaryForm({
            salaryType: user?.salaryType || row.salaryType || 'MONTHLY',
            baseSalary: user?.baseSalary ?? row.baseSalary ?? '',
            hourlyRate: user?.hourlyRate ?? row.hourlyRate ?? '',
            minRequiredShifts: user?.minRequiredShifts ?? row.minRequiredShifts ?? '',
            countLateAsPresent: user?.countLateAsPresent ?? true,
            workingHoursPerMonth: user?.workingHoursPerMonth ?? 208,
        });
        setSalaryFormErrors({});
        setSalaryModalOpen(true);
    }

    async function handleMarkPayrollPaid() {
        if (!filters.fromMonth) return;
        const confirmed = window.confirm(
            `Xác nhận thanh toán lương tháng ${filters.fromMonth} cho ${filteredRows.length} nhân viên?\nHệ thống sẽ gửi email xác nhận đến admin.`
        );
        if (!confirmed) return;

        try {
            setPayingPayroll(true);
            setPayrollMessage('');
            setError('');
            const params = { month: filters.fromMonth };
            if (filters.userId) params.userId = filters.userId;
            const result = await shiftService.markPayrollPaid(params);
            setPayrollMessage(typeof result === 'string' ? result : (result?.message || 'Đã thanh toán lương thành công. Email xác nhận đã được gửi đến admin.'));
            await loadPayroll();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể thanh toán lương.');
        } finally {
            setPayingPayroll(false);
        }
    }

    function closeSalaryModal() {
        setSalaryModalOpen(false);
        setSelectedEmployee(null);
        setSalaryFormErrors({});
    }

    async function handleSaveSalaryConfig() {
        const errors = validateSalaryForm(salaryForm);
        setSalaryFormErrors(errors);
        if (Object.keys(errors).length > 0 || !selectedEmployee?.id) {
            return;
        }

        const currentUser = users.find((entry) => String(entry.id) === String(selectedEmployee.id));
        if (!currentUser) {
            setError('Không tìm thấy thông tin nhân viên để cập nhật lương.');
            return;
        }

        try {
            setSalaryFormSaving(true);
            await userService.update(selectedEmployee.id, {
                fullName: currentUser.fullName,
                email: currentUser.email,
                phone: currentUser.phone || undefined,
                address: currentUser.address || undefined,
                roleId: currentUser.role?.id,
                status: currentUser.status,
                ...buildSalaryPayload(salaryForm),
            });
            await loadUsers();
            await loadPayroll();
            setError('');
            closeSalaryModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể cập nhật cấu hình lương nhân viên.');
        } finally {
            setSalaryFormSaving(false);
        }
    }
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

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);
};

const formatSalaryType = (salaryType) => {
    if (salaryType === 'HOURLY') return 'Theo giờ';
    if (salaryType === 'MONTHLY_MIN_SHIFTS') return 'Theo tháng (đủ ca)';
    if (salaryType === 'MONTHLY') return 'Theo tháng';
    return 'Theo giờ';
};

const validatePayrollFilters = (filters) => {
    const errors = {};

    if (!filters.fromMonth) {
        errors.fromMonth = 'Vui lòng chọn tháng bắt đầu.';
    }

    if (!filters.toMonth) {
        errors.toMonth = 'Vui lòng chọn tháng kết thúc.';
    }

    if (filters.fromMonth && filters.toMonth && filters.fromMonth > filters.toMonth) {
        errors.toMonth = 'Tháng kết thúc phải lớn hơn hoặc bằng tháng bắt đầu.';
    }

    return errors;
};

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
        errors.salaryType = 'Vui lòng chọn chế độ lương.';
    }

    if ((salaryType === 'MONTHLY' || salaryType === 'MONTHLY_MIN_SHIFTS')
        && (salaryForm.baseSalary === '' || Number.isNaN(baseSalary) || baseSalary < 0)) {
        errors.baseSalary = 'Lương cơ bản phải lớn hơn hoặc bằng 0.';
    }

    if ((salaryType === 'HOURLY' || salaryType === 'MONTHLY' || salaryType === 'MONTHLY_MIN_SHIFTS')
        && (salaryForm.hourlyRate === '' || Number.isNaN(hourlyRate) || hourlyRate < 0)) {
        errors.hourlyRate = 'Đơn giá giờ phải lớn hơn hoặc bằng 0.';
    }

    if ((salaryType === 'MONTHLY' || salaryType === 'MONTHLY_MIN_SHIFTS')
        && (salaryForm.workingHoursPerMonth === '' || Number.isNaN(workingHoursPerMonth) || workingHoursPerMonth <= 0)) {
        errors.workingHoursPerMonth = 'Giờ chuẩn/tháng phải lớn hơn 0.';
    }

    if (salaryType === 'MONTHLY_MIN_SHIFTS'
        && (salaryForm.minRequiredShifts === '' || Number.isNaN(minRequiredShifts) || minRequiredShifts < 0)) {
        errors.minRequiredShifts = 'Số ca tối thiểu phải lớn hơn hoặc bằng 0.';
    }

    return errors;
};

export default PayrollManagement;
