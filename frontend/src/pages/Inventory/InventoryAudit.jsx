import React, { useState, useEffect } from "react";
import { Upload, Save, CheckCircle, FileText, Search } from "lucide-react";
import { getProducts } from "../../services/inventoryService";

function InventoryAudit() {
  const [products, setProducts] = useState([]);
  const [auditItems, setAuditItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsData = await getProducts();
        setProducts(productsData);
        
        const items = productsData.map((p, index) => ({
          id: p.id,
          stt: index + 1,
          code: p.sku,
          name: p.name,
          unit: p.unit,
          systemStock: p.stock_quantity || 0,
          actualStock: null,
          difference: 0,
          valueDifference: 0,
          price: p.purchase_price,
        }));
        setAuditItems(items);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleActualStockChange = (id, value) => {
    setAuditItems((items) =>
      items.map((item) => {
        if (item.id === id) {
          const actualStock = parseInt(value) || 0;
          const difference = actualStock - item.systemStock;
          const valueDifference = difference * item.price;
          return { ...item, actualStock, difference, valueDifference };
        }
        return item;
      })
    );
  };

  const getFilteredItems = () => {
    let filtered = auditItems;
    if (activeTab === "match") {
      filtered = filtered.filter((item) => item.actualStock !== null && item.difference === 0);
    } else if (activeTab === "mismatch") {
      filtered = filtered.filter((item) => item.actualStock !== null && item.difference !== 0);
    } else if (activeTab === "unchecked") {
      filtered = filtered.filter((item) => item.actualStock === null);
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  const filteredItems = getFilteredItems();
  const allCount = auditItems.length;
  const matchCount = auditItems.filter((item) => item.actualStock !== null && item.difference === 0).length;
  const mismatchCount = auditItems.filter((item) => item.actualStock !== null && item.difference !== 0).length;
  const uncheckedCount = auditItems.filter((item) => item.actualStock === null).length;
  const totalActualStock = auditItems.reduce((sum, item) => sum + (item.actualStock || 0), 0);

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
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "all" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"
              }`}
            >
              Tất cả ({allCount})
            </button>
            <button
              onClick={() => setActiveTab("match")}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "match" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"
              }`}
            >
              Khớp ({matchCount})
            </button>
            <button
              onClick={() => setActiveTab("mismatch")}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "mismatch" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"
              }`}
            >
              Lệch ({mismatchCount})
            </button>
            <button
              onClick={() => setActiveTab("unchecked")}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "unchecked" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"
              }`}
            >
              Chưa kiểm ({uncheckedCount})
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
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.stt}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{item.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center">{item.unit}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.systemStock}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      <input
                        type="number"
                        value={item.actualStock === null ? "" : item.actualStock}
                        onChange={(e) => handleActualStockChange(item.id, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={`font-medium ${item.difference > 0 ? "text-green-600" : item.difference < 0 ? "text-red-600" : "text-gray-900"}`}>
                        {item.actualStock !== null ? item.difference : "---"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={`font-medium ${item.valueDifference > 0 ? "text-green-600" : item.valueDifference < 0 ? "text-red-600" : "text-gray-900"}`}>
                        {item.actualStock !== null ? item.valueDifference.toLocaleString() : "---"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

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
    </div>
  );
}

export default InventoryAudit;
