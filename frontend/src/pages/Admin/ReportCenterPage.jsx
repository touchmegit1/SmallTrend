import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import {
    FileText,
    Download,
    Calendar,
    TrendingUp,
    Users,
    Package,
    Clock,
    CheckCircle,
    AlertCircle,
    Loader
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import reportService from '../../services/reportService';

const ReportCenterPage = () => {
    // State for quick reports
    const [quickReports, setQuickReports] = useState([]);

    // State for report generation form
    const [reportForm, setReportForm] = useState({
        type: 'Revenue',
        fromDate: '',
        toDate: '',
        format: 'PDF'
    });

    // State for report history
    const [reportHistory, setReportHistory] = useState([]);
    const [totalReports, setTotalReports] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    // UI State
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Polling interval for status updates
    const [pollingInterval, setPollingInterval] = useState(null);

    // Report type options
    const reportTypes = [
        { value: 'Revenue', label: 'Doanh thu (Revenue)', icon: TrendingUp },
        { value: 'Products', label: 'Sản phẩm (Products)', icon: Package },
        { value: 'Customers', label: 'Khách hàng (Customers)', icon: Users },
        { value: 'Inventory', label: 'Tồn kho (Inventory)', icon: Package }
    ];

    // Format options
    const formatOptions = ['PDF', 'EXCEL', 'CSV'];

    // Load quick reports
    useEffect(() => {
        loadQuickReports();
    }, []);

    // Load report history
    useEffect(() => {
        loadReportHistory();
    }, [currentPage, pageSize]);

    // Setup polling for pending reports
    useEffect(() => {
        const hasPendingReports = reportHistory.some(
            report => report.status === 'PENDING' || report.status === 'PROCESSING'
        );

        if (hasPendingReports && !pollingInterval) {
            const interval = setInterval(() => {
                loadReportHistory();
            }, 5000);
            setPollingInterval(interval);
        } else if (!hasPendingReports && pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
        }

        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, [reportHistory]);

    const loadQuickReports = async () => {
        try {
            const data = await reportService.getQuickReports();
            setQuickReports(data);
        } catch (err) {
            console.error('Error loading quick reports:', err);
        }
    };

    const loadReportHistory = async () => {
        setLoading(true);
        try {
            const response = await reportService.getReportHistory(currentPage, pageSize);
            setReportHistory(response.reports || []);
            setTotalReports(response.totalElements || 0);
            setTotalPages(response.totalPages || 0);
        } catch (err) {
            setError('Không thể tải lịch sử báo cáo');
            console.error('Error loading report history:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (field, value) => {
        setReportForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleGenerateReport = async () => {
        if (!reportForm.fromDate || !reportForm.toDate) {
            setError('Vui lòng chọn khoảng thời gian');
            return;
        }

        setGenerating(true);
        setError(null);
        setSuccess(null);

        try {
            await reportService.generateReport(reportForm);
            setSuccess('Báo cáo đang được tạo thành công!');

            setReportForm({
                type: 'Revenue',
                fromDate: '',
                toDate: '',
                format: 'PDF'
            });

            // Reload report history immediately
            await loadReportHistory();

            // Auto-clear success message after 3 seconds
            setTimeout(() => {
                setSuccess(null);
            }, 3000);
        } catch (err) {
            setError('Không thể tạo báo cáo. Vui lòng thử lại.');
            console.error('Error generating report:', err);
        } finally {
            setGenerating(false);
        }
    };

    const handleDownload = async (report) => {
        try {
            await reportService.openDownload(report.id);
        } catch (err) {
            setError('Không thể tải báo cáo');
            console.error('Error downloading report:', err);
        }
    };

    const handleQuickReport = async (reportType) => {
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

        const quickReportData = {
            type: reportType,
            fromDate: lastMonth.toISOString().split('T')[0],
            toDate: today.toISOString().split('T')[0],
            format: 'PDF'
        };

        setGenerating(true);
        setError(null);
        setSuccess(null);

        try {
            await reportService.generateReport(quickReportData);
            setSuccess('Báo cáo nhanh đang được tạo thành công!');

            // Reload report history immediately
            await loadReportHistory();

            // Auto-clear success message after 3 seconds
            setTimeout(() => {
                setSuccess(null);
            }, 3000);
        } catch (err) {
            setError('Không thể tạo báo cáo nhanh');
            console.error('Error generating quick report:', err);
        } finally {
            setGenerating(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'COMPLETED':
                return <Badge variant="success"><CheckCircle size={12} className="mr-1" />Hoàn thành</Badge>;
            case 'PROCESSING':
                return <Badge variant="warning"><Loader size={12} className="mr-1" />Đang xử lý</Badge>;
            case 'PENDING':
                return <Badge variant="info"><Clock size={12} className="mr-1" />Chờ xử lý</Badge>;
            case 'FAILED':
                return <Badge variant="destructive"><AlertCircle size={12} className="mr-1" />Thất bại</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const formatDateTime = (dateTime) => {
        if (!dateTime) return 'N/A';
        const date = new Date(dateTime);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getQuickReportIcon = (type) => {
        const reportType = reportTypes.find(rt => rt.value === type);
        return reportType ? reportType.icon : FileText;
    };

    const [showFilter, setShowFilter] = useState(true);

    return (
        <Container fluid className="bg-slate-50 min-h-screen py-4">
            {/* Page Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-1">
                        Trung tâm Báo cáo
                    </h2>
                    <p className="text-slate-500 text-sm">Quản lý và tạo báo cáo hệ thống</p>
                </div>
                <Button
                    variant="gradient"
                    onClick={() => setShowFilter(prev => !prev)}
                    className="flex items-center gap-2"
                >
                    <FileText size={16} />
                    + Tạo báo cáo tùy chỉnh
                </Button>
            </div>

            {/* Alerts */}
            {error && (
                <Alert variant="destructive" className="mb-3">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {success && (
                <Alert variant="success" className="mb-3">
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}

            {/* Custom Filter Section */}
            {showFilter && (
                <div className="mb-6">
                    <Card className="shadow-sm border border-slate-200">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h5 className="text-base font-semibold text-slate-800">Bộ lọc tùy chỉnh</h5>
                                <button
                                    onClick={() => setShowFilter(false)}
                                    className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Loại báo cáo</label>
                                    <Select value={reportForm.type} onValueChange={(value) => handleFormChange('type', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Doanh thu (Revenue)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {reportTypes.map(type => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Từ ngày</label>
                                    <Input
                                        type="date"
                                        value={reportForm.fromDate}
                                        onChange={(e) => handleFormChange('fromDate', e.target.value)}
                                        placeholder="dd/mm/yyyy"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Đến ngày</label>
                                    <Input
                                        type="date"
                                        value={reportForm.toDate}
                                        onChange={(e) => handleFormChange('toDate', e.target.value)}
                                        placeholder="dd/mm/yyyy"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Định dạng</label>
                                    <Select value={reportForm.format} onValueChange={(value) => handleFormChange('format', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {formatOptions.map(format => (
                                                <SelectItem key={format} value={format}>
                                                    {format}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Button
                                        variant="gradient"
                                        className="w-full"
                                        onClick={handleGenerateReport}
                                        disabled={generating}
                                    >
                                        {generating ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                Đang tạo...
                                            </>
                                        ) : (
                                            'Tạo báo cáo'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Quick Reports Section */}
            <div className="mb-6">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                    Báo cáo nhanh
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickReports.map((report, index) => {
                        const IconComponent = getQuickReportIcon(report.type);
                        return (
                            <Card
                                key={index}
                                className={`border border-slate-200 transition-all h-full ${
                                    report.available
                                        ? 'cursor-pointer hover:-translate-y-1 hover:shadow-md hover:border-blue-400'
                                        : 'opacity-60 bg-slate-50 cursor-not-allowed'
                                }`}
                                onClick={() => report.available && handleQuickReport(report.type)}
                            >
                                <CardContent className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                                            <IconComponent size={22} />
                                        </div>
                                        <Badge variant={report.badge === 'Ready' ? 'success' : 'warning'} className="text-xs px-2 py-0.5">
                                            {report.badge === 'Ready' ? 'Sẵn sàng' : 'Chờ xử lý'}
                                        </Badge>
                                    </div>
                                    <h6 className="font-semibold text-slate-800 mb-1">{report.title}</h6>
                                    <p className="text-sm text-slate-500 leading-snug mb-0">
                                        {report.description}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Report History Section */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Lịch sử báo cáo
                    </h5>
                    <span className="text-sm font-semibold text-blue-600">{totalReports} báo cáo</span>
                </div>
                <Card className="shadow-sm border border-slate-200">
                    <CardContent className="p-0">
                        {loading && reportHistory.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <p className="mt-3 text-slate-600">Đang tải...</p>
                            </div>
                        ) : reportHistory.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-slate-600">Chưa có báo cáo nào</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-slate-200">
                                            <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-3">Tên báo cáo</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-3">Loại</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-3">Thời gian</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-3">Trạng thái</TableHead>
                                            <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide py-3">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportHistory.map((report) => (
                                            <TableRow key={report.id} className="hover:bg-slate-50 border-b border-slate-100">
                                                <TableCell className="py-4">
                                                    <div>
                                                        <div className="font-semibold text-slate-800">{report.reportName}</div>
                                                        <div className="text-xs text-slate-400 mt-0.5">{report.dateRange || ''}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <Badge variant="default">{report.type}</Badge>
                                                </TableCell>
                                                <TableCell className="py-4 text-slate-600 text-sm">
                                                    {formatDateTime(report.createdAt)}
                                                </TableCell>
                                                <TableCell className="py-4">{getStatusBadge(report.status)}</TableCell>
                                                <TableCell className="py-4">
                                                    {report.status === 'COMPLETED' ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDownload(report)}
                                                            className="border-slate-300 text-slate-700 hover:bg-slate-50"
                                                        >
                                                            <Download size={14} className="mr-1" />
                                                            ↓ Tải
                                                        </Button>
                                                    ) : report.status === 'PROCESSING' || report.status === 'PENDING' ? (
                                                        <Button variant="secondary" size="sm" disabled>
                                                            <Loader size={14} className="mr-1" />
                                                            Chờ
                                                        </Button>
                                                    ) : (
                                                        <Button variant="outline" size="sm" disabled>
                                                            Thất bại
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                    {!loading && reportHistory.length > 0 && (
                        <CardFooter className="border-t border-slate-200 p-4 bg-white">
                            <div className="flex justify-between items-center w-full">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-600">Số hàng mỗi trang:</span>
                                    <select
                                        className="border border-slate-300 rounded px-2 py-1 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                        value={pageSize}
                                        onChange={(e) => {
                                            setPageSize(parseInt(e.target.value));
                                            setCurrentPage(0);
                                        }}
                                    >
                                        <option value="5">5</option>
                                        <option value="10">10</option>
                                        <option value="20">20</option>
                                        <option value="50">50</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                        disabled={currentPage === 0}
                                        className="border-slate-300 text-slate-600 px-3"
                                    >
                                        ‹ Trước
                                    </Button>
                                    <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded font-medium">
                                        {currentPage + 1}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                        disabled={currentPage >= totalPages - 1}
                                        className="border-slate-300 text-slate-600 px-3"
                                    >
                                        Sau ›
                                    </Button>
                                </div>
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </Container>
    );
};

export default ReportCenterPage;
