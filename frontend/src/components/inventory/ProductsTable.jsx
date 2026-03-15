import React from "react";

const getStockBadgeClass = (stockQuantity) =>
  stockQuantity < 100 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800";

function ProductsTable({ products }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">Danh sách sản phẩm</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Mã hàng</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tên hàng</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Giá bán</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Giá vốn</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Tồn kho</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Đơn vị</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-900">{product.sku}</td>
                <td className="px-4 py-3 text-sm text-slate-900">{product.name}</td>
                <td className="px-4 py-3 text-sm text-slate-900 text-right">
                  {Number(product.retail_price ?? 0).toLocaleString("vi-VN")}
                </td>
                <td className="px-4 py-3 text-sm text-slate-900 text-right">
                  {Number(product.purchase_price ?? 0).toLocaleString("vi-VN")}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getStockBadgeClass(product.stock_quantity ?? 0)}`}
                  >
                    {product.stock_quantity ?? 0}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{product.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductsTable;

