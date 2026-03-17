import { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "../components/ui/Toast";
import {
  DV_STATUS,
  validateForConfirm,
  DEFAULT_VOUCHER,
} from "../utils/disposalVoucher";
import { getActiveLocations } from "../services/inventoryService";
import {
  getDisposalVoucherById,
  getNextDisposalCode,
  getExpiredBatches,
  saveDisposalDraft,
  submitDisposalVoucher,
  approveDisposalVoucher,
} from "../services/disposalService";

export function useDisposalVoucher(voucherId = null) {
  const toast = useToast();
  const [voucher, setVoucher] = useState({ ...DEFAULT_VOUCHER });
  const [items, setItems] = useState([]);
  const [expiredBatches, setExpiredBatches] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // ─── Init ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const locsData = await getActiveLocations();

        if (cancelled) return;
        setLocations(locsData);

        if (voucherId) {
          const voucherData = await getDisposalVoucherById(voucherId);
          if (cancelled) return;
          setVoucher(voucherData);
          setItems(voucherData.items || []);
        } else {
          const code = await getNextDisposalCode();

          let defaultLocationId = null;
          for (const loc of locsData) {
            try {
              const expiredAtLocation = await getExpiredBatches(loc.id);
              if ((expiredAtLocation || []).length > 0) {
                defaultLocationId = loc.id;
                break;
              }
            } catch {
              // skip invalid location response
            }
          }

          if (cancelled) return;
          setVoucher((prev) => ({
            ...prev,
            code,
            created_at: new Date().toISOString(),
            location_id: defaultLocationId,
            locationId: defaultLocationId,
          }));
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
  }, [voucherId]);

  // ─── Load expired batches by selected location ──────────
  useEffect(() => {
    let cancelled = false;

    const loadExpiredBatches = async () => {
      const locationId = voucher.location_id ?? voucher.locationId;
      if (!locationId) {
        setExpiredBatches([]);
        return;
      }

      try {
        const data = await getExpiredBatches(locationId);
        if (cancelled) return;

        setExpiredBatches(
          data.map((b) => ({
            ...b,
            id: b.id ?? b.batchId ?? b.batch_id,
            batch_id: b.batch_id ?? b.batchId ?? b.id,
            product_id: b.product_id ?? b.productId,
            product_name: b.product_name ?? b.productName,
            batch_code: b.batch_code ?? b.batchCode,
            quantity: b.quantity ?? b.availableQuantity ?? 0,
            unit_cost: b.unit_cost ?? b.unitCost ?? 0,
            expiry_date: b.expiry_date ?? b.expiryDate,
            unit: b.unit ?? "",
          }))
        );
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    };

    loadExpiredBatches();

    return () => {
      cancelled = true;
    };
  }, [voucher.location_id, voucher.locationId]);

  const expiredBatchById = useMemo(() => {
    const map = new Map();
    expiredBatches.forEach((b) => {
      map.set(b.id, b);
    });
    return map;
  }, [expiredBatches]);

  const validationBatches = useMemo(
    () =>
      items.map((item) => {
        const batch = expiredBatchById.get(item.batch_id);
        return {
          id: item.batch_id,
          quantity: batch?.quantity ?? item.quantity,
        };
      }),
    [items, expiredBatchById]
  );

  const isEditable =
    voucher.status === DV_STATUS.DRAFT || voucher.status === DV_STATUS.REJECTED;

  // ─── Update voucher fields ─────────────────────────────
  const updateVoucher = useCallback((field, value) => {
    setVoucher((prev) => ({ ...prev, [field]: value }));

    if (field === "location_id") {
      setItems([]);
    }
  }, []);

  // ─── Add expired batch as disposal item ────────────────
  const addItem = useCallback(
    (batch) => {
      // Check if already added
      if (items.some((i) => i.batch_id === batch.id)) return;

      const newItem = {
        _tempId: Date.now(),
        batch_id: batch.id,
        product_id: batch.product_id,
        product_name: batch.product_name,
        batch_code: batch.batch_code,
        quantity: batch.quantity, // default to full batch qty
        unit_cost: batch.unit_cost,
        total_cost: batch.quantity * batch.unit_cost,
        expiry_date: batch.expiry_date,
        unit: batch.unit,
      };
      setItems((prev) => [...prev, newItem]);
    },
    [items]
  );

  // ─── Remove item ───────────────────────────────────────
  const removeItem = useCallback((batchId) => {
    setItems((prev) => prev.filter((i) => i.batch_id !== batchId));
  }, []);

  // ─── Update item quantity ──────────────────────────────
  const updateItemQty = useCallback(
    (batchId, qty) => {
      const numQty = Number.parseInt(qty, 10) || 0;
      setItems((prev) =>
        prev.map((i) =>
          i.batch_id === batchId
            ? { ...i, quantity: numQty, total_cost: numQty * i.unit_cost }
            : i
        )
      );
    },
    []
  );

  // ─── Totals ────────────────────────────────────────────
  const totals = useMemo(() => {
    const totalQty = items.reduce((s, i) => s + i.quantity, 0);
    const totalValue = items.reduce((s, i) => s + i.total_cost, 0);
    return { totalItems: items.length, totalQty, totalValue };
  }, [items]);

  // ─── Save Draft ────────────────────────────────────────
  const saveDraft = useCallback(async () => {
    setSaving(true);
    try {
      const voucherData = {
        ...voucher,
        items: items,
      };

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || 1;

      const savedVoucher = await saveDisposalDraft(voucherData, userId);
      setVoucher(savedVoucher);
      return savedVoucher;
    } catch (err) {
      throw err;
    } finally {
      setSaving(false);
    }
  }, [voucher, items]);

  // ─── Confirm and deduct stock immediately ──────────────
  const confirmAndDeductAction = useCallback(async () => {
    const validationErrors = validateForConfirm(voucher, items, validationBatches);
    if (validationErrors.length > 0) {
      toast.warning(validationErrors.join(", "), {
        title: "Không thể xác nhận",
        duration: 5000,
      });
      return false;
    }

    setSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id || 1;

      let currentVoucherId = voucherId || voucher.id;
      if (!currentVoucherId) {
        const saved = await saveDraft();
        currentVoucherId = saved.id;
      }

      await submitDisposalVoucher(currentVoucherId);
      const confirmedVoucher = await approveDisposalVoucher(currentVoucherId, userId);
      setVoucher(confirmedVoucher);
      return confirmedVoucher;
    } catch (err) {
      toast.error("Lỗi khi xác nhận xử lý: " + err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [voucher, items, validationBatches, voucherId, saveDraft, toast]);

  return {
    voucher,
    items,
    locations,
    expiredBatches,
    loading,
    saving,
    error,
    isEditable,
    totals,

    updateVoucher,
    addItem,
    removeItem,
    updateItemQty,
    saveDraft,
    confirmAndDeduct: confirmAndDeductAction,
  };
}
