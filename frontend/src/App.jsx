import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Dashboard from './pages/Dashboard/Dashboard'
import POS from './pages/Pos/pos'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ProtectedRoute from './components/common/ProtectedRoute'
import PublicRoute from './components/common/PublicRoute'
import UserManagement from './pages/HR/UserManagement'
import ProductListScreen from './pages/Products/ProductManager/ProductList'
import AddNewProduct from './pages/Products/ProductManager/AddNewProduct'
import ProductDetail from './pages/Products/ProductManager/ProductDetail'

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                {/* Redirect root to Dashboard */}
                <Route index element={<Navigate to="/dashboard" replace />} />

                {/* Dashboard Route - only ADMIN/MANAGER */}
                <Route path="dashboard" element={
                    <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                        <Dashboard />
                    </ProtectedRoute>
                } />

                {/* Module 1: POS (Bán hàng) */}
                <Route path="pos" element={<POS />} />
                <Route path="pos/history" element={<div className="p-4">Lịch sử đơn hàng</div>} />
                <Route path="pos/suspended" element={<div className="p-4">Đơn hàng treo</div>} />

                {/* Module 2: Inventory (Kho) */}
                <Route path="inventory" element={<div className="p-4">Nhập kho</div>} />
                <Route path="inventory/import" element={<div className="p-4">Nhập kho</div>} />
                <Route path="inventory/export" element={<div className="p-4">Xuất kho</div>} />
                <Route path="inventory/audit" element={<div className="p-4">Kiểm kê</div>} />
                <Route path="inventory/alerts" element={<div className="p-4">Cảnh báo hết hàng</div>} />

                {/* Module 3: Products (Sản phẩm) */}
                <Route path="products" element={<ProductListScreen />} />
                <Route path="products/addproduct" element={<AddNewProduct />} />
                <Route path="products/detail" element={<ProductDetail />} />
                <Route path="products/categories" element={<div className="p-4">Danh mục & Brand</div>} />
                <Route path="products/price-books" element={<div className="p-4">Thiết lập giá</div>} />
                <Route path="products/print-barcodes" element={<div className="p-4">In tem mã vạch</div>} />

                {/* Module 4: CRM (Khách hàng) */}
                <Route path="crm" element={<div className="p-4">CRM & Promotion</div>} />
                <Route path="crm/promotions" element={<div className="p-4">Chương trình KM</div>} />
                <Route path="crm/vouchers" element={<div className="p-4">Voucher/Coupon</div>} />
                <Route path="crm/loyalty" element={<div className="p-4">Tích điểm</div>} />
                <Route path="crm/complaints" element={<div className="p-4">Khiếu nại</div>} />

                {/* Module 5: HR (Nhân sự) */}
                <Route path="hr" element={<div className="p-4">HR & Shift (Nhân sự)</div>} />
                <Route path="hr/users" element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                        <UserManagement />
                    </ProtectedRoute>
                } />
                <Route path="hr/shifts" element={<div className="p-4">Phân ca làm việc</div>} />
                <Route path="hr/attendance" element={<div className="p-4">Chấm công</div>} />
                <Route path="hr/payroll" element={<div className="p-4">Tính lương</div>} />

                {/* Module 6: Reports (Báo cáo) */}
                <Route path="reports" element={<div className="p-4">Reports & AI (Báo cáo)</div>} />
                <Route path="reports/sales" element={<div className="p-4">Báo cáo doanh thu</div>} />
                <Route path="reports/inventory" element={<div className="p-4">Báo cáo kho</div>} />
                <Route path="reports/logs" element={<div className="p-4">Nhật ký hoạt động</div>} />
            </Route>
        </Routes>
    )
}

export default App
