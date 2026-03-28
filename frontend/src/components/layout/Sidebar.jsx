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
  ChevronRight,
  Shield,
  Menu,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  ADMIN_ROLES,
  MANAGER_ROLES,
  CASHIER_ROLES,
  INVENTORY_ROLES,
  hasAnyRole,
} from "../../utils/rolePermissions";

const Sidebar = ({ collapsed, onToggleSidebar }) => {
  const [openMenus, setOpenMenus] = React.useState({ admin: true });
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isAdmin = hasAnyRole(user, ADMIN_ROLES);
  const isManager = hasAnyRole(user, MANAGER_ROLES);
  const isCashier = hasAnyRole(user, CASHIER_ROLES);
  const isInventoryStaff = hasAnyRole(user, INVENTORY_ROLES);

  const canManageWorkforce = isAdmin || isManager;
  const canAccessCrm = isManager || isCashier;
  const showBusinessMenu = !isAdmin;

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

  const posChildren = isManager && !isCashier
    ? [
      { label: "Báo cáo doanh số", path: "/pos/suspended" },
      { label: "Khiếu nại", path: "/pos/complain" },
    ]
    : [
      { label: "Giao diện bán hàng", path: "/pos" },
      { label: "Lịch sử đơn hàng", path: "/pos/history" },
      { label: "Báo cáo doanh số", path: "/pos/suspended" },
      { label: "Khiếu nại", path: "/pos/complain" },
    ];

  const inventoryChildren = isCashier
    ? [
      { label: "Tổng quan kho", path: "/inventory" },
      { label: "Quản lý vị trí", path: "/inventory/locations" },
    ]
    : [
      { label: "Tổng quan kho", path: "/inventory" },
      { label: "Nhập hàng", path: "/inventory/purchase-orders" },
      { label: "Kiểm kê kho", path: "/inventory-counts" },
      { label: "Quản lý vị trí", path: "/inventory/locations" },
      { label: "Xử lý hàng hóa", path: "/inventory/disposal" },
    ];

  const productChildren = (isCashier || isInventoryStaff)
    ? [
      { label: "Danh sách nhà cung cấp", path: "/products/suppliers" },
      { label: "Danh sách sản phẩm", path: "/products" },
      { label: "Combo sản phẩm", path: "/products/combo" },
    ]
    : [
      { label: "Danh mục & Thương hiệu", path: "/products/categories" },
      { label: "Danh sách nhà cung cấp", path: "/products/suppliers" },
      { label: "Danh sách sản phẩm", path: "/products" },
      { label: "Thiết lập giá", path: "/products/price" },
      { label: "Combo sản phẩm", path: "/products/combo" },
    ];

  const hrChildren = canManageWorkforce
    ? [
      { label: "Nhân sự tổng hợp", path: "/hr/workforce" },
      { label: "Lịch làm việc chung", path: "/hr/schedule" },
      { label: "Phân ca làm việc", path: "/hr/shifts" },
      { label: "Trung tâm ticket", path: "/hr/ticket-processing" },
      { label: "Lương của tôi", path: "/hr/my-payroll" },
    ]
    : [
      { label: "Lịch làm việc chung", path: "/hr/schedule" },
      { label: "Trung tâm ticket", path: "/hr/ticket-processing" },
      { label: "Chấm công", path: "/hr/my-attendance" },
      { label: "Lương của tôi", path: "/hr/my-payroll" },
    ];

  const navItems = showBusinessMenu
    ? [
      ...((isCashier || isManager)
        ? [{
          icon: ShoppingCart,
          label: "Bán hàng (POS)",
          path: isManager && !isCashier ? "/pos/suspended" : "/pos",
          children: posChildren,
        }]
        : []),
      {
        icon: Warehouse,
        label: "Kho (Inventory)",
        path: "/inventory",
        children: inventoryChildren,
      },
      {
        icon: Package,
        label: "Sản phẩm",
        path: "/products",
        children: productChildren,
      },
      ...(canAccessCrm
        ? [{
          icon: Users,
          label: "Khách hàng & KM",
          path: "/crm",
          children: isCashier
            ? [
              { label: "Kho quà tặng", path: "/crm/loyalty" },
            ]
            : [
              { label: "Danh sách khách hàng", path: "/crm/customer" },
              { label: "Khuyến Mãi", path: "/crm/event" },
              { label: "Kho quà tặng", path: "/crm/loyalty" },
              { label: "Quản lý Quảng cáo", path: "/crm/ads" },
              { label: "Báo Cáo Thống Kê", path: "/crm/report" },
            ],
        }]
        : []),
      {
        icon: Clock,
        label: "Nhân sự & Ca",
        path: "/hr",
        children: hrChildren,
      },
    ]
    : [];

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 z-50`}>
      <div className={`${collapsed ? 'p-4' : 'p-6'} border-b border-slate-100 flex flex-col gap-3`}>
        <div
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} cursor-pointer hover:bg-slate-50 rounded-lg p-2`}
          onClick={() => {
            navigate("/crm/homepage");
          }}
          title="Về trang chính"
        >
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Store className="text-white" size={24} />
          </div>
          {!collapsed && (
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Smalltrend
            </h1>
          )}
        </div>

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
        {isAdmin && (
          <div className="mb-2">
            <div
              className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group ${location.pathname.startsWith("/admin") ||
                location.pathname === "/hr/users" ||
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
                  location.pathname.startsWith("/admin") ||
                    location.pathname === "/hr/users" ||
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
              </div>
            )}
          </div>
        )}

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
