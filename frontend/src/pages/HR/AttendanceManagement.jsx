import React, { useEffect, useMemo, useState } from 'react';
import { shiftService } from '../../services/shiftService';
import { userService } from '../../services/userService';

const AttendanceManagement = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [records, setRecords] = useState([]);

    const [filters, setFilters] = useState({
        date: toDateInput(new Date()),
        userId: '',
        status: 'ALL',
    });

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        loadAttendance();
    }, [filters.date, filters.userId, filters.status]);

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
        try {
            setLoading(true);
            const params = {
                date: filters.date,
                status: filters.status,
            };
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
        return { total, present, late, absent };
    }, [records]);

    const updateAttendance = async (record, patch) => {
        try {
            const next = {
                ...record,
                ...patch,
            };

            await shiftService.upsertAttendance({
                userId: record.userId,
                date: record.date,
                timeIn: next.checkIn || null,
                timeOut: next.checkOut || null,
                status: next.status,
            });

            setRecords((prev) => prev.map((item) => item.key === record.key ? next : item));
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể cập nhật chấm công');
        }
    };

    if (loading) {
        return <div className="text-slate-500">Đang tải dữ liệu chấm công...</div>;
    }

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Chấm công</h1>
                <p className="text-sm text-slate-500 mt-1">Theo dõi trạng thái đi làm theo phân ca.</p>
            </div>

            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard title="Tổng ca" value={summary.total} />
                <StatCard title="Có mặt" value={summary.present} />
                <StatCard title="Đi muộn" value={summary.late} />
                <StatCard title="Vắng" value={summary.absent} />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="grid gap-3 md:grid-cols-4">
                    <input
                        type="date"
                        value={filters.date}
                        onChange={(event) => setFilters((prev) => ({ ...prev, date: event.target.value }))}
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
                    <select
                        value={filters.status}
                        onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="PENDING">Chưa chấm</option>
                        <option value="PRESENT">Có mặt</option>
                        <option value="LATE">Đi muộn</option>
                        <option value="ABSENT">Vắng</option>
                    </select>
                    <button
                        onClick={() => setFilters({ date: toDateInput(new Date()), userId: '', status: 'ALL' })}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                    >
                        Đặt lại bộ lọc
                    </button>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="grid grid-cols-12 gap-2 border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <div className="col-span-2">Ngày</div>
                    <div className="col-span-2">Nhân viên</div>
                    <div className="col-span-2">Ca làm</div>
                    <div className="col-span-2">Giờ vào/ra</div>
                    <div className="col-span-2">Trạng thái</div>
                    <div className="col-span-2">Ghi chú</div>
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
                                className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs"
                            />
                            <input
                                type="time"
                                value={record.checkOut}
                                onChange={(event) => updateAttendance(record, { checkOut: event.target.value })}
                                className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs"
                            />
                        </div>
                        <div className="col-span-2">
                            <select
                                value={record.status}
                                onChange={(event) => updateAttendance(record, { status: event.target.value })}
                                className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs"
                            >
                                <option value="PENDING">Chưa chấm</option>
                                <option value="PRESENT">Có mặt</option>
                                <option value="LATE">Đi muộn</option>
                                <option value="ABSENT">Vắng</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <input
                                value={record.note}
                                onChange={(event) => updateAttendance(record, { note: event.target.value })}
                                placeholder="Ghi chú"
                                className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs"
                            />
                        </div>
                    </div>
                ))}

                {records.length === 0 && (
                    <div className="px-4 py-6 text-sm text-slate-500">Không có dữ liệu chấm công theo bộ lọc hiện tại.</div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ title, value }) => (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
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

export default AttendanceManagement;
