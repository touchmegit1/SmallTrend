import React, { useState, useEffect } from 'react';
import { Users, Edit, Trash2, X, Search, Plus, Loader2 } from 'lucide-react';
import CustomSelect from '../../components/common/CustomSelect';
import { userService } from '../../services/userService';
import api from '../../config/axiosConfig';
const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isCreate, setIsCreate] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        email: '',
        phone: '',
        address: '',
        roleId: 2,
        status: 'active',
        salaryType: 'MONTHLY',
        baseSalary: '',
        hourlyRate: '',
        minRequiredShifts: '',
        countLateAsPresent: true,
        workingHoursPerMonth: 208
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isListLoading, setIsListLoading] = useState(false);
    const [actionLoadingKey, setActionLoadingKey] = useState('');
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        return () => {
            if (avatarPreviewUrl && avatarPreviewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(avatarPreviewUrl);
            }
        };
    }, [avatarPreviewUrl]);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, statusFilter]);

    const fetchUsers = async () => {
        try {
            setIsListLoading(true);
            const response = await userService.getAll({ page: 0, size: 100 });
            setUsers(normalizeUsers(response));
            setError('');
        } catch (err) {
            setUsers([]);
            setError('Không thể tải danh sách người dùng: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsListLoading(false);
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = normalizeUsers(users);

        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.role?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
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

        const salaryType = String(formData.salaryType || '').toUpperCase();
        const baseSalary = Number(formData.baseSalary);
        const hourlyRate = Number(formData.hourlyRate);
        const minRequiredShifts = Number(formData.minRequiredShifts);
        const workingHoursPerMonth = Number(formData.workingHoursPerMonth);

        if (!salaryType) {
            errors.salaryType = 'Vui lòng chọn chế độ lương';
        }

        if ((salaryType === 'MONTHLY' || salaryType === 'MONTHLY_MIN_SHIFTS')
            && (formData.baseSalary === '' || Number.isNaN(baseSalary) || baseSalary < 0)) {
            errors.baseSalary = 'Lương cơ bản phải là số lớn hơn hoặc bằng 0';
        }

        if ((salaryType === 'HOURLY' || salaryType === 'MONTHLY' || salaryType === 'MONTHLY_MIN_SHIFTS')
            && (formData.hourlyRate === '' || Number.isNaN(hourlyRate) || hourlyRate < 0)) {
            errors.hourlyRate = 'Đơn giá giờ phải là số lớn hơn hoặc bằng 0';
        }

        if ((salaryType === 'MONTHLY' || salaryType === 'MONTHLY_MIN_SHIFTS')
            && (formData.workingHoursPerMonth === '' || Number.isNaN(workingHoursPerMonth) || workingHoursPerMonth <= 0)) {
            errors.workingHoursPerMonth = 'Giờ chuẩn/tháng phải lớn hơn 0';
        }

        if (salaryType === 'MONTHLY_MIN_SHIFTS'
            && (formData.minRequiredShifts === '' || Number.isNaN(minRequiredShifts) || minRequiredShifts < 0)) {
            errors.minRequiredShifts = 'Số ca tối thiểu phải là số lớn hơn hoặc bằng 0';
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
            status: (user.status || 'active').toLowerCase(),
            salaryType: user.salaryType || 'MONTHLY',
            baseSalary: user.baseSalary ?? '',
            hourlyRate: user.hourlyRate ?? '',
            minRequiredShifts: user.minRequiredShifts ?? '',
            countLateAsPresent: user.countLateAsPresent ?? true,
            workingHoursPerMonth: user.workingHoursPerMonth ?? 208
        });
        setValidationErrors({});
        setAvatarFile(null);
        setAvatarPreviewUrl('');
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
            status: 'active',
            salaryType: 'MONTHLY',
            baseSalary: '',
            hourlyRate: '',
            minRequiredShifts: '',
            countLateAsPresent: true,
            workingHoursPerMonth: 208
        });
        setValidationErrors({});
        setAvatarFile(null);
        setAvatarPreviewUrl('');
        setError('');
        setShowModal(true);
    };

    const handleAvatarFileChange = (file) => {
        setAvatarFile(file || null);
        if (avatarPreviewUrl && avatarPreviewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(avatarPreviewUrl);
        }
        if (file) {
            setAvatarPreviewUrl(URL.createObjectURL(file));
        } else {
            setAvatarPreviewUrl('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setError('');

        if (!validateForm()) return;

        try {
            setIsSubmitting(true);
            if (isCreate) {
                const payload = {
                    username: formData.username,
                    password: formData.password,
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone || undefined,
                    address: formData.address || undefined,
                    roleId: formData.roleId,
                    status: (formData.status || 'active').toUpperCase(),
                    ...buildSalaryPayload(formData)
                };
                const createdUser = await userService.create(payload);
                const createdUserId = createdUser?.id || createdUser?.data?.id;
                if (avatarFile && createdUserId) {
                    await userService.uploadAvatar(createdUserId, avatarFile);
                }
            } else {
                await userService.update(selectedUser.id, {
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone || undefined,
                    address: formData.address || undefined,
                    roleId: formData.roleId,
                    status: (formData.status || 'active').toUpperCase(),
                    ...buildSalaryPayload(formData)
                });
                if (avatarFile) {
                    await userService.uploadAvatar(selectedUser.id, avatarFile);
                }
            }
            setShowModal(false);
            await fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
            try {
                setActionLoadingKey(`delete-${userId}`);
                await userService.remove(userId);
                await fetchUsers();
            } catch (err) {
                setError('Không thể xóa người dùng: ' + (err.response?.data?.message || err.message));
            } finally {
                setActionLoadingKey('');
            }
        }
    };

    const handleStatusToggle = async (userId, newStatus) => {
        try {
            setActionLoadingKey(`status-${userId}`);
            await userService.updateStatus(userId, newStatus);
            await fetchUsers();
        } catch (err) {
            setError('Không thể cập nhật trạng thái: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoadingKey('');
        }
    };

    const handleRoleChange = async (userId, newRoleId) => {
        try {
            setActionLoadingKey(`role-${userId}`);
            await userService.update(userId, { roleId: parseInt(newRoleId) });
            await fetchUsers();
        } catch (err) {
            setError('Không thể cập nhật vai trò: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoadingKey('');
        }
    };

    const safeUsers = normalizeUsers(users);
    const totalCount = safeUsers.length;
    const backendOrigin = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');
    const currentAvatarUrl = selectedUser?.avatarUrl
        ? (selectedUser.avatarUrl.startsWith('http') ? selectedUser.avatarUrl : `${backendOrigin}${selectedUser.avatarUrl}`)
        : '';
    const displayAvatarUrl = avatarPreviewUrl || currentAvatarUrl;
    const isActionBusy = isListLoading || Boolean(actionLoadingKey);
    const resolveAvatarUrl = (avatarUrl) => {
        if (!avatarUrl) return '';
        return avatarUrl.startsWith('http') ? avatarUrl : `${backendOrigin}${avatarUrl}`;
    };

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
                    disabled={isActionBusy}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
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
                </div>
                <div className="mt-3 text-sm text-slate-600">
                    Hiển thị <span className="font-semibold">{filteredUsers.length}</span> / {totalCount} người dùng
                </div>
            </div>

            {isListLoading && !loading && (
                <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Đang tải danh sách người dùng...
                </div>
            )}

            {filteredUsers.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                    <Users size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-600">Không tìm thấy người dùng nào</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Họ tên</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vai trò</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cấu hình lương</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                {resolveAvatarUrl(user.avatarUrl) ? (
                                                    <img
                                                        src={resolveAvatarUrl(user.avatarUrl)}
                                                        alt={user.fullName || 'Avatar'}
                                                        className="h-10 w-10 rounded-full object-cover border border-slate-200"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                        <span className="text-indigo-600 font-medium text-sm">
                                                            {user.fullName?.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
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
                                            disabled={isActionBusy || actionLoadingKey === `role-${user.id}`}
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
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <CustomSelect
                                            value={(user.status || '').toLowerCase()}
                                            onChange={(newStatus) => handleStatusToggle(user.id, newStatus)}
                                            disabled={isActionBusy || actionLoadingKey === `status-${user.id}`}
                                            variant="status"
                                            options={[
                                                { value: 'active', label: 'Hoạt động' },
                                                { value: 'inactive', label: 'Vô hiệu' }
                                            ]}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700">
                                        {summarizeSalary(user)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                disabled={isActionBusy}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                disabled={isActionBusy}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                                                title="Xóa"
                                            >
                                                {actionLoadingKey === `delete-${user.id}` ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                            </button>
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
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-slate-200">
                            <h2 className="text-xl font-semibold text-slate-800">
                                {isCreate ? 'Tạo người dùng' : 'Chỉnh sửa người dùng'}
                            </h2>
                            <button
                                onClick={() => !isSubmitting && setShowModal(false)}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1.5 transition"
                                disabled={isSubmitting}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-1">
                                        <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50">
                                            <p className="text-sm font-semibold text-slate-800">Ảnh đại diện</p>
                                            <div className="w-full aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
                                                {displayAvatarUrl ? (
                                                    <img src={displayAvatarUrl} alt="Avatar preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-slate-400 text-sm">Chưa có ảnh</span>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleAvatarFileChange(e.target.files?.[0] || null)}
                                                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white"
                                            />
                                            {avatarFile && (
                                                <p className="text-xs text-slate-500">Đã chọn: {avatarFile.name}</p>
                                            )}
                                            {!avatarFile && !isCreate && currentAvatarUrl && (
                                                <p className="text-xs text-slate-500">Đang dùng ảnh hiện tại.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2 space-y-4">
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
                                                <div className="hidden md:block" />
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

                                        <div className="rounded-lg border border-slate-200 p-4 space-y-4">
                                            <h3 className="text-sm font-semibold text-slate-800">Cấu hình lương nhân viên</h3>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Chế độ lương</label>
                                                <CustomSelect
                                                    value={formData.salaryType}
                                                    onChange={(value) => setFormData({ ...formData, salaryType: value })}
                                                    options={[
                                                        { value: 'MONTHLY', label: 'Theo tháng' },
                                                        { value: 'MONTHLY_MIN_SHIFTS', label: 'Theo tháng (đủ số ca)' },
                                                        { value: 'HOURLY', label: 'Theo giờ' },
                                                    ]}
                                                />
                                                {validationErrors.salaryType && (
                                                    <p className="text-red-600 text-xs mt-1.5">{validationErrors.salaryType}</p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">Lương cơ bản (VND)</label>
                                                    <input
                                                        type="number"
                                                        value={formData.baseSalary}
                                                        onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                                                        min="0"
                                                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${validationErrors.baseSalary ? 'border-red-300 bg-red-50 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'}`}
                                                        placeholder="7000000"
                                                    />
                                                    {validationErrors.baseSalary && (
                                                        <p className="text-red-600 text-xs mt-1.5">{validationErrors.baseSalary}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">Đơn giá theo giờ (VND)</label>
                                                    <input
                                                        type="number"
                                                        value={formData.hourlyRate}
                                                        onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                                                        min="0"
                                                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${validationErrors.hourlyRate ? 'border-red-300 bg-red-50 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'}`}
                                                        placeholder="30000"
                                                    />
                                                    {validationErrors.hourlyRate && (
                                                        <p className="text-red-600 text-xs mt-1.5">{validationErrors.hourlyRate}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">Ca tối thiểu/tháng</label>
                                                    <input
                                                        type="number"
                                                        value={formData.minRequiredShifts}
                                                        onChange={(e) => setFormData({ ...formData, minRequiredShifts: e.target.value })}
                                                        min="0"
                                                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${validationErrors.minRequiredShifts ? 'border-red-300 bg-red-50 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'}`}
                                                        placeholder="20"
                                                    />
                                                    {validationErrors.minRequiredShifts && (
                                                        <p className="text-red-600 text-xs mt-1.5">{validationErrors.minRequiredShifts}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">Giờ chuẩn/tháng</label>
                                                    <input
                                                        type="number"
                                                        value={formData.workingHoursPerMonth}
                                                        onChange={(e) => setFormData({ ...formData, workingHoursPerMonth: e.target.value })}
                                                        min="1"
                                                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition ${validationErrors.workingHoursPerMonth ? 'border-red-300 bg-red-50 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'}`}
                                                        placeholder="208"
                                                    />
                                                    {validationErrors.workingHoursPerMonth && (
                                                        <p className="text-red-600 text-xs mt-1.5">{validationErrors.workingHoursPerMonth}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(formData.countLateAsPresent)}
                                                    onChange={(e) => setFormData({ ...formData, countLateAsPresent: e.target.checked })}
                                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                Tính đi trễ là có mặt khi xét lương tháng đủ ca
                                            </label>
                                        </div>
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
                                        className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                        disabled={isSubmitting}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                                        {isSubmitting ? 'Đang lưu...' : (isCreate ? 'Tạo mới' : 'Cập nhật')}
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

const toNullableNumber = (value) => {
    if (value === '' || value === null || value === undefined) {
        return null;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
};

const buildSalaryPayload = (formData) => ({
    salaryType: String(formData.salaryType || 'MONTHLY').toUpperCase(),
    baseSalary: toNullableNumber(formData.baseSalary),
    hourlyRate: toNullableNumber(formData.hourlyRate),
    minRequiredShifts: toNullableNumber(formData.minRequiredShifts),
    countLateAsPresent: Boolean(formData.countLateAsPresent),
    workingHoursPerMonth: toNullableNumber(formData.workingHoursPerMonth)
});

const formatCurrencyCompact = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(Number(value) || 0);
};

const formatSalaryMode = (salaryType) => {
    if (salaryType === 'HOURLY') return 'Theo giờ';
    if (salaryType === 'MONTHLY_MIN_SHIFTS') return 'Tháng đủ ca';
    return 'Theo tháng';
};

const summarizeSalary = (user) => {
    const mode = formatSalaryMode(user.salaryType);
    if (user.salaryType === 'HOURLY') {
        return `${mode}: ${formatCurrencyCompact(user.hourlyRate)}/giờ`;
    }
    if (user.salaryType === 'MONTHLY_MIN_SHIFTS') {
        return `${mode}: ${formatCurrencyCompact(user.baseSalary)} · Tối thiểu ${user.minRequiredShifts ?? 0} ca`;
    }
    return `${mode}: ${formatCurrencyCompact(user.baseSalary)}`;
};

export default UserManagement;
