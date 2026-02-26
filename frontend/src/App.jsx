import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/common/ProtectedRoute'
import PublicRoute from './components/common/PublicRoute'
import Dashboard from './pages/Dashboard/Dashboard'
import POS from './pages/Pos/pos'
import CRMHomepage from './pages/CRM/homepage'
import Login from './pages/Auth/Login'
import UserManagement from './pages/HR/UserManagement'
import EmployeeList from './pages/HR/EmployeeList'
import ShiftManagement from './pages/HR/ShiftManagement'
import AttendanceManagement from './pages/HR/AttendanceManagement'
import PayrollManagement from './pages/HR/PayrollManagement'

function App() {
    const ADMIN_MANAGER = ['ADMIN', 'MANAGER']
    const ADMIN_ONLY = ['ADMIN']
    const HR_ROLES = ['ADMIN', 'MANAGER', 'CASHIER', 'INVENTORY_STAFF', 'SALES_STAFF']

    return (
        <Routes>
            {/* Public Routes */}
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />
            <Route path="/register" element={<Navigate to="/login" replace />} />

            {/* App Routes */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                {/* Redirect root to Dashboard */}
                <Route index element={<Navigate to="/dashboard" replace />} />

                <Route
                    path="dashboard"
                    element={
                        <ProtectedRoute allowedRoles={ADMIN_MANAGER}>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Module 1: POS (Bán hàng) */}
                <Route path="pos" element={<POS />} />
                <Route path="pos/history" element={<div className="p-4">Lịch sử đơn hàng</div>} />
                <Route path="pos/suspended" element={<div className="p-4">Đơn hàng treo</div>} />

                {/* Module 2: Inventory (Kho) */}
                <Route path="inventory" element={<div className="p-4">Inventory Management (Kho)</div>} />
                <Route path="inventory/import" element={<div className="p-4">Nhập kho</div>} />
                <Route path="inventory/export" element={<div className="p-4">Xuất kho</div>} />
                <Route path="inventory/audit" element={<div className="p-4">Kiểm kê</div>} />
                <Route path="inventory/alerts" element={<div className="p-4">Cảnh báo hết hàng</div>} />

                {/* Module 3: Products (Sản phẩm) */}
                <Route path="products" element={<div className="p-4">Product Management (Sản phẩm)</div>} />
                <Route path="products/categories" element={<div className="p-4">Danh mục & Brand</div>} />
                <Route path="products/price-books" element={<div className="p-4">Thiết lập giá</div>} />
                <Route path="products/print-barcodes" element={<div className="p-4">In tem mã vạch</div>} />

                {/* Module 4: CRM (Khách hàng) */}
                <Route path="crm" element={<div className="p-4">CRM & Promotion</div>} />
                <Route path="crm/homepage" element={<CRMHomepage />} />
                <Route path="crm/promotions" element={<div className="p-4">Chương trình KM</div>} />
                <Route path="crm/vouchers" element={<div className="p-4">Voucher/Coupon</div>} />
                <Route path="crm/loyalty" element={<div className="p-4">Tích điểm</div>} />
                <Route path="crm/complain" element={<div className="p-4">Khiếu nại</div>} />

                {/* Dashboard Route - only ADMIN/MANAGER
                <Route path="dashboard" element={
                    <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                        <Dashboard />
                    </ProtectedRoute>
                } /> */}
                {/* Module 5: HR (Nhân sự) */}
                <Route
                    path="hr"
                    element={
                        <ProtectedRoute allowedRoles={HR_ROLES}>
                            <EmployeeList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="hr/users"
                    element={
                        <ProtectedRoute allowedRoles={ADMIN_ONLY}>
                            <UserManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="hr/shifts"
                    element={
                        <ProtectedRoute allowedRoles={HR_ROLES}>
                            <ShiftManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="hr/attendance"
                    element={
                        <ProtectedRoute allowedRoles={HR_ROLES}>
                            <AttendanceManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="hr/payroll"
                    element={
                        <ProtectedRoute allowedRoles={HR_ROLES}>
                            <PayrollManagement />
                        </ProtectedRoute>
                    }
                />

                {/* Module 6: Suppliers (Nhà cung cấp) */}
                <Route path="suppliers" element={<div className="p-4">Danh sách nhà cung cấp</div>} />
                <Route path="suppliers/contracts" element={<div className="p-4">Hợp đồng & SLA</div>} />
                <Route path="suppliers/performance" element={<div className="p-4">Đánh giá & Hiệu suất</div>} />

                {/* Module 7: Ticket Center */}
                <Route path="tickets" element={<div className="p-4">Danh sách ticket</div>} />
                <Route path="tickets/new" element={<div className="p-4">Tạo ticket</div>} />
                <Route path="tickets/queue" element={<div className="p-4">Hàng đợi & SLA</div>} />

                {/* Module 8: AI Chatbot */}
                <Route path="ai-chatbot" element={<div className="p-4">Trợ lý AI</div>} />
                <Route path="ai-chatbot/flows" element={<div className="p-4">Kịch bản hội thoại</div>} />
                <Route path="ai-chatbot/logs" element={<div className="p-4">Nhật ký hội thoại</div>} />

                {/* Module 6: Reports (Báo cáo) */}
                <Route path="reports" element={<div className="p-4">Reports & AI (Báo cáo)</div>} />
                <Route path="reports/sales" element={<div className="p-4">Báo cáo doanh thu</div>} />
                <Route path="reports/inventory" element={<div className="p-4">Báo cáo kho</div>} />
                <Route path="reports/logs" element={<div className="p-4">Nhật ký hoạt động</div>} />

                {/* Sidebar reports links */}
                <Route path="reports/create" element={<div className="p-4">Tạo báo cáo</div>} />
                <Route path="reports/manage" element={<div className="p-4">Quản lý báo cáo</div>} />
                <Route path="reports/ai" element={<div className="p-4">AI dự báo</div>} />
                <Route path="reports/audit-logs" element={<div className="p-4">Audit Logs</div>} />

                {/* In-app fallback */}
                <Route path="*" element={<Navigate to="/pos" replace />} />
            </Route>

            {/* Global fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

export default App
