import React from 'react';
import { TrendingUp, Users, DollarSign, ShoppingBag, History, Bot, Clock3, Warehouse } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import api from '../../config/axiosConfig';
import * as XLSX from 'xlsx';

const Dashboard = () => {
    const [orders, setOrders] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchSaleOrders = async () => {
            try {
                const response = await api.get('/sale-orders');
                setOrders(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('Không thể tải dữ liệu sale-orders cho dashboard:', error);
                setOrders([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSaleOrders();
    }, []);

    const toNumber = (value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(value);
    };

    const monthlySales = React.useMemo(() => {
        const now = new Date();
        const buckets = [];

        for (let offset = 5; offset >= 0; offset -= 1) {
            const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
            buckets.push({
                key: `${date.getFullYear()}-${date.getMonth() + 1}`,
                month: `T${date.getMonth() + 1}`,
                revenue: 0,
            });
        }

        orders.forEach((order) => {
            if (!order?.orderDate) {
                return;
            }
            const date = new Date(order.orderDate);
            if (Number.isNaN(date.getTime())) {
                return;
            }

            const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
            const bucket = buckets.find((item) => item.key === key);
            if (bucket) {
                bucket.revenue += toNumber(order.totalAmount);
            }
        });

        return buckets.map((item) => ({
            month: item.month,
            revenue: Math.round(item.revenue / 1000000),
        }));
    }, [orders]);

    const totalRevenueRaw = React.useMemo(() => orders.reduce((sum, order) => sum + toNumber(order.totalAmount), 0), [orders]);
    const totalOrders = orders.length;
    const averageOrderRaw = totalOrders > 0 ? totalRevenueRaw / totalOrders : 0;
    const revenueThisMonthRaw = React.useMemo(() => {
        const now = new Date();
        return orders
            .filter((order) => {
                if (!order?.orderDate) {
                    return false;
                }
                const date = new Date(order.orderDate);
                return !Number.isNaN(date.getTime())
                    && date.getMonth() === now.getMonth()
                    && date.getFullYear() === now.getFullYear();
            })
            .reduce((sum, order) => sum + toNumber(order.totalAmount), 0);
    }, [orders]);

    const stats = [
        { label: 'Tổng doanh số', value: formatCurrency(totalRevenueRaw), trend: `${totalOrders} đơn`, icon: DollarSign, color: 'bg-green-500' },
        { label: 'Tổng đơn hàng', value: totalOrders.toLocaleString('vi-VN'), trend: 'Đơn đã ghi nhận', icon: ShoppingBag, color: 'bg-blue-500' },
        { label: 'Giá trị trung bình/đơn', value: formatCurrency(averageOrderRaw), trend: 'Theo sale-orders', icon: Users, color: 'bg-purple-500' },
        { label: 'Doanh thu tháng này', value: formatCurrency(revenueThisMonthRaw), trend: 'Cập nhật realtime', icon: TrendingUp, color: 'bg-orange-500' },
    ];

    const quickWidgets = [
        { label: 'Lịch sử đơn hàng', path: '/pos/history', icon: History, tone: 'bg-blue-50 text-blue-700 border-blue-100' },
        { label: 'AI dự báo', path: '/reports/ai', icon: Bot, tone: 'bg-purple-50 text-purple-700 border-purple-100' },
        { label: 'Ca làm việc', path: '/hr/shifts', icon: Clock3, tone: 'bg-amber-50 text-amber-700 border-amber-100' },
        { label: 'Kho hàng', path: '/inventory', icon: Warehouse, tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    ];

    const maxRevenue = Math.max(...monthlySales.map((item) => item.revenue), 1);
    const avgRevenue = Math.round(monthlySales.reduce((sum, item) => sum + item.revenue, 0) / monthlySales.length);
    const peakMonth = monthlySales.reduce((best, current) => (current.revenue > best.revenue ? current : best), monthlySales[0]);

    const handleExportExcel = () => {
        const now = new Date();
        const dateText = now.toISOString().slice(0, 10);

        const summaryRows = [
            { 'Chỉ số': 'Tổng doanh số', 'Giá trị': formatCurrency(totalRevenueRaw) },
            { 'Chỉ số': 'Tổng đơn hàng', 'Giá trị': totalOrders },
            { 'Chỉ số': 'Giá trị trung bình/đơn', 'Giá trị': formatCurrency(averageOrderRaw) },
            { 'Chỉ số': 'Doanh thu tháng này', 'Giá trị': formatCurrency(revenueThisMonthRaw) },
            { 'Chỉ số': 'Trung bình doanh thu/tháng (triệu)', 'Giá trị': avgRevenue },
            { 'Chỉ số': 'Tháng cao nhất', 'Giá trị': `${peakMonth.month} (${peakMonth.revenue} triệu)` },
        ];

        const monthlyRows = monthlySales.map((item) => ({
            'Tháng': item.month,
            'Doanh thu (triệu VNĐ)': item.revenue,
        }));

        const orderRows = orders.map((order) => ({
            'Mã đơn': order.orderCode || '',
            'Thời gian': order.orderDate ? new Date(order.orderDate).toLocaleString('vi-VN') : '',
            'Thu ngân': order.cashierName || '',
            'Khách hàng': order.customerName || '',
            'Thanh toán': order.paymentMethod || '',
            'Trạng thái': order.status || '',
            'Tạm tính': toNumber(order.subtotal),
            'Thuế': toNumber(order.taxAmount),
            'Giảm giá': toNumber(order.discountAmount),
            'Tổng tiền': toNumber(order.totalAmount),
        }));

        const workbook = XLSX.utils.book_new();
        const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
        const monthlySheet = XLSX.utils.json_to_sheet(monthlyRows);
        const ordersSheet = XLSX.utils.json_to_sheet(orderRows.length > 0 ? orderRows : [{ 'Thông báo': 'Không có dữ liệu đơn hàng' }]);

        XLSX.utils.book_append_sheet(workbook, summarySheet, 'TongQuan');
        XLSX.utils.book_append_sheet(workbook, monthlySheet, 'DoanhSoTheoThang');
        XLSX.utils.book_append_sheet(workbook, ordersSheet, 'DonHang');

        XLSX.writeFile(workbook, `bao-cao-dashboard-${dateText}.xlsx`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Bảng điều khiển</h1>
                    <p className="text-slate-500 mt-1">Chào mừng quay lại, đây là tình hình hoạt động hôm nay.</p>
                </div>
                <button
                    onClick={handleExportExcel}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-lg shadow-indigo-600/30 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                >
                    Tải báo cáo
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-slate-800 mt-2">{stat.value}</h3>
                            </div>
                            <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg shadow-black/10`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="text-green-500 font-medium bg-green-50 px-2 py-0.5 rounded-full">{stat.trend}</span>
                            <span className="text-slate-400 ml-2">{isLoading ? 'đang tải...' : 'từ dữ liệu thực tế'}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Tổng quan doanh số</h3>
                            <p className="text-xs text-slate-500 mt-1">Doanh thu 6 tháng gần nhất (triệu VNĐ)</p>
                        </div>
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">{isLoading ? 'Đang đồng bộ' : 'Dữ liệu live'}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
                            <p className="text-xs text-slate-500">Trung bình / tháng</p>
                            <p className="text-sm font-bold text-slate-800">{avgRevenue.toLocaleString('vi-VN')} triệu</p>
                        </div>
                        <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
                            <p className="text-xs text-slate-500">Tháng cao nhất</p>
                            <p className="text-sm font-bold text-slate-800">{peakMonth.month} ({peakMonth.revenue.toLocaleString('vi-VN')} triệu)</p>
                        </div>
                        <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
                            <p className="text-xs text-slate-500">Tổng kỳ</p>
                            <p className="text-sm font-bold text-slate-800">{monthlySales.reduce((sum, item) => sum + item.revenue, 0).toLocaleString('vi-VN')} triệu</p>
                        </div>
                    </div>

                    <div className="flex-1 rounded-xl border border-slate-100 bg-slate-50/40 p-4">
                        <div className="h-full grid grid-cols-6 gap-3 items-end">
                            {monthlySales.map((item) => (
                                <div key={item.month} className="flex flex-col items-center justify-end h-full gap-2">
                                    <span className="text-[11px] text-slate-600 font-medium">{item.revenue}</span>
                                    <div className="w-full max-w-10 rounded-t-md bg-indigo-500/90 hover:bg-indigo-600 transition-colors"
                                        style={{ height: `${Math.max((item.revenue / maxRevenue) * 160, 20)}px` }}
                                    />
                                    <span className="text-[11px] text-slate-500">{item.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Widgets</h3>
                    <p className="text-xs text-slate-500 mb-4">Truy cập nhanh các mục manager dùng nhiều nhất</p>
                    <div className="grid grid-cols-2 grid-rows-2 gap-3 flex-1 min-h-0">
                        {quickWidgets.map((widget) => (
                            <NavLink
                                key={widget.path}
                                to={widget.path}
                                className={`rounded-xl border p-3 transition-all hover:shadow-sm h-full min-h-0 flex flex-col justify-between ${widget.tone}`}
                            >
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <widget.icon size={16} />
                                    <span className="text-[11px] font-semibold">Mở</span>
                                </div>
                                <p className="text-sm font-semibold leading-tight">{widget.label}</p>
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
