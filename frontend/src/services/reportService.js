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
     * Download report
     */
    downloadReport: async (id, reportName, format = 'PDF') => {
        try {
            const response = await api.get(`/reports/${id}/download`, {
                responseType: 'blob'
            });

            // Determine extension
            let extension = 'pdf';
            if (format && format.toUpperCase() === 'EXCEL') {
                extension = 'xlsx';
            } else if (format && format.toUpperCase() === 'CSV') {
                extension = 'csv';
            }

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${reportName}.${extension}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading report:', error);
            throw error;
        }
    }
};

export default reportService;
