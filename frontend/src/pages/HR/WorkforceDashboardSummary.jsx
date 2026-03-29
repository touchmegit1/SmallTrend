import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Users, Clock3, TriangleAlert, Wallet, BadgeDollarSign, CheckCircle2 } from 'lucide-react';
import { shiftService } from '../../services/shiftService';

const WorkforceDashboardSummary = ({ filters: controlledFilters, onFiltersChange, onPayrollPaid }) => {
    const [loading, setLoading] = useState(true);
    const [processingPaid, setProcessingPaid] = useState(false);
    const [error, setError] = useState('');
    const [localFilters, setLocalFilters] = useState(() => {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const defaultDueDate = new Date(now.getFullYear(), now.getMonth() + 1, 5);
        return {
            date: now.toISOString().slice(0, 10),
            fromMonth: currentMonth,
            toMonth: currentMonth,
            paymentDueDate: defaultDueDate.toISOString().slice(0, 10),
        };
    });
    const filters = controlledFilters || localFilters;
    const setFilters = onFiltersChange || setLocalFilters;
    const [dashboard, setDashboard] = useState({
        attendance: { total: 0, present: 0, late: 0, absent: 0, onLeave: 0 },
        payroll: { staffCount: 0, totalHours: 0, totalPayroll: 0, month: '' },
        paymentStatus: {
            month: '',
            dueDate: '',
            isPaid: false,
            overdueDays: 0,
            assignedStaff: 0,
            paidStaff: 0,
            remainingStaff: 0,
            supported: true,
            message: '',
        },
    });

    useEffect(() => {
        loadDashboard();
    }, [filters.date, filters.fromMonth, filters.toMonth, filters.paymentDueDate]);

    useEffect(() => {
        if (!filters?.toMonth || controlledFilters) {
            return;
        }

        const [year, month] = String(filters.toMonth).split('-').map(Number);
        if (!year || !month) {
            return;
        }

        const nextMonthDue = new Date(year, month, 5).toISOString().slice(0, 10);
        setLocalFilters((prev) => ({
            ...prev,
            paymentDueDate: prev.paymentDueDate || nextMonthDue,
        }));
    }, [filters?.toMonth, controlledFilters]);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await shiftService.getWorkforceDashboard({
                date: filters.date,
                fromMonth: filters.fromMonth,
                toMonth: filters.toMonth,
                paymentDueDate: filters.paymentDueDate,
            });
            setDashboard({
                attendance: {
                    total: Number(data?.attendance?.total || 0),
                    present: Number(data?.attendance?.present || 0),
                    late: Number(data?.attendance?.late || 0),
                    absent: Number(data?.attendance?.absent || 0),
                    onLeave: Number(data?.attendance?.onLeave || 0),
                },
                payroll: {
                    staffCount: Number(data?.payroll?.staffCount || 0),
                    totalHours: Number(data?.payroll?.totalHours || 0),
                    totalPayroll: Number(data?.payroll?.totalPayroll || 0),
                    month: data?.payroll?.month || '',
                },
                paymentStatus: {
                    month: data?.paymentStatus?.month || '',
                    dueDate: data?.paymentStatus?.dueDate || '',
                    isPaid: Boolean(data?.paymentStatus?.isPaid),
                    overdueDays: Number(data?.paymentStatus?.overdueDays || 0),
                    assignedStaff: Number(data?.paymentStatus?.assignedStaff || 0),
                    paidStaff: Number(data?.paymentStatus?.paidStaff || 0),
                    remainingStaff: Number(data?.paymentStatus?.remainingStaff || 0),
                    supported: data?.paymentStatus?.supported !== false,
                    message: data?.paymentStatus?.message || '',
                },
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải dashboard nhân sự');
            setDashboard({
                attendance: { total: 0, present: 0, late: 0, absent: 0, onLeave: 0 },
                payroll: { staffCount: 0, totalHours: 0, totalPayroll: 0, month: '' },
                paymentStatus: {
                    month: '',
                    dueDate: '',
                    isPaid: false,
                    overdueDays: 0,
                    assignedStaff: 0,
                    paidStaff: 0,
                    remainingStaff: 0,
                    supported: true,
                    message: '',
                },
            });
        } finally {
            setLoading(false);
        }
    };

    const canMarkPaid = useMemo(
        () => filters.fromMonth && filters.toMonth && filters.fromMonth === filters.toMonth,
        [filters.fromMonth, filters.toMonth]
    );

    const handleMarkPaid = async () => {
        if (!canMarkPaid) {
            setError('Vui lòng chọn cùng 1 tháng (Từ tháng = Đến tháng) để xác nhận đã thanh toán.');
            return;
        }

        const confirmed = window.confirm(`Xác nhận đã thanh toán lương tháng ${filters.fromMonth}? Tháng này sẽ được reset khỏi tổng lương.`);
        if (!confirmed) {
            return;
        }

        try {
            setProcessingPaid(true);
            setError('');
            await shiftService.markPayrollPaid({ month: filters.fromMonth });
            await loadDashboard();
            onPayrollPaid?.();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể xác nhận đã thanh toán lương.');
        } finally {
            setProcessingPaid(false);
        }
    };

    return (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/95 p-4 backdrop-blur-sm">
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={handleMarkPaid}
                    disabled={processingPaid || !canMarkPaid}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <CheckCircle2 size={15} />
                    {processingPaid ? 'Đang xử lý...' : 'Thanh toán lương tháng'}
                </button>
            </div>

            <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Ngày chấm công</label>
                    <input
                        type="date"
                        value={filters.date}
                        onChange={(event) => setFilters((prev) => ({ ...prev, date: event.target.value }))}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Từ tháng lương</label>
                    <input
                        type="month"
                        value={filters.fromMonth}
                        onChange={(event) => setFilters((prev) => ({ ...prev, fromMonth: event.target.value }))}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Đến tháng lương</label>
                    <input
                        type="month"
                        value={filters.toMonth}
                        onChange={(event) => setFilters((prev) => ({ ...prev, toMonth: event.target.value }))}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Chốt thanh toán lương</label>
                    <input
                        type="date"
                        value={filters.paymentDueDate || ''}
                        onChange={(event) => setFilters((prev) => ({ ...prev, paymentDueDate: event.target.value }))}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-sm text-slate-500">Đang tải dashboard nhân sự...</div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <StatCard title="Tổng ca" value={dashboard.attendance.total} icon={CalendarDays} />
                        <StatCard title="Có mặt" value={dashboard.attendance.present} icon={Users} />
                        <StatCard title="Đi muộn" value={dashboard.attendance.late} icon={Clock3} />
                        <StatCard title="Vắng (không phép)" value={dashboard.attendance.absent} icon={TriangleAlert} />
                        <StatCard title="Nghỉ phép" value={dashboard.attendance.onLeave} icon={CalendarDays} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <StatCard title="Nhân viên" value={dashboard.payroll.staffCount} icon={Users} />
                        <StatCard title="Tổng giờ công" value={Number(dashboard.payroll.totalHours || 0).toFixed(1)} icon={Clock3} />
                        <StatCard title="Tổng lương" value={formatCurrency(dashboard.payroll.totalPayroll || 0)} icon={BadgeDollarSign} />
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                        <p className="font-medium text-slate-900">
                            Bảng lương tháng: {dashboard.paymentStatus.month || filters.fromMonth}
                        </p>
                        <p className="mt-1">Chốt thanh toán: {formatDate(dashboard.paymentStatus.dueDate || filters.paymentDueDate)}</p>
                        <p className={`mt-1 font-medium ${dashboard.paymentStatus.isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {dashboard.paymentStatus.message || (dashboard.paymentStatus.isPaid ? 'Đã thanh toán lương tháng' : 'Chưa thanh toán lương tháng')}
                        </p>
                        {!dashboard.paymentStatus.isPaid && dashboard.paymentStatus.overdueDays > 0 && (
                            <p className="mt-1 font-semibold text-rose-600">
                                Trễ thanh toán {dashboard.paymentStatus.overdueDays} ngày.
                            </p>
                        )}
                    </div>
                    {dashboard.payroll.month && (
                        <p className="text-xs text-slate-500 inline-flex items-center gap-1">
                            <Wallet size={14} className="text-indigo-500" />
                            Phạm vi lương: {dashboard.payroll.month}
                        </p>
                    )}
                </>
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
        <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
);

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
}).format(value || 0);

const formatDate = (value) => {
    if (!value) {
        return '--/--/----';
    }
    return new Date(value).toLocaleDateString('vi-VN');
};

export default WorkforceDashboardSummary;
