import React, { useEffect, useMemo, useState } from 'react';
import { shiftService } from '../../services/shiftService';
import { userService } from '../../services/userService';

const PayrollManagement = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [payrollRows, setPayrollRows] = useState([]);
    const [summary, setSummary] = useState({ staffCount: 0, totalHours: 0, totalPayroll: 0 });

    const [filters, setFilters] = useState(() => {
        const now = new Date();
        return {
            month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
            userId: '',
            hourlyRate: 30000,
        };
    });

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        loadPayroll();
    }, [filters.month, filters.userId, filters.hourlyRate]);

    const loadUsers = async () => {
        try {
            const userRes = await userService.getAll();
            const usersPayload = userRes?.content ? userRes.content : userRes;
            setUsers(Array.isArray(usersPayload) ? usersPayload : []);
        } catch (err) {
            setUsers([]);
        }
    };

    const loadPayroll = async () => {
        try {
            setLoading(true);
            const params = {
                month: filters.month,
                hourlyRate: filters.hourlyRate,
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

    if (loading) {
        return <div className="text-slate-500">Đang tải dữ liệu tính lương...</div>;
    }

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Tính lương</h1>
                <p className="text-sm text-slate-500 mt-1">Tổng hợp lương theo tháng dựa trên phân ca và dữ liệu chấm công.</p>
            </div>

            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <StatCard title="Nhân viên" value={summary.staffCount} />
                <StatCard title="Tổng giờ công" value={Number(summary.totalHours || 0).toFixed(1)} />
                <StatCard title="Đơn giá/giờ" value={formatCurrency(Number(filters.hourlyRate || 0))} />
                <StatCard title="Tổng lương" value={formatCurrency(summary.totalPayroll || 0)} />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="grid gap-3 md:grid-cols-3">
                    <input
                        type="month"
                        value={filters.month}
                        onChange={(event) => setFilters((prev) => ({ ...prev, month: event.target.value }))}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                    <select
                        value={filters.userId}
                        onChange={(event) => setFilters((prev) => ({ ...prev, userId: event.target.value }))}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                        <option value="">Tất cả nhân viên</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>{user.fullName || user.email}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        value={filters.hourlyRate}
                        onChange={(event) => setFilters((prev) => ({ ...prev, hourlyRate: event.target.value }))}
                        min="0"
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="grid grid-cols-12 gap-2 border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <div className="col-span-2">Nhân viên</div>
                    <div className="col-span-2">Ca làm</div>
                    <div className="col-span-2">Giờ công</div>
                    <div className="col-span-2">OT / Vắng</div>
                    <div className="col-span-2">Lương cơ bản</div>
                    <div className="col-span-2">Thực nhận</div>
                </div>

                {payrollRows.map((row) => (
                    <div key={row.userId} className="grid grid-cols-12 gap-2 px-4 py-3 text-sm border-b border-slate-100">
                        <div className="col-span-2 font-medium text-slate-900">{row.fullName}</div>
                        <div className="col-span-2 text-slate-700">{row.workedShifts}/{row.totalShifts}</div>
                        <div className="col-span-2 text-slate-700">{Number(row.workedHours || 0).toFixed(1)} giờ</div>
                        <div className="col-span-2 text-slate-700">OT {Number(row.overtimeHours || 0).toFixed(1)}h / Vắng {row.absentShifts}</div>
                        <div className="col-span-2 text-slate-700">{formatCurrency(row.grossPay)}</div>
                        <div className="col-span-2 font-semibold text-slate-900">{formatCurrency(row.netPay)}</div>
                    </div>
                ))}

                {payrollRows.length === 0 && (
                    <div className="px-4 py-6 text-sm text-slate-500">Không có dữ liệu lương cho bộ lọc hiện tại.</div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ title, value }) => (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
        <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    </div>
);

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);
};

export default PayrollManagement;
