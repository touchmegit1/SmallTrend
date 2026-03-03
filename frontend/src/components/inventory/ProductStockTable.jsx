import React, { useState } from "react";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Plus,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import {
  formatCurrency,
  formatNumber,
  STOCK_STATUS_CONFIG,
} from "../../utils/inventory";

function SortIcon({ columnKey, sortConfig }) {
  if (sortConfig.key !== columnKey)
    return <ChevronsUpDown size={14} className="text-slate-300 ml-1" />;
  return sortConfig.direction === "asc" ? (
    <ChevronUp size={14} className="text-indigo-600 ml-1" />
  ) : (
    <ChevronDown size={14} className="text-indigo-600 ml-1" />
  );
}

export default function ProductStockTable({
  products,
  categories,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  stockFilter,
  setStockFilter,
  sortConfig,
  handleSort,
}) {
  const [expandedRow, setExpandedRow] = useState(null);

  const stockFilterOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "OUT_OF_STOCK", label: "Hết hàng" },
    { value: "CRITICAL", label: "Nguy hiểm" },
    { value: "LOW", label: "Sắp hết" },
    { value: "ADEQUATE", label: "Đủ hàng" },
    { value: "HEALTHY", label: "Dồi dào" },
  ];

  const columns = [
    { key: "sku", label: "Mã SKU", align: "left", sortable: true },
    { key: "name", label: "Sản phẩm", align: "left", sortable: true },
    { key: "categoryName", label: "Danh mục", align: "left", sortable: true },
    { key: "stock_quantity", label: "Tồn kho", align: "right", sortable: true },
    { key: "min_stock", label: "Tối thiểu", align: "right", sortable: true },
    { key: "retail_price", label: "Giá bán", align: "right", sortable: true },
    {
      key: "inventoryValue",
      label: "Giá trị kho",
      align: "right",
      sortable: true,
    },
    {
      key: "stockStatus",
      label: "Trạng thái",
      align: "center",
      sortable: false,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* ─── Toolbar ─────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, SKU, danh mục..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {stockFilterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ─── Table ───────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap ${
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                        ? "text-center"
                        : "text-left"
                  } ${col.sortable ? "cursor-pointer select-none hover:text-indigo-600 transition-colors" : ""}`}
                >
                  <span className="inline-flex items-center">
                    {col.label}
                    {col.sortable && (
                      <SortIcon columnKey={col.key} sortConfig={sortConfig} />
                    )}
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-16 text-center"
                >
                  <div className="flex flex-col items-center">
                    <Search size={40} className="text-slate-200 mb-3" />
                    <p className="text-slate-500 font-medium">
                      Không tìm thấy sản phẩm
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const statusCfg = STOCK_STATUS_CONFIG[product.stockStatus];
                const isExpanded = expandedRow === product.id;
                const stockPercent = product.min_stock
                  ? Math.min(
                      100,
                      Math.round(
                        ((product.stock_quantity || 0) / product.min_stock) *
                          100,
                      ),
                    )
                  : 100;

                return (
                  <React.Fragment key={product.id}>
                    <tr
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() =>
                        setExpandedRow(isExpanded ? null : product.id)
                      }
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {product.sku}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900 truncate max-w-[200px]">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {product.brandName}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {product.categoryName}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-semibold text-slate-900">
                            {formatNumber(product.stock_quantity || 0)}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase">
                            {product.unit}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">
                        {formatNumber(product.min_stock || 50)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700 font-medium">
                        {formatCurrency(product.retail_price)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700">
                        {formatCurrency(product.inventoryValue)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${statusCfg.badgeBg} ${statusCfg.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}
                          ></span>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="p-1 rounded-md hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal
                            size={16}
                            className="text-slate-400"
                          />
                        </button>
                      </td>
                    </tr>
                    {/* Expanded Row */}
                    {isExpanded && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={columns.length + 1} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Stock Bar */}
                            <div>
                              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">
                                Mức tồn kho
                              </p>
                              <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    stockPercent < 50
                                      ? "bg-red-500"
                                      : stockPercent < 100
                                        ? "bg-amber-500"
                                        : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${stockPercent}%` }}
                                ></div>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                {stockPercent}% so với mức tối thiểu (
                                {product.min_stock || 50})
                              </p>
                            </div>
                            {/* Batch Info */}
                            <div>
                              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">
                                Lô hàng ({product.productBatches.length})
                              </p>
                              {product.productBatches.length > 0 ? (
                                <div className="space-y-1">
                                  {product.productBatches.map((b) => (
                                    <div
                                      key={b.id}
                                      className="flex items-center justify-between text-xs"
                                    >
                                      <span className="font-mono text-slate-600">
                                        {b.batch_code}
                                      </span>
                                      <span className="text-slate-500">
                                        SL: {b.quantity} ·{" "}
                                        {b.expiry_date
                                          ? new Date(
                                              b.expiry_date,
                                            ).toLocaleDateString("vi-VN")
                                          : "Không HSD"}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400">
                                  Chưa có lô hàng
                                </p>
                              )}
                            </div>
                            {/* Quick Actions */}
                            <div>
                              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">
                                Thao tác nhanh
                              </p>
                              <div className="flex gap-2 flex-wrap">
                                <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition">
                                  <Plus size={12} /> Nhập thêm
                                </button>
                                <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition">
                                  <Eye size={12} /> Chi tiết
                                </button>
                                <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition">
                                  <ArrowUpDown size={12} /> Điều chỉnh
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Footer ──────────────────────────────────────────── */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Hiển thị{" "}
          <span className="font-semibold text-slate-700">
            {products.length}
          </span>{" "}
          sản phẩm
        </p>
        <p className="text-xs text-slate-400">Click vào hàng để xem chi tiết</p>
      </div>
    </div>
  );
}
