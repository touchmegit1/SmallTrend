import React, { useEffect, useMemo, useState } from 'react';
import { Check, XCircle, Clock, AlertCircle, FileText, Users, Plus, CalendarDays, Timer, X } from 'lucide-react';
import { shiftTicketService } from '../../services/shiftTicketService';
import { shiftService } from '../../services/shiftService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import CustomSelect from '../../components/common/CustomSelect';

const defaultForm = {
    ticketMode: 'SWAP',
    assignmentId: '',
    targetUserId: '',
    reason: '',
};

const TicketCard = ({ ticket, canApprove, canAcceptSwap, onApprove, onReject, onAcceptSwap }) => {
    const getPriorityColor = (priority) => {
        const colors = {
            LOW: 'bg-blue-100 text-blue-800',
            NORMAL: 'bg-gray-100 text-gray-800',
            HIGH: 'bg-orange-100 text-orange-800',
            URGENT: 'bg-red-100 text-red-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    const getStatusColor = (status) => {
        const colors = {
            OPEN: 'bg-yellow-100 text-yellow-800',
            IN_PROGRESS: 'bg-blue-100 text-blue-800',
            RESOLVED: 'bg-green-100 text-green-800',
            CLOSED: 'bg-red-100 text-red-800',
            CANCELLED: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-indigo-500 border border-slate-200">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-base text-slate-900">{ticket.title}</h3>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                        </span>
                        {!ticket.assignedToUserId && (
                            <span className="text-xs font-medium px-2 py-1 rounded bg-indigo-100 text-indigo-800">
                                Chung (Manager/Admin)
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{ticket.description}</p>
                    <div className="text-xs text-slate-500 space-y-1">
                        <div>Mã ticket: <span className="font-mono font-semibold">{ticket.ticketCode}</span></div>
                        <div>Tạo lúc: {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('vi-VN') : '-'}</div>
                        <div>Người tạo: <span className="font-semibold">{ticket.createdByName || '-'}</span></div>
                        <div>Người xử lý: <span className="font-semibold">{ticket.assignedToName || 'Manager/Admin xử lý chung'}</span></div>
                    </div>
                </div>
            </div>

            {canAcceptSwap && ticket.status === 'OPEN' && (
                <div className="flex gap-2 pt-3 border-t border-slate-200">
                    <button
                        onClick={() => onAcceptSwap(ticket)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                    >
                        <Check size={16} /> Đồng ý đổi ca
                    </button>
                    <button
                        onClick={() => onReject(ticket.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                    >
                        <XCircle size={16} /> Từ chối
                    </button>
                </div>
            )}

            {canApprove && ticket.status === 'OPEN' && (
                <div className="flex gap-2 pt-3 border-t border-slate-200">
                    <button
                        onClick={() => onApprove(ticket.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                    >
                        <Check size={16} /> Duyệt nhanh
                    </button>
                    <button
                        onClick={() => onReject(ticket.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                    >
                        <XCircle size={16} /> Từ chối
                    </button>
                </div>
            )}

            {ticket.resolution && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Kết quả xử lý:</p>
                    <p className="text-sm text-slate-700">{ticket.resolution}</p>
                </div>
            )}
        </div>
    );
};

const ShiftTicketCenter = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('pending');
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState([]);
    const [myAssignments, setMyAssignments] = useState([]);
    const [myAttendance, setMyAttendance] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAcceptSwapModal, setShowAcceptSwapModal] = useState(false);
    const [createForm, setCreateForm] = useState(defaultForm);
    const [acceptSwapTicket, setAcceptSwapTicket] = useState(null);
    const [acceptSwapTargetAssignmentId, setAcceptSwapTargetAssignmentId] = useState('');
    const [acceptSwapRequesterAssignment, setAcceptSwapRequesterAssignment] = useState(null);
    const [acceptSwapRequesterLoading, setAcceptSwapRequesterLoading] = useState(false);
    const [acceptSwapSubmitting, setAcceptSwapSubmitting] = useState(false);
    const [acceptSwapError, setAcceptSwapError] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [range, setRange] = useState(() => {
        const now = new Date();
        return {
            month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
        };
    });

    const roleName = String(user?.role?.name || user?.role || '').toUpperCase();
    const isManager = roleName === 'MANAGER' || roleName === 'ROLE_MANAGER';
    const isAdmin = roleName === 'ADMIN' || roleName === 'ROLE_ADMIN';
    const currentUserId = user?.id || user?.userId;

    const managerUsers = useMemo(
        () => users.filter((entry) => {
            const role = String(entry?.role?.name || '').toUpperCase();
            return role === 'ADMIN' || role === 'ROLE_ADMIN' || role === 'MANAGER' || role === 'ROLE_MANAGER';
        }),
        [users]
    );

    const assignmentOptions = useMemo(
        () => myAssignments.map((assignment) => ({
            value: String(assignment.id),
            label: `${assignment.shiftDate} - ${assignment.shift?.shiftName || assignment.shift?.shiftCode || 'Ca làm'}`,
        })),
        [myAssignments]
    );

    const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

    const attendanceDoneDateSet = useMemo(() => {
        const doneStatuses = new Set(['PRESENT', 'LATE']);
        const result = new Set();
        (myAttendance || []).forEach((item) => {
            const status = String(item?.status || '').toUpperCase();
            if (doneStatuses.has(status) && item?.date) {
                result.add(String(item.date));
            }
        });
        return result;
    }, [myAttendance]);

    const swappableAssignmentOptions = useMemo(() => {
        const allowedStatuses = new Set(['ASSIGNED', 'CONFIRMED']);
        return myAssignments
            .filter((assignment) => {
                const date = String(assignment?.shiftDate || '');
                if (!date || date < todayIso) {
                    return false;
                }

                if (attendanceDoneDateSet.has(date)) {
                    return false;
                }

                const status = String(assignment?.status || '').toUpperCase();
                if (status && !allowedStatuses.has(status)) {
                    return false;
                }

                return true;
            })
            .map((assignment) => ({
                value: String(assignment.id),
                label: `${assignment.shiftDate} - ${assignment.shift?.shiftName || assignment.shift?.shiftCode || 'Ca làm'}`,
            }));
    }, [myAssignments, attendanceDoneDateSet, todayIso]);

    const assignmentOptionsByMode = useMemo(() => {
        return createForm.ticketMode === 'SWAP' ? swappableAssignmentOptions : assignmentOptions;
    }, [createForm.ticketMode, swappableAssignmentOptions, assignmentOptions]);

    useEffect(() => {
        if (!createForm.assignmentId) {
            return;
        }

        const exists = assignmentOptionsByMode.some((item) => String(item.value) === String(createForm.assignmentId));
        if (!exists) {
            setCreateForm((prev) => ({ ...prev, assignmentId: '' }));
        }
    }, [createForm.ticketMode, createForm.assignmentId, assignmentOptionsByMode]);

    const acceptSwapRequesterAssignmentId = useMemo(
        () => extractSwapId(acceptSwapTicket?.description, 'SWAP_REQUESTER_ASSIGNMENT_ID'),
        [acceptSwapTicket]
    );

    const acceptSwapSuggestedTargetAssignmentId = useMemo(
        () => extractSwapId(acceptSwapTicket?.description, 'SWAP_TARGET_ASSIGNMENT_ID'),
        [acceptSwapTicket]
    );

    const acceptSwapAssignmentOptions = useMemo(
        () => myAssignments
            .filter((assignment) => Number(assignment.id) !== Number(acceptSwapRequesterAssignmentId || 0))
            .map((assignment) => ({
                value: String(assignment.id),
                label: `${assignment.shiftDate} - ${assignment.shift?.shiftName || assignment.shift?.shiftCode || 'Ca làm'}`,
            })),
        [myAssignments, acceptSwapRequesterAssignmentId]
    );

    const acceptSwapEligibleAssignmentOptions = useMemo(() => {
        return acceptSwapAssignmentOptions.filter((option) => {
            const assignment = myAssignments.find((entry) => String(entry.id) === String(option.value));
            if (!assignment) {
                return false;
            }

            const date = String(assignment.shiftDate || '');
            if (!date || date < todayIso) {
                return false;
            }

            if (attendanceDoneDateSet.has(date)) {
                return false;
            }

            const requesterDate = String(acceptSwapRequesterAssignment?.shiftDate || '');
            const requesterShiftId = acceptSwapRequesterAssignment?.shift?.id;
            const ownShiftId = assignment?.shift?.id;
            if (requesterDate && requesterShiftId && ownShiftId
                && requesterDate === date
                && Number(requesterShiftId) === Number(ownShiftId)) {
                return false;
            }

            return true;
        });
    }, [acceptSwapAssignmentOptions, myAssignments, todayIso, attendanceDoneDateSet, acceptSwapRequesterAssignment]);

    const ticketSummary = useMemo(() => {
        const pending = tickets.filter((item) => item.status === 'OPEN' || item.status === 'IN_PROGRESS').length;
        const approved = tickets.filter((item) => item.status === 'RESOLVED').length;
        const rejected = tickets.filter((item) => item.status === 'CLOSED' || item.status === 'CANCELLED').length;
        const waitingMyApproval = tickets.filter((item) => {
            if (item.status !== 'OPEN') {
                return false;
            }
            if (isAdmin || isManager) {
                return true;
            }
            return Number(item.assignedToUserId) === Number(currentUserId);
        }).length;
        return { pending, approved, rejected, waitingMyApproval };
    }, [tickets, currentUserId, isAdmin, isManager]);

    const monthlyShiftSummary = useMemo(() => {
        const totalAssigned = myAssignments.length;
        const attendanceInMonth = myAttendance.filter((item) => String(item.date || '').startsWith(range.month));
        const worked = attendanceInMonth.filter((item) => item.status === 'PRESENT' || item.status === 'LATE').length;
        const absent = attendanceInMonth.filter((item) => item.status === 'ABSENT').length;
        const workedHours = attendanceInMonth.reduce((sum, item) => {
            if (!item.timeIn || !item.timeOut) return sum;
            return sum + calcHours(item.timeIn, item.timeOut);
        }, 0);
        return { totalAssigned, worked, absent, workedHours };
    }, [myAssignments, myAttendance, range.month]);

    useEffect(() => {
        if (!currentUserId) return;
        loadPageData();
    }, [currentUserId, range.month]);

    useEffect(() => {
        filterTickets();
    }, [tickets, activeTab, search]);

    const loadPageData = async () => {
        try {
            setLoading(true);
            const [ticketData, userRes, assignmentData, attendanceData] = await Promise.all([
                shiftTicketService.getShiftTickets(),
                userService.getAll({ page: 0, size: 100 }),
                shiftService.getAssignments({
                    startDate: `${range.month}-01`,
                    endDate: `${range.month}-${getLastDayOfMonth(range.month)}`,
                    userId: currentUserId,
                }),
                shiftService.getAttendance({
                    userId: currentUserId,
                    startDate: `${range.month}-01`,
                    endDate: `${range.month}-${getLastDayOfMonth(range.month)}`,
                }),
            ]);

            const userPayload = userRes?.content ? userRes.content : userRes;
            setUsers(Array.isArray(userPayload) ? userPayload : []);
            setTickets(Array.isArray(ticketData) ? ticketData : []);
            setMyAssignments(Array.isArray(assignmentData) ? assignmentData : []);
            setMyAttendance(Array.isArray(attendanceData) ? attendanceData : []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải danh sách tickets');
            setTickets([]);
            setUsers([]);
            setMyAssignments([]);
            setMyAttendance([]);
        } finally {
            setLoading(false);
        }
    };

    const filterTickets = () => {
        let filtered = tickets;

        // Filter by tab (status)
        if (activeTab === 'pending') {
            filtered = filtered.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS');
        } else if (activeTab === 'approved') {
            filtered = filtered.filter(t => t.status === 'RESOLVED');
        } else if (activeTab === 'rejected') {
            filtered = filtered.filter(t => t.status === 'CLOSED' || t.status === 'CANCELLED');
        }

        // Filter by search
        if (search.trim()) {
            const query = search.toLowerCase();
            filtered = filtered.filter(t =>
                String(t.ticketCode || '').toLowerCase().includes(query) ||
                String(t.title || '').toLowerCase().includes(query) ||
                t.description?.toLowerCase().includes(query)
            );
        }

        setFilteredTickets(filtered);
    };

    const handleApprove = async (ticketId) => {
        try {
            const reason = prompt('Ghi chú duyệt (không bắt buộc):');
            await shiftTicketService.approveTicket(ticketId, reason);
            loadPageData();
            alert('Đã phê duyệt ticket thành công');
        } catch (err) {
            alert('Lỗi: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleReject = async (ticketId) => {
        try {
            const reason = prompt('Lý do từ chối:');
            if (!reason) return;
            await shiftTicketService.rejectTicket(ticketId, reason);
            loadPageData();
            alert('Đã từ chối ticket thành công');
        } catch (err) {
            alert('Lỗi: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleSubmitTicket = async (event) => {
        event.preventDefault();
        const errors = validateCreateForm(createForm, assignmentOptionsByMode);
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        const selectedAssignment = myAssignments.find((item) => String(item.id) === String(createForm.assignmentId));
        const shiftDate = selectedAssignment?.shiftDate || range.month;
        const assignedToUserId = createForm.ticketMode === 'SWAP'
            ? Number(createForm.targetUserId)
            : null;

        if (createForm.ticketMode === 'SWAP' && !assignedToUserId) {
            setError('Vui lòng chọn nhân viên bạn muốn đổi ca hoặc nhờ nhận ca.');
            return;
        }

        try {
            setSubmitting(true);
            if (createForm.ticketMode === 'SWAP') {
                await shiftTicketService.createShiftSwapTicket({
                    fromDate: shiftDate,
                    toDate: null,
                    reason: createForm.reason,
                    requesterUserId: Number(currentUserId),
                    requesterAssignmentId: Number(createForm.assignmentId),
                    targetUserId: Number(createForm.targetUserId),
                    targetAssignmentId: null,
                    swapMode: 'TAKE_OVER',
                    assignedToUserId,
                });
            } else if (createForm.ticketMode === 'CANCEL') {
                await shiftTicketService.createShiftCancelTicket({
                    shiftDate,
                    reason: createForm.reason,
                    assignmentId: Number(createForm.assignmentId),
                    assignedToUserId,
                });
            } else {
                await shiftTicketService.createShiftUpdateTicket({
                    shiftDate,
                    reason: createForm.reason,
                    assignmentId: Number(createForm.assignmentId),
                    assignedToUserId,
                });
            }

            setShowCreateModal(false);
            setCreateForm(defaultForm);
            await loadPageData();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tạo ticket đổi ca.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAcceptSwap = (ticket) => {
        const requesterAssignmentId = extractSwapId(ticket.description, 'SWAP_REQUESTER_ASSIGNMENT_ID');
        if (!requesterAssignmentId) {
            alert('Ticket đổi ca thiếu thông tin ca của người yêu cầu.');
            return;
        }

        const suggestedTargetAssignmentId = extractSwapId(ticket.description, 'SWAP_TARGET_ASSIGNMENT_ID');
        setAcceptSwapTicket(ticket);
        setAcceptSwapTargetAssignmentId(suggestedTargetAssignmentId ? String(suggestedTargetAssignmentId) : '');
        setAcceptSwapRequesterAssignment(null);
        setAcceptSwapError('');
        setShowAcceptSwapModal(true);

        (async () => {
            try {
                setAcceptSwapRequesterLoading(true);
                const assignment = await shiftService.getAssignment(requesterAssignmentId);
                setAcceptSwapRequesterAssignment(assignment || null);
            } catch (err) {
                setAcceptSwapRequesterAssignment(null);
            } finally {
                setAcceptSwapRequesterLoading(false);
            }
        })();
    };

    useEffect(() => {
        if (!showAcceptSwapModal) {
            return;
        }

        if (!acceptSwapTargetAssignmentId) {
            return;
        }

        const exists = acceptSwapEligibleAssignmentOptions.some(
            (option) => String(option.value) === String(acceptSwapTargetAssignmentId)
        );

        if (!exists) {
            setAcceptSwapTargetAssignmentId('');
        }
    }, [showAcceptSwapModal, acceptSwapTargetAssignmentId, acceptSwapEligibleAssignmentOptions]);

    const handleConfirmAcceptSwap = async () => {
        if (!acceptSwapTicket) {
            return;
        }

        if (acceptSwapRequesterLoading) {
            setAcceptSwapError('Đang tải thông tin ca yêu cầu, vui lòng chờ một chút rồi xác nhận lại.');
            return;
        }

        try {
            const requesterAssignmentId = extractSwapId(acceptSwapTicket.description, 'SWAP_REQUESTER_ASSIGNMENT_ID');

            if (!requesterAssignmentId) {
                setAcceptSwapError('Ticket đổi ca thiếu thông tin ca của người yêu cầu.');
                return;
            }

            setAcceptSwapSubmitting(true);
            const targetAssignmentId = acceptSwapTargetAssignmentId ? Number(acceptSwapTargetAssignmentId) : null;

            await shiftService.executeSwap({
                requesterAssignmentId,
                targetAssignmentId,
                accepterUserId: currentUserId,
                ticketId: acceptSwapTicket.id,
                note: 'Đổi ca được xác nhận bởi nhân viên nhận đổi',
            });

            await shiftTicketService.approveTicket(
                acceptSwapTicket.id,
                targetAssignmentId
                    ? 'Nhân viên nhận đổi đã đồng ý. Hệ thống đã swap ca hai chiều.'
                    : 'Nhân viên nhận đổi đã đồng ý. Hệ thống đã chuyển ca theo mode nhận ca thay.'
            );

            setShowAcceptSwapModal(false);
            setAcceptSwapTicket(null);
            setAcceptSwapTargetAssignmentId('');
            setAcceptSwapRequesterAssignment(null);
            setAcceptSwapRequesterLoading(false);
            setAcceptSwapError('');

            await loadPageData();
            alert(
                targetAssignmentId
                    ? 'Đã đồng ý đổi ca. Hệ thống đã hoán đổi ca cho cả hai nhân viên.'
                    : 'Đã đồng ý nhận ca thay. Hệ thống đã chuyển ca cho bạn.'
            );
        } catch (err) {
            setAcceptSwapError(err.response?.data?.message || err.message || 'Không thể thực hiện đổi ca.');
        } finally {
            setAcceptSwapSubmitting(false);
        }
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <FileText size={28} className="text-indigo-600" />
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Trung tâm đổi ca & ticket ca làm</h1>
                        <p className="text-slate-600 text-sm">Tạo yêu cầu đổi/nhường/nghỉ ca và xử lý phê duyệt nhanh cho quản lý.</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                    <Plus size={16} /> Tạo ticket ca làm
                </button>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Ca tạm thời có thể bị ngưng hiển thị theo lịch, nhưng dữ liệu làm việc/chấm công lịch sử vẫn được giữ để tính lương và tra soát.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <MetricCard title="Tổng ca được phân" value={monthlyShiftSummary.totalAssigned} icon={CalendarDays} />
                <MetricCard title="Ca đã làm" value={monthlyShiftSummary.worked} icon={Check} />
                <MetricCard title="Ca vắng" value={monthlyShiftSummary.absent} icon={XCircle} />
                <MetricCard title="Giờ làm" value={`${monthlyShiftSummary.workedHours.toFixed(1)}h`} icon={Timer} />
                <MetricCard title="Chờ bạn duyệt" value={ticketSummary.waitingMyApproval} icon={Clock} />
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="grid gap-3 md:grid-cols-3">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Tháng theo dõi</label>
                        <input
                            type="month"
                            value={range.month}
                            onChange={(event) => setRange({ month: event.target.value })}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-medium text-slate-600">Tìm ticket</label>
                        <input
                            type="text"
                            placeholder="Mã ticket, tiêu đề, nội dung..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-4 py-2 font-medium border-b-2 transition ${activeTab === 'pending'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Clock size={18} />
                            Chờ xử lý ({ticketSummary.pending})
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('approved')}
                        className={`px-4 py-2 font-medium border-b-2 transition ${activeTab === 'approved'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Check size={18} />
                            Đã duyệt ({ticketSummary.approved})
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('rejected')}
                        className={`px-4 py-2 font-medium border-b-2 transition ${activeTab === 'rejected'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <XCircle size={18} />
                            Từ chối/Đóng ({ticketSummary.rejected})
                        </div>
                    </button>
                </div>
            </div>

            {/* Tickets grid */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : filteredTickets.length === 0 ? (
                <div className="text-center py-12">
                    <AlertCircle size={48} className="mx-auto text-slate-400 mb-3" />
                    <p className="text-slate-600 text-lg font-medium">Không có ticket phù hợp</p>
                    <p className="text-slate-500">Hãy tạo yêu cầu đổi ca hoặc chỉnh bộ lọc.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredTickets.map(ticket => (
                        <TicketCard
                            key={ticket.id}
                            ticket={ticket}
                            canApprove={(isAdmin || isManager)}
                            canAcceptSwap={!(isAdmin || isManager)
                                && ticket.relatedEntityType === 'SHIFT_SWAP'
                                && Number(ticket.assignedToUserId) === Number(currentUserId)}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onAcceptSwap={handleAcceptSwap}
                        />
                    ))}
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="w-full max-w-xl rounded-xl bg-white border border-slate-200 shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <h3 className="text-lg font-semibold text-slate-900">Tạo ticket ca làm</h3>
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitTicket} className="p-5 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Loại yêu cầu</label>
                                <div className="mt-1">
                                    <CustomSelect
                                        value={createForm.ticketMode}
                                        onChange={(value) => setCreateForm((prev) => ({ ...prev, ticketMode: value }))}
                                        options={[
                                            { value: 'SWAP', label: 'Đổi ca với người khác' },
                                            { value: 'CANCEL', label: 'Xin nghỉ ca đã phân' },
                                            { value: 'UPDATE', label: 'Yêu cầu cập nhật ca' },
                                        ]}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Ca làm liên quan</label>
                                <div className="mt-1">
                                    <CustomSelect
                                        value={createForm.assignmentId}
                                        onChange={(value) => setCreateForm((prev) => ({ ...prev, assignmentId: value }))}
                                        options={[{ value: '', label: 'Chọn ca làm' }, ...assignmentOptionsByMode]}
                                    />
                                </div>
                                {formErrors.assignmentId && <p className="text-xs text-rose-600 mt-1">{formErrors.assignmentId}</p>}
                                {createForm.ticketMode === 'SWAP' && (
                                    <p className="mt-1 text-xs text-slate-500">Chỉ hiển thị các ca hợp lệ để đổi: chưa qua ngày làm và chưa chấm công.</p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    {createForm.ticketMode === 'SWAP' ? 'Nhân viên muốn đổi/nhờ nhận ca' : 'Người xử lý (tuỳ chọn)'}
                                </label>
                                <div className="mt-1">
                                    <CustomSelect
                                        value={createForm.targetUserId}
                                        onChange={(value) => setCreateForm((prev) => ({ ...prev, targetUserId: value }))}
                                        options={[
                                            { value: '', label: createForm.ticketMode === 'SWAP' ? 'Chọn nhân viên còn lại' : 'Để trống: manager/admin sẽ xử lý chung' },
                                            ...(createForm.ticketMode === 'SWAP'
                                                ? users.filter((entry) => Number(entry.id) !== Number(currentUserId)).map((entry) => ({ value: String(entry.id), label: entry.fullName || entry.email }))
                                                : managerUsers.map((entry) => ({ value: String(entry.id), label: entry.fullName || entry.email }))),
                                        ]}
                                    />
                                </div>
                                {formErrors.targetUserId && <p className="text-xs text-rose-600 mt-1">{formErrors.targetUserId}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Lý do</label>
                                <textarea
                                    value={createForm.reason}
                                    onChange={(event) => setCreateForm((prev) => ({ ...prev, reason: event.target.value }))}
                                    rows={4}
                                    className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${formErrors.reason ? 'border-rose-400' : 'border-slate-200'}`}
                                    placeholder="Mô tả chi tiết để admin/manager phê duyệt nhanh"
                                />
                                {formErrors.reason && <p className="text-xs text-rose-600 mt-1">{formErrors.reason}</p>}
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
                                >
                                    {submitting ? 'Đang gửi...' : 'Gửi ticket'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAcceptSwapModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg rounded-xl bg-white border border-slate-200 shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <h3 className="text-lg font-semibold text-slate-900">Xác nhận xử lý đổi ca</h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAcceptSwapModal(false);
                                    setAcceptSwapTicket(null);
                                    setAcceptSwapTargetAssignmentId('');
                                    setAcceptSwapRequesterAssignment(null);
                                    setAcceptSwapRequesterLoading(false);
                                    setAcceptSwapError('');
                                }}
                                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {acceptSwapError && (
                                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                                    {acceptSwapError}
                                </div>
                            )}

                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                                <p className="font-medium text-slate-900">{acceptSwapTicket?.title || 'Ticket đổi ca'}</p>
                                <p className="mt-1 text-xs text-slate-500">{acceptSwapTicket?.ticketCode ? `Mã ticket: ${acceptSwapTicket.ticketCode}` : ''}</p>
                                {acceptSwapRequesterLoading ? (
                                    <p className="mt-1 text-xs text-slate-500">Đang tải thông tin ca yêu cầu...</p>
                                ) : (
                                    <p className="mt-1 text-xs text-slate-500">
                                        {acceptSwapRequesterAssignment?.shiftDate
                                            ? `Ca cần xử lý: ${acceptSwapRequesterAssignment.shiftDate} - ${acceptSwapRequesterAssignment?.shift?.shiftName || acceptSwapRequesterAssignment?.shift?.shiftCode || 'Ca làm'}`
                                            : 'Không tải được chi tiết ca yêu cầu. Hệ thống vẫn sẽ kiểm tra ở backend khi xác nhận.'}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Ca của bạn để đổi 2 chiều (không bắt buộc)</label>
                                <div className="mt-1">
                                    <CustomSelect
                                        value={acceptSwapTargetAssignmentId}
                                        onChange={(value) => setAcceptSwapTargetAssignmentId(value)}
                                        options={[
                                            { value: '', label: 'Không chọn: nhận ca thay hộ' },
                                            ...acceptSwapEligibleAssignmentOptions,
                                        ]}
                                    />
                                </div>
                                <p className="mt-1 text-xs text-slate-500">
                                    Chọn ca của bạn nếu muốn đổi 2 chiều. Để trống nếu chỉ nhận ca của người kia.
                                </p>
                                {acceptSwapEligibleAssignmentOptions.length === 0 && (
                                    <p className="mt-1 text-xs text-amber-600">
                                        Hiện không có ca hợp lệ để đổi hai chiều. Bạn vẫn có thể chọn nhận ca thay.
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAcceptSwapModal(false);
                                        setAcceptSwapTicket(null);
                                        setAcceptSwapTargetAssignmentId('');
                                        setAcceptSwapRequesterAssignment(null);
                                        setAcceptSwapRequesterLoading(false);
                                        setAcceptSwapError('');
                                    }}
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmAcceptSwap}
                                    disabled={acceptSwapSubmitting || acceptSwapRequesterLoading}
                                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
                                >
                                    {acceptSwapRequesterLoading
                                        ? 'Đang tải dữ liệu...'
                                        : (acceptSwapSubmitting ? 'Đang xử lý...' : 'Xác nhận')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MetricCard = ({ title, value, icon: Icon }) => (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
            {Icon ? <Icon size={16} className="text-indigo-500" /> : null}
        </div>
        <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    </div>
);

const validateCreateForm = (form, allowedAssignmentOptions = []) => {
    const errors = {};
    if (!form.assignmentId) {
        errors.assignmentId = 'Vui lòng chọn ca làm liên quan.';
    }

    if (form.assignmentId) {
        const exists = allowedAssignmentOptions.some((option) => String(option.value) === String(form.assignmentId));
        if (!exists) {
            errors.assignmentId = 'Ca đã chọn không còn hợp lệ để xử lý yêu cầu này.';
        }
    }

    if (form.ticketMode === 'SWAP' && !form.targetUserId) {
        errors.targetUserId = 'Vui lòng chọn nhân viên bạn muốn đổi hoặc nhờ nhận ca.';
    }

    if (!form.reason || form.reason.trim().length < 5) {
        errors.reason = 'Lý do tối thiểu 5 ký tự để người duyệt xử lý nhanh.';
    }
    return errors;
};

const extractSwapId = (description, key) => {
    const regex = new RegExp(`\\[${key}=(\\d+)\\]`);
    const matched = String(description || '').match(regex);
    if (!matched || !matched[1]) {
        return null;
    }
    return Number(matched[1]);
};

const calcHours = (timeIn, timeOut) => {
    const [inHour, inMinute] = String(timeIn).split(':').map(Number);
    const [outHour, outMinute] = String(timeOut).split(':').map(Number);
    if ([inHour, inMinute, outHour, outMinute].some((value) => Number.isNaN(value))) {
        return 0;
    }
    const minutes = (outHour * 60 + outMinute) - (inHour * 60 + inMinute);
    return minutes > 0 ? minutes / 60 : 0;
};

const getLastDayOfMonth = (month) => {
    const [year, monthValue] = String(month || '').split('-').map(Number);
    if (!year || !monthValue) return '31';
    return String(new Date(year, monthValue, 0).getDate()).padStart(2, '0');
};

export default ShiftTicketCenter;
