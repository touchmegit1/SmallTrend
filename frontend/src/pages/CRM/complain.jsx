import React, { useState } from 'react';
import { Package, CheckCircle, FileText, Calendar, User, ShoppingBag, RotateCcw } from 'lucide-react';

export default function CustomerComplaintSystem() {
  const [activeTab, setActiveTab] = useState('manager'); // 'manager' or 'system'
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnData, setReturnData] = useState({
    productId: '',
    productName: '',
    quantity: 1,
    reason: '',
    condition: 'damaged'
  });

  // Completed complaints only (handled offline by cashier)
  const [complaints, setComplaints] = useState([
    {
      id: 'COMP-001',
      customerId: 'CUST-4521',
      customerName: 'Nguyễn Văn An',
      product: 'Tai nghe không dây Pro',
      productId: 'PROD-8821',
      issue: 'Sản phẩm không hoạt động',
      completedDate: '2026-02-03',
      completedBy: 'Thu ngân 01',
      quantity: 1,
      restocked: true,
      refundAmount: '450,000 đ'
    },
    {
      id: 'COMP-002',
      customerId: 'CUST-3312',
      customerName: 'Trần Thị Bình',
      product: 'Đồng hồ thông minh Series 5',
      productId: 'PROD-6634',
      issue: 'Nhận sai màu',
      completedDate: '2026-02-02',
      completedBy: 'Thu ngân 02',
      quantity: 1,
      restocked: true,
      refundAmount: '1,200,000 đ'
    },
    {
      id: 'COMP-003',
      customerId: 'CUST-7789',
      customerName: 'Lê Hoàng Minh',
      product: 'Loa Bluetooth Mini',
      productId: 'PROD-4423',
      issue: 'Pin hết quá nhanh',
      completedDate: '2026-02-01',
      completedBy: 'Thu ngân 01',
      quantity: 2,
      restocked: true,
      refundAmount: '800,000 đ'
    },
    {
      id: 'COMP-004',
      customerId: 'CUST-9921',
      customerName: 'Phạm Thị Lan',
      product: 'Cáp USB-C 2m',
      productId: 'PROD-2211',
      issue: 'Hàng bị hỏng khi nhận',
      completedDate: '2026-01-31',
      completedBy: 'Thu ngân 03',
      quantity: 3,
      restocked: true,
      refundAmount: '180,000 đ'
    },
    {
      id: 'COMP-005',
      customerId: 'CUST-5543',
      customerName: 'Đỗ Văn Cường',
      product: 'Ốp lưng iPhone 15',
      productId: 'PROD-7788',
      issue: 'Không vừa máy',
      completedDate: '2026-01-30',
      completedBy: 'Thu ngân 02',
      quantity: 1,
      restocked: true,
      refundAmount: '150,000 đ'
    }
  ]);

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    
    const newComplaint = {
      id: `COMP-${String(complaints.length + 1).padStart(3, '0')}`,
      customerId: `CUST-${Math.floor(Math.random() * 9999)}`,
      customerName: 'Khách hàng mới',
      product: returnData.productName,
      productId: returnData.productId,
      issue: returnData.reason,
      completedDate: new Date().toISOString().split('T')[0],
      completedBy: 'Hệ thống',
      quantity: parseInt(returnData.quantity),
      restocked: false,
      refundAmount: '0 đ'
    };

    setComplaints([newComplaint, ...complaints]);
    setShowReturnModal(false);
    setReturnData({
      productId: '',
      productName: '',
      quantity: 1,
      reason: '',
      condition: 'damaged'
    });
  };

  const handleAutoRestock = (complaint) => {
    const updatedComplaints = complaints.map(c => {
      if (c.id === complaint.id) {
        return { ...c, restocked: true };
      }
      return c;
    });
    setComplaints(updatedComplaints);
  };

  const stats = {
    total: complaints.length,
    restocked: complaints.filter(c => c.restocked).length,
    pending: complaints.filter(c => !c.restocked).length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        * {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
        }
      `}</style>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Khiếu nại</h1>
              <p className="text-sm text-gray-500 mt-1">Quản lý khiếu nại khách hàng</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('manager')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'manager'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Quản lý
              </button>
              <button
                onClick={() => setActiveTab('system')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'system'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Hệ thống
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng khiếu nại</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Đã nhập kho</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.restocked}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Chờ nhập kho</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Package className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {activeTab === 'manager' ? (
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Danh sách khiếu nại đã xử lý</h2>
              <p className="text-sm text-gray-500 mt-1">Thu ngân đã xử lý offline tại quầy</p>
            </div>

            <div className="divide-y divide-gray-200">
              {complaints.map((complaint) => (
                <div key={complaint.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <RotateCcw className="text-indigo-600" size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{complaint.id}</h3>
                        <p className="text-xs text-gray-500">{complaint.completedDate}</p>
                      </div>
                    </div>
                    {complaint.restocked && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        <CheckCircle size={14} />
                        Đã nhập kho
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <User size={14} />
                        <span>Khách hàng</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{complaint.customerName}</p>
                      <p className="text-xs text-gray-500">{complaint.customerId}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <ShoppingBag size={14} />
                        <span>Sản phẩm</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{complaint.product}</p>
                      <p className="text-xs text-gray-500">{complaint.productId}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Lý do khiếu nại</p>
                    <p className="text-sm text-gray-700">{complaint.issue}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Số lượng: <span className="font-medium text-gray-900">{complaint.quantity}</span></span>
                      <span>Hoàn tiền: <span className="font-medium text-gray-900">{complaint.refundAmount}</span></span>
                      <span>Thu ngân: <span className="font-medium text-gray-900">{complaint.completedBy}</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Quản lý nhập kho hàng trả</h2>
                  <p className="text-sm text-gray-500 mt-1">Tự động nhập kho sản phẩm trả lại</p>
                </div>
                <button
                  onClick={() => setShowReturnModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  + Đăng ký hàng trả
                </button>
              </div>

              <div className="divide-y divide-gray-200">
                {complaints.map((complaint) => (
                  <div key={complaint.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="text-gray-600" size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">{complaint.product}</h3>
                          <p className="text-xs text-gray-500">{complaint.productId}</p>
                        </div>
                      </div>
                      {complaint.restocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          <CheckCircle size={14} />
                          Đã nhập kho
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                          <Calendar size={14} />
                          Chờ nhập kho
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Mã khiếu nại</p>
                        <p className="text-sm font-medium text-gray-900">{complaint.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Số lượng</p>
                        <p className="text-sm font-medium text-gray-900">{complaint.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Ngày xử lý</p>
                        <p className="text-sm font-medium text-gray-900">{complaint.completedDate}</p>
                      </div>
                    </div>

                    {!complaint.restocked && (
                      <button
                        onClick={() => handleAutoRestock(complaint)}
                        className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Tự động nhập kho
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Đăng ký hàng trả lại</h3>

            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã sản phẩm
                </label>
                <input
                  type="text"
                  required
                  value={returnData.productId}
                  onChange={(e) => setReturnData({...returnData, productId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="VD: PROD-1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  required
                  value={returnData.productName}
                  onChange={(e) => setReturnData({...returnData, productName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="VD: Chuột không dây"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số lượng
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={returnData.quantity}
                  onChange={(e) => setReturnData({...returnData, quantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tình trạng hàng
                </label>
                <select
                  value={returnData.condition}
                  onChange={(e) => setReturnData({...returnData, condition: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="damaged">Hư hỏng</option>
                  <option value="defective">Lỗi sản xuất</option>
                  <option value="unopened">Chưa mở hộp</option>
                  <option value="used">Đã sử dụng</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lý do trả hàng
                </label>
                <textarea
                  required
                  value={returnData.reason}
                  onChange={(e) => setReturnData({...returnData, reason: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Mô tả lý do trả hàng..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Đăng ký
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}