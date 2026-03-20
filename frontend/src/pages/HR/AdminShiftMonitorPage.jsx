import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarRange, Filter, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { shiftService } from '../../services/shiftService';
import { userService } from '../../services/userService';
import CustomSelect from '../../components/common/CustomSelect';

const PRESET_CURRENT_MONTH = 'current_month';
const PRESET_ALL_TIME = 'all_time';
const PRESET_CUSTOM = 'custom';

const toIsoDate = (value) => {
    const date = value instanceof Date ? value : new Date(value);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const resolveRangeByPreset = (preset, customRange) => {
    const now = new Date();
    if (preset === PRESET_ALL_TIME) {
        return { startDate: '2020-01-01', endDate: '2099-12-31' };
    }

    if (preset === PRESET_CUSTOM) {
        return {
            startDate: customRange.startDate,
            endDate: customRange.endDate,
        };
    }

    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
        startDate: toIsoDate(startDate),
        endDate: toIsoDate(endDate),
    };
};

const formatTime = (value) => {
    if (!value) return '--:--';
    return String(value).slice(0, 5);
};

const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('vi-VN');
};

const extractErrorMessage = (error, fallback) => {
    const data = error?.response?.data;
    if (typeof data === 'string' && data.trim()) return data;
    if (typeof data?.message === 'string' && data.message.trim()) return data.message;
    return fallback;
};

const AdminShiftMonitorPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [payrollRows, setPayrollRows] = useState([]);
    const [users, setUsers] = useState([]);
    const [shifts, setShifts] = useState([]);

    const [preset, setPreset] = useState(PRESET_CURRENT_MONTH);
    const [customRange, setCustomRange] = useState(() => {
        const now = new Date();
        return {
            startDate: toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
            endDate: toIsoDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
        };
    });

    const [filters, setFilters] = useState({
        userId: '',
        shiftId: '',
        status: 'all',
    });

    const activeRange = useMemo(() => resolveRangeByPreset(preset, customRange), [preset, customRange]);

    const visibleAssignments = useMemo(() => {
        return assignments.filter((item) => {
            if (filters.status !== 'all' && String(item?.status || '').toUpperCase() !== filters.status) {
                return false;
            }
            return true;
        });
    }, [assignments, filters.status]);

    const summary = useMemo(() => {
        const total = visibleAssignments.length;
        const byStatus = visibleAssignments.reduce((acc, item) => {
            const key = String(item?.status || 'UNKNOWN').toUpperCase();
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        const uniqueUsers = new Set(visibleAssignments.map((item) => item?.user?.id).filter(Boolean)).size;
        const uniqueDays = new Set(visibleAssignments.map((item) => item?.shiftDate).filter(Boolean)).size;
        return { total, byStatus, uniqueUsers, uniqueDays };
    }, [visibleAssignments]);

    const monthRange = useMemo(() => dateRangeToMonths(activeRange.startDate, activeRange.endDate), [activeRange.startDate, activeRange.endDate]);

    const flaggedPayrollRows = useMemo(() => {
        return payrollRows
            .filter((row) => row && row.isPaid === false)
            .filter((row) => Number(row.absentShifts || 0) > 0 || Number(row.lateShifts || 0) > 0)
            .sort((a, b) => Number(b.absentShifts || 0) - Number(a.absentShifts || 0));
    }, [payrollRows]);

    useEffect(() => {
        const loadBaseData = async () => {
            try {
                const [userRes, shiftRes] = await Promise.all([
                    userService.getAll({ page: 0, size: 100 }),
                    shiftService.getShifts({ includeExpired: true }),
                ]);

                const userPayload = Array.isArray(userRes?.content) ? userRes.content : (Array.isArray(userRes) ? userRes : []);
                setUsers(userPayload);
                setShifts(Array.isArray(shiftRes) ? shiftRes : []);
            } catch (loadError) {
                setUsers([]);
                setShifts([]);
            }
        };

        loadBaseData();
    }, []);

    useEffect(() => {
        loadAssignments();
    }, [activeRange.startDate, activeRange.endDate, filters.userId, filters.shiftId]);

    const loadAssignments = async () => {
        try {
            setLoading(true);
            const params = {
                startDate: activeRange.startDate,
                endDate: activeRange.endDate,
            };

            if (filters.userId) {
                params.userId = Number(filters.userId);
            }

            if (filters.shiftId) {
                params.shiftId = Number(filters.shiftId);
            }

            const [data, payrollSummary] = await Promise.all([
                shiftService.getAssignments(params),
                shiftService.getPayrollSummary({
                    fromMonth: monthRange.fromMonth,
                    toMonth: monthRange.toMonth,
                }),
            ]);

            setAssignments(Array.isArray(data) ? data : []);
            setPayrollRows(Array.isArray(payrollSummary?.rows) ? payrollSummary.rows : []);
            setError('');
        } catch (loadError) {
            setAssignments([]);
            setPayrollRows([]);
            setError(extractErrorMessage(loadError, 'Không thể tải dữ liệu theo dõi ca làm.'));
        } finally {
            setLoading(false);
        }
    };

    const goToEmployeeAttendance = (userId) => {
        const search = new URLSearchParams({
            month: monthRange.fromMonth,
        });
        navigate(`/hr/workforce/employee/${userId}?${search.toString()}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <button
                        type="button"
                        onClick={() => navigate('/hr/workforce')}
                        className="mb-2 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300"
                    >
                        <ArrowLeft size={14} /> Về nhân sự tổng hợp
                    </button>
                    <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                        <CalendarRange size={24} className="text-indigo-600" />
                        Theo dõi tổng ca làm (Admin)
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Theo dõi toàn bộ phân ca theo tháng hiện tại, toàn thời gian hoặc khoảng tùy chọn.</p>
                </div>
                <button
                    type="button"
                    onClick={loadAssignments}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
                >
                    <RefreshCw size={16} /> Tải lại
                </button>
            </div>

            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Filter size={16} /> Bộ lọc thời gian và dữ liệu
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Khoảng thời gian</label>
                        <CustomSelect
                            value={preset}
                            onChange={setPreset}
                            options={[
                                { value: PRESET_CURRENT_MONTH, label: 'Trong tháng này' },
                                { value: PRESET_ALL_TIME, label: 'Toàn thời gian' },
                                { value: PRESET_CUSTOM, label: 'Tùy chọn' },
                            ]}
                        />
                    </div>

                    {preset === PRESET_CUSTOM && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">Từ ngày</label>
                                <input
                                    type="date"
                                    value={customRange.startDate}
                                    onChange={(event) => setCustomRange((prev) => ({ ...prev, startDate: event.target.value }))}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">Đến ngày</label>
                                <input
                                    type="date"
                                    value={customRange.endDate}
                                    onChange={(event) => setCustomRange((prev) => ({ ...prev, endDate: event.target.value }))}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                />
                            </div>
                        </>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Nhân viên</label>
                        <CustomSelect
                            value={filters.userId}
                            onChange={(value) => setFilters((prev) => ({ ...prev, userId: value }))}
                            options={[
                                { value: '', label: 'Tất cả nhân viên' },
                                ...users.map((item) => ({ value: String(item.id), label: item.fullName || item.email })),
                            ]}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Ca làm</label>
                        <CustomSelect
                            value={filters.shiftId}
                            onChange={(value) => setFilters((prev) => ({ ...prev, shiftId: value }))}
                            options={[
                                { value: '', label: 'Tất cả ca' },
                                ...shifts.map((item) => ({ value: String(item.id), label: item.shiftName || item.shiftCode })),
                            ]}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Trạng thái phân công</label>
                        <CustomSelect
                            value={filters.status}
                            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                            options={[
                                { value: 'all', label: 'Tất cả trạng thái' },
                                { value: 'ASSIGNED', label: 'ASSIGNED' },
                                { value: 'CONFIRMED', label: 'CONFIRMED' },
                                { value: 'COMPLETED', label: 'COMPLETED' },
                                { value: 'CANCELLED', label: 'CANCELLED' },
                            ]}
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
                <SummaryCard label="Tổng phân ca" value={summary.total} />
                <SummaryCard label="Số nhân viên" value={summary.uniqueUsers} />
                <SummaryCard label="Số ngày có ca" value={summary.uniqueDays} />
                <SummaryCard label="ASSIGNED" value={summary.byStatus.ASSIGNED || 0} />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
                <div className="border-b border-slate-200 px-4 py-3">
                    <h2 className="text-sm font-semibold text-slate-900">Flag nhan vien chua lanh luong co vi pham cham cong</h2>
                    <p className="mt-1 text-xs text-slate-500">Nhan vao nhan vien de mo dashboard cham cong theo dung ky hien tai.</p>
                </div>
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                            <th className="px-4 py-3 text-left">Nhan vien</th>
                            <th className="px-4 py-3 text-left">Da lam/Vang/Tre</th>
                            <th className="px-4 py-3 text-left">Luong</th>
                            <th className="px-4 py-3 text-left">Tre thanh toan</th>
                            <th className="px-4 py-3 text-left">Mo dashboard</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                        {loading ? (
                            <tr>
                                <td className="px-4 py-6 text-slate-500" colSpan={5}>Dang tai flag nhan vien...</td>
                            </tr>
                        ) : flaggedPayrollRows.length === 0 ? (
                            <tr>
                                <td className="px-4 py-6 text-slate-500" colSpan={5}>Khong co nhan vien nao dang no luong va bi flag vi pham.</td>
                            </tr>
                        ) : (
                            flaggedPayrollRows.map((row) => (
                                <tr key={row.userId}>
                                    <td className="px-4 py-3 font-medium text-slate-900">{row.fullName || `User #${row.userId}`}</td>
                                    <td className="px-4 py-3">{row.workedShifts || 0} / {row.absentShifts || 0} / {row.lateShifts || 0}</td>
                                    <td className="px-4 py-3">{formatCurrency(row.netPay || 0)}</td>
                                    <td className="px-4 py-3">{row.overdueDays > 0 ? `${row.overdueDays} ngay` : '-'}</td>
                                    <td className="px-4 py-3">
                                        <button
                                            type="button"
                                            onClick={() => goToEmployeeAttendance(row.userId)}
                                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                        >
                                            Xem chi tiet
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                            <th className="px-4 py-3 text-left">Ngày</th>
                            <th className="px-4 py-3 text-left">Nhân viên</th>
                            <th className="px-4 py-3 text-left">Ca</th>
                            <th className="px-4 py-3 text-left">Giờ</th>
                            <th className="px-4 py-3 text-left">Trạng thái</th>
                            <th className="px-4 py-3 text-left">Ghi chú</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                        {loading ? (
                            <tr>
                                <td className="px-4 py-6 text-slate-500" colSpan={6}>Đang tải dữ liệu phân ca...</td>
                            </tr>
                        ) : visibleAssignments.length === 0 ? (
                            <tr>
                                <td className="px-4 py-6 text-slate-500" colSpan={6}>Không có dữ liệu phân ca theo bộ lọc hiện tại.</td>
                            </tr>
                        ) : (
                            visibleAssignments.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-3">{formatDate(item.shiftDate)}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-900">{item.user?.fullName || '-'}</div>
                                        <div className="text-xs text-slate-500">{item.user?.email || '-'}</div>
                                    </td>
                                    <td className="px-4 py-3">{item.shift?.shiftName || item.shift?.shiftCode || '-'}</td>
                                    <td className="px-4 py-3">{formatTime(item.shift?.startTime)} - {formatTime(item.shift?.endTime)}</td>
                                    <td className="px-4 py-3">
                                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                                            {String(item.status || 'ASSIGNED').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{item.notes || '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SummaryCard = ({ label, value }) => (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
    </div>
);

const dateRangeToMonths = (startDate, endDate) => {
    const fromMonth = String(startDate || '').slice(0, 7);
    const toMonth = String(endDate || '').slice(0, 7);
    return {
        fromMonth: /^\d{4}-\d{2}$/.test(fromMonth) ? fromMonth : toIsoDate(new Date()).slice(0, 7),
        toMonth: /^\d{4}-\d{2}$/.test(toMonth) ? toMonth : toIsoDate(new Date()).slice(0, 7),
    };
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);
};

export default AdminShiftMonitorPage;
