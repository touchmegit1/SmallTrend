import api from '../config/axiosConfig';

export const shiftTicketService = {
    getShiftTickets: async () => {
        const res = await api.get('/crm/tickets');
        const payload = Array.isArray(res.data) ? res.data : [];
        return payload.filter((item) => item.ticketType === 'SHIFT_CHANGE');
    },

    createShiftSwapTicket: async (swapData) => {
        const res = await api.post('/crm/tickets', {
            ticketType: 'SHIFT_CHANGE',
            title: `Yêu cầu đổi ca: ${swapData.fromDate} ↔ ${swapData.toDate}`,
            description: swapData.reason,
            priority: swapData.priority || 'HIGH',
            relatedEntityType: 'SHIFT_SWAP',
            relatedEntityId: swapData.relatedEntityId || swapData.requesterAssignmentId || null,
            assignedToUserId: swapData.assignedToUserId,
            requesterUserId: swapData.requesterUserId,
            swapRequesterAssignmentId: swapData.requesterAssignmentId,
            swapTargetUserId: swapData.targetUserId,
            swapTargetAssignmentId: swapData.targetAssignmentId || null,
            swapMode: swapData.swapMode || 'DIRECT',
        });
        return res.data;
    },

    createShiftCancelTicket: async (cancelData) => {
        const res = await api.post('/crm/tickets', {
            ticketType: 'SHIFT_CHANGE',
            title: `Yêu cầu nghỉ ca: ${cancelData.shiftDate}`,
            description: cancelData.reason,
            priority: cancelData.priority || 'HIGH',
            relatedEntityType: 'SHIFT_ASSIGNMENT',
            relatedEntityId: cancelData.assignmentId,
            assignedToUserId: cancelData.assignedToUserId,
        });
        return res.data;
    },

    createShiftUpdateTicket: async (updateData) => {
        const res = await api.post('/crm/tickets', {
            ticketType: 'SHIFT_CHANGE',
            title: `Yêu cầu cập nhật ca: ${updateData.shiftDate}`,
            description: updateData.reason,
            priority: updateData.priority || 'NORMAL',
            relatedEntityType: 'SHIFT_ASSIGNMENT',
            relatedEntityId: updateData.assignmentId,
            assignedToUserId: updateData.assignedToUserId,
        });
        return res.data;
    },

    approveTicket: async (ticketId, resolution = '') => {
        const res = await api.put(`/crm/tickets/${ticketId}`, {
            status: 'RESOLVED',
            resolution: resolution || 'Đã duyệt yêu cầu đổi ca',
        });
        return res.data;
    },

    rejectTicket: async (ticketId, resolution) => {
        const res = await api.put(`/crm/tickets/${ticketId}`, {
            status: 'CLOSED',
            resolution: resolution || 'Từ chối yêu cầu đổi ca',
        });
        return res.data;
    },

    updateTicketStatus: async (ticketId, status, resolution = '') => {
        const res = await api.put(`/crm/tickets/${ticketId}`, {
            status,
            resolution,
        });
        return res.data;
    },
};
