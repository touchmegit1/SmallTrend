import { useState, useEffect, useMemo, useCallback } from "react";
import {
  getProducts,
  getSuppliers,
  getPurchaseOrders,
  getLocations,
  createPurchaseOrder,
  createPurchaseOrderItem,
  updateProductStock,
  createProductBatch,
  updatePurchaseOrder,
} from "../services/inventoryService";
import {
  PO_STATUS,
  generatePOCode,
  createDefaultOrder,
  createOrderItem,
  calcItemTotal,
  calcOrderFinancials,
  validateDraft,
  validateConfirm,
  canTransitionTo,
} from "../utils/purchaseOrder";

export function usePurchaseOrder() {
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
        const [productsData, suppliersData, ordersData, locationsData] =
          await Promise.all([
            getProducts(),
            getSuppliers(),
            getPurchaseOrders(),
            getLocations(),
          ]);
        setProducts(productsData);
        setSuppliers(suppliersData);
        setLocations(locationsData.filter((l) => l.status === "ACTIVE"));

        const code = generatePOCode(ordersData);
        setOrder((prev) => ({ ...prev, po_number: code }));
      } catch (err) {
        console.error("Init error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

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
        (s.phone && s.phone.includes(q))
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
          created_at: new Date().toISOString(),
        };

        const savedOrder = await createPurchaseOrder(orderData);

        for (const item of items) {
          await createPurchaseOrderItem({
            purchase_order_id: savedOrder.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount: item.discount || 0,
            total: item.total,
          });
        }

        alert("Đã lưu phiếu tạm thành công!");
        if (navigate) navigate("/inventory/import");
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
        const now = new Date().toISOString();
        const orderData = {
          ...order,
          status: PO_STATUS.CONFIRMED,
          subtotal: financials.subtotal,
          tax_amount: financials.taxAmount,
          total_amount: financials.total,
          remaining_amount: financials.remaining,
          confirmed_at: now,
          created_at: now,
        };

        const savedOrder = await createPurchaseOrder(orderData);

        for (const item of items) {
          // Save order item
          await createPurchaseOrderItem({
            purchase_order_id: savedOrder.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount: item.discount || 0,
            total: item.total,
          });

          // Update product stock
          const currentProduct = products.find((p) => p.id === item.product_id);
          if (currentProduct) {
            await updateProductStock(
              item.product_id,
              (currentProduct.stock_quantity || 0) + item.quantity
            );
          }

          // Create batches
          if (item.batches && item.batches.length > 0) {
            for (const batch of item.batches) {
              await createProductBatch({
                batch_code: batch.batch_code,
                product_id: item.product_id,
                quantity: batch.quantity,
                expiry_date: batch.expiry_date || null,
                received_date: now.split("T")[0],
                created_at: now,
              });
            }
          }
        }

        alert("Đã xác nhận nhập hàng và cập nhật tồn kho thành công!");
        if (navigate) navigate("/inventory/import");
        return true;
      } catch (err) {
        console.error("Confirm error:", err);
        alert("Lỗi khi xác nhận nhập hàng: " + err.message);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [order, items, financials, products]
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

      // For new unsaved orders, just navigate away
      alert("Đã hủy phiếu nhập.");
      if (navigate) navigate("/inventory/import");
      return true;
    },
    [order.status]
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
  };
}
