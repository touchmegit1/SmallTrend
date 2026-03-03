import React, { useEffect, useMemo, useState } from 'react';
import { shiftService } from '../../services/shiftService';
import { userService } from '../../services/userService';
import { Wallet, Users, Clock3, BadgeDollarSign, Calculator } from 'lucide-react';
import CustomSelect from '../../components/common/CustomSelect';

const PayrollManagement = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [payrollRows, setPayrollRows] = useState([]);
    const [summary, setSummary] = useState({ staffCount: 0, totalHours: 0, totalPayroll: 0 });
    const [filterErrors, setFilterErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    const [filters, setFilters] = useState(() => {
        const now = new Date();
        return {
            month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
            userId: '',
            hourlyRate: 30000,
            salaryMode: 'PER_USER',
        };
    });

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        loadPayroll();
    }, [filters.month, filters.userId, filters.hourlyRate, filters.salaryMode]);

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
                month: filters.month,
            };

            if (filters.salaryMode === 'OVERRIDE') {
                params.hourlyRate = filters.hourlyRate;
            }

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
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                        <Wallet size={24} className="text-indigo-600" />
                        Tính lương
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Tổng hợp lương theo tháng dựa trên phân ca và dữ liệu chấm công.</p>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <StatCard title="Nhân viên" value={summary.staffCount} icon={Users} />
                <StatCard title="Tổng giờ công" value={Number(summary.totalHours || 0).toFixed(1)} icon={Clock3} />
                <StatCard
                    title="Đơn giá/giờ"
                    value={filters.salaryMode === 'OVERRIDE' ? formatCurrency(Number(filters.hourlyRate || 0)) : 'Theo từng nhân viên'}
                    icon={Calculator}
                />
                <StatCard title="Tổng lương" value={formatCurrency(summary.totalPayroll || 0)} icon={BadgeDollarSign} />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="grid gap-3 md:grid-cols-5">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Tháng tính lương</label>
                        <input
                            type="month"
                            value={filters.month}
                            onChange={(event) => setFilters((prev) => ({ ...prev, month: event.target.value }))}
                            className={`w-full rounded-lg border px-3 py-2 text-sm ${filterErrors.month ? 'border-rose-400' : 'border-slate-200'}`}
                        />
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
                        <label className="text-xs font-medium text-slate-600">Chế độ tính lương</label>
                        <CustomSelect
                            value={filters.salaryMode}
                            onChange={(value) => setFilters((prev) => ({ ...prev, salaryMode: value }))}
                            options={[
                                { value: 'PER_USER', label: 'Theo cấu hình từng nhân viên' },
                                { value: 'OVERRIDE', label: 'Ghi đè theo đơn giá chung' },
                            ]}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Đơn giá theo giờ (VND)</label>
                        <input
                            type="number"
                            value={filters.hourlyRate}
                            onChange={(event) => setFilters((prev) => ({ ...prev, hourlyRate: event.target.value }))}
                            min="0"
                            disabled={filters.salaryMode !== 'OVERRIDE'}
                            className={`w-full rounded-lg border px-3 py-2 text-sm ${filterErrors.hourlyRate ? 'border-rose-400' : 'border-slate-200'}`}
                        />
                        {filterErrors.hourlyRate && filters.salaryMode === 'OVERRIDE' && <p className="text-xs text-rose-600">{filterErrors.hourlyRate}</p>}
                    </div>
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
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="grid grid-cols-12 gap-2 border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <div className="col-span-2">Nhân viên</div>
                    <div className="col-span-2">Số điện thoại</div>
                    <div className="col-span-2">Ca làm</div>
                    <div className="col-span-2">Giờ công</div>
                    <div className="col-span-2">OT / Vắng</div>
                    <div className="col-span-1">Đơn giá</div>
                    <div className="col-span-1">Thực nhận</div>
                </div>

                {filteredRows.map((row) => (
                    <div key={row.userId} className="grid grid-cols-12 gap-2 px-4 py-3 text-sm border-b border-slate-100">
                        <div className="col-span-2 font-medium text-slate-900">{row.fullName}</div>
                        <div className="col-span-2 text-slate-700">{userPhoneMap.get(String(row.userId)) || '-'}</div>
                        <div className="col-span-2 text-slate-700">{row.workedShifts}/{row.totalShifts}</div>
                        <div className="col-span-2 text-slate-700">{Number(row.workedHours || 0).toFixed(1)} giờ</div>
                        <div className="col-span-2 text-slate-700">OT {Number(row.overtimeHours || 0).toFixed(1)}h / Vắng {row.absentShifts}</div>
                        <div className="col-span-1 text-slate-700">{formatCurrency(row.hourlyRate)}</div>
                        <div className="col-span-1 font-semibold text-slate-900">{formatCurrency(row.netPay)}</div>
                    </div>
                ))}

                {filteredRows.length === 0 && (
                    <div className="px-4 py-6 text-sm text-slate-500">Không có dữ liệu lương cho bộ lọc hiện tại.</div>
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

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);
};

const validatePayrollFilters = (filters) => {
    const errors = {};

    if (!filters.month) {
        errors.month = 'Vui lòng chọn tháng tính lương.';
    }

    if (filters.salaryMode === 'OVERRIDE') {
        const hourlyRate = Number(filters.hourlyRate);
        if (filters.hourlyRate === '' || Number.isNaN(hourlyRate) || hourlyRate < 0) {
            errors.hourlyRate = 'Đơn giá theo giờ phải là số lớn hơn hoặc bằng 0.';
        }
    }

    return errors;
};

export default PayrollManagement;
