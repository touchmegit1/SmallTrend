import { useState, useEffect, useMemo, useCallback } from "react";
import {
  DV_STATUS,
  REASON_TYPE,
  generateDVCode,
  validateForConfirm,
  DEFAULT_VOUCHER,
} from "../utils/disposalVoucher";
import { getProductBatches, getDashboardProducts, getLocations } from "../services/inventoryService";
import { getDisposalVoucherById, getNextDisposalCode } from "../services/disposalService";

export function useDisposalVoucher(voucherId = null) {
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
          getLocations(),
        ]);

        if (cancelled) return;

        setBatches(batchesData);
        setProducts(productsData);
        setLocations(locsData.filter((l) => l.status === "ACTIVE"));

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

  const isEditable = voucher.status === DV_STATUS.DRAFT;

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
        status: DV_STATUS.DRAFT,
        total_items: totals.totalItems,
        total_quantity: totals.totalQty,
        total_value: totals.totalValue,
      };

      let savedVoucher;
      if (voucherId) {
        const res = await fetch(`${API}/disposal_vouchers/${voucherId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(voucherData),
        });
        savedVoucher = await res.json();
      } else {
        const res = await fetch(`${API}/disposal_vouchers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(voucherData),
        });
        savedVoucher = await res.json();
      }

      // Save items (for new voucher, create all; for existing, simple approach: delete old + create new)
      if (voucherId) {
        // Fetch existing items and delete them
        const existingRes = await fetch(
          `${API}/disposal_voucher_items?disposal_voucher_id=${voucherId}`
        );
        const existingItems = await existingRes.json();
        for (const ei of existingItems) {
          await fetch(`${API}/disposal_voucher_items/${ei.id}`, { method: "DELETE" });
        }
      }

      // Create all items
      for (const item of items) {
        await fetch(`${API}/disposal_voucher_items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            disposal_voucher_id: savedVoucher.id,
            batch_id: item.batch_id,
            product_id: item.product_id,
            product_name: item.product_name,
            batch_code: item.batch_code,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
            total_cost: item.total_cost,
            expiry_date: item.expiry_date,
          }),
        });
      }

      setVoucher(savedVoucher);
      return savedVoucher;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [voucher, items, totals, voucherId]);

  // ─── Confirm (stock deduction) ─────────────────────────
  const confirmVoucher = useCallback(async () => {
    // Validate
    const validationErrors = validateForConfirm(voucher, items, batches);
    if (validationErrors.length > 0) {
      alert("Không thể xác nhận:\n" + validationErrors.join("\n"));
      return false;
    }

    if (!window.confirm("Xác nhận xử lý? Tồn kho sẽ bị trừ ngay lập tức.")) {
      return false;
    }

    setSaving(true);
    try {
      // 1. Save the voucher first (as draft, to persist items)
      let currentVoucherId = voucherId;
      if (!currentVoucherId) {
        const saved = await saveDraft();
        currentVoucherId = saved.id;
      }

      // 2. For each item: deduct batch stock + product stock + create stock movement
      for (const item of items) {
        // 2a. Update batch quantity
        const batch = batches.find((b) => b.id === item.batch_id);
        const newBatchQty = Math.max(0, batch.quantity - item.quantity);
        await fetch(`${API}/product_batches/${item.batch_id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: newBatchQty }),
        });

        // 2b. Update product stock_quantity
        const product = products.find((p) => p.id === item.product_id);
        if (product) {
          const newProdQty = Math.max(0, product.stock_quantity - item.quantity);
          await fetch(`${API}/products/${item.product_id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stock_quantity: newProdQty }),
          });
          // Update local state
          product.stock_quantity = newProdQty;
        }

        // 2c. Create stock movement record
        await fetch(`${API}/stock_movements`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            variant_id: item.product_id,
            from_bin_id: null,
            to_bin_id: null,
            quantity: item.quantity,
            type: "DISPOSAL",
            reason: voucher.reason_type,
            reference_code: voucher.code,
            created_at: new Date().toISOString(),
          }),
        });

        // Update local batch state
        batch.quantity = newBatchQty;
      }

      // 3. Update voucher status to CONFIRMED
      const now = new Date().toISOString();
      await fetch(`${API}/disposal_vouchers/${currentVoucherId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: DV_STATUS.CONFIRMED,
          confirmed_at: now,
          confirmed_by: voucher.created_by,
          total_items: totals.totalItems,
          total_quantity: totals.totalQty,
          total_value: totals.totalValue,
        }),
      });

      setVoucher((prev) => ({
        ...prev,
        status: DV_STATUS.CONFIRMED,
        confirmed_at: now,
      }));

      return true;
    } catch (err) {
      setError(err.message);
      alert("Lỗi khi xác nhận: " + err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [voucher, items, batches, products, totals, voucherId, saveDraft]);

  // ─── Cancel ────────────────────────────────────────────
  const cancelVoucher = useCallback(async () => {
    if (!window.confirm("Bạn có chắc muốn hủy phiếu xử lý này?")) return false;

    setSaving(true);
    try {
      const id = voucherId || voucher.id;
      if (id) {
        await fetch(`${API}/disposal_vouchers/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: DV_STATUS.CANCELLED }),
        });
      }
      setVoucher((prev) => ({ ...prev, status: DV_STATUS.CANCELLED }));
      return true;
    } catch (err) {
      alert("Lỗi khi hủy phiếu: " + err.message);
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
    saveDraft,
    confirmVoucher,
    cancelVoucher,
  };
}
