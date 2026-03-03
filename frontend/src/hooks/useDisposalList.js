import { useState, useEffect, useMemo, useCallback } from "react";
import { getDisposalVouchers, cancelDisposalVoucher } from "../services/disposalService";
import { getLocations } from "../services/inventoryService";

export function useDisposalList() {
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
        const [vouchersData, locsData] = await Promise.all([
          getDisposalVouchers(),
          getLocations(),
        ]);

        if (!cancelled) {
          setVouchers(vouchersData);
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

    if (statusFilter !== "ALL") {
      result = result.filter((v) => v.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (v) =>
          (v.code || "").toLowerCase().includes(term) ||
          (v.notes || "").toLowerCase().includes(term) ||
          (v.locationName || "").toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === "createdAt" || sortField === "confirmedAt") {
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
  }, [vouchers, statusFilter, searchTerm, sortField, sortDir]);

  // ─── Pagination ──────────────────────────────────
  const totalPages = Math.ceil(filteredVouchers.length / perPage);
  const paginatedVouchers = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredVouchers.slice(start, start + perPage);
  }, [filteredVouchers, page]);

  // ─── Stats by status ────────────────────────────
  const statusCounts = useMemo(() => {
    const counts = { ALL: vouchers.length };
    const statuses = ["DRAFT", "CONFIRMED", "CANCELLED"];
    for (const s of statuses) {
      counts[s] = vouchers.filter((v) => v.status === s).length;
    }
    return counts;
  }, [vouchers]);

  // ─── Cancel voucher ──────────────────────────────
  const cancelVoucher = useCallback(async (id) => {
    try {
      await cancelDisposalVoucher(id);
      setVouchers((prev) =>
        prev.map((v) =>
          v.id === id ? { ...v, status: "CANCELLED" } : v
        )
      );
    } catch (err) {
      alert("Lỗi khi hủy phiếu: " + err.message);
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
    locations,
    statusCounts,

    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    sortField,
    sortDir,
    toggleSort,

    page,
    setPage,
    totalPages,
    perPage,

    cancelVoucher,
  };
}
