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
import TicketProcessingPage from "./pages/HR/TicketProcessingPage";
import AdminShiftMonitorPage from "./pages/HR/AdminShiftMonitorPage";
import EmployeeDetailPage from "./pages/HR/EmployeeDetailPage";
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
import {
  ADMIN_ROLES,
  MANAGER_ROLES,
  CASHIER_ROLES,
  INVENTORY_ROLES,
  STAFF_ROLES,
  POS_ROLES,
  INVENTORY_OVERVIEW_ROLES,
  INVENTORY_FULL_ROLES,
  HR_SCHEDULE_ATTENDANCE_ROLES,
  CRM_ROLES,
  hasAnyRole,
} from "./utils/rolePermissions";

const DASHBOARD_ROLES = [...ADMIN_ROLES, ...MANAGER_ROLES];
const PRODUCT_VIEW_ROLES = [...MANAGER_ROLES, ...CASHIER_ROLES, ...INVENTORY_ROLES];
const PRODUCT_MANAGE_ROLES = [...MANAGER_ROLES];
const CRM_CASHIER_ROLES = [...CRM_ROLES, ...CASHIER_ROLES];
const HR_MANAGE_ROLES = [...MANAGER_ROLES];
const HR_MONITOR_ROLES = [...ADMIN_ROLES, ...MANAGER_ROLES];
const ACCOUNT_ROLES = [...ADMIN_ROLES, ...MANAGER_ROLES, ...CASHIER_ROLES, ...INVENTORY_ROLES, ...STAFF_ROLES];
const REPORT_ROLES = [...MANAGER_ROLES];
const POS_REPORT_VIEW_ROLES = [...MANAGER_ROLES, ...CASHIER_ROLES];
const POS_COMPLAINT_VIEW_ROLES = [...MANAGER_ROLES, ...CASHIER_ROLES];

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

  if (hasAnyRole(user, ADMIN_ROLES)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (hasAnyRole(user, MANAGER_ROLES)) {
    return <Navigate to="/hr/workforce" replace />;
  }

  if (hasAnyRole(user, CASHIER_ROLES)) {
    return <Navigate to="/pos" replace />;
  }

  if (hasAnyRole(user, INVENTORY_ROLES)) {
    return <Navigate to="/inventory" replace />;
  }

  if (hasAnyRole(user, STAFF_ROLES)) {
    return <Navigate to="/hr/schedule" replace />;
  }

  return <Navigate to="/login" replace />;
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
            <ProtectedRoute allowedRoles={DASHBOARD_ROLES}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="pos" element={<ProtectedRoute allowedRoles={POS_ROLES}><POS /></ProtectedRoute>} />
        <Route path="pos/history" element={<ProtectedRoute allowedRoles={POS_ROLES}><TransactionHistory /></ProtectedRoute>} />
        <Route path="pos/suspended" element={<ProtectedRoute allowedRoles={POS_REPORT_VIEW_ROLES}><ReportforCashier /></ProtectedRoute>} />
        <Route path="pos/complain" element={<ProtectedRoute allowedRoles={POS_COMPLAINT_VIEW_ROLES}><PosComplain /></ProtectedRoute>} />
        <Route path="pos/complaints" element={<ProtectedRoute allowedRoles={POS_COMPLAINT_VIEW_ROLES}><PosComplain /></ProtectedRoute>} />

        <Route path="inventory" element={<ProtectedRoute allowedRoles={INVENTORY_OVERVIEW_ROLES}><InventoryDashboard /></ProtectedRoute>} />
        <Route path="inventory/alerts" element={<ProtectedRoute allowedRoles={INVENTORY_FULL_ROLES}><InventoryCountList /></ProtectedRoute>} />
        <Route path="inventory-counts" element={<ProtectedRoute allowedRoles={INVENTORY_FULL_ROLES}><InventoryCountList /></ProtectedRoute>} />
        <Route path="inventory-counts/create" element={<ProtectedRoute allowedRoles={INVENTORY_FULL_ROLES}><InventoryCountDetail /></ProtectedRoute>} />
        <Route path="inventory-counts/:id" element={<ProtectedRoute allowedRoles={INVENTORY_FULL_ROLES}><InventoryCountDetail /></ProtectedRoute>} />
        <Route path="inventory/locations" element={<ProtectedRoute allowedRoles={INVENTORY_OVERVIEW_ROLES}><LocationManagement /></ProtectedRoute>} />
        <Route path="inventory/disposal" element={<ProtectedRoute allowedRoles={INVENTORY_FULL_ROLES}><DisposalList /></ProtectedRoute>} />
        <Route path="inventory/disposal/create" element={<ProtectedRoute allowedRoles={INVENTORY_FULL_ROLES}><DisposalDetail /></ProtectedRoute>} />
        <Route path="inventory/disposal/:id" element={<ProtectedRoute allowedRoles={INVENTORY_FULL_ROLES}><DisposalDetail /></ProtectedRoute>} />
        <Route path="inventory/purchase-orders" element={<ProtectedRoute allowedRoles={INVENTORY_FULL_ROLES}><PurchaseOrderList /></ProtectedRoute>} />
        <Route path="inventory/purchase-orders/create" element={<ProtectedRoute allowedRoles={INVENTORY_FULL_ROLES}><CreatePurchaseOrder /></ProtectedRoute>} />
        <Route path="inventory/purchase-orders/:id" element={<ProtectedRoute allowedRoles={INVENTORY_FULL_ROLES}><CreatePurchaseOrder /></ProtectedRoute>} />

        <Route path="products" element={<ProtectedRoute allowedRoles={PRODUCT_VIEW_ROLES}><ProductList /></ProtectedRoute>} />
        <Route path="products/addproduct" element={<ProtectedRoute allowedRoles={PRODUCT_MANAGE_ROLES}><AddNewProduct /></ProtectedRoute>} />
        <Route path="products/detail/:id" element={<ProtectedRoute allowedRoles={PRODUCT_VIEW_ROLES}><ProductDetail /></ProtectedRoute>} />
        <Route path="products/addproduct_variant" element={<ProtectedRoute allowedRoles={PRODUCT_MANAGE_ROLES}><AddNewProductVariant /></ProtectedRoute>} />
        <Route path="products/categories" element={<ProtectedRoute allowedRoles={PRODUCT_MANAGE_ROLES}><div className="p-4"><CategoryAndBrand /></div></ProtectedRoute>} />
        <Route path="products/price" element={<ProtectedRoute allowedRoles={PRODUCT_MANAGE_ROLES}><div className="p-4"><PriceSetting /></div></ProtectedRoute>} />
        <Route path="products/combo" element={<ProtectedRoute allowedRoles={PRODUCT_VIEW_ROLES}><div className="p-4"><ComboManage /></div></ProtectedRoute>} />
        <Route path="products/create_combo" element={<ProtectedRoute allowedRoles={PRODUCT_MANAGE_ROLES}><div className="p-4"><CreateCombo /></div></ProtectedRoute>} />
        <Route path="products/combo_detail" element={<ProtectedRoute allowedRoles={PRODUCT_VIEW_ROLES}><div className="p-4"><ComboDetail /></div></ProtectedRoute>} />
        <Route path="products/suppliers" element={<ProtectedRoute allowedRoles={PRODUCT_VIEW_ROLES}><div className="p-4"><Suppliers /></div></ProtectedRoute>} />

        <Route path="crm" element={<ProtectedRoute allowedRoles={CRM_ROLES}><div className="p-4">CRM &amp; Promotion</div></ProtectedRoute>} />
        <Route path="crm/customer" element={<ProtectedRoute allowedRoles={CRM_ROLES}><CRMcustomer /></ProtectedRoute>} />
        <Route path="crm/event" element={<ProtectedRoute allowedRoles={CRM_ROLES}><CRMevent /></ProtectedRoute>} />
        <Route path="crm/loyalty" element={<ProtectedRoute allowedRoles={CRM_CASHIER_ROLES}><CRMloyalty /></ProtectedRoute>} />
        <Route path="crm/ads" element={<ProtectedRoute allowedRoles={CRM_ROLES}><AdsManagement /></ProtectedRoute>} />
        <Route path="crm/report" element={<ProtectedRoute allowedRoles={CRM_ROLES}><CRMreport /></ProtectedRoute>} />
        <Route path="crm/promotions" element={<ProtectedRoute allowedRoles={CRM_ROLES}><div className="p-4">Chuong trinh KM</div></ProtectedRoute>} />
        <Route path="crm/vouchers" element={<ProtectedRoute allowedRoles={CRM_ROLES}><div className="p-4">Voucher/Coupon</div></ProtectedRoute>} />

        <Route path="hr" element={<Navigate to="/hr/schedule" replace />} />
        <Route path="hr/workforce" element={<ProtectedRoute allowedRoles={HR_MANAGE_ROLES}><WorkforceManagement defaultTab="employees" /></ProtectedRoute>} />
        <Route path="hr/workforce/employee/:id" element={<ProtectedRoute allowedRoles={HR_SCHEDULE_ATTENDANCE_ROLES}><EmployeeDetailPage /></ProtectedRoute>} />
        <Route path="hr/employees" element={<ProtectedRoute allowedRoles={HR_MANAGE_ROLES}><Navigate to="/hr/workforce" replace /></ProtectedRoute>} />
        <Route path="hr/users" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><UserManagement /></ProtectedRoute>} />
        <Route path="hr/shifts" element={<ProtectedRoute allowedRoles={HR_MANAGE_ROLES}><ShiftManagement /></ProtectedRoute>} />
        <Route path="hr/schedule" element={<ProtectedRoute allowedRoles={HR_SCHEDULE_ATTENDANCE_ROLES}><ShiftCalendarPage /></ProtectedRoute>} />
        <Route path="hr/my-schedule" element={<Navigate to="/hr/schedule" replace />} />
        <Route path="hr/my-shift-requests" element={<Navigate to="/hr/ticket-processing" replace />} />
        <Route path="hr/shift-exchange" element={<Navigate to="/hr/ticket-processing" replace />} />
        <Route path="hr/admin-shift-monitor" element={<ProtectedRoute allowedRoles={HR_MONITOR_ROLES}><AdminShiftMonitorPage /></ProtectedRoute>} />
        <Route path="hr/my-attendance" element={<ProtectedRoute allowedRoles={HR_SCHEDULE_ATTENDANCE_ROLES}><AttendanceManagement selfOnly={true} /></ProtectedRoute>} />
        <Route path="hr/attendance" element={<ProtectedRoute allowedRoles={HR_SCHEDULE_ATTENDANCE_ROLES}><MyPayrollSummary defaultTab="attendance" /></ProtectedRoute>} />
        <Route path="hr/shift-tickets" element={<Navigate to="/hr/ticket-processing" replace />} />
        <Route path="hr/shift-swap-tickets" element={<Navigate to="/hr/shift-exchange" replace />} />
        <Route path="hr/shift-leave-tickets" element={<Navigate to="/hr/ticket-processing" replace />} />
        <Route path="hr/ticket-processing" element={<ProtectedRoute allowedRoles={HR_SCHEDULE_ATTENDANCE_ROLES}><TicketProcessingPage /></ProtectedRoute>} />
        <Route path="hr/payroll" element={<ProtectedRoute allowedRoles={HR_MANAGE_ROLES}><WorkforceManagement defaultTab="payroll" /></ProtectedRoute>} />
        <Route path="hr/my-payroll" element={<ProtectedRoute allowedRoles={HR_SCHEDULE_ATTENDANCE_ROLES}><MyPayrollSummary /></ProtectedRoute>} />

        <Route path="account/profile" element={<ProtectedRoute allowedRoles={ACCOUNT_ROLES}><PersonalInfoPage /></ProtectedRoute>} />
        <Route path="account/settings" element={<ProtectedRoute allowedRoles={ACCOUNT_ROLES}><AccountSettingsPage /></ProtectedRoute>} />

        <Route path="admin/report-center" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><ReportCenterPage /></ProtectedRoute>} />
        <Route path="admin/ticket-center" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><ReportCenterPage /></ProtectedRoute>} />
        <Route path="admin/audit-logs" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AuditLogPage /></ProtectedRoute>} />
        <Route path="admin/ai-settings" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AiSettingsPage /></ProtectedRoute>} />

        <Route path="reports" element={<ProtectedRoute allowedRoles={REPORT_ROLES}><div className="p-4">Reports & AI (Bao cao)</div></ProtectedRoute>} />
        <Route path="reports/create" element={<ProtectedRoute allowedRoles={REPORT_ROLES}><div className="p-4">Tao bao cao</div></ProtectedRoute>} />
        <Route path="reports/manage" element={<ProtectedRoute allowedRoles={REPORT_ROLES}><div className="p-4">Quan ly bao cao</div></ProtectedRoute>} />
        <Route path="reports/ai" element={<ProtectedRoute allowedRoles={REPORT_ROLES}><div className="p-4">AI du bao</div></ProtectedRoute>} />
        <Route path="reports/ai-chat" element={<ProtectedRoute allowedRoles={REPORT_ROLES}><AiChatPage /></ProtectedRoute>} />
        <Route path="reports/audit-logs" element={<ProtectedRoute allowedRoles={REPORT_ROLES}><div className="p-4">Nhat ky kiem toan</div></ProtectedRoute>} />
        <Route path="reports/sales" element={<ProtectedRoute allowedRoles={REPORT_ROLES}><div className="p-4">Bao cao doanh thu</div></ProtectedRoute>} />
        <Route path="reports/inventory" element={<ProtectedRoute allowedRoles={REPORT_ROLES}><div className="p-4">Bao cao kho</div></ProtectedRoute>} />
        <Route path="reports/logs" element={<ProtectedRoute allowedRoles={REPORT_ROLES}><div className="p-4">Nhat ky hoat dong</div></ProtectedRoute>} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
