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
     * Open the report file directly from Cloudinary.
     * Step 1: fetch the URL from our backend (authenticated via JWT).
     * Step 2: trigger a native browser download via hidden anchor — no Axios, no auth header sent to Cloudinary.
     */
    openDownload: async (id) => {
        try {
            const response = await api.get(`/reports/${id}/download-url`);
            const url = response.data.url;

            // Use a hidden anchor to let the browser download the file natively.
            // This avoids Axios interceptors and does NOT send the JWT to Cloudinary.
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', '');  // browser will infer filename from Content-Disposition
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error opening report download:', error);
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
