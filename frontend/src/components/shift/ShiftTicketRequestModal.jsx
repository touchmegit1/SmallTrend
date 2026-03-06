import React, { useState, useContext } from 'react';
import { X, Send } from 'lucide-react';
import { shiftTicketService } from '../../services/shiftTicketService';
import { AuthContext } from '../../context/AuthContext';

const ShiftTicketRequestModal = ({ isOpen, onClose, ticketType, assignment, onSuccess }) => {
    const { user } = useContext(AuthContext);
    const [form, setForm] = useState({
        reason: '',
        targetUserId: null,
        targetShiftId: null,
        priority: 'NORMAL'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.reason.trim()) {
            setError('Vui lòng nhập lý do');
            return;
        }

        try {
            setLoading(true);
            setError('');

            let result;
            switch (ticketType) {
                case 'SHIFT_CANCEL':
                    result = await shiftTicketService.createShiftCancelTicket({
                        assignmentId: assignment.id,
                        shiftDate: assignment.shiftDate,
                        reason: form.reason,
                        priority: form.priority,
                        managerId: assignment.shift?.manager?.id || null
                    });
                    break;
                case 'SHIFT_UPDATE':
                    result = await shiftTicketService.createShiftUpdateTicket({
                        assignmentId: assignment.id,
                        shiftDate: assignment.shiftDate,
                        reason: form.reason,
                        priority: form.priority,
                        managerId: assignment.shift?.manager?.id || null
                    });
                    break;
                case 'SHIFT_SWAP':
                    if (!form.targetUserId) {
                        setError('Vui lòng chọn nhân viên muốn đổi ca với');
                        return;
                    }
                    result = await shiftTicketService.createShiftSwapTicket({
                        assignmentId: assignment.id,
                        fromDate: assignment.shiftDate,
                        toDate: form.targetDate,
                        reason: form.reason,
                        targetUserId: form.targetUserId
                    });
                    break;
                default:
                    throw new Error('Invalid ticket type');
            }

            alert('Ticket created successfully. Ticket Code: ' + result.ticketCode);
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi tạo ticket: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const getTitleByType = () => {
        const titles = {
            SHIFT_CANCEL: 'Request to Cancel Shift',
            SHIFT_UPDATE: 'Request to Update Shift',
            SHIFT_SWAP: 'Request to Swap Shift'
        };
        return titles[ticketType] || 'Create Shift Ticket';
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-200 sticky top-0 bg-white">
                    <h2 className="text-xl font-semibold text-slate-900">{getTitleByType()}</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Shift Info */}
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-indigo-900">Shift Date:</p>
                        <p className="text-lg font-semibold text-indigo-600">
                            {assignment.shiftDate}
                        </p>
                    </div>

                    {/* Shift Swap - Select Target User */}
                    {ticketType === 'SHIFT_SWAP' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Target Shift Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={form.targetDate || ''}
                                    onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Select Employee to Swap With <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter employee name or ID"
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Note: The other employee will receive a notification to approve the swap
                                </p>
                            </div>
                        </>
                    )}

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                        <select
                            value={form.priority}
                            onChange={(e) => setForm({ ...form, priority: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="LOW">Low</option>
                            <option value="NORMAL">Normal</option>
                            <option value="HIGH">High</option>
                            <option value="URGENT">Urgent</option>
                        </select>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={form.reason}
                            onChange={(e) => setForm({ ...form, reason: e.target.value })}
                            placeholder="Explain your reason for this request..."
                            rows="4"
                            maxLength={500}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            {form.reason.length}/500 characters
                        </p>
                    </div>

                    {/* Help text */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-900">
                            {ticketType === 'SHIFT_CANCEL' && 'Your manager will review and approve/reject your cancellation request.'}
                            {ticketType === 'SHIFT_UPDATE' && 'Your manager will review and approve/reject your update request.'}
                            {ticketType === 'SHIFT_SWAP' && 'The other employee will receive a notification. Auto-approved when both accept!'}
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50"
                        >
                            <Send size={18} />
                            {loading ? 'Sending...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShiftTicketRequestModal;
