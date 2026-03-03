import React, { useState } from 'react';
import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/crm/homepage');
    };

    // Get initials from full name
    const getInitials = (name) => {
        if (!name) return 'U';
        const names = name.split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 fixed top-0 right-0 left-64 z-40 px-8 flex items-center justify-end shadow-sm">
            <div className="flex items-center gap-6">
                <button className="relative text-slate-500 hover:text-indigo-600 transition-colors">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="relative">
                    <div
                        className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                            {user ? getInitials(user.fullName) : 'U'}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-semibold text-slate-700 leading-none">
                                {user?.fullName || 'User'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                {user?.role === 'ROLE_ADMIN' ? 'Admin' :
                                    user?.role === 'ROLE_MANAGER' ? 'Manager' :
                                        user?.role === 'ROLE_CASHIER' ? 'Cashier' : 'User'}
                            </p>
                        </div>
                    </div>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2">
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                                <LogOut size={16} />
                                Đăng xuất
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
