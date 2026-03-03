import React, { useEffect, useMemo, useState } from 'react';
import { Users, Search, Eye, X } from 'lucide-react';
import { userService } from '../../services/userService';
import CustomSelect from '../../components/common/CustomSelect';

const EmployeeList = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, statusFilter]);

    const fetchUsers = async () => {
        try {
            const response = await userService.getAll({ page: 0, size: 100 });
            setUsers(normalizeUsers(response));
            setError('');
        } catch (err) {
            setUsers([]);
            const status = err.response?.status;
            if (status === 403) {
                setError('Bạn không có quyền xem danh sách nhân viên. Vui lòng liên hệ quản trị hệ thống.');
            } else {
                setError('Không thể tải danh sách nhân viên: ' + (err.response?.data?.message || err.message));
            }
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let rows = normalizeUsers(users).filter((user) => normalizeStatus(user.status) !== 'pending');

        if (searchTerm.trim()) {
            const keyword = searchTerm.trim().toLowerCase();
            rows = rows.filter((user) =>
                (user.fullName || '').toLowerCase().includes(keyword)
                || (user.email || '').toLowerCase().includes(keyword)
                || (user.phone || '').toLowerCase().includes(keyword)
            );
        }

        if (statusFilter !== 'all') {
            rows = rows.filter((user) => normalizeStatus(user.status) === statusFilter);
        }

        setFilteredUsers(rows);
    };

    const activeCount = useMemo(
        () => normalizeUsers(users).filter((user) => normalizeStatus(user.status) === 'active').length,
        [users]
    );

    const inactiveCount = useMemo(
        () => normalizeUsers(users).filter((user) => normalizeStatus(user.status) === 'inactive').length,
        [users]
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <div className="text-slate-600">Đang tải danh sách nhân viên...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                    <Users size={24} className="text-indigo-600" />
                    Danh sách nhân viên
                </h1>
                <div className="text-sm text-slate-500">
                    Hoạt động: <span className="font-semibold text-emerald-700">{activeCount}</span> ·
                    Vô hiệu: <span className="font-semibold text-rose-700"> {inactiveCount}</span>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Tìm kiếm nhân viên</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Tên, email, số điện thoại"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Trạng thái</label>
                        <CustomSelect
                            value={statusFilter}
                            onChange={setStatusFilter}
                            variant="status"
                            options={[
                                { value: 'all', label: 'Tất cả trạng thái' },
                                { value: 'active', label: 'Hoạt động' },
                                { value: 'inactive', label: 'Vô hiệu' },
                            ]}
                        />
                    </div>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                    Hiển thị <span className="font-semibold">{filteredUsers.length}</span> nhân viên
                </p>
            </div>

            {filteredUsers.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
                    Không có nhân viên phù hợp với bộ lọc.
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Họ tên</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">SĐT</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Vai trò</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Trạng thái</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{user.fullName || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-700">{user.email || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-700">{user.phone || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-700">{user.role?.name || '-'}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${normalizeStatus(user.status) === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {normalizeStatus(user.status) === 'active' ? 'Hoạt động' : 'Vô hiệu'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => setSelectedEmployee(user)}
                                            className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                                        >
                                            <Eye size={14} /> Xem
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedEmployee && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                            <h2 className="text-lg font-semibold text-slate-900">Chi tiết nhân viên</h2>
                            <button
                                onClick={() => setSelectedEmployee(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <Info label="Họ tên" value={selectedEmployee.fullName} />
                            <Info label="Email" value={selectedEmployee.email} />
                            <Info label="Số điện thoại" value={selectedEmployee.phone} />
                            <Info label="Địa chỉ" value={selectedEmployee.address} />
                            <Info label="Vai trò" value={selectedEmployee.role?.name} />
                            <Info label="Trạng thái" value={normalizeStatus(selectedEmployee.status) === 'active' ? 'Hoạt động' : 'Vô hiệu'} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Info = ({ label, value }) => (
    <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-slate-900">{value || '-'}</p>
    </div>
);

const normalizeUsers = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    if (Array.isArray(payload?.data?.content)) return payload.data.content;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const normalizeStatus = (status) => String(status || '').toLowerCase();

export default EmployeeList;
