import api from '../config/axiosConfig';

export const shiftTicketService = {
    // Get all shift-related tickets
    getShiftTickets: async (params = {}) => {
        const res = await api.get('/api/tickets', {
            params: {
                ticketType: 'SHIFT_CHANGE',
                ...params
            }
        });
        return res.data;
    },

    // Get tickets assigned to current user (for manager approval)
    getAssignedTickets: async (params = {}) => {
        const res = await api.get('/api/tickets/assigned', { params });
        return res.data;
    },

    // Create shift swap ticket (when 2 employees want to swap shifts)
    createShiftSwapTicket: async (swapData) => {
        const res = await api.post('/api/tickets', {
            ticketType: 'SHIFT_CHANGE',
            title: `Shift Swap: ${swapData.fromDate} ↔ ${swapData.toDate}`,
            description: swapData.reason,
            priority: 'NORMAL',
            relatedEntityType: 'SHIFT_SWAP',
            relatedEntityId: swapData.swapRequestId,
            assignedToUserId: swapData.targetUserId // Assign to other employee
        });
        return res.data;
    },

    // Create shift cancel ticket (employee asks to cancel a shift)
    createShiftCancelTicket: async (cancelData) => {
        const res = await api.post('/api/tickets', {
            ticketType: 'SHIFT_CHANGE',
            title: `Cancel Shift Request: ${cancelData.shiftDate}`,
            description: cancelData.reason,
            priority: cancelData.priority || 'NORMAL',
            relatedEntityType: 'SHIFT_ASSIGNMENT',
            relatedEntityId: cancelData.assignmentId,
            assignedToUserId: cancelData.managerId // Assign to manager for approval
        });
        return res.data;
    },

    // Create shift update ticket (employee asks to modify shift details)
    createShiftUpdateTicket: async (updateData) => {
        const res = await api.post('/api/tickets', {
            ticketType: 'SHIFT_CHANGE',
            title: `Shift Update Request: ${updateData.shiftDate}`,
            description: updateData.reason,
            priority: updateData.priority || 'NORMAL',
            relatedEntityType: 'SHIFT_ASSIGNMENT',
            relatedEntityId: updateData.assignmentId,
            assignedToUserId: updateData.managerId // Assign to manager for approval
        });
        return res.data;
    },

    // Approve ticket (for manager or co-worker)
    approveTicket: async (ticketId, resolution = '') => {
        const res = await api.put(`/api/tickets/${ticketId}/approve`, {
            status: 'RESOLVED',
            resolution: resolution || 'Approved'
        });
        return res.data;
    },

    // Reject ticket
    rejectTicket: async (ticketId, resolution) => {
        const res = await api.put(`/api/tickets/${ticketId}/reject`, {
            status: 'CLOSED',
            resolution: resolution || 'Rejected'
        });
        return res.data;
    },

    // Update ticket status
    updateTicketStatus: async (ticketId, status, resolution = '') => {
        const res = await api.put(`/api/tickets/${ticketId}`, {
            status,
            resolution
        });
        return res.data;
    },

    // Get pending shift swap requests
    getPendingSwapRequests: async (params = {}) => {
        const res = await api.get('/shifts/swap-requests/pending', { params });
        return res.data;
    },

    // Auto-approve swap if both employees accepted
    autoApproveSwap: async (ticketId, swapRequestId) => {
        const res = await api.post(`/shifts/swap-requests/${swapRequestId}/auto-approve`);
        // Also update ticket status
        await shiftTicketService.approveTicket(ticketId, 'Auto-approved by both employees');
        return res.data;
    }
};
