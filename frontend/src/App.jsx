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
  POS_ROLES,
  INVENTORY_OVERVIEW_ROLES,
  INVENTORY_FULL_ROLES,
  PRODUCT_VIEW_ROLES,
  HR_SCHEDULE_ATTENDANCE_ROLES,
  CRM_ROLES,
} from "./utils/rolePermissions";

const ALL_APP_ROLES = [...ADMIN_ROLES, ...MANAGER_ROLES, "SALES_STAFF", "ROLE_SALES_STAFF", "CASHIER", "ROLE_CASHIER", "INVENTORY_STAFF", "ROLE_INVENTORY_STAFF"];
const PRODUCT_MANAGE_ROLES = [...ADMIN_ROLES, ...MANAGER_ROLES, ...INVENTORY_ROLES];
const HR_MANAGE_ROLES = [...ADMIN_ROLES, ...MANAGER_ROLES];
const INVENTORY_LOCATION_ROLES = [...INVENTORY_OVERVIEW_ROLES];
const CRM_CASHIER_VIEW_ROLES = [...CRM_ROLES, ...CASHIER_ROLES];
const CRM_FULL_ROLES = [...CRM_ROLES];

function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

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
            <ProtectedRoute
              allowedRoles={[...ADMIN_ROLES, ...MANAGER_ROLES]}
            >
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="pos"
          element={
            <ProtectedRoute allowedRoles={POS_ROLES}>
              <POS />
            </ProtectedRoute>
          }
        />
        <Route
          path="pos/history"
          element={
            <ProtectedRoute allowedRoles={POS_ROLES}>
              <TransactionHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="pos/suspended"
          element={
            <ProtectedRoute allowedRoles={POS_ROLES}>
              <ReportforCashier />
            </ProtectedRoute>
          }
        />
        <Route
          path="pos/complain"
          element={
            <ProtectedRoute allowedRoles={POS_ROLES}>
              <PosComplain />
            </ProtectedRoute>
          }
        />
        <Route
          path="pos/complaints"
          element={
            <ProtectedRoute allowedRoles={POS_ROLES}>
              <PosComplain />
            </ProtectedRoute>
          }
        />

        <Route
          path="inventory"
          element={
            <ProtectedRoute allowedRoles={INVENTORY_OVERVIEW_ROLES}>
              <InventoryDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="inventory/alerts"
          element={
            <ProtectedRoute allowedRoles={INVENTORY_FULL_ROLES}>
              <InventoryCountList />
            </ProtectedRoute>
          }
        />

        <Route
          path="inventory-counts"
          element={
            <ProtectedRoute allowedRoles={INVENTORY_FULL_ROLES}>
              <InventoryCountList />
            </ProtectedRoute>
          }
        />
        <Route
          path="inventory-counts/create"
          element={
            <ProtectedRoute allowedRoles={INVENTORY_FULL_ROLES}>
              <InventoryCountDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="inventory-counts/:id"
          element={
            <ProtectedRoute allowedRoles={INVENTORY_FULL_ROLES}>
              <InventoryCountDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="inventory/locations"
          element={
            <ProtectedRoute allowedRoles={INVENTORY_LOCATION_ROLES}>
              <LocationManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="inventory/disposal"
          element={
            <ProtectedRoute allowedRoles={INVENTORY_FULL_ROLES}>
              <DisposalList />
            </ProtectedRoute>
          }
        />
        <Route
          path="inventory/disposal/create"
          element={
            <ProtectedRoute allowedRoles={INVENTORY_FULL_ROLES}>
              <DisposalDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="inventory/disposal/:id"
          element={
            <ProtectedRoute allowedRoles={INVENTORY_FULL_ROLES}>
              <DisposalDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="inventory/purchase-orders"
          element={
            <ProtectedRoute allowedRoles={INVENTORY_FULL_ROLES}>
              <PurchaseOrderList />
            </ProtectedRoute>
          }
        />
        <Route
          path="inventory/purchase-orders/create"
          element={
            <ProtectedRoute allowedRoles={INVENTORY_FULL_ROLES}>
              <CreatePurchaseOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="inventory/purchase-orders/:id"
          element={
            <ProtectedRoute allowedRoles={INVENTORY_FULL_ROLES}>
              <CreatePurchaseOrder />
            </ProtectedRoute>
          }
        />

        {/* Product */}
        <Route
          path="products"
          element={
            <ProtectedRoute allowedRoles={PRODUCT_VIEW_ROLES}>
              <ProductList />
            </ProtectedRoute>
          }
        />
        <Route
          path="products/addproduct"
          element={
            <ProtectedRoute allowedRoles={PRODUCT_MANAGE_ROLES}>
              <AddNewProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="products/detail/:id"
          element={
            <ProtectedRoute allowedRoles={PRODUCT_VIEW_ROLES}>
              <ProductDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="products/addproduct_variant"
          element={
            <ProtectedRoute allowedRoles={PRODUCT_MANAGE_ROLES}>
              <AddNewProductVariant />
            </ProtectedRoute>
          }
        />
        <Route
          path="products/categories"
          element={
            <ProtectedRoute allowedRoles={PRODUCT_MANAGE_ROLES}>
              <div className="p-4">
                <CategoryAndBrand />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="products/price"
          element={
            <ProtectedRoute allowedRoles={PRODUCT_MANAGE_ROLES}>
              <div className="p-4"><PriceSetting /></div>
            </ProtectedRoute>
          }
        />
        <Route
          path="products/combo"
          element={
            <ProtectedRoute allowedRoles={PRODUCT_VIEW_ROLES}>
              <div className="p-4">
                <ComboManage />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="products/create_combo"
          element={
            <ProtectedRoute allowedRoles={PRODUCT_MANAGE_ROLES}>
              <div className="p-4">
                <CreateCombo />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="products/combo_detail"
          element={
            <ProtectedRoute allowedRoles={PRODUCT_VIEW_ROLES}>
              <div className="p-4">
                <ComboDetail />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="products/suppliers"
          element={
            <ProtectedRoute allowedRoles={PRODUCT_VIEW_ROLES}>
              <div className="p-4">
                <Suppliers />
              </div>
            </ProtectedRoute>
          }
        />


        <Route
          path="crm"
          element={
            <ProtectedRoute allowedRoles={CRM_CASHIER_VIEW_ROLES}>
              <div className="p-4">CRM &amp; Promotion</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="crm/customer"
          element={
            <ProtectedRoute allowedRoles={CRM_CASHIER_VIEW_ROLES}>
              <CRMcustomer />
            </ProtectedRoute>
          }
        />
        <Route
          path="crm/event"
          element={
            <ProtectedRoute allowedRoles={CRM_FULL_ROLES}>
              <CRMevent />
            </ProtectedRoute>
          }
        />
        <Route
          path="crm/loyalty"
          element={
            <ProtectedRoute allowedRoles={CRM_CASHIER_VIEW_ROLES}>
              <CRMloyalty />
            </ProtectedRoute>
          }
        />
        <Route
          path="crm/ads"
          element={
            <ProtectedRoute allowedRoles={CRM_FULL_ROLES}>
              <AdsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="crm/report"
          element={
            <ProtectedRoute allowedRoles={CRM_FULL_ROLES}>
              <CRMreport />
            </ProtectedRoute>
          }
        />
        <Route
          path="crm/promotions"
          element={
            <ProtectedRoute allowedRoles={CRM_FULL_ROLES}>
              <div className="p-4">Chương trình KM</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="crm/vouchers"
          element={
            <ProtectedRoute allowedRoles={CRM_FULL_ROLES}>
              <div className="p-4">Voucher/Coupon</div>
            </ProtectedRoute>
          }
        />

        <Route
          path="hr"
          element={<Navigate to="/hr/schedule" replace />}
        />
        <Route
          path="hr/workforce"
          element={
            <ProtectedRoute
              allowedRoles={HR_MANAGE_ROLES}
            >
              <WorkforceManagement defaultTab="employees" />
            </ProtectedRoute>
          }
        />
        <Route
          path="hr/employees"
          element={
            <ProtectedRoute
              allowedRoles={HR_MANAGE_ROLES}
            >
              <Navigate to="/hr/workforce" replace />
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
            <ProtectedRoute
              allowedRoles={HR_MANAGE_ROLES}
            >
              <ShiftManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="hr/schedule"
          element={
            <ProtectedRoute allowedRoles={HR_SCHEDULE_ATTENDANCE_ROLES}>
              <ShiftCalendarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="hr/my-attendance"
          element={
            <ProtectedRoute allowedRoles={HR_SCHEDULE_ATTENDANCE_ROLES}>
              <AttendanceManagement selfOnly={true} />
            </ProtectedRoute>
          }
        />
        <Route
          path="hr/attendance"
          element={
            <ProtectedRoute allowedRoles={HR_SCHEDULE_ATTENDANCE_ROLES}>
              <MyPayrollSummary defaultTab="attendance" />
            </ProtectedRoute>
          }
        />
        <Route
          path="hr/shift-tickets"
          element={
            <ProtectedRoute allowedRoles={HR_MANAGE_ROLES}>
              <ShiftTicketCenter />
            </ProtectedRoute>
          }
        />
        <Route
          path="hr/payroll"
          element={
            <ProtectedRoute
              allowedRoles={HR_MANAGE_ROLES}
            >
              <WorkforceManagement defaultTab="payroll" />
            </ProtectedRoute>
          }
        />
        <Route
          path="hr/my-payroll"
          element={
            <ProtectedRoute allowedRoles={HR_MANAGE_ROLES}>
              <MyPayrollSummary />
            </ProtectedRoute>
          }
        />

        <Route
          path="account/profile"
          element={
            <ProtectedRoute allowedRoles={ALL_APP_ROLES}>
              <PersonalInfoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="account/settings"
          element={
            <ProtectedRoute allowedRoles={ALL_APP_ROLES}>
              <AccountSettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/report-center"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <ReportCenterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/ticket-center"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <ReportCenterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/report-center"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <ReportCenterPage />
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

        <Route
          path="admin/ai-settings"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <AiSettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Module 6: Reports (Báo cáo) */}
        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={[...ADMIN_ROLES, ...MANAGER_ROLES]}>
              <div className="p-4">Reports & AI (Báo cáo)</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="reports/create"
          element={
            <ProtectedRoute allowedRoles={[...ADMIN_ROLES, ...MANAGER_ROLES]}>
              <div className="p-4">Tạo báo cáo</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="reports/manage"
          element={
            <ProtectedRoute allowedRoles={[...ADMIN_ROLES, ...MANAGER_ROLES]}>
              <div className="p-4">Quản lý báo cáo</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="reports/ai"
          element={
            <ProtectedRoute allowedRoles={[...ADMIN_ROLES, ...MANAGER_ROLES]}>
              <div className="p-4">AI dự báo</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={[...ADMIN_ROLES, ...MANAGER_ROLES]}>
              <div className="p-4">Reports & AI (Báo cáo)</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="reports/create"
          element={
            <ProtectedRoute allowedRoles={[...ADMIN_ROLES, ...MANAGER_ROLES]}>
              <div className="p-4">Tạo báo cáo</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="reports/manage"
          element={
            <ProtectedRoute allowedRoles={[...ADMIN_ROLES, ...MANAGER_ROLES]}>
              <div className="p-4">Quản lý báo cáo</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="reports/ai"
          element={
            <ProtectedRoute allowedRoles={[...ADMIN_ROLES, ...MANAGER_ROLES]}>
              <div className="p-4">AI dự báo</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="reports/ai-chat"
          element={
            <ProtectedRoute
              allowedRoles={[...ADMIN_ROLES, ...MANAGER_ROLES]}
            >
              <AiChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports/audit-logs"
          element={
            <ProtectedRoute allowedRoles={[...ADMIN_ROLES, ...MANAGER_ROLES]}>
              <div className="p-4">Nhật ký kiểm toán</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="reports/sales"
          element={
            <ProtectedRoute allowedRoles={[...ADMIN_ROLES, ...MANAGER_ROLES]}>
              <div className="p-4">Báo cáo doanh thu</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="reports/inventory"
          element={
            <ProtectedRoute allowedRoles={[...ADMIN_ROLES, ...MANAGER_ROLES]}>
              <div className="p-4">Báo cáo kho</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="reports/logs"
          element={
            <ProtectedRoute allowedRoles={[...ADMIN_ROLES, ...MANAGER_ROLES]}>
              <div className="p-4">Nhật ký hoạt động</div>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
