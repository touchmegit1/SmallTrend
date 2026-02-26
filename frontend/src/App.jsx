import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import POS from "./pages/Pos/pos";
import Login from "./pages/Auth/Login";
import ProtectedRoute from "./components/common/ProtectedRoute";
import PublicRoute from "./components/common/PublicRoute";
import UserManagement from "./pages/HR/UserManagement";
import EmployeeList from "./pages/HR/EmployeeList";
import ShiftManagement from "./pages/HR/ShiftManagement";
import AttendanceManagement from "./pages/HR/AttendanceManagement";
import PayrollManagement from "./pages/HR/PayrollManagement";
import InventoryDashboard from "./pages/Inventory/InventoryDashboard";
import ImportInventory from "./pages/Inventory/ImportInventory";
import CreateImport from "./pages/Inventory/CreateImport";
import InventoryCountList from "./pages/Inventory/InventoryCountList";
import InventoryCountDetail from "./pages/Inventory/InventoryCountDetail";
import LocationManagement from "./pages/Inventory/LocationManagement";
import DisposalList from "./pages/Inventory/DisposalList";
import DisposalDetail from "./pages/Inventory/DisposalDetail";
import CRMcomplain from "./pages/CRM/complain";
import CRMcustomer from "./pages/CRM/customer";
import CRMevent from "./pages/CRM/event";
import CRMhomepage from "./pages/CRM/homepage";
import CRMloyalty from "./pages/CRM/loyalty";
import { useAuth } from "./context/AuthContext";
import TransactionHistory from "./pages/Pos/Transition_History";
import ReportforCashier from "./pages/Pos/ReportforCashier";

const ADMIN_ROLES = ["ADMIN", "ROLE_ADMIN"];
const MANAGER_ROLES = ["MANAGER", "ROLE_MANAGER"];
const CASHIER_ROLES = ["CASHIER", "ROLE_CASHIER"];
const INVENTORY_ROLES = ["INVENTORY_STAFF", "ROLE_INVENTORY_STAFF"];
const SALES_ROLES = ["SALES_STAFF", "ROLE_SALES_STAFF"];

const ALL_APP_ROLES = [
  ...ADMIN_ROLES,
  ...MANAGER_ROLES,
  ...CASHIER_ROLES,
  ...INVENTORY_ROLES,
  ...SALES_ROLES,
];

function RootRedirect() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/crm/homepage" replace />;
  }

  const privilegedRoles = [...ADMIN_ROLES, ...MANAGER_ROLES];
  const currentRole = user?.role;
  return privilegedRoles.includes(currentRole)
    ? <Navigate to="/dashboard" replace />
    : <Navigate to="/pos" replace />;
}

function App() {
  return (
    <Routes>
      {/* Root Route - Redirect based on authentication */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route path="/crm/homepage" element={<CRMhomepage />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard Route - only ADMIN/MANAGER */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute allowedRoles={[...ADMIN_ROLES, ...MANAGER_ROLES]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Module 1: POS (Bán hàng) */}
        <Route path="pos" element={<POS />} />
        <Route
          path="pos/history"
          element={<TransactionHistory />}
        />
        <Route
          path="pos/suspended"
          element={<ReportforCashier />}
        />

        {/* Module 2: Inventory (Kho) */}
        <Route path="inventory" element={<InventoryDashboard />} />
        <Route path="inventory/import" element={<ImportInventory />} />
        <Route path="inventory/import/create" element={<CreateImport />} />
        <Route path="inventory/export" element={<DisposalList />} />
        <Route path="inventory/alerts" element={<InventoryCountList />} />
        <Route
          path="inventory/suppliers"
          element={<div className="p-4">Quản lý nhà cung cấp (Supplier)</div>}
        />
        <Route
          path="inventory/audit"
          element={<Navigate to="/inventory-counts" replace />}
        />
        <Route path="inventory-counts" element={<InventoryCountList />} />
        <Route
          path="inventory-counts/create"
          element={<InventoryCountDetail />}
        />
        <Route path="inventory-counts/:id" element={<InventoryCountDetail />} />
        <Route path="inventory/locations" element={<LocationManagement />} />
        <Route path="inventory/disposal" element={<DisposalList />} />
        <Route path="inventory/disposal/create" element={<DisposalDetail />} />
        <Route path="inventory/disposal/:id" element={<DisposalDetail />} />

        {/* Module 3: Products (Sản phẩm) */}
        <Route
          path="products"
          element={<div className="p-4">Product Management (Sản phẩm)</div>}
        />
        <Route
          path="products/categories"
          element={<div className="p-4">Danh mục & Brand</div>}
        />
        <Route
          path="products/price-books"
          element={<div className="p-4">Thiết lập giá</div>}
        />
        <Route
          path="products/print-barcodes"
          element={<div className="p-4">In tem mã vạch</div>}
        />

        {/* Module 4: CRM (Khách hàng) */}
        <Route
          path="crm"
          element={<CRMcustomer />}
        />
        <Route path="crm/customer" element={<CRMcustomer />} />
        <Route path="crm/event" element={<CRMevent />} />
        <Route path="crm/loyalty" element={<CRMloyalty />} />
        <Route
          path="crm/promotions"
          element={<div className="p-4">Chương trình KM</div>}
        />
        <Route
          path="crm/vouchers"
          element={<div className="p-4">Voucher/Coupon</div>}
        />
        <Route path="crm/complain" element={<CRMcomplain />} />
        <Route path="crm/complaints" element={<CRMcomplain />} />

        {/* Module 5: HR (Nhân sự) */}
        <Route path="hr" element={<Navigate to="/hr/employees" replace />} />
        <Route
          path="hr/employees"
          element={
            <ProtectedRoute allowedRoles={ALL_APP_ROLES}>
              <EmployeeList />
            </ProtectedRoute>
          }
        />
        <Route
          path="hr/users"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="hr/shifts"
          element={
            <ProtectedRoute allowedRoles={ALL_APP_ROLES}>
              <ShiftManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="hr/attendance"
          element={
            <ProtectedRoute allowedRoles={ALL_APP_ROLES}>
              <AttendanceManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="hr/payroll"
          element={
            <ProtectedRoute allowedRoles={ALL_APP_ROLES}>
              <PayrollManagement />
            </ProtectedRoute>
          }
        />

        {/* Ticket Center */}
        <Route
          path="ticket-center"
          element={<div className="p-4">Trung tâm Ticket</div>}
        />

        {/* Module 6: Reports (Báo cáo) */}
        <Route
          path="reports"
          element={<div className="p-4">Reports & AI (Báo cáo)</div>}
        />
        <Route
          path="reports/create"
          element={<div className="p-4">Tạo báo cáo</div>}
        />
        <Route
          path="reports/manage"
          element={<div className="p-4">Quản lý báo cáo</div>}
        />
        <Route
          path="reports/ai"
          element={<div className="p-4">AI dự báo</div>}
        />
        <Route
          path="reports/ai-chatbot"
          element={<div className="p-4">AI Chatbot</div>}
        />
        <Route
          path="reports/audit-logs"
          element={<div className="p-4">Nhật ký kiểm toán</div>}
        />
        <Route
          path="reports/sales"
          element={<div className="p-4">Báo cáo doanh thu</div>}
        />
        <Route
          path="reports/inventory"
          element={<div className="p-4">Báo cáo kho</div>}
        />
        <Route
          path="reports/logs"
          element={<div className="p-4">Nhật ký hoạt động</div>}
        />

        <Route path="*" element={<Navigate to="/pos" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
export default App;