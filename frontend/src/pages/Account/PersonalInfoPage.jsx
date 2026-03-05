import React, { useEffect, useState } from 'react';
import api from '../../config/axiosConfig';
import { userService } from '../../services/userService';

const PersonalInfoPage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAvatarModal, setShowAvatarModal] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await userService.getMyProfile();
                setProfile(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Không thể tải thông tin cá nhân');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const backendOrigin = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');
    const avatarUrl = profile?.avatarUrl
        ? (profile.avatarUrl.startsWith('http') ? profile.avatarUrl : `${backendOrigin}${profile.avatarUrl}`)
        : '';

    if (loading) {
        return <div className="p-6 text-slate-600">Đang tải thông tin cá nhân...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-600">{error}</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-semibold text-slate-900">Thông tin cá nhân</h1>

            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                <div className="flex items-center gap-4">
                    {avatarUrl ? (
                        <button
                            type="button"
                            onClick={() => setShowAvatarModal(true)}
                            className="rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            title="Phóng to ảnh đại diện"
                        >
                            <img src={avatarUrl} alt={profile?.fullName || 'Avatar'} className="w-16 h-16 rounded-full object-cover border border-slate-200" />
                        </button>
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-semibold">
                            {(profile?.fullName || 'U').slice(0, 1).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <p className="text-lg font-semibold text-slate-900">{profile?.fullName || '-'}</p>
                        <p className="text-sm text-slate-500">{profile?.role || '-'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <InfoRow label="Tên đăng nhập" value={profile?.username} />
                    <InfoRow label="Email" value={profile?.email} />
                    <InfoRow label="Số điện thoại" value={profile?.phone} />
                    <InfoRow label="Trạng thái" value={profile?.status} />
                </div>

                <InfoRow label="Địa chỉ" value={profile?.address} />
            </div>

            {showAvatarModal && avatarUrl && (
                <div
                    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setShowAvatarModal(false)}
                >
                    <div
                        className="relative bg-white rounded-2xl p-3 max-w-2xl w-full"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setShowAvatarModal(false)}
                            className="absolute top-3 right-3 rounded-full bg-black/70 text-white w-8 h-8 flex items-center justify-center"
                            title="Đóng"
                        >
                            ×
                        </button>
                        <img
                            src={avatarUrl}
                            alt={profile?.fullName || 'Avatar'}
                            className="w-full max-h-[80vh] object-contain rounded-xl"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

const InfoRow = ({ label, value }) => (
    <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-slate-800">{value || '-'}</p>
    </div>
);

export default PersonalInfoPage;
