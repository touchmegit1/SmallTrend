import React, { useState, useEffect } from "react";
import { Package, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import {
  getProducts,
  getStockMovements,
  getPurchaseOrders,
} from "../../services/inventoryService";

function InventoryDashboard() {
  const [products, setProducts] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, movementsData] = await Promise.all([
          getProducts(),
          getStockMovements(),
        ]);
        setProducts(productsData);
        setStockMovements(movementsData);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalValue = products.reduce(
    (sum, p) => sum + (p.stock_quantity || 0) * p.purchase_price,
    0
  );
  const totalProducts = products.reduce(
    (sum, p) => sum + (p.stock_quantity || 0),
    0
  );
  const lowStockCount = products.filter(
    (p) => (p.stock_quantity || 0) < 100
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Tổng quan kho hàng
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Theo dõi tồn kho và hoạt động nhập xuất
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Tổng giá trị</span>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-semibold text-gray-900">
            {totalValue.toLocaleString()}đ
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {products.length} loại sản phẩm
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Tổng số lượng</span>
            <Package className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-semibold text-gray-900">
            {totalProducts.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">Sản phẩm trong kho</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Sắp hết hàng</span>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-semibold text-gray-900">
            {lowStockCount}
          </div>
          <div className="text-xs text-gray-500 mt-1">Dưới 100 sản phẩm</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Hoạt động</span>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-semibold text-gray-900">
            {stockMovements.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">Giao dịch gần đây</div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Danh sách sản phẩm
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mã hàng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tên hàng
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Giá bán
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Giá vốn
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Tồn kho
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Đơn vị
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {product.sku}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {product.retail_price?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {product.purchase_price?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        (product.stock_quantity || 0) < 100
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {product.stock_quantity || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {product.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg border border-gray-200 mt-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Hoạt động gần đây
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mã GD
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Loại
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Số lượng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Thời gian
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stockMovements.slice(0, 10).map((movement) => (
                <tr key={movement.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">
                    {movement.type}-{String(movement.id).padStart(3, "0")}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        movement.type === "IN"
                          ? "bg-green-100 text-green-800"
                          : movement.type === "OUT"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {movement.type === "IN"
                        ? "Nhập"
                        : movement.type === "OUT"
                        ? "Xuất"
                        : "Chuyển"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {movement.quantity}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(movement.created_at).toLocaleString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default InventoryDashboard;
