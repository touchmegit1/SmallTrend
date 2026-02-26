import React from "react";
import { Save, Eye, Printer, Grid, Check } from "lucide-react";

function ImportSidebar({ importForm, setImportForm, currentProducts, totalAmount, onSave, saving }) {
  return (
    <div className="w-[400px] bg-white border-l border-gray-200 flex flex-col">
      <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Mã phiếu nhập</span>
            <input
              type="text"
              value={importForm.po_number}
              disabled
              className="text-right font-semibold text-gray-900 bg-transparent border-none focus:outline-none w-32"
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Trạng thái</span>
            <select className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 border-none">
              <option>Phiếu tạm</option>
              <option>Đã nhập hàng</option>
            </select>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Tổng tiền hàng</span>
            <span className="font-semibold text-gray-900">{currentProducts.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Giảm giá</span>
            <input
              type="number"
              defaultValue="0"
              className="text-right font-semibold text-gray-900 bg-transparent border-none focus:outline-none w-20"
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Cần trả nhà cung cấp</span>
            <span className="font-semibold text-blue-600">{totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Nhà cung cấp</label>
          <input
            type="text"
            value={importForm.supplier_name}
            onChange={(e) => setImportForm({ ...importForm, supplier_name: e.target.value })}
            placeholder="Nhập tên nhà cung cấp"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
          <textarea
            value={importForm.notes}
            onChange={(e) => setImportForm({ ...importForm, notes: e.target.value })}
            placeholder="Ghi chú"
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2 mb-3">
          <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm">
            <Save className="w-4 h-4" />
            Lưu tạm
          </button>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Printer className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Grid className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <button
          onClick={onSave}
          disabled={saving || !importForm.supplier_name || currentProducts.length === 0}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="w-5 h-5" />
          {saving ? "Đang lưu..." : "Hoàn thành"}
        </button>
      </div>
    </div>
  );
}

export default ImportSidebar;
