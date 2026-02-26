import React, { useState, useEffect } from 'react';
import { Users, Edit, Trash2, X, Search, Filter, UserCheck, Clock, Plus, Check, Ban } from 'lucide-react';
import CustomSelect from '../../components/common/CustomSelect';
import { userService } from '../../services/userService';
const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isCreate, setIsCreate] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('approved');
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        email: '',
        phone: '',
        address: '',
        roleId: 2,
        status: 'active'
    });
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, statusFilter, activeTab]);

    const fetchUsers = async () => {
        try {
            const response = await userService.getAll({ page: 0, size: 100 });
            setUsers(normalizeUsers(response));
            setError('');
        } catch (err) {
            setUsers([]);
            setError('Không thể tải danh sách người dùng: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = normalizeUsers(users);

        if (activeTab === 'pending') {
            filtered = filtered.filter(user => normalizeStatus(user.status) === 'pending');
        } else {
            filtered = filtered.filter(user => normalizeStatus(user.status) !== 'pending');
        }

        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.role?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (activeTab === 'approved' && statusFilter !== 'all') {
            filtered = filtered.filter(user => normalizeStatus(user.status) === statusFilter);
        }

        setFilteredUsers(filtered);
    };

    const validateForm = () => {
        const errors = {};

        if (isCreate) {
            const usernameRegex = /^[a-zA-Z0-9_]+$/;
            if (!formData.username || formData.username.length < 3 || formData.username.length > 50 || !usernameRegex.test(formData.username)) {
                errors.username = 'Username 3-50 ký tự, chỉ a-z, 0-9, _';
            }
            if (!formData.password || formData.password.length < 6) {
                errors.password = 'Mật khẩu tối thiểu 6 ký tự';
            }
            if (formData.password !== formData.confirmPassword) {
                errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
            }
        }

        if (!formData.fullName || formData.fullName.trim().length < 2) {
            errors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            errors.email = 'Email không hợp lệ';
        }

        if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
            errors.phone = 'Số điện thoại phải có 10-11 chữ số';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setIsCreate(false);
        setFormData({
            username: '',
            password: '',
            confirmPassword: '',
            fullName: user.fullName,
            email: user.email,
            phone: user.phone || '',
            address: user.address || '',
            roleId: user.role?.id || 2,
            status: (user.status || 'active').toLowerCase()
        });
        setValidationErrors({});
        setError('');
        setShowModal(true);
    };

    const handleCreateOpen = () => {
        setSelectedUser(null);
        setIsCreate(true);
        setFormData({
            username: '',
            password: '',
            confirmPassword: '',
            fullName: '',
            email: '',
            phone: '',
            address: '',
            roleId: 2,
            status: 'active'
        });
        setValidationErrors({});
        setError('');
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        try {
            if (isCreate) {
                const payload = {
                    username: formData.username,
                    password: formData.password,
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone || undefined,
                    address: formData.address || undefined,
                    roleId: formData.roleId,
                    status: (formData.status || 'active').toUpperCase()
                };
                await userService.create(payload);
            } else {
                await userService.update(selectedUser.id, {
                    ...formData,
                    status: (formData.status || 'active').toUpperCase()
                });
            }
            setShowModal(false);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
            try {
                await userService.remove(userId);
                fetchUsers();
            } catch (err) {
                setError('Không thể xóa người dùng: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleStatusToggle = async (userId, newStatus) => {
        try {
            await userService.updateStatus(userId, newStatus);
            fetchUsers();
        } catch (err) {
            setError('Không thể cập nhật trạng thái: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleRoleChange = async (userId, newRoleId) => {
        try {
            await userService.update(userId, { roleId: parseInt(newRoleId) });
            fetchUsers();
        } catch (err) {
            setError('Không thể cập nhật vai trò: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleApprove = async (userId) => {
        try {
            await userService.updateStatus(userId, 'active');
            fetchUsers();
        } catch (err) {
            setError('Không thể duyệt người dùng: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleReject = async (userId) => {
        if (window.confirm('Bạn có chắc muốn từ chối yêu cầu đăng ký này?')) {
            try {
                await userService.remove(userId);
                fetchUsers();
            } catch (err) {
                setError('Không thể từ chối: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const safeUsers = normalizeUsers(users);
    const pendingCount = safeUsers.filter(u => normalizeStatus(u.status) === 'pending').length;
    const approvedCount = safeUsers.filter(u => normalizeStatus(u.status) !== 'pending').length;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-lg text-slate-600">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center gap-4">
                <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                    <Users size={26} className="text-indigo-600" />
                    Quản lý tài khoản hệ thống
                </h1>
                <button
                    onClick={handleCreateOpen}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    <Plus size={16} />
                    Tạo người dùng
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('approved')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${activeTab === 'approved'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <UserCheck size={20} />
                    Đã duyệt ({approvedCount})
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${activeTab === 'pending'
                        ? 'bg-orange-600 text-white shadow-md'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <Clock size={20} />
                    Chờ duyệt ({pendingCount})
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên, email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                    {activeTab === 'approved' && (
                        <div>
                            <CustomSelect
                                value={statusFilter}
                                onChange={(val) => setStatusFilter(val)}
                                variant="status"
                                options={[
                                    { value: 'all', label: 'Tất cả trạng thái' },
                                    { value: 'active', label: 'Hoạt động' },
                                    { value: 'inactive', label: 'Vô hiệu' }
                                ]}
                            />
                        </div>
                    )}
                </div>
                <div className="mt-3 text-sm text-slate-600">
                    Hiển thị <span className="font-semibold">{filteredUsers.length}</span> / {activeTab === 'pending' ? pendingCount : approvedCount} người dùng
                </div>
            </div>

            {filteredUsers.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                    <Users size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-600">
                        {activeTab === 'pending' ? 'Không có yêu cầu đăng ký nào' : 'Không tìm thấy người dùng nào'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Họ tên</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vai trò</th>
                                {activeTab === 'approved' && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                )}
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                    <span className="text-indigo-600 font-medium text-sm">
                                                        {user.fullName?.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-slate-900">{user.fullName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <CustomSelect
                                            value={user.role?.id || 2}
                                            onChange={(newRoleId) => handleRoleChange(user.id, newRoleId)}
                                            variant="role"
                                            options={[
                                                { value: 1, label: 'Admin' },
                                                { value: 2, label: 'Manager' },
                                                { value: 3, label: 'Cashier' },
                                                { value: 4, label: 'Inventory Staff' },
                                                { value: 5, label: 'Sales Staff' }
                                            ]}
                                        />
                                    </td>
                                    {activeTab === 'approved' && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <CustomSelect
                                                value={(user.status || '').toLowerCase()}
                                                onChange={(newStatus) => handleStatusToggle(user.id, newStatus)}
                                                variant="status"
                                                options={[
                                                    { value: 'active', label: 'Hoạt động' },
                                                    { value: 'inactive', label: 'Vô hiệu' }
                                                ]}
                                            />
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            {activeTab === 'pending' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(user.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs font-medium"
                                                        title="Duyệt"
                                                    >
                                                        <Check size={14} /> Duyệt
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(user.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-xs font-medium"
                                                        title="Từ chối"
                                                    >
                                                        <Ban size={14} /> Từ chối
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-slate-200">
                            <h2 className="text-xl font-semibold text-slate-800">
                                {isCreate ? 'Tạo người dùng' : 'Chỉnh sửa người dùng'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1.5 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Two-column grid similar to Register page */}
                                {isCreate && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Username <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.username}
                                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${validationErrors.username ? 'border-red-300 bg-red-50 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'}`}
                                                placeholder="nhap_username"
                                            />
                                            {validationErrors.username && (
                                                <p className="text-red-600 text-xs mt-1.5">{validationErrors.username}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Mật khẩu <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${validationErrors.password ? 'border-red-300 bg-red-50 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'}`}
                                                placeholder="••••••"
                                            />
                                            {validationErrors.password && (
                                                <p className="text-red-600 text-xs mt-1.5">{validationErrors.password}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Xác nhận mật khẩu <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${validationErrors.confirmPassword ? 'border-red-300 bg-red-50 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'}`}
                                                placeholder="••••••"
                                            />
                                            {validationErrors.confirmPassword && (
                                                <p className="text-red-600 text-xs mt-1.5">{validationErrors.confirmPassword}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Họ tên <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${validationErrors.fullName ? 'border-red-300 bg-red-50 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'}`}
                                            placeholder="Nhập họ tên đầy đủ"
                                        />
                                        {validationErrors.fullName && (
                                            <p className="text-red-600 text-xs mt-1.5">{validationErrors.fullName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${validationErrors.email ? 'border-red-300 bg-red-50 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'}`}
                                            placeholder="example@email.com"
                                        />
                                        {validationErrors.email && (
                                            <p className="text-red-600 text-xs mt-1.5">{validationErrors.email}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Số điện thoại
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${validationErrors.phone ? 'border-red-300 bg-red-50 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'}`}
                                            placeholder="0123456789"
                                        />
                                        {validationErrors.phone && (
                                            <p className="text-red-600 text-xs mt-1.5">{validationErrors.phone}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Địa chỉ
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Nhập địa chỉ"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Vai trò
                                        </label>
                                        <CustomSelect
                                            value={formData.roleId}
                                            onChange={(val) => setFormData({ ...formData, roleId: parseInt(val) })}
                                            variant="role"
                                            options={[
                                                { value: 1, label: 'Admin' },
                                                { value: 2, label: 'Manager' },
                                                { value: 3, label: 'Cashier' },
                                                { value: 4, label: 'Inventory Staff' },
                                                { value: 5, label: 'Sales Staff' }
                                            ]}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Trạng thái
                                        </label>
                                        <CustomSelect
                                            value={formData.status}
                                            onChange={(val) => setFormData({ ...formData, status: val })}
                                            variant="status"
                                            options={[
                                                { value: 'active', label: 'Hoạt động' },
                                                { value: 'inactive', label: 'Vô hiệu hóa' }
                                            ]}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                    >
                                        {isCreate ? 'Tạo mới' : 'Cập nhật'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const normalizeUsers = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    if (Array.isArray(payload?.data?.content)) return payload.data.content;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const normalizeStatus = (status) => String(status || '').toLowerCase();

export default UserManagement;
