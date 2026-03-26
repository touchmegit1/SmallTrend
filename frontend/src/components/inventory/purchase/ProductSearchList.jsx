import React from "react";
import PropTypes from "prop-types";
import { Plus } from "lucide-react";
import { resolveInventoryImageUrl } from "../../../utils/inventory";

function ProductSearchList({ products = [], searchQuery = "", onAddProduct }) {
  if (!searchQuery) return null;

  const normalizedQuery = searchQuery.toLowerCase();
  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(normalizedQuery) ||
      p.sku?.toLowerCase().includes(normalizedQuery),
  );

  const formatPurchasePrice = (price) => Number(price ?? 0).toLocaleString("vi-VN");

  const handleAddProduct = (product) => onAddProduct(product);

  return (
    <div className="bg-white border-t-2 border-slate-300">
      <div className="px-6 py-3 bg-slate-100 border-b">
        <h3 className="text-sm font-semibold text-slate-700">Sản phẩm có sẵn</h3>
      </div>
      <div className="max-h-64 overflow-auto">
        {filteredProducts.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => handleAddProduct(product)}
            className="w-full px-6 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-100 flex items-center justify-between text-left"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                  {product.image_url ? (
                    <img
                      src={resolveInventoryImageUrl(product.image_url)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
                <span className="text-sm font-mono text-blue-600">{product.sku}</span>
                <div>
                  <span className="text-sm text-slate-900">{product.name}</span>
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
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500">{product.unit}</span>
              <span className="text-sm font-semibold text-slate-900">{formatPurchasePrice(product.purchase_price)}đ</span>
              <Plus className="w-4 h-4 text-blue-600" />
            </div>
          </button>
        ))}
        {filteredProducts.length === 0 && (
          <div className="px-6 py-8 text-center text-slate-500 text-sm">Không tìm thấy sản phẩm</div>
        )}
      </div>
    </div>
  );
}

ProductSearchList.propTypes = {
  products: PropTypes.array,
  searchQuery: PropTypes.string,
  onAddProduct: PropTypes.func.isRequired,
};

ProductSearchList.defaultProps = {
  products: [],
  searchQuery: "",
};

export default ProductSearchList;

