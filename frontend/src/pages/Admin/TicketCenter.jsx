import React from 'react';

/**
 * Ticket Center Page - Admin ticket management
 * TODO: Implement full ticket center functionality
 */
const TicketCenter = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Ticket Center
        </h1>
        <p className="text-gray-600 mb-6">
          Quản lý tickets và hỗ trợ khách hàng
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <svg 
            className="mx-auto h-16 w-16 text-blue-400 mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <h2 className="text-xl font-semibold text-blue-900 mb-2">
            Tính năng đang phát triển
          </h2>
          <p className="text-blue-700">
            Trang quản lý ticket sẽ được hoàn thiện trong phiên bản tiếp theo
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Tickets Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">-</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Tickets In Progress</h3>
            <p className="text-3xl font-bold text-blue-600">-</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Tickets Resolved</h3>
            <p className="text-3xl font-bold text-green-600">-</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketCenter;
