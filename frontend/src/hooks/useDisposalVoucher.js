import { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "../components/ui/Toast";
import {
  DV_STATUS,
  REASON_TYPE,
  generateDVCode,
  validateForConfirm,
  DEFAULT_VOUCHER,
} from "../utils/disposalVoucher";
import { getActiveLocations } from "../services/inventoryService";
import {
  getDisposalVoucherById,
  getNextDisposalCode,
  getExpiredBatches,
  createDisposalVoucher,
  approveDisposalVoucher,
  rejectDisposalVoucher,
} from "../services/disposalService";

export function useDisposalVoucher(voucherId = null) {
  const toast = useToast();
  const [voucher, setVoucher] = useState({ ...DEFAULT_VOUCHER });
  const [items, setItems] = useState([]);
  const [expiredBatches, setExpiredBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
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
          setVoucher(voucherData);
          setItems(voucherData.items || []);

          // If voucher has a location, load expired batches for that location
          if (voucherData.location_id) {
            const batches = await getExpiredBatches(voucherData.location_id);
            setExpiredBatches(batches);
          }
        } else {
          const code = await getNextDisposalCode();
          setVoucher((prev) => ({
            ...prev,
            code,
            created_at: new Date().toISOString(),
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

  const isEditable =
    voucher.status === DV_STATUS.DRAFT || voucher.status === DV_STATUS.REJECTED;

  // ─── Change location → fetch expired batches for that location ─
  const changeLocation = useCallback(
    async (locationId) => {
      updateVoucher("location_id", locationId);
      setItems([]); // reset selected items when changing location
      setExpiredBatches([]);

      if (!locationId) return;

      setLoadingBatches(true);
      try {
        const batches = await getExpiredBatches(locationId);
        setExpiredBatches(batches);
      } catch (err) {
        toast.error("Lỗi tải lô hết hạn: " + err.message);
      } finally {
        setLoadingBatches(false);
      }
    },
    [],
  );

  // ─── Update voucher fields ─────────────────────────────
  const updateVoucher = useCallback((field, value) => {
    setVoucher((prev) => ({ ...prev, [field]: value }));
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
        unit_cost: batch.unit_cost || 0,
        total_cost: batch.quantity * (batch.unit_cost || 0),
        expiry_date: batch.expiry_date,
        unit: batch.unit || "",
      };
      setItems((prev) => [...prev, newItem]);
    },
    [items],
  );

  // ─── Remove item ───────────────────────────────────────
  const removeItem = useCallback((batchId) => {
    setItems((prev) => prev.filter((i) => i.batch_id !== batchId));
  }, []);

  // ─── Update item quantity ──────────────────────────────
  const updateItemQty = useCallback((batchId, qty) => {
    const numQty = parseInt(qty, 10) || 0;
    setItems((prev) =>
      prev.map((i) =>
        i.batch_id === batchId
          ? { ...i, quantity: numQty, total_cost: numQty * i.unit_cost }
          : i,
      ),
    );
  }, []);

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

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id || 1;

      const savedVoucher = await saveDisposalDraft(voucherData, userId);
      setVoucher(savedVoucher);
      return savedVoucher;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [voucher, items]);

  // ─── Submit for approval ───────────────────────────────
  const submitVoucherAction = useCallback(async () => {
    // Validate
    const validationErrors = validateForConfirm(voucher, items, expiredBatches);
    if (validationErrors.length > 0) {
      toast.warning(validationErrors.join(", "), {
        title: "Không thể gửi duyệt",
        duration: 5000,
      });
      return false;
    }

    setSaving(true);
    try {
      const voucherData = {
        ...voucher,
        items: items,
      };

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id || 1;

      const submittedVoucher = await createDisposalVoucher(voucherData, userId);
      setVoucher(submittedVoucher);
      return submittedVoucher;
    } catch (err) {
      setError(err.message);
      toast.error("Lỗi khi gửi duyệt: " + err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [voucher, items, expiredBatches, voucherId]);

  // ─── Approve (stock deduction) ─────────────────────────
  const approveVoucherAction = useCallback(async () => {
    setSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id || 1;

      const currentVoucherId = voucherId || voucher.id;
      const approvedVoucher = await approveDisposalVoucher(
        currentVoucherId,
        userId,
      );

      setVoucher(approvedVoucher);
      return true;
    } catch (err) {
      setError(err.message);
      toast.error("Lỗi khi duyệt: " + err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [voucherId, voucher.id]);

  // ─── Reject ────────────────────────────────────────────
  const rejectVoucherAction = useCallback(
    async (reason) => {
      if (!reason || reason.trim() === "") {
        toast.warning("Vui lòng nhập lý do từ chối");
        return false;
      }

      setSaving(true);
      try {
        const currentVoucherId = voucherId || voucher.id;
        const rejectedVoucher = await rejectDisposalVoucher(
          currentVoucherId,
          reason,
        );

        setVoucher(rejectedVoucher);
        return true;
      } catch (err) {
        return false;
      } finally {
        setSaving(false);
      }
    },
    [voucherId, voucher.id],
  );

  return {
    voucher,
    items,
    locations,
    expiredBatches,
    loadingBatches,
    loading,
    saving,
    error,
    isEditable,
    totals,

    updateVoucher,
    changeLocation,
    addItem,
    removeItem,
    updateItemQty,
    submitVoucher: submitVoucherAction,
    approveVoucher: approveVoucherAction,
    rejectVoucher: rejectVoucherAction,
  };
}
