import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, Barcode, X } from "lucide-react";

export default function ProductSearchBar({ products, onAddProduct }) {
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
          <Barcode size={14} />
          <span>Quét mã vạch</span>
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
