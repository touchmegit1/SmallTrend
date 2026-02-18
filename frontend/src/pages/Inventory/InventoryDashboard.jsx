import React, { useState, useEffect } from "react";
import { Package, TrendingUp, AlertTriangle, DollarSign, AlertCircle, Clock } from "lucide-react";
import {
  getProducts,
  getStockMovements,
  getProductBatches,
} from "../../services/inventoryService";

function InventoryDashboard() {
  const [products, setProducts] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, movementsData, batchesData] = await Promise.all([
          getProducts(),
          getStockMovements(),
          getProductBatches(),
        ]);
        setProducts(productsData);
        setStockMovements(movementsData);
        setBatches(batchesData);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalProducts = products.reduce(
    (sum, p) => sum + (p.stock_quantity || 0),
    0
  );
  const lowStockCount = products.filter(
    (p) => (p.stock_quantity || 0) < 100
  ).length;

  const expiringBatches = batches.filter((batch) => {
    if (!batch.expiry_date) return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(batch.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  });

  const expiredBatches = batches.filter((batch) => {
    if (!batch.expiry_date) return false;
    return new Date(batch.expiry_date) < new Date();
  });

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
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Sắp hết hạn</span>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-2xl font-semibold text-gray-900">
            {expiringBatches.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">Trong 30 ngày tới</div>
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

      {/* Low Stock Products */}
      {lowStockCount > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 mt-6">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Sản phẩm sắp hết hàng</h2>
            <span className="text-sm text-orange-600 font-medium">{lowStockCount} sản phẩm</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên hàng</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tồn kho</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.filter((p) => (p.stock_quantity || 0) < 100).map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{product.sku}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className="text-orange-600 font-semibold">{product.stock_quantity || 0}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-orange-100 text-orange-800">Cần nhập thêm</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expiring Batches */}
      {(expiringBatches.length > 0 || expiredBatches.length > 0) && (
        <div className="bg-white rounded-lg border border-gray-200 mt-6">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Cảnh báo hạn sử dụng</h2>
            <span className="text-sm text-red-600 font-medium">{expiringBatches.length + expiredBatches.length} lô hàng</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã lô</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hạn sử dụng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...expiredBatches, ...expiringBatches].map((batch) => {
                  const product = products.find((p) => p.id === batch.product_id);
                  const daysUntilExpiry = Math.ceil((new Date(batch.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
                  const isExpired = daysUntilExpiry < 0;
                  return (
                    <tr key={batch.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">{batch.batch_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{product?.name || "N/A"}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{batch.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{new Date(batch.expiry_date).toLocaleDateString("vi-VN")}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${isExpired ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {isExpired ? "Đã hết hạn" : `Còn ${daysUntilExpiry} ngày`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
