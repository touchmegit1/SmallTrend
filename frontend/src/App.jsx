import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import PublicRoute from "./components/common/PublicRoute";
import ShiftManagement from "./pages/HR/ShiftManagement";
import PurchaseOrderList from "./pages/Inventory/PurchaseOrder/PurchaseOrderList";
import CreatePurchaseOrder from "./pages/Inventory/PurchaseOrder/CreatePurchaseOrder";
import CRMcomplain from "./pages/CRM/complain";
import CRMcustomer from "./pages/CRM/customer";
import CRMevent from "./pages/CRM/event";
import CRMhomepage from "./pages/CRM/homepage";
import CRMloyalty from "./pages/CRM/loyalty";
import CRMreport from "./pages/CRM/report";
import Dashboard from "./pages/Dashboard/Dashboard";
import AttendanceManagement from "./pages/HR/AttendanceManagement";
import EmployeeList from "./pages/HR/EmployeeList";
import PayrollManagement from "./pages/HR/PayrollManagement";
import UserManagement from "./pages/HR/UserManagement";
import DisposalDetail from "./pages/Inventory/Disposal/DisposalDetail";
import DisposalList from "./pages/Inventory/Disposal/DisposalList";
import InventoryCountDetail from "./pages/Inventory/Count/InventoryCountDetail";
import InventoryCountList from "./pages/Inventory/Count/InventoryCountList";
import InventoryDashboard from "./pages/Inventory/Dashboard/InventoryDashboard";
import LocationManagement from "./pages/Inventory/Location/LocationManagement";
import POS from "./pages/Pos/pos";
import ReportforCashier from "./pages/Pos/ReportforCashier";
import ShiftHandover from "./pages/Pos/ShiftHandover";
import TransactionHistory from "./pages/Pos/TransactionHistory";
import AddNewProduct from "./pages/Products/ProductManager/AddNewProduct";
import AddNewProductVariant from "./pages/Products/ProductManager/AddNewProductVariant";
import CategoryAndBrand from "./pages/Products/ProductManager/CategoryAndBrand";
import ComboDetail from "./pages/Products/ProductManager/ComboDetail";
import ComboManage from "./pages/Products/ProductManager/ComboManage";
import CreateCombo from "./pages/Products/ProductManager/CreateCombo";
import PriceSetting from "./pages/Products/ProductManager/PriceSetting";
import ProductDetail from "./pages/Products/ProductManager/ProductDetail";
import ProductList from "./pages/Products/ProductManager/ProductList";
import Suppliers from "./pages/Products/ProductManager/Suppliers";
import Login from "./pages/Auth/Login";
import MainLayout from "./components/layout/MainLayout";
import { useAuth } from "./context/AuthContext";
import TicketCenter from "./pages/Admin/TicketCenter";
import AuditLogPage from "./pages/Admin/AuditLogPage";
import AiChatPage from "./pages/Admin/AiChatPage";
import PersonalInfoPage from "./pages/Account/PersonalInfoPage";
import AccountSettingsPage from "./pages/Account/AccountSettingsPage";
import NotFoundPage from "./pages/Common/NotFoundPage";

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

  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/crm/homepage" replace />
  );
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
            <ProtectedRoute allowedRoles={[...ADMIN_ROLES, ...MANAGER_ROLES, ...SALES_ROLES, ...INVENTORY_ROLES, ...CASHIER_ROLES]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Module 1: POS (Bán hàng) */}
        <Route path="pos" element={<POS />} />
        <Route path="pos/history" element={<TransactionHistory />} />
        <Route path="pos/suspended" element={<ReportforCashier />} />
        <Route path="pos/shift-handover" element={<ShiftHandover />} />
        {/* Module 2: Inventory (Kho) */}
        <Route path="inventory" element={<InventoryDashboard />} />
        <Route
          path="inventory/purchase-orders"
          element={<PurchaseOrderList />}
        />
        <Route
          path="inventory/purchase-orders/create"
          element={<CreatePurchaseOrder />}
        />
        <Route
          path="inventory/purchase-orders/:id"
          element={<CreatePurchaseOrder />}
        />
        <Route path="inventory/alerts" element={<InventoryCountList />} />

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
        <Route path="products" element={<ProductList />} />
        <Route path="products/addproduct" element={<AddNewProduct />} />
        <Route path="products/detail/:id" element={<ProductDetail />} />
        <Route
          path="products/addproduct_variant"
          element={<AddNewProductVariant />}
        />
        <Route
          path="products/categories"
          element={<div className="p-4"><CategoryAndBrand /></div>}
        />
        <Route
          path="products/combo"
          element={<div className="p-4"><ComboManage /></div>}
        />
        <Route
          path="products/create_combo"
          element={<div className="p-4"><CreateCombo /></div>}
        />
        <Route
          path="products/combo_detail"
          element={<div className="p-4"><ComboDetail /></div>}
        />
        <Route
          path="products/price"
          element={<div className="p-4"><PriceSetting /></div>}
        />

        <Route
          path="products/suppliers"
          element={<div className="p-4"><Suppliers/></div>}
        />
        {/* Module 4: CRM (Khách hàng) */}
        <Route
          path="crm"
          element={<div className="p-4">CRM &amp; Promotion</div>}
        />
        <Route path="crm/customer" element={<CRMcustomer />} />
        <Route path="crm/event" element={<CRMevent />} />
        <Route path="crm/loyalty" element={<CRMloyalty />} />
        <Route path="crm/report" element={<CRMreport />} />
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
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <TicketCenter />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/ticket-center"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <TicketCenter />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/audit-logs"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <AuditLogPage />
            </ProtectedRoute>
          }
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
          path="reports/ai-chat"
          element={
            <ProtectedRoute allowedRoles={[...ADMIN_ROLES, ...MANAGER_ROLES]}>
              <AiChatPage />
            </ProtectedRoute>
          }
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

        {/* Account Routes */}
        <Route path="account/profile" element={<PersonalInfoPage />} />
        <Route path="account/settings" element={<AccountSettingsPage />} />

        {/* 404 Not Found - Show error page instead of redirect */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
export default App;
