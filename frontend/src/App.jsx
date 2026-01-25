import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Dashboard from './pages/Dashboard/Dashboard'
import Login from './pages/Auth/Login'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/" element={<MainLayout />}>
                    {/* Redirect root to POS or Dashboard */}
                    <Route
                        index
                        element={
                            <ProtectedRoute>
                                <Navigate to="/dashboard" replace />
                            </ProtectedRoute>
                        }
                    />

                    {/* Dashboard Route */}
                    <Route
                        path="dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Module 1: POS (Bán hàng) */}
                    <Route
                        path="pos"
                        element={
                            <ProtectedRoute>
                                <div className="p-4">POS Interface (Bán hàng)</div>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="pos/history" element={<ProtectedRoute><div className="p-4">Lịch sử đơn hàng</div></ProtectedRoute>} />
                    <Route path="pos/suspended" element={<ProtectedRoute><div className="p-4">Đơn hàng treo</div></ProtectedRoute>} />

                    {/* Module 2: Inventory (Kho) */}
                    <Route
                        path="inventory"
                        element={
                            <ProtectedRoute>
                                <div className="p-4">Inventory Management (Kho)</div>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="inventory/import" element={<ProtectedRoute><div className="p-4">Nhập kho</div></ProtectedRoute>} />
                    <Route path="inventory/export" element={<ProtectedRoute><div className="p-4">Xuất kho</div></ProtectedRoute>} />
                    <Route path="inventory/audit" element={<ProtectedRoute><div className="p-4">Kiểm kê</div></ProtectedRoute>} />
                    <Route path="inventory/alerts" element={<ProtectedRoute><div className="p-4">Cảnh báo hết hàng</div></ProtectedRoute>} />

                    {/* Module 3: Products (Sản phẩm) */}
                    <Route
                        path="products"
                        element={
                            <ProtectedRoute>
                                <div className="p-4">Product Management (Sản phẩm)</div>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="products/categories" element={<ProtectedRoute><div className="p-4">Danh mục & Brand</div></ProtectedRoute>} />
                    <Route path="products/price-books" element={<ProtectedRoute><div className="p-4">Thiết lập giá</div></ProtectedRoute>} />
                    <Route path="products/print-barcodes" element={<ProtectedRoute><div className="p-4">In tem mã vạch</div></ProtectedRoute>} />

                    {/* Module 4: CRM (Khách hàng) */}
                    <Route
                        path="crm"
                        element={
                            <ProtectedRoute>
                                <div className="p-4">CRM & Promotion</div>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="crm/promotions" element={<ProtectedRoute><div className="p-4">Chương trình KM</div></ProtectedRoute>} />
                    <Route path="crm/vouchers" element={<ProtectedRoute><div className="p-4">Voucher/Coupon</div></ProtectedRoute>} />
                    <Route path="crm/loyalty" element={<ProtectedRoute><div className="p-4">Tích điểm</div></ProtectedRoute>} />
                    <Route path="crm/complaints" element={<ProtectedRoute><div className="p-4">Khiếu nại</div></ProtectedRoute>} />

                    {/* Module 5: HR (Nhân sự) */}
                    <Route
                        path="hr"
                        element={
                            <ProtectedRoute>
                                <div className="p-4">HR & Shift (Nhân sự)</div>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="hr/shifts" element={<ProtectedRoute><div className="p-4">Phân ca làm việc</div></ProtectedRoute>} />
                    <Route path="hr/attendance" element={<ProtectedRoute><div className="p-4">Chấm công</div></ProtectedRoute>} />
                    <Route path="hr/payroll" element={<ProtectedRoute><div className="p-4">Tính lương</div></ProtectedRoute>} />

                    {/* Module 6: Reports (Báo cáo) */}
                    <Route
                        path="reports"
                        element={
                            <ProtectedRoute>
                                <div className="p-4">Reports & AI (Báo cáo)</div>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="reports/sales" element={<ProtectedRoute><div className="p-4">Báo cáo doanh thu</div></ProtectedRoute>} />
                    <Route path="reports/inventory" element={<ProtectedRoute><div className="p-4">Báo cáo kho</div></ProtectedRoute>} />
                    <Route path="reports/logs" element={<ProtectedRoute><div className="p-4">Nhật ký hoạt động</div></ProtectedRoute>} />
                </Route>
            </Routes>
        </AuthProvider>
    )
}

export default App
