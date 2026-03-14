import api from '../config/axiosConfig';

const reportService = {
    /**
     * Get quick report summaries
     */
    getQuickReports: async () => {
        try {
            const response = await api.get('/reports/quick');
            return response.data;
        } catch (error) {
            console.error('Error fetching quick reports:', error);
            throw error;
        }
    },

    /**
     * Generate a new report
     */
    generateReport: async (reportData) => {
        try {
            const response = await api.post('/reports/generate', reportData);
            return response.data;
        } catch (error) {
            console.error('Error generating report:', error);
            throw error;
        }
    },

    /**
     * Get report history
     */
    getReportHistory: async (page = 0, size = 10) => {
        try {
            const response = await api.get('/reports/history', {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching report history:', error);
            throw error;
        }
    },

    /**
     * Get all reports (Admin)
     */
    getAllReports: async (page = 0, size = 10) => {
        try {
            const response = await api.get('/reports/all', {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching all reports:', error);
            throw error;
        }
    },

    /**
     * Get report by ID
     */
    getReportById: async (id) => {
        try {
            const response = await api.get(`/reports/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching report:', error);
            throw error;
        }
    },

    /**
     * Delete report
     */
    deleteReport: async (id) => {
        try {
            await api.delete(`/reports/${id}`);
        } catch (error) {
            console.error('Error deleting report:', error);
            throw error;
        }
    },

    /**
     * Get the Cloudinary download URL for a completed report.
     * Returns the secure_url string stored in the DB.
     */
    getDownloadUrl: async (id) => {
        try {
            const response = await api.get(`/reports/${id}/download-url`);
            return response.data.url; // Cloudinary https:// URL
        } catch (error) {
            console.error('Error fetching download URL:', error);
            throw error;
        }
    },

    /**
     * Download the report file through the backend (backend fetches from Cloudinary using API credentials).
     * This avoids Cloudinary delivery URL restrictions entirely.
     */
    openDownload: async (id, reportName, format) => {
        try {
            const response = await api.get(`/reports/${id}/download`, {
                responseType: 'blob'
            });

            const extMap = { PDF: '.pdf', EXCEL: '.xlsx', CSV: '.csv' };
            const ext = extMap[(format || '').toUpperCase()] || '';
            const safeName = (reportName || `report_${id}`).replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
            const filename = safeName + ext;

            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Error downloading report:', error);
            throw error;
        }
    },

    /**
     * @deprecated Use openDownload() instead.
     */
    downloadReport: async (id, _reportName, _format) => {
        try {
            const response = await api.get(`/reports/${id}/download-url`);
            const url = response.data.url;

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', '');
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading report:', error);
            throw error;
        }
    }
};

export default reportService;
