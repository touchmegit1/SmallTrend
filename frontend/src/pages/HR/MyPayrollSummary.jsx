import React, { useEffect, useMemo, useState } from 'react';
import { Wallet, CalendarClock, Clock3, UserRoundCheck } from 'lucide-react';
import { shiftService } from '../../services/shiftService';
import { useAuth } from '../../context/AuthContext';

const MyPayrollSummary = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState(() => {
        const now = new Date();
        return {
            month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
        };
    });

    const [payrollRow, setPayrollRow] = useState(null);
    const [attendanceRows, setAttendanceRows] = useState([]);

    const currentUserId = useMemo(() => user?.id || user?.userId, [user]);

    useEffect(() => {
        if (!currentUserId) {
            setLoading(false);
            setError('Không xác định được tài khoản hiện tại để tải bảng lương cá nhân.');
            return;
        }
        loadData();
    }, [filters.month, currentUserId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const payroll = await shiftService.getPayrollSummary({
                month: filters.month,
                userId: currentUserId,
            });
            const row = Array.isArray(payroll?.rows) && payroll.rows.length > 0 ? payroll.rows[0] : null;
            setPayrollRow(row);

            const attendance = await shiftService.getAttendance({ userId: currentUserId });
            const monthRows = Array.isArray(attendance)
                ? attendance.filter((entry) => String(entry.date || '').startsWith(filters.month))
                : [];

            monthRows.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
            setAttendanceRows(monthRows);
            setError('');
        } catch (err) {
            setPayrollRow(null);
            setAttendanceRows([]);
            setError(err.response?.data?.message || 'Không thể tải dữ liệu lương cá nhân.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-slate-500">Đang tải bảng lương cá nhân...</div>;
    }

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                    <Wallet size={24} className="text-indigo-600" />
                    Lương cá nhân
                </h1>
                <p className="text-sm text-slate-500 mt-1">Tổng hợp ca làm, số buổi nghỉ và thông tin lương của chính bạn theo từng tháng.</p>
            </div>

            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="grid gap-3 md:grid-cols-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Tháng</label>
                        <input
                            type="month"
                            value={filters.month}
                            onChange={(event) => setFilters((prev) => ({ ...prev, month: event.target.value }))}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                    </div>
                    <StatCard title="Tổng ca" value={payrollRow?.totalShifts ?? 0} icon={CalendarClock} />
                    <StatCard title="Ca đã làm" value={payrollRow?.workedShifts ?? 0} icon={UserRoundCheck} />
                    <StatCard title="Buổi nghỉ" value={payrollRow?.absentShifts ?? 0} icon={Clock3} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <InfoCard label="Chế độ lương" value={formatSalaryType(payrollRow?.salaryType)} />
                <InfoCard label="Lương cơ bản" value={formatCurrency(payrollRow?.baseSalary || 0)} />
                <InfoCard label="Đơn giá/giờ" value={`${formatCurrency(payrollRow?.hourlyRate || 0)}/giờ`} />
                <InfoCard label="Giờ công" value={`${Number(payrollRow?.workedHours || 0).toFixed(1)} giờ`} />
                <InfoCard label="Tăng ca" value={`${Number(payrollRow?.overtimeHours || 0).toFixed(1)} giờ`} />
                <InfoCard label="Lương thực nhận" value={formatCurrency(payrollRow?.netPay || 0)} emphasize />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="grid grid-cols-5 gap-2 border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <div>Ngày</div>
                    <div>Trạng thái</div>
                    <div>Ca làm</div>
                    <div>Giờ vào</div>
                    <div>Giờ ra</div>
                </div>
                {attendanceRows.map((item) => (
                    <div key={item.id} className="grid grid-cols-5 gap-2 border-b border-slate-100 px-4 py-3 text-sm text-slate-700">
                        <div>{item.date || '-'}</div>
                        <div>{formatAttendanceStatus(item.status)}</div>
                        <div>{item.shiftName || '-'}</div>
                        <div>{item.timeIn || '-'}</div>
                        <div>{item.timeOut || '-'}</div>
                    </div>
                ))}
                {attendanceRows.length === 0 && (
                    <div className="px-4 py-6 text-sm text-slate-500">Không có dữ liệu chấm công trong tháng đã chọn.</div>
                )}
            </div>
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

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);
};

const formatSalaryType = (salaryType) => {
    if (salaryType === 'HOURLY') return 'Theo giờ';
    if (salaryType === 'MONTHLY_MIN_SHIFTS') return 'Theo tháng (đủ ca)';
    if (salaryType === 'MONTHLY') return 'Theo tháng';
    return '-';
};

const formatAttendanceStatus = (status) => {
    if (!status) return '-';
    if (status === 'PRESENT') return 'Có mặt';
    if (status === 'LATE') return 'Đi trễ';
    if (status === 'ABSENT') return 'Vắng';
    return status;
};

export default MyPayrollSummary;
