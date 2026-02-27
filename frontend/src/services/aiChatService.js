import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

/**
 * Service for AI Chat operations
 */
const aiChatService = {
    /**
     * Send a chat message to the AI
     * @param {string} query - The user's question
     * @param {string} sessionId - Optional session ID for conversation context
     * @param {Date} contextDate - Optional date for filtering context
     * @returns {Promise} AI response
     */
    sendMessage: async (query, sessionId = null, contextDate = null) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_BASE_URL}/api/ai/chat`,
                {
                    query,
                    sessionId,
                    contextDate: contextDate ? contextDate.toISOString().split('T')[0] : null
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error sending chat message:', error);
            throw error;
        }
    },

    /**
     * Get AI chat statistics
     * @returns {Promise} Statistics data
     */
    getStatistics: async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_BASE_URL}/api/ai/stats`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching AI statistics:', error);
            throw error;
        }
    },

    /**
     * Check AI service health
     * @returns {Promise} Health status
     */
    healthCheck: async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_BASE_URL}/api/ai/health`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error checking AI health:', error);
            throw error;
        }
    }
};

export default aiChatService;
