import { useState, useEffect, useMemo, useCallback } from "react";
import { getInventoryCounts, getLocations, cancelInventoryCount, deleteInventoryCount } from "../services/inventoryService";
import { IC_STATUS, IC_STATUS_CONFIG, formatVNDCount } from "../utils/inventoryCount";

export function useInventoryCountList() {
  const [vouchers, setVouchers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── Filters ─────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");

  // ─── Pagination ──────────────────────────────────
  const [page, setPage] = useState(1);
  const perPage = 10;

  // ─── Fetch ───────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const [countsData, locsData] = await Promise.all([
          getInventoryCounts(),
          getLocations(),
        ]);

        if (!cancelled) {
          setVouchers(countsData);
          setLocations(locsData);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  // ─── Location lookup ─────────────────────────────
  const locationMap = useMemo(() => {
    const map = {};
    for (const loc of locations) {
      map[loc.id] = loc.location_name || loc.name;
    }
    return map;
  }, [locations]);

  // ─── Filtering + Sorting ─────────────────────────
  const filteredVouchers = useMemo(() => {
    let result = [...vouchers];

    // Status filter
    if (statusFilter !== "ALL") {
      result = result.filter((v) => v.status === statusFilter);
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (v) =>
          (v.code || "").toLowerCase().includes(term) ||
          (locationMap[v.location_id] || "").toLowerCase().includes(term)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === "created_at" || sortField === "confirmed_at") {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [vouchers, statusFilter, searchTerm, sortField, sortDir, locationMap]);

  // ─── Pagination ──────────────────────────────────
  const totalPages = Math.ceil(filteredVouchers.length / perPage);
  const paginatedVouchers = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredVouchers.slice(start, start + perPage);
  }, [filteredVouchers, page]);

  // ─── Stats by status ────────────────────────────
  const statusCounts = useMemo(() => {
    const counts = { ALL: vouchers.length };
    for (const s of Object.values(IC_STATUS)) {
      counts[s] = vouchers.filter((v) => v.status === s).length;
    }
    return counts;
  }, [vouchers]);

  // ─── Cancel voucher ──────────────────────────────
  const cancelVoucher = useCallback(async (id) => {
    if (!window.confirm("Bạn có chắc muốn hủy phiếu kiểm kho này?")) return;

    try {
      await cancelInventoryCount(id);
      setVouchers((prev) =>
        prev.map((v) =>
          v.id === id ? { ...v, status: IC_STATUS.CANCELLED } : v
        )
      );
    } catch (err) {
      alert("Lỗi khi hủy phiếu: " + err.message);
    }
  }, []);

  // ─── Delete voucher ──────────────────────────────
  const deleteVoucher = useCallback(async (id) => {
    if (!window.confirm("Bạn có chắc muốn XÓA VĨNH VIỄN phiếu kiểm kho này?")) return;

    try {
      await deleteInventoryCount(id);
      setVouchers((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      alert("Lỗi khi xóa phiếu: " + err.message);
    }
  }, []);

  // ─── Toggle sort ─────────────────────────────────
  const toggleSort = useCallback(
    (field) => {
      if (sortField === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDir("desc");
      }
    },
    [sortField]
  );

  return {
    loading,
    error,
    vouchers: paginatedVouchers,
    allVouchers: filteredVouchers,
    locationMap,
    statusCounts,

    // Filters
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    sortField,
    sortDir,
    toggleSort,

    // Pagination
    page,
    setPage,
    totalPages,
    perPage,

    // Actions
    cancelVoucher,
    deleteVoucher,
  };
}
