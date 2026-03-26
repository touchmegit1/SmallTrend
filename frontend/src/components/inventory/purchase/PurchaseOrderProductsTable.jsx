import React from "react";
import { Search } from "lucide-react";
import { resolveInventoryImageUrl } from "../../../utils/inventory";

function PurchaseOrderProductsTable({ currentProducts, onUpdateQuantity }) {
  if (currentProducts.length === 0) {
    return (
      <tr>
        <td colSpan="8" className="px-4 py-12 text-center">
          <div className="flex flex-col items-center justify-center">
            <Search className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">
              Chưa có sản phẩm nào trong phiếu nhập
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Tìm kiếm và click vào sản phẩm bên dưới để thêm
            </p>
          </div>
        </td>
      </tr>
    );
  }

  return currentProducts.map((product, index) => (
    <tr key={product.id} className="hover:bg-slate-50">
      <td className="px-4 py-3 text-sm">{index + 1}</td>
      <td className="px-4 py-3 text-sm font-mono text-blue-600">
        {product.sku}
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden shrink-0">
            {product.image_url ? (
              <img
                src={resolveInventoryImageUrl(product.image_url)}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
          <div>
            <span>{product.name}</span>
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {Object.entries(product.attributes).map(([key, value]) => (
                  <span key={key} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                    {key}: {value}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm">{product.unit}</td>
      <td className="px-4 py-3 text-sm text-right">
        <input
          type="number"
          value={product.quantity}
          onChange={(e) => onUpdateQuantity(product.id, e.target.value)}
          className="w-20 px-2 py-1 border border-slate-300 rounded text-right"
          min="1"
        />
      </td>
      <td className="px-4 py-3 text-sm text-right">
        {Number(product.unit_cost ?? 0).toLocaleString("vi-VN")}
      </td>
      <td className="px-4 py-3 text-sm text-right">0</td>
      <td className="px-4 py-3 text-sm text-right font-semibold">
        {Number(product.total_cost ?? 0).toLocaleString("vi-VN")}
      </td>
    </tr>
  ));
}

export default PurchaseOrderProductsTable;

