import React from "react";
import PropTypes from "prop-types";

function LowStockTable(props) {
  const products = props.products ?? [];
  const lowStockProducts = products.filter((p) => (p.stock_quantity ?? 0) < 100);

  if (lowStockProducts.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-slate-200 mt-6">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Sản phẩm sắp hết hàng</h2>
        <span className="text-sm text-orange-600 font-medium">{lowStockProducts.length} sản phẩm</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Mã hàng</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tên hàng</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Tồn kho</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {lowStockProducts.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-900">{product.sku}</td>
                <td className="px-4 py-3 text-sm text-slate-900">{product.name}</td>
                <td className="px-4 py-3 text-sm text-right">
                  <span className="text-orange-600 font-semibold">{product.stock_quantity ?? 0}</span>
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
  );
}

LowStockTable.propTypes = {
  products: PropTypes.arrayOf(PropTypes.object),
};

export default LowStockTable;

