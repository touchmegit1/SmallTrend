import React from "react";
import { Save, CheckCircle } from "lucide-react";

function AuditSidebar({ totalActualStock, uncheckedCount }) {
  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mã kiểm kho</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Trạng thái</span>
            <span className="text-gray-900">Phiếu tạm</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tổng SL thực tế</span>
            <span className="text-gray-900 font-semibold">{totalActualStock}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
        <textarea
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập ghi chú..."
        />
      </div>

      <div className="mt-auto p-6 border-t border-gray-200">
        <div className="flex gap-3">
          <button className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
            <Save className="w-5 h-5" />
            Lưu tạm
          </button>
          <button
            onClick={() => {
              if (uncheckedCount > 0) {
                alert(`Còn ${uncheckedCount} sản phẩm chưa kiểm!`);
              } else {
                alert("Hoàn thành kiểm kho!");
              }
            }}
            className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Hoàn thành
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuditSidebar;
