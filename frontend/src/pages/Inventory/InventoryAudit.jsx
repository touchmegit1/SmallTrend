import React from "react";
import { Upload, Search, FileText } from "lucide-react";
import { useInventoryAudit } from "../../hooks/useInventoryAudit";
import AuditTable from "../../components/inventory/AuditTable";
import AuditSidebar from "../../components/inventory/AuditSidebar";

function InventoryAudit() {
  const {
    loading,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    filteredItems,
    handleActualStockChange,
    stats,
  } = useInventoryAudit();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Kiểm kho</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm hàng hóa theo mã hoặc tên"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-80 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border-b border-gray-200 px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("all")}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === "all" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"}`}
            >
              Tất cả ({stats.allCount})
            </button>
            <button
              onClick={() => setActiveTab("match")}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === "match" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"}`}
            >
              Khớp ({stats.matchCount})
            </button>
            <button
              onClick={() => setActiveTab("mismatch")}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === "mismatch" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"}`}
            >
              Lệch ({stats.mismatchCount})
            </button>
            <button
              onClick={() => setActiveTab("unchecked")}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === "unchecked" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"}`}
            >
              Chưa kiểm ({stats.uncheckedCount})
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <FileText className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Thêm sản phẩm từ file excel</h3>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Chọn file dữ liệu
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">STT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên hàng</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-24">ĐVT</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">Tồn kho</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">Thực tế</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">SL lệch</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-40">Giá trị lệch</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AuditTable items={filteredItems} onActualStockChange={handleActualStockChange} />
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AuditSidebar totalActualStock={stats.totalActualStock} uncheckedCount={stats.uncheckedCount} />
    </div>
  );
}

export default InventoryAudit;
