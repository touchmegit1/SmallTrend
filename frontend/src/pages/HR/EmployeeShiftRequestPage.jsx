import React, { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Plus, RefreshCw, Ticket } from 'lucide-react';
import { shiftService } from '../../services/shiftService';
import { shiftTicketService } from '../../services/shiftTicketService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import CustomSelect from '../../components/common/CustomSelect';

const defaultForm = {
    ticketMode: 'LEAVE',
    assignmentId: '',
    targetUserId: '',
    assignedToUserId: '',
    reason: '',
};

const toIsoDate = (value) => {
    const date = value instanceof Date ? value : new Date(value);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('vi-VN');
};

const formatTime = (value) => {
    if (!value) return '--:--';
    return String(value).slice(0, 5);
};

const extractErrorMessage = (error, fallback) => {
    const data = error?.response?.data;
    if (typeof data === 'string' && data.trim()) return data;
    if (typeof data?.message === 'string' && data.message.trim()) return data.message;
    return fallback;
};

const EmployeeShiftRequestPage = () => {
    const { user } = useAuth();
    const currentUserId = Number(user?.id || user?.userId || 0);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [assignments, setAssignments] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]);

    const [month, setMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const [form, setForm] = useState(defaultForm);

    const assignmentOptions = useMemo(() => {
        return assignments.map((item) => ({
            value: String(item.id),
            label: `${item.shiftDate} - ${item.shift?.shiftName || item.shift?.shiftCode || 'Ca làm'}`,
        }));
    }, [assignments]);

    const coworkerOptions = useMemo(() => {
        return users
            .filter((item) => Number(item.id) !== currentUserId)
            .map((item) => ({
                value: String(item.id),
                label: item.fullName || item.email,
            }));
    }, [users, currentUserId]);

    const managerOptions = useMemo(() => {
        return users
            .filter((item) => {
                const roleName = String(item?.role?.name || item?.role || '').toUpperCase();
                return roleName === 'ADMIN' || roleName === 'ROLE_ADMIN' || roleName === 'MANAGER' || roleName === 'ROLE_MANAGER';
            })
            .map((item) => ({ value: String(item.id), label: item.fullName || item.email }));
    }, [users]);

    const myTickets = useMemo(() => {
        return tickets
            .filter((item) => Number(item?.createdByUserId || item?.requesterUserId || 0) === currentUserId)
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }, [tickets, currentUserId]);

    useEffect(() => {
        if (!currentUserId) return;
        loadData();
    }, [currentUserId, month]);

    useEffect(() => {
        if (!form.assignmentId) {
            return;
        }
        const exists = assignmentOptions.some((item) => String(item.value) === String(form.assignmentId));
        if (!exists) {
            setForm((prev) => ({ ...prev, assignmentId: '' }));
        }
    }, [assignmentOptions, form.assignmentId]);

    const loadData = async () => {
        try {
            setLoading(true);
            setSuccess('');
            const [ticketData, assignmentData, userRes] = await Promise.all([
                shiftTicketService.getShiftTickets(),
                shiftService.getAssignments({
                    userId: currentUserId,
                    startDate: `${month}-01`,
                    endDate: `${month}-${lastDayOfMonth(month)}`,
                }),
                userService.getAll({ page: 0, size: 100 }),
            ]);

            const userPayload = Array.isArray(userRes?.content) ? userRes.content : (Array.isArray(userRes) ? userRes : []);
            setTickets(Array.isArray(ticketData) ? ticketData : []);
            setAssignments(Array.isArray(assignmentData) ? assignmentData : []);
            setUsers(userPayload);
            setError('');

            if (!form.assignedToUserId) {
                const firstManager = userPayload.find((item) => {
                    const roleName = String(item?.role?.name || item?.role || '').toUpperCase();
                    return roleName === 'ADMIN' || roleName === 'ROLE_ADMIN' || roleName === 'MANAGER' || roleName === 'ROLE_MANAGER';
                });
                if (firstManager?.id) {
                    setForm((prev) => ({ ...prev, assignedToUserId: String(firstManager.id) }));
                }
            }
        } catch (loadError) {
            setAssignments([]);
            setTickets([]);
            setUsers([]);
            setError(extractErrorMessage(loadError, 'Không thể tải dữ liệu ca và ticket của bạn.'));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (!form.assignmentId) {
            setError('Vui lòng chọn ca làm cần xử lý.');
            return;
        }

        if (!form.assignedToUserId) {
            setError('Vui lòng chọn người tiếp nhận ticket (manager/admin).');
            return;
        }

        if (!form.reason.trim()) {
            setError('Vui lòng nhập lý do.');
            return;
        }

        if (form.ticketMode === 'SWAP' && !form.targetUserId) {
            setError('Vui lòng chọn nhân viên bạn muốn đổi ca.');
            return;
        }

        const selectedAssignment = assignments.find((item) => String(item.id) === String(form.assignmentId));
        if (!selectedAssignment) {
            setError('Ca được chọn không hợp lệ.');
            return;
        }

        try {
            setSubmitting(true);

            if (form.ticketMode === 'SWAP') {
                await shiftTicketService.createShiftSwapTicket({
                    requesterUserId: currentUserId,
                    requesterAssignmentId: Number(form.assignmentId),
                    targetUserId: Number(form.targetUserId),
                    assignedToUserId: Number(form.assignedToUserId),
                    fromDate: selectedAssignment.shiftDate,
                    swapMode: 'TAKE_OVER',
                    reason: form.reason.trim(),
                    priority: 'HIGH',
                });
            } else if (form.ticketMode === 'UPDATE') {
                await shiftTicketService.createShiftUpdateTicket({
                    assignmentId: Number(form.assignmentId),
                    shiftDate: selectedAssignment.shiftDate,
                    assignedToUserId: Number(form.assignedToUserId),
                    reason: form.reason.trim(),
                    priority: 'NORMAL',
                });
            } else {
                await shiftTicketService.createShiftCancelTicket({
                    assignmentId: Number(form.assignmentId),
                    shiftDate: selectedAssignment.shiftDate,
                    assignedToUserId: Number(form.assignedToUserId),
                    reason: form.reason.trim(),
                    priority: 'HIGH',
                });
            }

            setSuccess('Đã gửi ticket thành công.');
            setForm((prev) => ({
                ...defaultForm,
                assignedToUserId: prev.assignedToUserId,
            }));
            await loadData();
        } catch (submitError) {
            setError(extractErrorMessage(submitError, 'Không thể gửi ticket ca làm.'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                        <CalendarClock size={24} className="text-indigo-600" />
                        Ca của tôi và yêu cầu ca
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Tạo yêu cầu nghỉ ca, đổi ca, cập nhật ca và theo dõi ticket của chính bạn.</p>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="month"
                        value={month}
                        onChange={(event) => setMonth(event.target.value)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                    <button
                        type="button"
                        onClick={loadData}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300"
                    >
                        <RefreshCw size={16} /> Tải lại
                    </button>
                </div>
            </div>

            {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

            <div className="grid gap-6 lg:grid-cols-2">
                <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
                    <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2"><Plus size={16} /> Tạo yêu cầu mới</h2>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600">Loại yêu cầu</label>
                            <CustomSelect
                                value={form.ticketMode}
                                onChange={(value) => setForm((prev) => ({ ...prev, ticketMode: value, targetUserId: '' }))}
                                options={[
                                    { value: 'LEAVE', label: 'Xin nghỉ ca' },
                                    { value: 'SWAP', label: 'Đổi ca' },
                                    { value: 'UPDATE', label: 'Cập nhật ca' },
                                ]}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600">Ca làm</label>
                            <CustomSelect
                                value={form.assignmentId}
                                onChange={(value) => setForm((prev) => ({ ...prev, assignmentId: value }))}
                                options={[
                                    { value: '', label: 'Chọn ca làm' },
                                    ...assignmentOptions,
                                ]}
                            />
                        </div>

                        {form.ticketMode === 'SWAP' && (
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">Nhân viên đổi ca</label>
                                <CustomSelect
                                    value={form.targetUserId}
                                    onChange={(value) => setForm((prev) => ({ ...prev, targetUserId: value }))}
                                    options={[
                                        { value: '', label: 'Chọn nhân viên' },
                                        ...coworkerOptions,
                                    ]}
                                />
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600">Người tiếp nhận</label>
                            <CustomSelect
                                value={form.assignedToUserId}
                                onChange={(value) => setForm((prev) => ({ ...prev, assignedToUserId: value }))}
                                options={[
                                    { value: '', label: 'Chọn manager/admin' },
                                    ...managerOptions,
                                ]}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600">Lý do</label>
                            <textarea
                                value={form.reason}
                                onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
                                className="min-h-[100px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                placeholder="Nhập lý do cụ thể để manager/admin dễ duyệt"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting || loading}
                                className="rounded-lg border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                            >
                                {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                            </button>
                        </div>
                    </form>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-4">
                    <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2"><Ticket size={16} /> Ticket của tôi</h2>
                    <div className="mt-3 space-y-3 max-h-[520px] overflow-y-auto pr-1">
                        {loading ? (
                            <div className="text-sm text-slate-500">Đang tải ticket...</div>
                        ) : myTickets.length === 0 ? (
                            <div className="text-sm text-slate-500">Chưa có ticket nào trong tháng đã chọn.</div>
                        ) : (
                            myTickets.map((item) => (
                                <div key={item.id} className="rounded-lg border border-slate-200 p-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="font-medium text-slate-900 text-sm">{item.title || `Ticket #${item.id}`}</p>
                                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{String(item.status || 'OPEN').toUpperCase()}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">{item.ticketCode || `#${item.id}`} • {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : '-'}</p>
                                    <p className="text-sm text-slate-700 mt-2 whitespace-pre-line">{item.description || '-'}</p>
                                    {item.resolution && (
                                        <p className="mt-2 rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-700">Kết quả xử lý: {item.resolution}</p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            <section className="rounded-xl border border-slate-200 bg-white p-4">
                <h2 className="text-base font-semibold text-slate-900">Ca đã được phân trong tháng</h2>
                <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-3 py-2 text-left">Ngày</th>
                                <th className="px-3 py-2 text-left">Ca</th>
                                <th className="px-3 py-2 text-left">Giờ</th>
                                <th className="px-3 py-2 text-left">Trạng thái</th>
                                <th className="px-3 py-2 text-left">Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {loading ? (
                                <tr><td className="px-3 py-4 text-slate-500" colSpan={5}>Đang tải phân ca...</td></tr>
                            ) : assignments.length === 0 ? (
                                <tr><td className="px-3 py-4 text-slate-500" colSpan={5}>Chưa có phân ca trong tháng đã chọn.</td></tr>
                            ) : (
                                assignments.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-3 py-2">{formatDate(item.shiftDate)}</td>
                                        <td className="px-3 py-2">{item.shift?.shiftName || item.shift?.shiftCode || '-'}</td>
                                        <td className="px-3 py-2">{formatTime(item.shift?.startTime)} - {formatTime(item.shift?.endTime)}</td>
                                        <td className="px-3 py-2">{String(item.status || 'ASSIGNED').toUpperCase()}</td>
                                        <td className="px-3 py-2">{item.notes || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

const lastDayOfMonth = (yearMonth) => {
    const [year, month] = String(yearMonth || '').split('-').map(Number);
    if (!year || !month) {
        return '31';
    }
    return String(new Date(year, month, 0).getDate()).padStart(2, '0');
};

export default EmployeeShiftRequestPage;
