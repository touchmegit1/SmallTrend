import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Search, RotateCcw, Save, Download, Clock, User, Activity, Target, CheckCircle, XCircle, Shield, Trash2 } from 'lucide-react';
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
import auditLogService from '../../services/auditLogService';

const AuditLogPage = () => {
    // Filter state
    const [filters, setFilters] = useState({
        fromDateTime: '',
        toDateTime: '',
        timezone: 'Asia/Bangkok',
        result: 'ALL',
        userSearch: '',
        action: 'ALL',
        target: '',
        ipAddress: '',
        traceId: '',
        source: 'ALL',
        page: 0,
        size: 50,
        sortBy: 'createdAt',
        sortDirection: 'DESC'
    });

    // Data state
    const [auditLogs, setAuditLogs] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Active saved filter tracking
    const [activeSavedFilterId, setActiveSavedFilterId] = useState(null);

    // Load saved filters from localStorage
    const STORAGE_KEY = 'auditLog_savedFilters';
    const [savedFilters, setSavedFilters] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    // Persist saved filters to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedFilters));
    }, [savedFilters]);

    // Save current filters
    const handleSaveFilter = () => {
        const name = window.prompt('Enter a name for this filter:');
        if (!name || !name.trim()) return;

        const { page, size, sortBy, sortDirection, ...criteria } = filters;
        const newFilter = {
            id: Date.now(),
            name: name.trim(),
            criteria
        };
        setSavedFilters(prev => [...prev, newFilter]);
    };

    // Delete a saved filter
    const handleDeleteFilter = (e, filterId) => {
        e.stopPropagation(); // prevent triggering applySavedFilter
        setSavedFilters(prev => prev.filter(f => f.id !== filterId));
        if (activeSavedFilterId === filterId) {
            setActiveSavedFilterId(null);
        }
    };

    // Apply a saved filter
    const applySavedFilter = (filter) => {
        setActiveSavedFilterId(filter.id);

        const newFilters = {
            fromDateTime: '',
            toDateTime: '',
            timezone: 'Asia/Bangkok',
            result: 'ALL',
            userSearch: '',
            action: 'ALL',
            target: '',
            ipAddress: '',
            traceId: '',
            source: 'ALL',
            page: 0,
            size: filters.size,
            sortBy: filters.sortBy,
            sortDirection: filters.sortDirection,
            ...filter.criteria
        };

        setFilters(newFilters);
        setTimeout(() => fetchAuditLogs(), 0);
    };

    // Action options
    const actionOptions = [
        'ALL', 'LOGIN', 'LOGOUT', 'UPDATE_PROFILE',
        'GRANT_ROLE', 'REVOKE_ROLE', 'DELETE', 'CREATE', 'UPDATE'
    ];

    // Result options
    const resultOptions = ['ALL', 'OK', 'FAIL', 'DENIED'];

    // Source options
    const sourceOptions = ['ALL', 'WEB', 'API', 'MOBILE', 'SYSTEM'];

    // Fetch audit logs
    const fetchAuditLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await auditLogService.getAuditLogs(filters);
            setAuditLogs(response.logs || []);
            setTotalElements(response.totalElements || 0);
            setTotalPages(response.totalPages || 0);
            setCurrentPage(response.currentPage || 0);
        } catch (err) {
            setError(err.message || 'Failed to fetch audit logs');
            console.error('Error fetching audit logs:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch whenever page/size/sortBy/sortDirection changes
    useEffect(() => {
        fetchAuditLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.page, filters.size, filters.sortBy, filters.sortDirection]);

    // Handle filter change
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle search
    const handleSearch = () => {
        if (filters.page === 0) {
            // Already on page 0, useEffect won't re-fire, so fetch directly
            fetchAuditLogs();
        } else {
            // Setting page to 0 will trigger useEffect which calls fetchAuditLogs
            setFilters(prev => ({ ...prev, page: 0 }));
        }
    };

    // Handle reset
    const handleReset = () => {
        const defaultFilters = {
            fromDateTime: '',
            toDateTime: '',
            timezone: 'Asia/Bangkok',
            result: 'ALL',
            userSearch: '',
            action: 'ALL',
            target: '',
            ipAddress: '',
            traceId: '',
            source: 'ALL',
            page: 0,
            size: 50,
            sortBy: 'createdAt',
            sortDirection: 'DESC'
        };
        setFilters(defaultFilters);
        // Fetch immediately with default filters since page may already be 0
        setTimeout(() => fetchAuditLogs(), 0);
    };

    // Quick time presets
    const setTimePreset = (minutes) => {
        const now = new Date();
        const from = new Date(now.getTime() - minutes * 60000);

        const formatDateTime = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const mins = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${mins}`;
        };

        setFilters(prev => ({
            ...prev,
            fromDateTime: formatDateTime(from),
            toDateTime: formatDateTime(now)
        }));
    };

    // Handle pagination
    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    // Handle rows per page change
    const handleRowsPerPageChange = (value) => {
        setFilters(prev => ({ ...prev, size: parseInt(value), page: 0 }));
    };

    // Format timestamp
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            timeZone: filters.timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    // Get result badge variant
    const getResultBadgeVariant = (result) => {
        switch (result?.toUpperCase()) {
            case 'OK':
                return 'success';
            case 'FAIL':
                return 'destructive';
            case 'DENIED':
                return 'warning';
            default:
                return 'secondary';
        }
    };

    // Export to CSV
    const handleExport = () => {
        const headers = ['Time', 'Actor', 'Action', 'Target', 'Result', 'IP', 'Trace ID'];
        const rows = auditLogs.map(log => [
            formatTimestamp(log.createdAt),
            `${log.userName || 'N/A'} (${log.userEmail || 'N/A'})`,
            log.action || 'N/A',
            log.target || 'N/A',
            log.result || 'N/A',
            log.ipAddress || 'N/A',
            log.traceId || 'N/A'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${new Date().toISOString()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <Container fluid className="bg-slate-50 min-h-screen py-4">
            <div className="flex gap-4">
                {/* Sidebar */}
                <div className="w-64 flex-shrink-0">
                    <Card className="shadow-sm">
                        <CardHeader className="bg-primary text-white p-4">
                            <h6 className="mb-0 flex items-center gap-2 text-base font-semibold">
                                <Save size={16} />
                                Saved Filters
                            </h6>
                        </CardHeader>
                        <CardContent className="p-2">
                            {savedFilters.length === 0 ? (
                                <p className="text-xs text-slate-400 p-2 text-center">No saved filters yet</p>
                            ) : (
                                savedFilters.map(filter => (
                                    <div
                                        key={filter.id}
                                        onClick={() => applySavedFilter(filter)}
                                        className={`p-2 mb-1 rounded cursor-pointer transition-all border flex items-center justify-between ${
                                            activeSavedFilterId === filter.id
                                                ? 'bg-primary/10 border-primary text-primary font-semibold'
                                                : 'hover:bg-slate-100 border-transparent hover:border-slate-300'
                                        }`}
                                    >
                                        <small>{filter.name}</small>
                                        <button
                                            onClick={(e) => handleDeleteFilter(e, filter.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-0.5 rounded hover:bg-red-50"
                                            title="Delete filter"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Time Presets */}
                    <Card className="shadow-sm mb-3">
                        <CardContent className="p-3">
                            <div className="flex gap-2 flex-wrap">
                                <Button variant="outline" size="sm" onClick={() => setTimePreset(15)}>
                                    <Clock size={14} className="mr-1" />
                                    Last 15m
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setTimePreset(60)}>
                                    <Clock size={14} className="mr-1" />
                                    Last 1h
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setTimePreset(1440)}>
                                    <Clock size={14} className="mr-1" />
                                    Last 24h
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setTimePreset(10080)}>
                                    <Clock size={14} className="mr-1" />
                                    Last 7d
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Filter Section */}
                    <Card className="shadow-sm mb-3">
                        <CardHeader className="bg-slate-100 p-4">
                            <h5 className="mb-0 flex items-center gap-2 text-lg font-semibold">
                                <Search size={18} />
                                Filter Audit Logs
                            </h5>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Date/Time Range */}
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">From Date/Time</label>
                                    <Input
                                        type="datetime-local"
                                        value={filters.fromDateTime}
                                        onChange={(e) => handleFilterChange('fromDateTime', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">To Date/Time</label>
                                    <Input
                                        type="datetime-local"
                                        value={filters.toDateTime}
                                        onChange={(e) => handleFilterChange('toDateTime', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Timezone</label>
                                    <Select value={filters.timezone} onValueChange={(value) => handleFilterChange('timezone', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Asia/Bangkok">Asia/Bangkok (UTC+7)</SelectItem>
                                            <SelectItem value="UTC">UTC</SelectItem>
                                            <SelectItem value="America/New_York">America/New_York</SelectItem>
                                            <SelectItem value="Europe/London">Europe/London</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Result */}
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Result</label>
                                    <Select value={filters.result} onValueChange={(value) => handleFilterChange('result', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {resultOptions.map(opt => (
                                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* User Search */}
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">User (email/name/ID)</label>
                                    <Input
                                        type="text"
                                        placeholder="Search user..."
                                        value={filters.userSearch}
                                        onChange={(e) => handleFilterChange('userSearch', e.target.value)}
                                    />
                                </div>

                                {/* Action */}
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Action</label>
                                    <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {actionOptions.map(opt => (
                                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Target/Resource */}
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Target/Resource</label>
                                    <Input
                                        type="text"
                                        placeholder="e.g., UserProfile#123"
                                        value={filters.target}
                                        onChange={(e) => handleFilterChange('target', e.target.value)}
                                    />
                                </div>

                                {/* IP Address */}
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">IP Address</label>
                                    <Input
                                        type="text"
                                        placeholder="e.g., 192.168.1.1"
                                        value={filters.ipAddress}
                                        onChange={(e) => handleFilterChange('ipAddress', e.target.value)}
                                    />
                                </div>

                                {/* Trace/Correlation ID */}
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Trace/Correlation ID</label>
                                    <Input
                                        type="text"
                                        placeholder="Trace ID..."
                                        value={filters.traceId}
                                        onChange={(e) => handleFilterChange('traceId', e.target.value)}
                                    />
                                </div>

                                {/* Source */}
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Source</label>
                                    <Select value={filters.source} onValueChange={(value) => handleFilterChange('source', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="ALL" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sourceOptions.map(opt => (
                                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-4">
                                <Button variant="default" size="sm" onClick={handleSearch} disabled={loading}>
                                    <Search size={14} className="mr-1" />
                                    Search
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleReset}>
                                    <RotateCcw size={14} className="mr-1" />
                                    Reset
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleSaveFilter}>
                                    <Save size={14} className="mr-1" />
                                    Save Filter
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleExport} disabled={auditLogs.length === 0}>
                                    <Download size={14} className="mr-1" />
                                    Export
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Error Alert */}
                    {error && (
                        <Alert variant="destructive" className="mb-3">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Results Section */}
                    <Card className="shadow-sm">
                        <CardHeader className="bg-slate-100 p-4 flex flex-row justify-between items-center">
                            <h5 className="mb-0 flex items-center gap-2 text-lg font-semibold">
                                <Activity size={18} />
                                Audit Logs
                            </h5>
                            <Badge variant="info">Total: {totalElements.toLocaleString()}</Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <p className="mt-3 text-slate-600">Loading audit logs...</p>
                                </div>
                            ) : auditLogs.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-slate-600">No audit logs found matching the filters.</p>
                                </div>
                            ) : (
                                <div className="max-h-[600px] overflow-y-auto scrollbar-thin">
                                    <Table>
                                        <TableHeader className="sticky top-0 bg-slate-100 z-10">
                                            <TableRow>
                                                <TableHead className="text-xs">Time (UTC+7)</TableHead>
                                                <TableHead className="text-xs">Actor</TableHead>
                                                <TableHead className="text-xs">Action</TableHead>
                                                <TableHead className="text-xs">Target</TableHead>
                                                <TableHead className="text-xs">Result</TableHead>
                                                <TableHead className="text-xs">IP</TableHead>
                                                <TableHead className="text-xs">Trace ID</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {auditLogs.map((log) => (
                                                <TableRow key={log.id} className="hover:bg-slate-50">
                                                    <TableCell className="text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <Clock size={14} className="text-slate-400" />
                                                            {formatTimestamp(log.createdAt)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <User size={14} className="text-slate-400" />
                                                            <strong>#{log.userId}</strong>
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {log.userEmail || 'N/A'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="default" className="font-bold">
                                                            {log.action || 'N/A'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <Target size={14} className="text-slate-400" />
                                                            {log.target || 'N/A'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={getResultBadgeVariant(log.result)}>
                                                            {log.result === 'OK' && <CheckCircle size={12} className="mr-1" />}
                                                            {log.result === 'FAIL' && <XCircle size={12} className="mr-1" />}
                                                            {log.result === 'DENIED' && <Shield size={12} className="mr-1" />}
                                                            {log.result || 'N/A'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm font-mono">
                                                        {log.ipAddress || 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="text-sm font-mono">
                                                        {log.traceId || 'N/A'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>

                        {/* Pagination */}
                        {!loading && auditLogs.length > 0 && (
                            <CardFooter className="bg-slate-100 p-4">
                                <div className="flex justify-between items-center w-full">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-600">Rows per page:</span>
                                        <Select value={filters.size.toString()} onValueChange={handleRowsPerPageChange}>
                                            <SelectTrigger className="w-20">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="10">10</SelectItem>
                                                <SelectItem value="25">25</SelectItem>
                                                <SelectItem value="50">50</SelectItem>
                                                <SelectItem value="100">100</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 0}
                                        >
                                            &lt; Prev
                                        </Button>
                                        <span className="text-sm">
                                            Page {currentPage + 1} of {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage >= totalPages - 1}
                                        >
                                            Next &gt;
                                        </Button>
                                    </div>
                                </div>
                            </CardFooter>
                        )}
                    </Card>
                </div>
            </div>
        </Container>
    );
};

export default AuditLogPage;
