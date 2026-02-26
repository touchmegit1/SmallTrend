import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, LogOut, Store, Warehouse, Users, Clock, BarChart3, ChevronRight, Shield, Truck, MessageSquare, Bot } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const [openMenus, setOpenMenus] = React.useState({ admin: true });
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const toggleMenu = (label) => {
        setOpenMenus(prev => ({
            ...prev,
            [label]: !prev[label]
        }));
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const currentRole = normalizeRole(user?.role);

    const navItems = [
        {
            icon: ShoppingCart,
            label: 'Bán hàng (POS)',
            path: '/pos',
            children: [
                { label: 'Giao diện bán hàng', path: '/pos' },
                { label: 'Lịch sử đơn hàng', path: '/pos/history' },
                { label: 'Đơn hàng treo', path: '/pos/suspended' },
            ]
        },
        {
            icon: Warehouse,
            label: 'Kho (Inventory)',
            path: '/inventory',
            children: [
                { label: 'Tổng quan kho', path: '/inventory' },
                { label: 'Nhập kho', path: '/inventory/import' },
                { label: 'Xuất kho', path: '/inventory/export' },
                { label: 'Kiểm kê', path: '/inventory/audit' },
                { label: 'Cảnh báo hết hàng', path: '/inventory/alerts' },
            ]
        },
        {
            icon: Package,
            label: 'Sản phẩm',
            path: '/products',
            children: [
                { label: 'Danh sách sản phẩm', path: '/products' },
                { label: 'Danh mục & Brand', path: '/products/categories' },
                { label: 'Thiết lập giá', path: '/products/price-books' },
                { label: 'In tem mã vạch', path: '/products/print-barcodes' },
            ]
        },
        {
            icon: Users,
            label: 'Khách hàng & KM',
            path: '/crm',
            children: [
                { label: 'Danh sách khách hàng', path: '/crm' },
                { label: 'Chương trình KM', path: '/crm/promotions' },
                { label: 'Voucher/Coupon', path: '/crm/vouchers' },
                { label: 'Tích điểm & Hạng', path: '/crm/loyalty' },
                { label: 'Khiếu nại', path: '/crm/complaints' },
                { label: 'Trang chủ', path: '/crm/homepage' },
            ]
        },
        {
            icon: Truck,
            label: 'Nhà cung cấp',
            path: '/suppliers',
            children: [
                { label: 'Danh sách nhà cung cấp', path: '/suppliers' },
                { label: 'Hợp đồng & SLA', path: '/suppliers/contracts' },
                { label: 'Đánh giá & Hiệu suất', path: '/suppliers/performance' },
            ]
        },
        {
            icon: Clock,
            label: 'Nhân sự & Ca',
            path: '/hr',
            allowedRoles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_CASHIER', 'ROLE_INVENTORY_STAFF', 'ROLE_SALES_STAFF'],
            children: [
                { label: 'Danh sách nhân viên', path: '/hr' },
                { label: 'Thời khóa biểu ca', path: '/hr/shifts' },
                { label: 'Chấm công', path: '/hr/attendance' },
                { label: 'Tính lương', path: '/hr/payroll' },
            ]
        },
        {
            icon: MessageSquare,
            label: 'Ticket Center',
            path: '/tickets',
            children: [
                { label: 'Danh sách ticket', path: '/tickets' },
                { label: 'Tạo ticket', path: '/tickets/new' },
                { label: 'Hàng đợi & SLA', path: '/tickets/queue' },
            ]
        },
        {
            icon: Bot,
            label: 'AI Chatbot',
            path: '/ai-chatbot',
            children: [
                { label: 'Trợ lý AI', path: '/ai-chatbot' },
                { label: 'Kịch bản hội thoại', path: '/ai-chatbot/flows' },
                { label: 'Nhật ký hội thoại', path: '/ai-chatbot/logs' },
            ]
        },
        {
            icon: BarChart3,
            label: 'Báo cáo & AI',
            path: '/reports',
            children: [
                { label: 'Tạo báo cáo', path: '/reports/create' },
                { label: 'Quản lý báo cáo', path: '/reports/manage' },
                { label: 'AI dự báo', path: '/reports/ai' },
                { label: 'Audit Logs', path: '/reports/audit-logs' },
            ]
        },
    ];

    const isAdmin = currentRole === 'ROLE_ADMIN';
    const visibleNavItems = navItems.filter(item => canAccess(item.allowedRoles, currentRole));

    return (
        <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 z-50">
            <div
                className="p-6 border-b border-slate-100 flex items-center gap-3 cursor-pointer hover:bg-slate-50"
                onClick={() => {
                    const isAdminRole = user && (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN');
                    navigate(isAdminRole ? '/dashboard' : '/pos');
                }}
                title="Về trang chính"
            >
                <div className="bg-indigo-600 p-2 rounded-lg">
                    <Store className="text-white" size={24} />
                </div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                    LocalStore
                </h1>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                {/* Admin Menu - ALWAYS FIRST for ROLE_ADMIN */}
                {isAdmin && (
                    <div className="mb-2">
                        <div
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group ${location.pathname === '/dashboard' || location.pathname.startsWith('/hr/users') || openMenus['admin']
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            onClick={() => toggleMenu('admin')}
                        >
                            <Shield size={20} className={
                                location.pathname === '/dashboard' || location.pathname.startsWith('/hr/users') || openMenus['admin']
                                    ? "text-indigo-600"
                                    : "text-slate-500 group-hover:text-slate-700"
                            } />
                            <span className="flex-1 font-medium">Quản trị</span>
                            <ChevronRight size={16} className={`transition-transform duration-200 ${openMenus['admin'] ? 'rotate-90' : ''}`} />
                        </div>

                        {openMenus['admin'] && (
                            <div className="pl-11 pr-2 py-1 space-y-1">
                                <NavLink
                                    to="/dashboard"
                                    className={({ isActive }) =>
                                        `block px-3 py-2 rounded-md text-sm transition-colors ${isActive
                                            ? 'bg-indigo-100 text-indigo-700 font-medium'
                                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                        }`
                                    }
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    to="/hr/users"
                                    className={({ isActive }) =>
                                        `block px-3 py-2 rounded-md text-sm transition-colors ${isActive
                                            ? 'bg-indigo-100 text-indigo-700 font-medium'
                                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                        }`
                                    }
                                >
                                    Tài khoản hệ thống
                                </NavLink>
                            </div>
                        )}
                    </div>
                )}

                {/* Regular Menu Items */}
                {visibleNavItems.map((item) => (
                    <div key={item.label}>
                        <div
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group ${location.pathname.startsWith(item.path) || openMenus[item.label]
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            onClick={() => toggleMenu(item.label)}
                        >
                            <item.icon size={20} className={location.pathname.startsWith(item.path) || openMenus[item.label] ? "text-indigo-600" : "text-slate-500 group-hover:text-slate-700"} />
                            <span className="flex-1 font-medium">{item.label.split('(')[0]}</span>
                            {item.children && (
                                <ChevronRight size={16} className={`transition-transform duration-200 ${openMenus[item.label] ? 'rotate-90' : ''}`} />
                            )}
                        </div>

                        {item.children && openMenus[item.label] && (
                            <div className="pl-11 pr-2 py-1 space-y-1">
                                {item.children.map(child => (
                                    <NavLink
                                        key={child.path}
                                        to={child.path}
                                        className={({ isActive }) =>
                                            `block px-3 py-2 rounded-md text-sm transition-colors ${isActive
                                                ? 'bg-indigo-100 text-indigo-700 font-medium'
                                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                            }`
                                        }
                                        end={child.path === item.path}
                                    >
                                        {child.label}
                                    </NavLink>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
};

const normalizeRole = (role) => {
    if (!role) return null;
    return role.startsWith('ROLE_') ? role : `ROLE_${role}`;
};

const canAccess = (allowedRoles, userRole) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    if (!userRole) return false;
    return allowedRoles.includes(userRole);
};

export default Sidebar;
