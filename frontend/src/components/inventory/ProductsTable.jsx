import React from "react";

function ProductsTable({ products }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Danh sách sản phẩm</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã hàng</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên hàng</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Giá bán</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Giá vốn</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tồn kho</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đơn vị</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{product.sku}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{product.name}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">{product.retail_price?.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">{product.purchase_price?.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${(product.stock_quantity || 0) < 100 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                    {product.stock_quantity || 0}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{product.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductsTable;
