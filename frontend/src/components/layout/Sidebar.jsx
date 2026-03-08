import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  LogOut,
  Store,
  Warehouse,
  Users,
  Clock,
  BarChart3,
  ChevronRight,
  Shield,
  Menu,
  User,
  Settings,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ collapsed, onToggleSidebar }) => {
  const [openMenus, setOpenMenus] = React.useState({ admin: true });
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    {
      icon: ShoppingCart,
      label: "Bán hàng (POS)",
      path: "/pos",
      children: [
        { label: "Giao diện bán hàng", path: "/pos" },
        { label: "Lịch sử đơn hàng", path: "/pos/history" },
        { label: "Đơn hàng treo", path: "/pos/suspended" },
        { label: "Giao ca", path: "/pos/shift-handover" },
      ],
    },
    {
      icon: Warehouse,
      label: "Kho (Inventory)",
      path: "/inventory",
      children: [
        { label: "Tổng quan kho", path: "/inventory" },
        { label: "Nhập hàng", path: "/inventory/purchase-orders" },
        { label: "Kiểm kê kho", path: "/inventory-counts" },
        { label: "Quản lý vị trí", path: "/inventory/locations" },
        { label: "Xử lý hàng hóa", path: "/inventory/disposal" },
      ],
    },
    {
      icon: Package,
      label: "Sản phẩm",
      path: "/products",
      children: [
        { label: "Danh mục & Thương hiệu", path: "/products/categories" },
        { label: "Danh sách nhà cung cấp", path: "/products/suppliers" },
        { label: "Danh sách sản phẩm", path: "/products" },
        { label: "Thêm sản phẩm", path: "/products/addproduct" },
        { label: "Thiết lập giá", path: "/products/price" },
        { label: "Combo sản phẩm", path: "/products/combo" },
      ],
    },
    {
      icon: Users,
      label: "Khách hàng & KM",
      path: "/crm",
      children: [
        { label: "Danh sách khách hàng", path: "/crm/customer" },
        { label: "Khuyến Mãi", path: "/crm/event" },
        { label: "Kho quà tặng", path: "/crm/loyalty" },
        { label: "Khiếu nại", path: "/crm/complain" },
        { label: "Báo Cáo Thống Kê", path: "/crm/report" },
      ],
    },
    {
      icon: Clock,
      label: "Nhân sự & Ca",
      path: "/hr",
      children: [
        { label: "Danh sách nhân viên", path: "/hr" },
        { label: "Phân ca làm việc", path: "/hr/shifts" },
        { label: "Chấm công", path: "/hr/attendance" },
        { label: "Tính lương", path: "/hr/payroll" },
      ],
    },
    {
      icon: BarChart3,
      label: "Báo cáo & AI",
      path: "/reports",
      children: [
        { label: "Tạo báo cáo", path: "/reports/create" },
        { label: "Quản lý báo cáo", path: "/reports/manage" },
        { label: "AI dự báo", path: "/reports/ai-chat" },
        { label: "Báo cáo doanh thu", path: "/reports/sales" },
        { label: "Báo cáo kho", path: "/reports/inventory" },
        { label: "Nhật ký kiểm toán", path: "/reports/audit-logs" },
        { label: "Nhật ký hoạt động", path: "/reports/logs" },
      ],
    },
  ];

  // Admin menu - compatible with new DB role naming
  const isAdmin = user && (user.role === "ADMIN" || user.role === "ROLE_ADMIN");

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 z-50`}>
      <div className={`${collapsed ? 'p-4' : 'p-6'} border-b border-slate-100 flex flex-col gap-3`}>
        <div
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} cursor-pointer hover:bg-slate-50 rounded-lg p-2`}
          onClick={() => {
            const isAdminRole =
              user && (user.role === "ADMIN" || user.role === "ROLE_ADMIN");
            navigate(isAdminRole ? "/dashboard" : "/pos");
          }}
          title="Về trang chính"
        >
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Store className="text-white" size={24} />
          </div>
          {!collapsed && (
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              LocalStore
            </h1>
          )}
        </div>
        
        {/* Collapse Button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2'} rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors`}
          title={collapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
        >
          <Menu size={20} />
          {!collapsed && <span>Thu gọn</span>}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {/* Admin Menu - ALWAYS FIRST for ROLE_ADMIN */}
        {isAdmin && (
          <div className="mb-2">
            <div
              className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group ${location.pathname === "/dashboard" ||
                location.pathname.startsWith("/hr/users") ||
                openMenus["admin"]
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              onClick={() => collapsed ? navigate("/dashboard") : toggleMenu("admin")}
              title={collapsed ? "Quản trị" : ""}
            >
              <Shield
                size={20}
                className={
                  location.pathname === "/dashboard" ||
                    location.pathname.startsWith("/hr/users") ||
                    openMenus["admin"]
                    ? "text-indigo-600"
                    : "text-slate-500 group-hover:text-slate-700"
                }
              />
              {!collapsed && (
                <>
                  <span className="flex-1 font-medium">Quản trị</span>
                  <ChevronRight
                    size={16}
                    className={`transition-transform duration-200 ${openMenus["admin"] ? "rotate-90" : ""}`}
                  />
                </>
              )}
            </div>

            {openMenus["admin"] && !collapsed && (
              <div className="pl-11 pr-2 py-1 space-y-1">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-sm transition-colors ${isActive
                      ? "bg-indigo-100 text-indigo-700 font-medium"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    }`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/hr/users"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-sm transition-colors ${isActive
                      ? "bg-indigo-100 text-indigo-700 font-medium"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    }`
                  }
                >
                  Quản lý người dùng
                </NavLink>
                <NavLink
                  to="/admin/ticket-center"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-sm transition-colors ${isActive
                      ? "bg-indigo-100 text-indigo-700 font-medium"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    }`
                  }
                >
                  Trung tâm Báo cáo
                </NavLink>
                <NavLink
                  to="/admin/audit-logs"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-sm transition-colors ${isActive
                      ? "bg-indigo-100 text-indigo-700 font-medium"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    }`
                  }
                >
                  Nhật ký Audit
                </NavLink>
              </div>
            )}
          </div>
        )}

        {/* Regular Menu Items */}
        {navItems.map((item) => (
          <div key={item.label}>
            <div
              className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group ${location.pathname.startsWith(item.path) || openMenus[item.label]
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              onClick={() => collapsed ? navigate(item.path) : toggleMenu(item.label)}
              title={collapsed ? item.label.split("(")[0] : ""}
            >
              <item.icon
                size={20}
                className={
                  location.pathname.startsWith(item.path) ||
                    openMenus[item.label]
                    ? "text-indigo-600"
                    : "text-slate-500 group-hover:text-slate-700"
                }
              />
              {!collapsed && (
                <>
                  <span className="flex-1 font-medium">
                    {item.label.split("(")[0]}
                  </span>
                  {item.children && (
                    <ChevronRight
                      size={16}
                      className={`transition-transform duration-200 ${openMenus[item.label] ? "rotate-90" : ""}`}
                    />
                  )}
                </>
              )}
            </div>

            {item.children && openMenus[item.label] && !collapsed && (
              <div className="pl-11 pr-2 py-1 space-y-1">
                {item.children.map((child) => (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-sm transition-colors ${isActive
                        ? "bg-indigo-100 text-indigo-700 font-medium"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
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

      <div className="p-4 border-t border-slate-100 space-y-2">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} w-full px-4 py-3 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200`}
          title={collapsed ? "Đăng xuất" : ""}
        >
          <LogOut size={20} />
          {!collapsed && <span className="font-medium">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
