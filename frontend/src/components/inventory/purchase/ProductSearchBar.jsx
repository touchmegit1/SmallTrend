import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, FileUp } from "lucide-react";
import * as XLSX from "xlsx";

export default function ProductSearchBar({
  products,
  onAddProduct,
  onImportProducts,
}) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filter products
  const filtered = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // F3 shortcut
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "F3") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const selectProduct = useCallback(
    (product) => {
      onAddProduct(product);
      setQuery("");
      setShowDropdown(false);
      setHighlightIdx(-1);
      inputRef.current?.focus();
    },
    [onAddProduct],
  );

  const handleKeyDown = (e) => {
    if (!showDropdown || filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightIdx >= 0) {
      e.preventDefault();
      selectProduct(filtered[highlightIdx]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const importedList = [];
        const notFound = [];

        data.forEach((row) => {
          // Normalize keys
          const normalizedRow = {};
          for (let key in row) {
            normalizedRow[key.toString().toLowerCase().trim()] = row[key];
          }

          const sku =
            normalizedRow["sku"] ||
            normalizedRow["mã sp"] ||
            normalizedRow["mã sản phẩm"];
          const quantity =
            normalizedRow["quantity"] ||
            normalizedRow["số lượng"] ||
            normalizedRow["sl"] ||
            1;
          const price =
            normalizedRow["price"] ||
            normalizedRow["giá"] ||
            normalizedRow["đơn giá nhập"] ||
            normalizedRow["đơn giá"];

          if (sku) {
            const product = products.find(
              (p) => p.sku.toLowerCase() === sku.toString().toLowerCase(),
            );
            if (product) {
              importedList.push({
                product,
                quantity: Number(quantity),
                unit_price: price ? Number(price) : undefined,
              });
            } else {
              notFound.push(sku);
            }
          }
        });

        if (importedList.length > 0) {
          if (onImportProducts) {
            onImportProducts(importedList);
          }
          alert(
            `Đã import thành công ${importedList.length} sản phẩm.${
              notFound.length > 0
                ? `\nKhông tìm thấy các mã SKU: ${notFound.join(", ")}`
                : ""
            }`,
          );
        } else if (notFound.length > 0) {
          alert(
            `Không có mã SKU nào trong file khớp với hệ thống.\nCác mã không tìm thấy: ${notFound.join(", ")}`,
          );
        } else {
          alert(
            "Danh sách trống hoặc sai định dạng cột (Cần có cột SKU, Quantity...).",
          );
        }
      } catch (error) {
        console.error("Import error:", error);
        alert("Lỗi khi đọc file. Vui lòng kiểm tra lại định dạng.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null; // reset
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-5 py-3 bg-slate-50/70 border-b border-slate-200">
        <div className="relative flex-1 max-w-xl">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
              setHighlightIdx(-1);
            }}
            onFocus={() => query.trim() && setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder="Tìm sản phẩm theo tên hoặc mã SKU (F3)"
            className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setShowDropdown(false);
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-indigo-600 transition-colors">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              className="hidden"
              onChange={handleFileUpload}
            />
            <FileUp size={14} />
            <span>Import Excel</span>
          </label>
        </div>
      </div>

      {/* ─── Dropdown ──────────────────────────────────────── */}
      {showDropdown && filtered.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-5 right-5 top-full z-50 bg-white rounded-b-xl border border-t-0 border-slate-200 shadow-xl max-h-72 overflow-auto"
        >
          {filtered.slice(0, 20).map((product, idx) => (
            <button
              key={product.id}
              onClick={() => selectProduct(product)}
              className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-indigo-50 transition-colors border-b border-slate-50 last:border-b-0 ${
                idx === highlightIdx ? "bg-indigo-50" : ""
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded shrink-0">
                  {product.sku}
                </span>
                <span className="text-sm text-slate-900 truncate">
                  {product.name}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className="text-xs text-slate-400">{product.unit}</span>
                <span className="text-sm font-semibold text-slate-700">
                  {(product.purchase_price || 0).toLocaleString("vi-VN")} ₫
                </span>
              </div>
            </button>
          ))}
          {filtered.length > 20 && (
            <div className="px-4 py-2 text-center text-xs text-slate-400">
              Và {filtered.length - 20} sản phẩm khác...
            </div>
          )}
        </div>
      )}

      {showDropdown && query.trim() && filtered.length === 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-5 right-5 top-full z-50 bg-white rounded-b-xl border border-t-0 border-slate-200 shadow-xl"
        >
          <div className="px-4 py-6 text-center text-sm text-slate-400">
            Không tìm thấy sản phẩm "{query}"
          </div>
        </div>
      )}
    </div>
  );
}
