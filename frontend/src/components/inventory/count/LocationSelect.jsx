import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, MapPin } from "lucide-react";

export default function LocationSelect({
  value,
  onChange,
  locations = [],
  disabled = false,
  placeholder = "Tất cả",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedLocation = locations.find((loc) => loc.id === value);

  // Filter locations by search term
  const filteredLocations = useMemo(() => {
    if (!searchTerm) return locations;
    const term = searchTerm.toLowerCase();
    return locations.filter(
      (loc) =>
        loc.location_name?.toLowerCase().includes(term) ||
        loc.location_code?.toLowerCase().includes(term) ||
        loc.location_type?.toLowerCase().includes(term),
    );
  }, [locations, searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (isOpen) setSearchTerm("");
          }
        }}
        className="w-full px-3 py-2.5 text-sm font-medium rounded-xl border border-slate-200 outline-none transition-all cursor-pointer hover:border-indigo-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent shadow-sm hover:shadow flex items-center justify-between gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          backgroundColor: value ? "#eff6ff" : "#f8fafc",
          color: value ? "#1e40af" : "#64748b",
        }}
      >
        <span className="flex items-center gap-2 truncate">
          <MapPin size={14} className="shrink-0 opacity-60" />
          <span className="truncate">
            {selectedLocation?.location_name || placeholder}
          </span>
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="fixed bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
          style={{
            zIndex: 9999,
            minWidth: dropdownRef.current?.offsetWidth || 200,
            maxWidth: 360,
            top: dropdownRef.current
              ? dropdownRef.current.getBoundingClientRect().bottom + 8
              : 0,
            left: dropdownRef.current
              ? dropdownRef.current.getBoundingClientRect().left
              : 0,
            animation: "locSelectFadeIn 0.2s ease-out",
          }}
        >
          {/* Search input */}
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm vị trí..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Options */}
          <div className="py-1 max-h-60 overflow-y-auto custom-scrollbar-loc">
            {/* "All" / empty option */}
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setIsOpen(false);
                setSearchTerm("");
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-all ${
                !value
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-2">
                <MapPin size={14} className="opacity-40" />
                Tất cả
              </span>
            </button>

            {filteredLocations.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-400 text-center">
                Không tìm thấy vị trí
              </div>
            ) : (
              filteredLocations.map((loc) => {
                const isSelected = value === loc.id;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      onChange(loc.id);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-all ${
                      isSelected
                        ? "bg-indigo-50 text-indigo-700 font-semibold ring-2 ring-inset ring-indigo-400"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin
                        size={14}
                        className={`shrink-0 ${isSelected ? "text-indigo-500" : "text-slate-400"}`}
                      />
                      <div className="min-w-0">
                        <div className="truncate">{loc.location_name}</div>
                        {(loc.location_code || loc.location_type) && (
                          <div className="text-[11px] text-slate-400 truncate">
                            {[loc.location_code, loc.location_type]
                              .filter(Boolean)
                              .join(" • ")}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes locSelectFadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar-loc::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar-loc::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar-loc::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar-loc::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}
