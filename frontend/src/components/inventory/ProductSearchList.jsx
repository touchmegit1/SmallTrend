import React from "react";
import { Plus } from "lucide-react";

function ProductSearchList({ products, searchQuery, onAddProduct }) {
  if (!searchQuery) return null;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white border-t-2 border-gray-300">
      <div className="px-6 py-3 bg-gray-100 border-b">
        <h3 className="text-sm font-semibold text-gray-700">Sản phẩm có sẵn</h3>
      </div>
      <div className="max-h-64 overflow-auto">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => onAddProduct(product)}
            className="px-6 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 flex items-center justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-blue-600">{product.sku}</span>
                <span className="text-sm text-gray-900">{product.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">{product.unit}</span>
              <span className="text-sm font-semibold text-gray-900">{product.purchase_price.toLocaleString()}đ</span>
              <Plus className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500 text-sm">Không tìm thấy sản phẩm</div>
        )}
      </div>
    </div>
  );
}

export default ProductSearchList;
