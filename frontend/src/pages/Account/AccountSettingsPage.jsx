import React, { useState } from 'react';
import { userService } from '../../services/userService';

const AccountSettingsPage = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Xác nhận mật khẩu mới không khớp');
            return;
        }

        try {
            setLoading(true);
            const response = await userService.changeMyPassword(formData);
            setSuccess(response?.message || 'Đổi mật khẩu thành công');
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể đổi mật khẩu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-semibold text-slate-900">Cài đặt</h1>

            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h2 className="text-base font-semibold text-slate-800">Đổi mật khẩu</h2>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu hiện tại</label>
                    <input
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="••••••"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu mới</label>
                    <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="••••••"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Xác nhận mật khẩu mới</label>
                    <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="••••••"
                    />
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>
                )}
                {success && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-lg text-sm">{success}</div>
                )}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
                    >
                        {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AccountSettingsPage;
