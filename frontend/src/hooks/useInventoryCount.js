import { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "../components/ui/Toast";
import {
  getProducts,
  getActiveLocations,
  getInventoryCountById,
  getInventoryCountNextCode,
  saveInventoryCountDraft,
  updateInventoryCount,
  confirmInventoryCount,
  createAndConfirmInventoryCount,
  cancelInventoryCount,
  submitInventoryCount,
  createAndSubmitInventoryCount,
  approveInventoryCount,
  rejectInventoryCount,
  getLocationStocks,
} from "../services/inventoryService";
import {
  IC_STATUS,
  createDefaultCountSession,
  createCountItem,
  classifyCountItem,
  calcCountStats,
  validateDraftCount,
  validateConfirmCount,
  COUNT_ITEM_STATUS,
} from "../utils/inventoryCount";

/**
 * @param {string|undefined} voucherId - If provided, loads an existing voucher.
 *                                       If "create" or undefined, creates a new one.
 */
export function useInventoryCount(voucherId) {
  const toast = useToast();
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
  const [bulkMatchedVariantIds, setBulkMatchedVariantIds] = useState(new Set());

  // ─── Init ────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const [productsData, locationsData] = await Promise.all([
          getProducts(),
          getActiveLocations(),
        ]);

        if (cancelled) return;
        setProducts(productsData);
        setLocations(locationsData);

        if (isCreateMode) {
          // ── CREATE MODE: generate new voucher ───────────
          const code = await getInventoryCountNextCode();
          if (cancelled) return;

          setSession(createDefaultCountSession(code));

          const countItems = productsData.map((p) => createCountItem(p));
          setItems(countItems);
        } else {
          // ── VIEW/EDIT MODE: load existing voucher ───────
          const sessionData = await getInventoryCountById(voucherId);

          if (cancelled) return;
          setSession(sessionData);

          const savedItems = sessionData.items || [];

          // Merge saved items with product info
          const productMap = {};
          for (const p of productsData) {
            productMap[p.id] = p;
          }

          // Build items: start with saved items, then add uncounted products
          const countedVariantIds = new Set(
            savedItems.map((i) => i.variant_id || i.product_id)
          );
          const mergedItems = [];

          // Add saved/counted items with product info
          for (const si of savedItems) {
            const prod = productMap[si.product_id];
            mergedItems.push({
              _key: `ci_${si.variant_id || si.product_id}_${si.id}`,
              product_id: si.product_id,
              variant_id: si.variant_id || si.product_id,
              sku: prod?.sku || "N/A",
              name: prod?.name || "Sản phẩm không tồn tại",
              image_url: prod?.image_url || prod?.imageUrl || null,
              attributes: prod?.attributes || null,
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
            let locStockMap = null;
            if (sessionData.location_id) {
              try {
                const stocks = await getLocationStocks(sessionData.location_id);
                locStockMap = {};
                stocks.forEach((s) => {
                  locStockMap[s.variant_id] = (locStockMap[s.variant_id] || 0) + s.quantity;
                });
              } catch (e) {
                console.error("Failed to load location stocks", e);
              }
            }

            for (const p of productsData) {
              const variantId = p.variant_id || p.variantId || p.id;
              if (!countedVariantIds.has(variantId)) {
                if (locStockMap) {
                  // Only add if it exists in the location
                  if (locStockMap[variantId] !== undefined) {
                    const newItem = createCountItem(p);
                    newItem.system_quantity = locStockMap[variantId];
                    mergedItems.push(newItem);
                  }
                } else {
                  mergedItems.push(createCountItem(p));
                }
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

  // ─── Refetch items when location changes ─────────
  useEffect(() => {
    // Only in edit mode (DRAFT or COUNTING) after initial load
    if (loading || !products.length || !session) return;
    if (session.status !== IC_STATUS.DRAFT && session.status !== IC_STATUS.COUNTING) return;

    let cancelled = false;
    const fetchLocationData = async () => {
      try {
        setLoading(true);
        let locStockMap = null;
        if (session.location_id) {
          const stocks = await getLocationStocks(session.location_id);
          locStockMap = {};
          stocks.forEach((s) => {
            locStockMap[s.variant_id] = (locStockMap[s.variant_id] || 0) + s.quantity;
          });
        }

        setBulkMatchedVariantIds(new Set());

        setItems((prevItems) => {
          // Keep only manually counted/modified items.
          // Items auto-filled by "Khớp tất cả chưa kiểm" should be rebuilt when location changes.
          const countedItems = prevItems.filter(
            (i) => i.actual_quantity !== null && !bulkMatchedVariantIds.has(i.variant_id)
          );
          const countedVariantIds = new Set(countedItems.map((i) => i.variant_id));

          const newItems = [...countedItems];

          for (const p of products) {
            const variantId = p.variant_id || p.variantId || p.id;
            if (!countedVariantIds.has(variantId)) {
              if (locStockMap) {
                if (locStockMap[variantId] !== undefined) {
                  const newItem = createCountItem(p);
                  newItem.system_quantity = locStockMap[variantId];
                  newItems.push(newItem);
                }
              } else {
                newItems.push(createCountItem(p));
              }
            }
          }
          return newItems;
        });

      } catch (err) {
        console.error("Failed to fetch location stocks on change", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLocationData();
    return () => { cancelled = true; };
  }, [session?.location_id]);

  // ─── Item Filtering ──────────────────────────────
  const filteredItems = useMemo(() => {
    let filtered = items;

    if (activeTab === "matched") {
      filtered = filtered.filter(
        (i) =>
          classifyCountItem(i) === COUNT_ITEM_STATUS.MATCHED &&
          !bulkMatchedVariantIds.has(i.variant_id)
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
  }, [items, activeTab, searchTerm, bulkMatchedVariantIds]);

  // ─── Stats ───────────────────────────────────────
  const stats = useMemo(() => calcCountStats(items), [items]);

  // ─── Update Actual Quantity ──────────────────────
  const updateActualQuantity = useCallback((variantId, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.variant_id !== variantId) return item;
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
  const updateReason = useCallback((variantId, reason) => {
    setItems((prev) =>
      prev.map((item) =>
        item.variant_id === variantId ? { ...item, reason } : item
      )
    );
  }, []);

  // ─── Mark All Matched ───────────────────────────
  const markAllAsMatched = useCallback(() => {
    setItems((prev) => {
      const autoMatchedIds = new Set();
      const nextItems = prev.map((item) => {
        if (item.actual_quantity !== null) return item;

        autoMatchedIds.add(item.variant_id);
        return {
          ...item,
          actual_quantity: item.system_quantity,
          difference_quantity: 0,
          difference_value: 0,
          reason: "",
        };
      });

      setBulkMatchedVariantIds(autoMatchedIds);
      return nextItems;
    });
  }, []);

  // ─── Session Update ──────────────────────────────
  const updateSession = useCallback((updates) => {
    setSession((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  // ─── Reason Modal ────────────────────────────────
  const openReasonModal = useCallback(
    (variantId) => {
      const item = items.find((i) => i.variant_id === variantId);
      if (item) setReasonModalItem(item);
    },
    [items]
  );

  const closeReasonModal = useCallback(() => {
    setReasonModalItem(null);
  }, []);

  const saveReasonFromModal = useCallback(
    (variantId, reason) => {
      updateReason(variantId, reason);
      setReasonModalItem(null);
    },
    [updateReason]
  );

  // ─── Save Draft ──────────────────────────────────
  const saveDraft = useCallback(
    async (navigate) => {
      const result = validateDraftCount(session, items);
      if (!result.valid) {
        toast.warning(result.errors.join(", "), { title: "Lỗi dữ liệu", duration: 5000 });
        return;
      }

      setSaving(true);
      try {
        const request = {
          code: session.code,
          location_id: session.location_id,
          notes: session.notes,
          status: IC_STATUS.DRAFT,
          items: items,
        };

        if (isCreateMode) {
          await saveInventoryCountDraft(request);
        } else {
          await updateInventoryCount(voucherId, request);
        }

        toast.success("Đã lưu phiếu kiểm kho nháp thành công!");
        if (navigate) navigate("/inventory-counts");
      } catch (err) {
        toast.error("Lỗi khi lưu: " + err.message);
      } finally {
        setSaving(false);
      }
    },
    [session, items, isCreateMode, voucherId]
  );

  // ─── Confirm & Adjust Stock ──────────────────────
  const confirmCount = useCallback(
    async (navigate) => {
      const result = validateConfirmCount(session, items);
      if (!result.valid) {
        toast.warning(result.errors.join(", "), { title: "Không thể xác nhận", duration: 5000 });
        return;
      }

      setSaving(true);
      try {
        const request = {
          code: session.code,
          location_id: session.location_id,
          notes: session.notes,
          items: items,
        };

        if (isCreateMode) {
          await createAndConfirmInventoryCount(request);
        } else {
          await confirmInventoryCount(voucherId, request);
        }

        toast.success("Đã xác nhận kiểm kho và cập nhật tồn kho!");
        if (navigate) navigate("/inventory-counts");
      } catch (err) {
        toast.error("Lỗi khi xác nhận: " + err.message);
      } finally {
        setSaving(false);
      }
    },
    [session, items, stats, isCreateMode, voucherId]
  );

  // ─── Submit for Approval ───────────────────────
  const submitForApproval = useCallback(
    async (navigate) => {
      const result = validateConfirmCount(session, items);
      if (!result.valid) {
        toast.warning(result.errors.join(", "), { title: "Không thể gửi duyệt", duration: 5000 });
        return;
      }

      setSaving(true);
      try {
        const request = {
          code: session.code,
          location_id: session.location_id,
          notes: session.notes,
          items: items,
        };

        if (isCreateMode) {
          await createAndSubmitInventoryCount(request);
        } else {
          await submitInventoryCount(voucherId, request);
        }

        toast.success("Đã gửi phiếu kiểm kho cho Manager duyệt!");
        if (navigate) navigate("/inventory-counts");
      } catch (err) {
        toast.error("Lỗi khi gửi duyệt: " + err.message);
      } finally {
        setSaving(false);
      }
    },
    [session, items, isCreateMode, voucherId]
  );

  // ─── Approve (Manager) ────────────────────────
  const approveCount = useCallback(
    async (navigate) => {
      setSaving(true);
      try {
        await approveInventoryCount(voucherId);
        toast.success("Đã duyệt phiếu kiểm kho và cập nhật tồn kho!");
        if (navigate) navigate("/inventory-counts");
      } catch (err) {
        toast.error("Lỗi khi duyệt: " + err.message);
      } finally {
        setSaving(false);
      }
    },
    [session, voucherId]
  );

  // ─── Reject (Manager) ─────────────────────────
  const rejectCount = useCallback(
    async (rejectionReason, navigate) => {
      if (!rejectionReason || !rejectionReason.trim()) {
        toast.warning("Vui lòng nhập lý do từ chối.");
        return;
      }

      setSaving(true);
      try {
        await rejectInventoryCount(voucherId, rejectionReason);
        toast.success("Đã từ chối phiếu kiểm kho!");
        if (navigate) navigate("/inventory-counts");
      } catch (err) {
        toast.error("Lỗi khi từ chối: " + err.message);
      } finally {
        setSaving(false);
      }
    },
    [session, voucherId]
  );

  // ─── Cancel ──────────────────────────────────────
  const cancelCount = useCallback(
    async (navigate) => {
      // If existing voucher, update status
      if (!isCreateMode) {
        try {
          await cancelInventoryCount(voucherId);
        } catch (err) {
          toast.error("Lỗi khi hủy: " + err.message);
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
    submitForApproval,
    approveCount,
    rejectCount,
    cancelCount,
  };
}
