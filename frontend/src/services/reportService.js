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
     * Open the report file directly from Cloudinary in a new browser tab.
     * No blob streaming — the file is fetched entirely from the cloud.
     */
    openDownload: async (id) => {
        try {
            const response = await api.get(`/reports/${id}/download-url`);
            const url = response.data.url;
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error('Error opening report download:', error);
            throw error;
        }
    },

    /**
     * @deprecated Use openDownload() instead.
     * Kept for backward compatibility — now simply opens the Cloudinary URL.
     */
    downloadReport: async (id, _reportName, _format) => {
        try {
            const response = await api.get(`/reports/${id}/download-url`);
            const url = response.data.url;
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error('Error downloading report:', error);
            throw error;
        }
    }
};

export default reportService;
