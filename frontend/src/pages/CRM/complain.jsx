import React, { useState } from 'react';
import {
  CheckCircle,
  FileText,
  User,
  ShoppingBag,
  RotateCcw,
  Plus
} from 'lucide-react';

const PAGE_SIZE = 3;

export default function CustomerComplaintSystem() {
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
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);

  const [form, setForm] = useState({
    customerId: '',
    customerName: '',
    product: '',
    productId: '',
    issue: '',
    quantity: 1,
    refundAmount: '',
    completedBy: ''
  });

  const totalPages = Math.ceil(complaints.length / PAGE_SIZE);
  const pagedComplaints = complaints.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const stats = {
    total: complaints.length,
    restocked: complaints.filter(c => c.restocked).length
  };

  const handleCreate = () => {
    setComplaints([
      {
        id: `COMP-${String(complaints.length + 1).padStart(3, '0')}`,
        completedDate: new Date().toISOString().slice(0, 10),
        restocked: true,
        ...form
      },
      ...complaints
    ]);
    setShowModal(false);
    setPage(1);
    setForm({
      customerId: '',
      customerName: '',
      product: '',
      productId: '',
      issue: '',
      quantity: 1,
      refundAmount: '',
      completedBy: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Quản lý khiếu nại
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Danh sách khiếu nại đã xử lý tại quầy
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            <Plus size={16} />
            Tạo đơn khiếu nại
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng khiếu nại</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {stats.total}
                </p>
              </div>
              <FileText className="text-blue-600" size={28} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Đã nhập kho</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {stats.restocked}
                </p>
              </div>
              <CheckCircle className="text-green-600" size={28} />
            </div>
          </div>
        </div>

        {/* Complaint List */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="divide-y divide-gray-200">
            {pagedComplaints.map(c => (
              <div key={c.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <RotateCcw className="text-indigo-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{c.id}</p>
                      <p className="text-xs text-gray-500">{c.completedDate}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    <CheckCircle size={14} />
                    Đã nhập kho
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <User size={14} /> Khách hàng
                    </p>
                    <p className="text-sm font-medium">{c.customerName}</p>
                    <p className="text-xs text-gray-500">{c.customerId}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <ShoppingBag size={14} /> Sản phẩm
                    </p>
                    <p className="text-sm font-medium">{c.product}</p>
                    <p className="text-xs text-gray-500">{c.productId}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-500">Lý do khiếu nại</p>
                  <p className="text-sm text-gray-700">{c.issue}</p>
                </div>

                <div className="flex gap-6 text-xs text-gray-500 border-t pt-3">
                  <span>Số lượng: <b>{c.quantity}</b></span>
                  <span>Hoàn tiền: <b>{c.refundAmount}</b></span>
                  <span>Thu ngân: <b>{c.completedBy}</b></span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center px-6 py-3 border-t text-sm">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page {page} / {totalPages || 1}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white w-[420px] rounded-lg p-5 space-y-2">
            <h3 className="font-semibold text-lg">Tạo đơn khiếu nại</h3>

            {Object.keys(form).map(key => (
              <input
                key={key}
                placeholder={key}
                value={form[key]}
                onChange={e =>
                  setForm({ ...form, [key]: e.target.value })
                }
                className="w-full border px-3 py-2 rounded text-sm"
              />
            ))}

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm border rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
