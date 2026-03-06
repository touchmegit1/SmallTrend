import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const adminAndManagerRoles = ['ADMIN', 'ROLE_ADMIN', 'MANAGER', 'ROLE_MANAGER'];

const NotFoundPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const roleName = String(user?.role?.name || user?.role || '').toUpperCase();
    const homePath = !isAuthenticated
        ? '/'
        : (adminAndManagerRoles.includes(roleName) ? '/dashboard' : '/pos');

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-6">
            <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <AlertTriangle size={30} />
                </div>
                <p className="text-sm font-semibold text-amber-600">404</p>
                <h1 className="mt-1 text-2xl font-bold text-slate-900">Không tìm thấy trang</h1>
                <p className="mt-2 text-sm text-slate-600">
                    Đường dẫn không tồn tại hoặc nội dung đã được thay đổi. Bạn có thể quay về trang ban đầu để tiếp tục sử dụng hệ thống.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <button
                        type="button"
                        onClick={() => navigate(homePath, { replace: true })}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        <Home size={16} /> Về trang ban đầu
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        <ArrowLeft size={16} /> Quay lại
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
