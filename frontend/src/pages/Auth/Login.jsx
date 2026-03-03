import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, User, Lock, AlertCircle, X } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showError, setShowError] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Auto hide error after 10 seconds
    useEffect(() => {
        if (error) {
            setShowError(true);
            const timer = setTimeout(() => {
                setShowError(false);
                setTimeout(() => setError(''), 300); // delay to allow fade out animation
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setShowError(false);
        setLoading(true);

        // Basic client-side validation
        if (!username.trim()) {
            setError('Tên đăng nhập không được để trống');
            setLoading(false);
            return;
        }

        if (!password.trim()) {
            setError('Mật khẩu không được để trống');
            setLoading(false);
            return;
        }

        try {
            await login(username.trim(), password);
            navigate('/'); // Chuyển hướng về trang chủ sau khi login
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
        } finally {
            setLoading(false);
        }
    };

    const dismissError = () => {
        setShowError(false);
        setTimeout(() => setError(''), 300);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                <div className="flex justify-center mb-6">
                    <div className="p-3 bg-blue-100 rounded-full">
                        <LogIn className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">Đăng nhập SmallTrend</h2>

                {error && (
                    <div className={`p-4 mb-4 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg transition-all duration-300 ${showError ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} role="alert">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <span className="font-medium">Lỗi đăng nhập:</span>
                                    <div className="mt-1">{error}</div>
                                </div>
                            </div>
                            <button
                                onClick={dismissError}
                                className="ml-3 text-red-400 hover:text-red-600 transition-colors"
                                aria-label="Đóng thông báo lỗi"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="mt-2 text-xs text-red-600">
                            Thông báo này sẽ tự động ẩn sau 10 giây
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="username">
                            Tên đăng nhập
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <User className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                id="username"
                                type="text"
                                className="w-full pl-10 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nhập tên đăng nhập"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="password">
                            Mật khẩu
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Lock className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                type="password"
                                className="w-full pl-10 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nhập mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </button>
                </form>

                {/* Information for new employees */}
                <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm">
                        Nhân viên mới?{' '}
                        <span className="text-gray-800 font-medium">
                            Liên hệ quản trị viên để được cấp tài khoản
                        </span>
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                        Chỉ quản trị viên mới có thể tạo tài khoản cho nhân viên
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
