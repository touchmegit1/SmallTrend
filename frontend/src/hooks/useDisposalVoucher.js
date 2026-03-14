import { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "../components/ui/Toast";
import {
  DV_STATUS,
  REASON_TYPE,
  generateDVCode,
  validateForConfirm,
  DEFAULT_VOUCHER,
} from "../utils/disposalVoucher";
import { getProductBatches, getDashboardProducts, getActiveLocations } from "../services/inventoryService";
import { 
  getDisposalVoucherById, 
  getNextDisposalCode,
  saveDisposalDraft,
  submitDisposalVoucher,
  approveDisposalVoucher,
  rejectDisposalVoucher
} from "../services/disposalService";

export function useDisposalVoucher(voucherId = null) {
  const toast = useToast();
  const [voucher, setVoucher] = useState({ ...DEFAULT_VOUCHER });
  const [items, setItems] = useState([]);
  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // ─── Init ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const [batchesData, productsData, locsData] = await Promise.all([
          getProductBatches(),
          getDashboardProducts(),
          getActiveLocations(),
        ]);

        if (cancelled) return;

        setBatches(batchesData);
        setProducts(productsData);
        setLocations(locsData);

        if (voucherId) {
          const voucherData = await getDisposalVoucherById(voucherId);
          setVoucher(voucherData);
          setItems(voucherData.items || []);
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
    return () => { cancelled = true; };
  }, [voucherId]);

  // ─── Expired batches detection ─────────────────────────
  const expiredBatches = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return batches.filter((b) => {
      if (!b.expiry_date || b.quantity <= 0) return false;
      return new Date(b.expiry_date) < today;
    }).map((b) => {
      const product = products.find((p) => p.id === b.product_id);
      return {
        ...b,
        product_name: product?.name || "Không rõ",
        product_sku: product?.sku || "",
        unit: product?.unit || "",
        unit_cost: product?.purchase_price || 0,
      };
    });
  }, [batches, products]);

  const isEditable =
    voucher.status === DV_STATUS.DRAFT || voucher.status === DV_STATUS.REJECTED;

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
      const numQty = parseInt(qty, 10) || 0;
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
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [voucher, items]);

  // ─── Submit for approval ───────────────────────────────
  const submitVoucherAction = useCallback(async () => {
    // Validate
    const validationErrors = validateForConfirm(voucher, items, batches);
    if (validationErrors.length > 0) {
      toast.warning(validationErrors.join(", "), { title: "Không thể gửi duyệt", duration: 5000 });
      return false;
    }

    if (!window.confirm("Gửi phiếu này cho quản lý để chờ duyệt?")) return false;

    setSaving(true);
    try {
      let currentVoucherId = voucherId || voucher.id;
      if (!currentVoucherId) {
        const saved = await saveDraft();
        currentVoucherId = saved.id;
      }
      const submittedVoucher = await submitDisposalVoucher(currentVoucherId);
      setVoucher(submittedVoucher);
      return true;
    } catch (err) {
      setError(err.message);
      toast.error("Lỗi khi gửi duyệt: " + err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [voucher, items, batches, voucherId, saveDraft]);

  // ─── Approve (stock deduction) ─────────────────────────
  const approveVoucherAction = useCallback(async () => {
    if (!window.confirm("Xác nhận duyệt phiếu xử lý? Tồn kho sẽ bị trừ ngay lập tức.")) {
      return false;
    }

    setSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || 1;

      const currentVoucherId = voucherId || voucher.id;
      const approvedVoucher = await approveDisposalVoucher(currentVoucherId, userId);

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
  const rejectVoucherAction = useCallback(async (reason) => {
    if (!reason || reason.trim() === "") {
      toast.warning("Vui lòng nhập lý do từ chối");
      return false;
    }

    if (!window.confirm("Xác nhận từ chối phiếu xử lý này?")) return false;

    setSaving(true);
    try {
      const currentVoucherId = voucherId || voucher.id;
      const rejectedVoucher = await rejectDisposalVoucher(currentVoucherId, reason);

      setVoucher(rejectedVoucher);
      return true;
    } catch (err) {
      // alert("Lỗi khi từ chối: " + err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [voucherId, voucher.id]);

  return {
    voucher,
    items,
    batches,
    products,
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
    submitVoucher: submitVoucherAction,
    approveVoucher: approveVoucherAction,
    rejectVoucher: rejectVoucherAction,
  };
}
