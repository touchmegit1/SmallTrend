import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import POS from "./pages/Pos/pos";
import Login from "./pages/Auth/Login";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ProtectedRoute from "./components/common/ProtectedRoute";
import PublicRoute from "./components/common/PublicRoute";
import UserManagement from "./pages/HR/UserManagement";
import WorkforceManagement from "./pages/HR/WorkforceManagement";
import ShiftManagement from "./pages/HR/ShiftManagement";
import ShiftCalendarPage from "./pages/HR/ShiftCalendarPage";
import MyPayrollSummary from "./pages/HR/MyPayrollSummary";
import ShiftTicketCenter from "./pages/HR/ShiftTicketCenter";
import TicketProcessingPage from "./pages/HR/TicketProcessingPage";
import InventoryDashboard from "./pages/Inventory/InventoryDashboard";
import InventoryCountList from "./pages/Inventory/InventoryCountList";
import InventoryCountDetail from "./pages/Inventory/InventoryCountDetail";
import LocationManagement from "./pages/Inventory/LocationManagement";
import PosComplain from "./pages/Pos/complain";
import CRMcustomer from "./pages/CRM/customer";
import AdsManagement from "./pages/CRM/ads";
import CRMevent from "./pages/CRM/event";
import CRMhomepage from "./pages/CRM/homepage";
import CRMloyalty from "./pages/CRM/loyalty";
import ProductList from "./pages/Products/ProductManager/ProductList";
import CRMreport from "./pages/CRM/report";
import AttendanceManagement from "./pages/HR/AttendanceManagement";
import DisposalDetail from "./pages/Inventory/DisposalDetail";
import DisposalList from "./pages/Inventory/DisposalList";
import ReportforCashier from "./pages/Pos/ReportforCashier";
import AddNewProduct from "./pages/Products/ProductManager/AddNewProduct";
import ProductDetail from "./pages/Products/ProductManager/ProductDetail";
import CategoryAndBrand from "./pages/Products/ProductManager/CategoryAndBrand";
import AddNewProductVariant from "./pages/Products/ProductManager/AddNewProductVariant";
import ComboManage from "./pages/Products/ProductManager/ComboManage";
import CreateCombo from "./pages/Products/ProductManager/CreateCombo";
import ComboDetail from "./pages/Products/ProductManager/ComboDetail";
import { useAuth } from "./context/AuthContext";
import ReportCenterPage from "./pages/Admin/ReportCenterPage";
import AuditLogPage from "./pages/Admin/AuditLogPage";
import AiChatPage from "./pages/Admin/AiChatPage";
import AiSettingsPage from "./pages/Admin/AiSettingsPage";
import Suppliers from "./pages/Products/ProductManager/Suppliers";
import PriceSetting from "./pages/Products/ProductManager/PriceSetting";
import PurchaseOrderList from "./pages/Inventory/PurchaseOrderList";
import CreatePurchaseOrder from "./pages/Inventory/CreatePurchaseOrder";
import TransactionHistory from "./pages/Pos/TransactionHistory";
import NotFoundPage from "./pages/Common/NotFoundPage";
import PersonalInfoPage from "./pages/Account/PersonalInfoPage";
import AccountSettingsPage from "./pages/Account/AccountSettingsPage";
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

  if (isAdminRole(user) || isManagerRole(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/hr/schedule" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route path="/crm/homepage" element={<CRMhomepage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="dashboard"
          element={
            <ProtectedRoute allowedRoles={[...ADMIN_ROLES, ...MANAGER_ROLES]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="pos" element={<POS />} />
        <Route path="pos/history" element={<TransactionHistory />} />
        <Route path="pos/suspended" element={<ReportforCashier />} />
        <Route path="pos/complain" element={<PosComplain />} />
        <Route path="pos/complaints" element={<PosComplain />} />

        {/* Module 2: Inventory (Kho) */}
        <Route path="inventory" element={<InventoryDashboard />} />
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
        <Route path="inventory/purchase-orders" element={<PurchaseOrderList />} />
        <Route
          path="inventory/purchase-orders/create"
          element={<CreatePurchaseOrder />}
        />
        <Route
          path="inventory/purchase-orders/:id"
          element={<CreatePurchaseOrder />}
        />
  
        {/* Product */}
        <Route path="products" element={<ProductList />} />
        <Route path="products/addproduct" element={<AddNewProduct />} />
        <Route path="products/detail/:id" element={<ProductDetail />} />
        <Route
          path="products/addproduct_variant"
          element={<AddNewProductVariant />}
        />
        <Route
          path="products/categories"
          element={
            <div className="p-4">
              <CategoryAndBrand />
            </div>
          }
        />
        <Route
          path="products/price"
          element={<div className="p-4"><PriceSetting /></div>}
        />
        <Route
          path="products/combo"
          element={
            <div className="p-4">
              <ComboManage />
            </div>
          }
        />
        <Route
          path="products/create_combo"
          element={
            <div className="p-4">
              <CreateCombo />
            </div>
          }
        />
        <Route
          path="products/combo_detail"
          element={
            <div className="p-4">
              <ComboDetail />
            </div>
          }
        />
        <Route
          path="products/suppliers"
          element={
            <div className="p-4">
              <Suppliers />
            </div>
          }
        />

        <Route
          path="crm"
          element={<div className="p-4">CRM &amp; Promotion</div>}
        />
        <Route path="crm/customer" element={<CRMcustomer />} />
        <Route path="crm/event" element={<CRMevent />} />
        <Route path="crm/loyalty" element={<CRMloyalty />} />
        <Route path="crm/ads" element={<AdsManagement />} />
        <Route path="crm/report" element={<CRMreport />} />
        <Route
          path="crm/promotions"
          element={<div className="p-4">Chương trình KM</div>}
        />
        <Route
          path="crm/vouchers"
          element={<div className="p-4">Voucher/Coupon</div>}
        />

        <Route path="hr" element={<Navigate to="/hr/schedule" replace />} />
        <Route
          path="hr/workforce"
          element={
            <ProtectedRoute
              allowedRoles={[...ADMIN_ROLES, ...MANAGER_ROLES]}
            >
              <WorkforceManagement defaultTab="employees" />
            </ProtectedRoute>
          }
        />
        <Route
          path="hr/employees"
          element={
            <ProtectedRoute
              allowedRoles={[...ADMIN_ROLES, ...MANAGER_ROLES]}
            >
              <Navigate to="/hr/workforce" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="hr/users"
          element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><UserManagement /></ProtectedRoute>}
        />
        <Route
          path="hr/shifts"
          element={
            <ProtectedRoute
              allowedRoles={[...ADMIN_ROLES, ...MANAGER_ROLES]}
            >
              <ShiftManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="hr/schedule"
          element={
            <ProtectedRoute allowedRoles={ALL_APP_ROLES}>
              <ShiftCalendarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="hr/my-attendance"
          element={
            <ProtectedRoute allowedRoles={ALL_APP_ROLES}>
              <AttendanceManagement selfOnly={true} />
            </ProtectedRoute>
          }
        />
        <Route
          path="hr/attendance"
          element={
            <ProtectedRoute allowedRoles={ALL_APP_ROLES}>
              <MyPayrollSummary defaultTab="attendance" />
            </ProtectedRoute>
          }
        />
        <Route
          path="hr/shift-tickets"
          element={
            <ProtectedRoute allowedRoles={ALL_APP_ROLES}>
              <ShiftTicketCenter />
            </ProtectedRoute>
          }
        />
        <Route
          path="hr/payroll"
          element={
            <ProtectedRoute
              allowedRoles={[...ADMIN_ROLES, ...MANAGER_ROLES]}
            >
              <WorkforceManagement defaultTab="payroll" />
            </ProtectedRoute>
          }
        />
        <Route
          path="hr/my-payroll"
          element={
            <ProtectedRoute allowedRoles={ALL_APP_ROLES}>
              <MyPayrollSummary />
            </ProtectedRoute>
          }
        />

        <Route
          path="account/profile"
          element={<ProtectedRoute allowedRoles={MANAGER_AND_STAFF_ROLES}><PersonalInfoPage /></ProtectedRoute>}
        />
        <Route
          path="account/settings"
          element={<ProtectedRoute allowedRoles={MANAGER_AND_STAFF_ROLES}><AccountSettingsPage /></ProtectedRoute>}
        />

        <Route
          path="admin/report-center"
          element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><ReportCenterPage /></ProtectedRoute>}
        />
        <Route
          path="admin/ticket-center"
          element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><ReportCenterPage /></ProtectedRoute>}
        />
        <Route
          path="admin/audit-logs"
          element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AuditLogPage /></ProtectedRoute>}
        />
        <Route
          path="admin/ai-settings"
          element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AiSettingsPage /></ProtectedRoute>}
        />

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
          element={<ProtectedRoute allowedRoles={MANAGER_ROLES}><AiChatPage /></ProtectedRoute>}
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

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
