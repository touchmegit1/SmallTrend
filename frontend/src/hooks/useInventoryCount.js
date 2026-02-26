import { useState, useEffect, useMemo, useCallback } from "react";
import {
  getProducts,
  getLocations,
} from "../services/inventoryService";
import {
  IC_STATUS,
  generateICCode,
  createDefaultCountSession,
  createCountItem,
  classifyCountItem,
  calcCountStats,
  validateDraftCount,
  validateConfirmCount,
  COUNT_ITEM_STATUS,
} from "../utils/inventoryCount";

const API_BASE = "http://localhost:3001";

/**
 * @param {string|undefined} voucherId - If provided, loads an existing voucher.
 *                                       If "create" or undefined, creates a new one.
 */
export function useInventoryCount(voucherId) {
  const isCreateMode = !voucherId || voucherId === "create";

  // ─── Reference Data ──────────────────────────────
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // ─── Count Session State ─────────────────────────
  const [session, setSession] = useState(null);
  const [items, setItems] = useState([]);

  // ─── UI State ────────────────────────────────────
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [reasonModalItem, setReasonModalItem] = useState(null);

  // ─── Init ────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const [productsData, locationsData] = await Promise.all([
          getProducts(),
          getLocations(),
        ]);

        if (cancelled) return;
        setProducts(productsData);
        setLocations(locationsData);

        if (isCreateMode) {
          // ── CREATE MODE: generate new voucher ───────────
          const existingCounts = await fetch(`${API_BASE}/inventory_counts`).then(
            (r) => (r.ok ? r.json() : [])
          );
          if (cancelled) return;

          const code = generateICCode(existingCounts);
          setSession(createDefaultCountSession(code));

          const countItems = productsData.map((p) => createCountItem(p));
          setItems(countItems);
        } else {
          // ── VIEW/EDIT MODE: load existing voucher ───────
          const [sessionRes, itemsRes] = await Promise.all([
            fetch(`${API_BASE}/inventory_counts/${voucherId}`),
            fetch(
              `${API_BASE}/inventory_count_items?inventory_count_id=${voucherId}`
            ),
          ]);

          if (!sessionRes.ok) throw new Error("Không tìm thấy phiếu kiểm kho.");
          const sessionData = await sessionRes.json();
          const savedItems = await itemsRes.json();

          if (cancelled) return;
          setSession(sessionData);

          // Merge saved items with product info
          const productMap = {};
          for (const p of productsData) {
            productMap[p.id] = p;
          }

          // Build items: start with saved items, then add uncounted products
          const countedProductIds = new Set(savedItems.map((i) => i.product_id));
          const mergedItems = [];

          // Add saved/counted items with product info
          for (const si of savedItems) {
            const prod = productMap[si.product_id];
            mergedItems.push({
              _key: `ci_${si.product_id}_${si.id}`,
              product_id: si.product_id,
              sku: prod?.sku || "N/A",
              name: prod?.name || "Sản phẩm không tồn tại",
              unit: prod?.unit || "",
              purchase_price: prod?.purchase_price || 0,
              system_quantity: si.system_quantity,
              actual_quantity: si.actual_quantity,
              difference_quantity: si.difference_quantity,
              difference_value: si.difference_value,
              reason: si.reason || "",
            });
          }

          // Add uncounted products (for draft/counting vouchers)
          if (
            sessionData.status === IC_STATUS.DRAFT ||
            sessionData.status === IC_STATUS.COUNTING
          ) {
            for (const p of productsData) {
              if (!countedProductIds.has(p.id)) {
                mergedItems.push(createCountItem(p));
              }
            }
          }

          setItems(mergedItems);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    init();
    return () => {
      cancelled = true;
    };
  }, [voucherId, isCreateMode]);

  // ─── Item Filtering ──────────────────────────────
  const filteredItems = useMemo(() => {
    let filtered = items;

    if (activeTab === "matched") {
      filtered = filtered.filter(
        (i) => classifyCountItem(i) === COUNT_ITEM_STATUS.MATCHED
      );
    } else if (activeTab === "shortage") {
      filtered = filtered.filter(
        (i) => classifyCountItem(i) === COUNT_ITEM_STATUS.SHORTAGE
      );
    } else if (activeTab === "overage") {
      filtered = filtered.filter(
        (i) => classifyCountItem(i) === COUNT_ITEM_STATUS.OVERAGE
      );
    } else if (activeTab === "unchecked") {
      filtered = filtered.filter(
        (i) => classifyCountItem(i) === COUNT_ITEM_STATUS.UNCHECKED
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.name.toLowerCase().includes(term) ||
          i.sku.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [items, activeTab, searchTerm]);

  // ─── Stats ───────────────────────────────────────
  const stats = useMemo(() => calcCountStats(items), [items]);

  // ─── Update Actual Quantity ──────────────────────
  const updateActualQuantity = useCallback((productId, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.product_id !== productId) return item;
        const actual =
          value === "" || value === null
            ? null
            : Math.max(0, parseInt(value) || 0);
        const diff = actual !== null ? actual - item.system_quantity : 0;
        const diffValue = diff * item.purchase_price;
        return {
          ...item,
          actual_quantity: actual,
          difference_quantity: diff,
          difference_value: diffValue,
          reason: diff === 0 ? "" : item.reason,
        };
      })
    );
  }, []);

  // ─── Update Reason ──────────────────────────────
  const updateReason = useCallback((productId, reason) => {
    setItems((prev) =>
      prev.map((item) =>
        item.product_id === productId ? { ...item, reason } : item
      )
    );
  }, []);

  // ─── Mark All Matched ───────────────────────────
  const markAllAsMatched = useCallback(() => {
    setItems((prev) =>
      prev.map((item) =>
        item.actual_quantity === null
          ? {
              ...item,
              actual_quantity: item.system_quantity,
              difference_quantity: 0,
              difference_value: 0,
              reason: "",
            }
          : item
      )
    );
  }, []);

  // ─── Session Update ──────────────────────────────
  const updateSession = useCallback((updates) => {
    setSession((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  // ─── Reason Modal ────────────────────────────────
  const openReasonModal = useCallback(
    (productId) => {
      const item = items.find((i) => i.product_id === productId);
      if (item) setReasonModalItem(item);
    },
    [items]
  );

  const closeReasonModal = useCallback(() => {
    setReasonModalItem(null);
  }, []);

  const saveReasonFromModal = useCallback(
    (productId, reason) => {
      updateReason(productId, reason);
      setReasonModalItem(null);
    },
    [updateReason]
  );

  // ─── Save Draft ──────────────────────────────────
  const saveDraft = useCallback(
    async (navigate) => {
      const result = validateDraftCount(session, items);
      if (!result.valid) {
        alert("Lỗi:\n" + result.errors.join("\n"));
        return;
      }

      setSaving(true);
      try {
        const countedItems = items.filter((i) => i.actual_quantity !== null);

        const sessionPayload = {
          ...session,
          status: IC_STATUS.DRAFT,
          total_shortage_value: stats.totalShortageValue,
          total_overage_value: stats.totalOverageValue,
          total_difference_value: stats.totalDifferenceValue,
        };

        let savedSessionId;

        if (isCreateMode) {
          const res = await fetch(`${API_BASE}/inventory_counts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sessionPayload),
          });
          const saved = await res.json();
          savedSessionId = saved.id;
        } else {
          await fetch(`${API_BASE}/inventory_counts/${voucherId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sessionPayload),
          });
          savedSessionId = voucherId;

          // Delete old items to replace
          const oldItems = await fetch(
            `${API_BASE}/inventory_count_items?inventory_count_id=${voucherId}`
          ).then((r) => r.json());
          for (const old of oldItems) {
            await fetch(`${API_BASE}/inventory_count_items/${old.id}`, {
              method: "DELETE",
            });
          }
        }

        // Save counted items
        for (const item of countedItems) {
          await fetch(`${API_BASE}/inventory_count_items`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              inventory_count_id: savedSessionId,
              product_id: item.product_id,
              system_quantity: item.system_quantity,
              actual_quantity: item.actual_quantity,
              difference_quantity: item.difference_quantity,
              difference_value: item.difference_value,
              reason: item.reason || "",
            }),
          });
        }

        alert("Đã lưu phiếu kiểm kho nháp thành công!");
        if (navigate) navigate("/inventory-counts");
      } catch (err) {
        alert("Lỗi khi lưu: " + err.message);
      } finally {
        setSaving(false);
      }
    },
    [session, items, stats, isCreateMode, voucherId]
  );

  // ─── Confirm & Adjust Stock ──────────────────────
  const confirmCount = useCallback(
    async (navigate) => {
      const result = validateConfirmCount(session, items);
      if (!result.valid) {
        alert("Không thể xác nhận:\n" + result.errors.join("\n"));
        return;
      }

      const confirmMsg =
        `Xác nhận kiểm kho ${session.code}?\n\n` +
        `• Khớp: ${stats.matched}\n` +
        `• Thiếu: ${stats.shortage}\n` +
        `• Dư: ${stats.overage}\n\n` +
        `Tồn kho sẽ được cập nhật theo số thực tế.`;

      if (!window.confirm(confirmMsg)) return;

      setSaving(true);
      try {
        const now = new Date().toISOString();

        const sessionPayload = {
          ...session,
          status: IC_STATUS.CONFIRMED,
          confirmed_by: 1,
          confirmed_at: now,
          total_shortage_value: stats.totalShortageValue,
          total_overage_value: stats.totalOverageValue,
          total_difference_value: stats.totalDifferenceValue,
        };

        let savedSessionId;

        if (isCreateMode) {
          const res = await fetch(`${API_BASE}/inventory_counts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sessionPayload),
          });
          const saved = await res.json();
          savedSessionId = saved.id;
        } else {
          await fetch(`${API_BASE}/inventory_counts/${voucherId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sessionPayload),
          });
          savedSessionId = voucherId;

          // Delete old items to replace
          const oldItems = await fetch(
            `${API_BASE}/inventory_count_items?inventory_count_id=${voucherId}`
          ).then((r) => r.json());
          for (const old of oldItems) {
            await fetch(`${API_BASE}/inventory_count_items/${old.id}`, {
              method: "DELETE",
            });
          }
        }

        const countedItems = items.filter((i) => i.actual_quantity !== null);

        for (const item of countedItems) {
          // Save count item
          await fetch(`${API_BASE}/inventory_count_items`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              inventory_count_id: savedSessionId,
              product_id: item.product_id,
              system_quantity: item.system_quantity,
              actual_quantity: item.actual_quantity,
              difference_quantity: item.difference_quantity,
              difference_value: item.difference_value,
              reason: item.reason || "",
            }),
          });

          // Create adjustment if difference
          if (item.difference_quantity !== 0) {
            await fetch(`${API_BASE}/inventory_adjustments`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                reference_id: savedSessionId,
                reference_type: "INVENTORY_COUNT",
                product_id: item.product_id,
                quantity_change: item.difference_quantity,
                reason: item.reason,
                created_at: now,
              }),
            });
          }

          // Update product stock
          await fetch(`${API_BASE}/products/${item.product_id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              stock_quantity: item.actual_quantity,
              updated_at: now,
            }),
          });
        }

        alert("Đã xác nhận kiểm kho và cập nhật tồn kho!");
        if (navigate) navigate("/inventory-counts");
      } catch (err) {
        alert("Lỗi khi xác nhận: " + err.message);
      } finally {
        setSaving(false);
      }
    },
    [session, items, stats, isCreateMode, voucherId]
  );

  // ─── Cancel ──────────────────────────────────────
  const cancelCount = useCallback(
    async (navigate) => {
      if (
        !window.confirm("Hủy phiên kiểm kho này? Dữ liệu sẽ không được lưu.")
      )
        return;

      // If existing voucher, update status
      if (!isCreateMode) {
        try {
          await fetch(`${API_BASE}/inventory_counts/${voucherId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: IC_STATUS.CANCELLED }),
          });
        } catch (err) {
          alert("Lỗi khi hủy: " + err.message);
          return;
        }
      }

      if (navigate) navigate("/inventory-counts");
    },
    [isCreateMode, voucherId]
  );

  // ─── Return ──────────────────────────────────────
  return {
    products,
    locations,
    loading,
    saving,
    error,
    isCreateMode,

    session,
    updateSession,
    items,
    filteredItems,
    stats,

    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,

    updateActualQuantity,
    updateReason,
    markAllAsMatched,

    reasonModalItem,
    openReasonModal,
    closeReasonModal,
    saveReasonFromModal,

    saveDraft,
    confirmCount,
    cancelCount,
  };
}
