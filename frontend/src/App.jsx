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
import AddNewProductVariant from './pages/Products/ProductManager/AddNewProductVariant'
import Category_Brand from './pages/Products/ProductManager/CategoryAndBrand'
import ComboManage from './pages/Products/ProductManager/ComboManage'
import CreateCombo from './pages/Products/ProductManager/CreateCombo'
import ComboDetail from './pages/Products/ProductManager/ComboDetail'
import SuppliersScreen from './pages/Products/ProductManager/Suppliers'

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            {/* Protected Routes */}
            <Route path="/" element={<PublicRoute><MainLayout /></PublicRoute>}>
                {/* Redirect root to Dashboard */}
                <Route index element={<Navigate to="/dashboard" replace />} />

                {/* Dashboard Route - only ADMIN/MANAGER */}
                <Route path="dashboard" element={
                    <PublicRoute allowedRoles={["ADMIN", "MANAGER"]}>
                        <Dashboard />
                    </PublicRoute>
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
                <Route path="products" element={<PublicRoute> <ProductListScreen /> </PublicRoute>} />
                <Route path="products/addproduct" element={<PublicRoute> <AddNewProduct /> </PublicRoute>} />
                <Route path="products/detail" element={<PublicRoute> <ProductDetail /> </PublicRoute>} />
                <Route path="products/addproduct_variant" element={<PublicRoute> <AddNewProductVariant /> </PublicRoute> } />
                <Route path="products/categories" element={<PublicRoute> <Category_Brand /> </PublicRoute>} />
                <Route path="products/suppliers" element={<PublicRoute> <SuppliersScreen /> </PublicRoute>} />
                <Route path="products/combos" element={<PublicRoute> <ComboManage /> </PublicRoute>} />
                <Route path="products/create_combo" element={<PublicRoute> <CreateCombo /> </PublicRoute>} />
                <Route path="products/combo_detail" element={<PublicRoute> <ComboDetail /> </PublicRoute>} />

                {/* Module 4: CRM (Khách hàng) */}
                <Route path="crm" element={<div className="p-4">CRM & Promotion</div>} />
                <Route path="crm/promotions" element={<div className="p-4">Chương trình KM</div>} />
                <Route path="crm/vouchers" element={<div className="p-4">Voucher/Coupon</div>} />
                <Route path="crm/loyalty" element={<div className="p-4">Tích điểm</div>} />
                <Route path="crm/complaints" element={<div className="p-4">Khiếu nại</div>} />

                {/* Module 5: HR (Nhân sự) */}
                <Route path="hr" element={<div className="p-4">HR & Shift (Nhân sự)</div>} />
                <Route path="hr/users" element={
                    <PublicRoute allowedRoles={['ROLE_ADMIN']}>
                        <UserManagement />
                    </PublicRoute>
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
