import React from "react";
import { Search } from "lucide-react";

function ImportProductsTable({ currentProducts, onUpdateQuantity }) {
  if (currentProducts.length === 0) {
    return (
      <tr>
        <td colSpan="8" className="px-4 py-12 text-center">
          <div className="flex flex-col items-center justify-center">
            <Search className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">Chưa có sản phẩm nào trong phiếu nhập</p>
            <p className="text-gray-400 text-xs mt-1">Tìm kiếm và click vào sản phẩm bên dưới để thêm</p>
          </div>
        </td>
      </tr>
    );
  }

  return currentProducts.map((product, index) => (
    <tr key={product.id} className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm">{index + 1}</td>
      <td className="px-4 py-3 text-sm font-mono text-blue-600">{product.sku}</td>
      <td className="px-4 py-3 text-sm">{product.name}</td>
      <td className="px-4 py-3 text-sm">{product.unit}</td>
      <td className="px-4 py-3 text-sm text-right">
        <input
          type="number"
          value={product.quantity}
          onChange={(e) => onUpdateQuantity(product.id, e.target.value)}
          className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
          min="1"
        />
      </td>
      <td className="px-4 py-3 text-sm text-right">{product.unit_cost.toLocaleString()}</td>
      <td className="px-4 py-3 text-sm text-right">0</td>
      <td className="px-4 py-3 text-sm text-right font-semibold">{product.total_cost.toLocaleString()}</td>
    </tr>
  ));
}

export default ImportProductsTable;
