import api from '../config/axiosConfig';

/**
 * Get filtered audit logs with pagination
 * @param {Object} filters - Filter parameters
 * @returns {Promise} - Paginated audit log response
 */
const getAuditLogs = async (filters = {}) => {
    try {
        const params = new URLSearchParams();

        // Add filters to query params
        if (filters.fromDateTime) params.append('fromDateTime', filters.fromDateTime);
        if (filters.toDateTime) params.append('toDateTime', filters.toDateTime);
        if (filters.timezone) params.append('timezone', filters.timezone);
        if (filters.result) params.append('result', filters.result);
        if (filters.userSearch) params.append('userSearch', filters.userSearch);
        if (filters.action) params.append('action', filters.action);
        if (filters.target) params.append('target', filters.target);
        if (filters.ipAddress) params.append('ipAddress', filters.ipAddress);
        if (filters.traceId) params.append('traceId', filters.traceId);
        if (filters.source) params.append('source', filters.source);

        // Pagination
        params.append('page', filters.page || 0);
        params.append('size', filters.size || 50);
        params.append('sortBy', filters.sortBy || 'createdAt');
        params.append('sortDirection', filters.sortDirection || 'DESC');

        const response = await api.get(`/audit-logs?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Get total count of audit logs matching the filter
 * @param {Object} filters - Filter parameters
 * @returns {Promise<number>} - Total count
 */
const getAuditLogCount = async (filters = {}) => {
    try {
        const params = new URLSearchParams();

        if (filters.fromDateTime) params.append('fromDateTime', filters.fromDateTime);
        if (filters.toDateTime) params.append('toDateTime', filters.toDateTime);
        if (filters.result) params.append('result', filters.result);
        if (filters.userSearch) params.append('userSearch', filters.userSearch);
        if (filters.action) params.append('action', filters.action);
        if (filters.target) params.append('target', filters.target);
        if (filters.ipAddress) params.append('ipAddress', filters.ipAddress);
        if (filters.traceId) params.append('traceId', filters.traceId);
        if (filters.source) params.append('source', filters.source);

        const response = await api.get(`/audit-logs/count?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Export ALL audit logs matching the filter as a PDF file (server-side generation).
 * @param {Object} filters - Filter parameters (same as getAuditLogs, pagination ignored)
 */
const exportPdf = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.fromDateTime) params.append('fromDateTime', filters.fromDateTime);
    if (filters.toDateTime) params.append('toDateTime', filters.toDateTime);
    if (filters.timezone) params.append('timezone', filters.timezone);
    if (filters.result && filters.result !== 'ALL') params.append('result', filters.result);
    if (filters.userSearch) params.append('userSearch', filters.userSearch);
    if (filters.action && filters.action !== 'ALL') params.append('action', filters.action);
    if (filters.target) params.append('target', filters.target);
    if (filters.ipAddress) params.append('ipAddress', filters.ipAddress);
    if (filters.traceId) params.append('traceId', filters.traceId);
    if (filters.source && filters.source !== 'ALL') params.append('source', filters.source);
    params.append('sortBy', filters.sortBy || 'createdAt');
    params.append('sortDirection', filters.sortDirection || 'DESC');

    const response = await api.get(`/audit-logs/export/pdf?${params.toString()}`, {
        responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
};

const auditLogService = {
    getAuditLogs,
    getAuditLogCount,
    exportPdf,
};

export default auditLogService;
