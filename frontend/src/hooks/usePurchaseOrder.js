import { useState, useEffect, useMemo, useCallback } from "react";
import {
  getProducts,
  getSuppliers,
  getLocations,
  getNextPOCode,
  createPurchaseOrder,
  confirmPurchaseOrder,
  updatePurchaseOrder,
  confirmExistingOrder,
  cancelPurchaseOrder as cancelPurchaseOrderApi,
  deletePurchaseOrder,
} from "../services/inventoryService";
import {
  PO_STATUS,
  createDefaultOrder,
  createOrderItem,
  calcItemTotal,
  calcOrderFinancials,
  validateDraft,
  validateConfirm,
  canTransitionTo,
} from "../utils/purchaseOrder";

export function usePurchaseOrder(initialId = null) {
  // ─── Reference Data ────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // ─── Order State ───────────────────────────────────────
  const [order, setOrder] = useState(createDefaultOrder(""));
  const [items, setItems] = useState([]);
  const [batchEditItem, setBatchEditItem] = useState(null); // item _key for batch modal

  // ─── Supplier Search ───────────────────────────────────
  const [supplierQuery, setSupplierQuery] = useState("");

  // ─── Init ──────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        let nextCode = "";
        let existingOrder = null;

        const promises = [
          getProducts(),
          getSuppliers(),
          getLocations(),
        ];

        if (initialId) {
          promises.push(
            import("../services/inventoryService").then((m) =>
              m.getPurchaseOrderById(initialId)
            )
          );
        } else {
          promises.push(getNextPOCode());
        }

        const results = await Promise.all(promises);
        
        setProducts(results[0]);
        setSuppliers(results[1]);
        setLocations(results[2].filter((l) => l.status === "ACTIVE" || !l.status));

        if (initialId) {
          existingOrder = results[3];
          setOrder(existingOrder);
          
          if (existingOrder.items) {
             const mappedItems = existingOrder.items.map(item => ({
                ...item,
                _key: Math.random().toString(36).substr(2, 9),
                product_id: item.productId || item.product_id,
                unit_price: item.unitCost || item.unit_cost,
                total: item.totalCost || item.total_cost,
                quantity: item.quantity,
                name: item.name || results[0].find(p => p.id === (item.productId || item.product_id))?.name || "Sản phẩm",
             }));
             setItems(mappedItems);
          }
          if (existingOrder.supplier_name) {
             setSupplierQuery(existingOrder.supplier_name);
          }
        } else {
          nextCode = results[3];
          setOrder((prev) => ({ ...prev, po_number: nextCode }));
        }

      } catch (err) {
        console.error("Init error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [initialId]);

  // ─── Financials (memoized) ─────────────────────────────
  const financials = useMemo(() => {
    return calcOrderFinancials(
      items,
      order.discount,
      order.tax_percent,
      order.shipping_fee,
      order.paid_amount
    );
  }, [items, order.discount, order.tax_percent, order.shipping_fee, order.paid_amount]);

  // ─── Filtered suppliers for autocomplete ───────────────
  const filteredSuppliers = useMemo(() => {
    if (!supplierQuery.trim()) return suppliers;
    const q = supplierQuery.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q)) ||
        (s.contactInfo && s.contactInfo.toLowerCase().includes(q))
    );
  }, [suppliers, supplierQuery]);

  // ─── Order Field Updates ───────────────────────────────
  const updateOrder = useCallback((field, value) => {
    setOrder((prev) => ({ ...prev, [field]: value }));
  }, []);

  const selectSupplier = useCallback(
    (supplier) => {
      setOrder((prev) => ({
        ...prev,
        supplier_id: supplier.id,
        supplier_name: supplier.name,
      }));
      setSupplierQuery(supplier.name);
    },
    []
  );

  const clearSupplier = useCallback(() => {
    setOrder((prev) => ({
      ...prev,
      supplier_id: null,
      supplier_name: "",
    }));
    setSupplierQuery("");
  }, []);

  // ─── Item Management ──────────────────────────────────
  const addProduct = useCallback(
    (product) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.product_id === product.id);
        if (existing) {
          return prev.map((i) =>
            i.product_id === product.id
              ? {
                  ...i,
                  quantity: i.quantity + 1,
                  total: calcItemTotal(i.quantity + 1, i.unit_price, i.discount),
                }
              : i
          );
        }
        return [...prev, createOrderItem(product)];
      });
    },
    []
  );

  const removeItem = useCallback((_key) => {
    setItems((prev) => prev.filter((i) => i._key !== _key));
  }, []);

  const updateItem = useCallback((_key, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item._key !== _key) return item;
        const updated = { ...item, [field]: value };
        // Recalculate total when quantity, price, or discount changes
        if (["quantity", "unit_price", "discount"].includes(field)) {
          updated.total = calcItemTotal(
            updated.quantity,
            updated.unit_price,
            updated.discount
          );
        }
        return updated;
      })
    );
  }, []);

  // ─── Batch Management ─────────────────────────────────
  const openBatchEditor = useCallback((_key) => {
    setBatchEditItem(_key);
  }, []);

  const closeBatchEditor = useCallback(() => {
    setBatchEditItem(null);
  }, []);

  const updateItemBatches = useCallback((_key, batches) => {
    setItems((prev) =>
      prev.map((item) => (item._key === _key ? { ...item, batches } : item))
    );
  }, []);

  const batchEditData = useMemo(() => {
    if (!batchEditItem) return null;
    return items.find((i) => i._key === batchEditItem) || null;
  }, [batchEditItem, items]);

  // ─── Save Draft ────────────────────────────────────────
  const saveDraft = useCallback(
    async (navigate) => {
      const validation = validateDraft(order, items);
      if (!validation.valid) {
        alert(validation.errors.join("\n"));
        return false;
      }

      setSaving(true);
      try {
        const orderData = {
          ...order,
          status: PO_STATUS.DRAFT,
          subtotal: financials.subtotal,
          tax_amount: financials.taxAmount,
          total_amount: financials.total,
          remaining_amount: financials.remaining,
          items: items,
        };

        if (initialId) {
          await updatePurchaseOrder(initialId, orderData);
        } else {
          await createPurchaseOrder(orderData);
        }

        alert("Đã lưu phiếu tạm thành công!");
        if (navigate) navigate("/inventory/purchase-orders");
        return true;
      } catch (err) {
        console.error("Save draft error:", err);
        alert("Lỗi khi lưu phiếu tạm: " + err.message);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [order, items, financials]
  );

  // ─── Confirm & Update Stock ────────────────────────────
  const confirmOrder = useCallback(
    async (navigate) => {
      const validation = validateConfirm(order, items);
      if (!validation.valid) {
        alert(validation.errors.join("\n"));
        return false;
      }

      if (!window.confirm("Xác nhận nhập hàng? Tồn kho sẽ được cập nhật và không thể hoàn tác.")) {
        return false;
      }

      setSaving(true);
      try {
        const orderData = {
          ...order,
          status: PO_STATUS.CONFIRMED,
          subtotal: financials.subtotal,
          tax_amount: financials.taxAmount,
          total_amount: financials.total,
          remaining_amount: financials.remaining,
          items: items,
        };

        if (initialId) {
          await updatePurchaseOrder(initialId, orderData);
          await confirmExistingOrder(initialId);
        } else {
          await confirmPurchaseOrder(orderData);
        }

        alert("Đã xác nhận nhập hàng và cập nhật tồn kho thành công!");
        if (navigate) navigate("/inventory/purchase-orders");
        return true;
      } catch (err) {
        console.error("Confirm error:", err);
        alert("Lỗi khi xác nhận nhập hàng: " + err.message);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [order, items, financials]
  );

  // ─── Cancel Order ──────────────────────────────────────
  const cancelOrder = useCallback(
    async (navigate) => {
      if (!canTransitionTo(order.status, PO_STATUS.CANCELLED)) {
        alert("Không thể hủy phiếu nhập ở trạng thái hiện tại.");
        return false;
      }

      if (!window.confirm("Bạn có chắc muốn hủy phiếu nhập này?")) {
        return false;
      }

      if (initialId) {
        setSaving(true);
        try {
          await cancelPurchaseOrderApi(initialId);
          alert("Đã hủy phiếu nhập.");
          if (navigate) navigate("/inventory/purchase-orders");
          return true;
        } catch (err) {
          alert("Lỗi khi hủy phiếu: " + err.message);
          return false;
        } finally {
          setSaving(false);
        }
      } else {
        alert("Đã hủy phiếu nhập.");
        if (navigate) navigate("/inventory/purchase-orders");
        return true;
      }
    },
    [order.status]
  );

  // ─── Delete Draft Order ────────────────────────────────
  const deleteOrder = useCallback(
    async (navigate) => {
      if (!initialId) return false;
      if (order.status !== PO_STATUS.DRAFT) {
        alert("Chỉ có thể xóa phiếu nháp.");
        return false;
      }
      if (!window.confirm("Bạn có chắc chắn muốn xóa phiếu nhập tạm này không?")) {
        return false;
      }
      setSaving(true);
      try {
        await deletePurchaseOrder(initialId);
        alert("Xóa thành công!");
        if (navigate) navigate("/inventory/purchase-orders");
        return true;
      } catch (err) {
        console.error("Delete order error", err);
        alert("Lỗi khi xóa: " + err.message);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [initialId, order.status]
  );

  return {
    // Reference data
    products,
    suppliers,
    locations,
    filteredSuppliers,
    loading,
    saving,
    error,

    // Order state
    order,
    items,
    financials,

    // Supplier autocomplete
    supplierQuery,
    setSupplierQuery,
    selectSupplier,
    clearSupplier,

    // Order management
    updateOrder,
    addProduct,
    removeItem,
    updateItem,

    // Batch management
    batchEditItem,
    batchEditData,
    openBatchEditor,
    closeBatchEditor,
    updateItemBatches,

    // Actions
    saveDraft,
    confirmOrder,
    cancelOrder,
    deleteOrder,
  };
}
