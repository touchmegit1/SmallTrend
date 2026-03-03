import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Phone, UserCircle } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        fullName: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const errors = {};

        // Username: alphanumeric and underscore only
        if (!formData.username) {
            errors.username = 'Username is required';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            errors.username = 'Username can only contain letters, numbers and underscores';
        }

        // Password
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        // Confirm Password
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        // Email
        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email format';
        }

        // Full Name
        if (!formData.fullName) {
            errors.fullName = 'Full name is required';
        } else if (formData.fullName.length < 2) {
            errors.fullName = 'Full name must be at least 2 characters';
        }

        // Phone (optional but validated if provided)
        if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
            errors.phone = 'Phone must be 10-11 digits';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await register({
                username: formData.username,
                password: formData.password,
                email: formData.email,
                fullName: formData.fullName,
                phone: formData.phone || undefined,
                roleId: 2,  // Manager role by default
                status: 'pending'  // Pending approval
            });
            // Navigate to login after successful registration
            navigate('/login', { state: { message: 'Đăng ký thành công! Vui lòng chờ admin duyệt tài khoản.' } });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserCircle className="text-indigo-600" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Create Account</h2>
                        <p className="text-indigo-100 mt-2">Join SmallTrend POS System</p>
                    </div>

                    {/* Form */}
                    <div className="p-8">
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Username *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${validationErrors.username ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                            }`}
                                        placeholder="Enter username"
                                    />
                                </div>
                                {validationErrors.username && (
                                    <p className="text-red-500 text-xs mt-1">{validationErrors.username}</p>
                                )}
                            </div>

                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Full Name *
                                </label>
                                <div className="relative">
                                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${validationErrors.fullName ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                            }`}
                                        placeholder="Enter full name"
                                    />
                                </div>
                                {validationErrors.fullName && (
                                    <p className="text-red-500 text-xs mt-1">{validationErrors.fullName}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Email *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${validationErrors.email ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                            }`}
                                        placeholder="Enter email"
                                    />
                                </div>
                                {validationErrors.email && (
                                    <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Phone (Optional)
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${validationErrors.phone ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                            }`}
                                        placeholder="Enter phone number"
                                    />
                                </div>
                                {validationErrors.phone && (
                                    <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Password *
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${validationErrors.password ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                            }`}
                                        placeholder="Enter password"
                                    />
                                </div>
                                {validationErrors.password && (
                                    <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Confirm Password *
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${validationErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                            }`}
                                        placeholder="Confirm password"
                                    />
                                </div>
                                {validationErrors.confirmPassword && (
                                    <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>

                        {/* Login Link */}
                        <div className="mt-6 text-center">
                            <p className="text-slate-600 text-sm">
                                Already have an account?{' '}
                                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                                    Login here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-500 text-sm mt-6">
                    &copy; 2026 SmallTrend POS System. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Register;
