import { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "../components/ui/Toast";
import {
  getProducts,
  getSuppliers,
  getActiveLocations,
  getNextPOCode,
  createPurchaseOrder,
  confirmPurchaseOrder,
  updatePurchaseOrder,
  confirmExistingOrder,
  cancelPurchaseOrder as cancelPurchaseOrderApi,
  deletePurchaseOrder,
  startCheckingOrder,
  receiveGoodsOrder,
  approvePurchaseOrder,
  rejectPurchaseOrder,
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
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [order, setOrder] = useState(createDefaultOrder(""));
  const [items, setItems] = useState([]);
  const [batchEditItem, setBatchEditItem] = useState(null);
  const [supplierQuery, setSupplierQuery] = useState("");

  // State cho kiểm kê (NV kho)
  const [receiptItems, setReceiptItems] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        let nextCode = "";
        let existingOrder = null;

        const promises = [getProducts(), getSuppliers(), getActiveLocations()];

        if (initialId) {
          promises.push(
            import("../services/inventoryService").then((m) =>
              m.getPurchaseOrderById(initialId),
            ),
          );
        } else {
          promises.push(getNextPOCode());
        }

        const results = await Promise.all(promises);

        setProducts(results[0]);
        setSuppliers(results[1]);
        setLocations(results[2]);

        if (initialId) {
          existingOrder = results[3];
          // Map backend camelCase → frontend snake_case field names
          const mappedOrder = {
            ...existingOrder,
            po_number: existingOrder.orderNumber || existingOrder.po_number,
            supplier_id: existingOrder.supplierId || existingOrder.supplier_id,
            supplier_name:
              existingOrder.supplierName || existingOrder.supplier_name,

            discount: Number(
              existingOrder.discountAmount || existingOrder.discount || 0,
            ),
            tax_percent: Number(
              existingOrder.taxPercent || existingOrder.tax_percent || 0,
            ),
            shipping_fee: Number(
              existingOrder.shippingFee || existingOrder.shipping_fee || 0,
            ),
            paid_amount: Number(
              existingOrder.paidAmount || existingOrder.paid_amount || 0,
            ),
            location_id:
              existingOrder.locationId || existingOrder.location_id || null,
          };
          setOrder(mappedOrder);

          if (existingOrder.items) {
            const mappedItems = existingOrder.items.map((item) => ({
              ...item,
              _key: Math.random().toString(36).substr(2, 9),
              product_id: item.productId || item.product_id,
              unit_price: item.unitCost || item.unit_cost,
              total: item.totalCost || item.total_cost,
              quantity: item.quantity,
              received_quantity:
                item.receivedQuantity ?? item.received_quantity ?? 0,
              expiry_date: item.expiryDate || item.expiry_date || "",
              name:
                item.name ||
                results[0].find(
                  (p) => p.id === (item.productId || item.product_id),
                )?.name ||
                "Sản phẩm",
            }));
            setItems(mappedItems);

            // Khởi tạo receiptItems cho kiểm kê
            setReceiptItems(
              mappedItems.map((item) => ({
                itemId: item.id,
                variantId: item.variantId || item.variant_id,
                receivedQuantity: item.received_quantity || item.quantity,
                notes: "",
              })),
            );
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

  const financials = useMemo(() => {
    return calcOrderFinancials(
      items,
      order.discount,
      order.tax_percent,
      order.shipping_fee,
      order.paid_amount,
    );
  }, [
    items,
    order.discount,
    order.tax_percent,
    order.shipping_fee,
    order.paid_amount,
  ]);

  const filteredSuppliers = useMemo(() => {
    if (!supplierQuery.trim()) return suppliers;
    const q = supplierQuery.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q)) ||
        (s.contactInfo && s.contactInfo.toLowerCase().includes(q)),
    );
  }, [suppliers, supplierQuery]);

  const updateOrder = useCallback((field, value) => {
    setOrder((prev) => ({ ...prev, [field]: value }));
  }, []);

  const selectSupplier = useCallback(async (supplier) => {
    setOrder((prev) => ({
      ...prev,
      supplier_id: supplier.id,
      supplier_name: supplier.name,
    }));
    setSupplierQuery(supplier.name);
  }, []);

  const clearSupplier = useCallback(() => {
    setOrder((prev) => ({
      ...prev,
      supplier_id: null,
      supplier_name: "",
    }));
    setSupplierQuery("");
  }, []);

  const addProduct = useCallback((product) => {
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
            : i,
        );
      }
      return [...prev, createOrderItem(product)];
    });
  }, []);

  const importProducts = useCallback((importedList) => {
    setItems((prev) => {
      const newItems = [...prev];
      importedList.forEach((importedInfo) => {
        const existingIndex = newItems.findIndex(
          (i) => i.product_id === importedInfo.product.id,
        );
        if (existingIndex >= 0) {
          const item = newItems[existingIndex];
          const newQty = item.quantity + (importedInfo.quantity || 1);
          const newPrice =
            importedInfo.unit_price !== undefined
              ? importedInfo.unit_price
              : item.unit_price;
          newItems[existingIndex] = {
            ...item,
            quantity: newQty,
            unit_price: newPrice,
            total: calcItemTotal(newQty, newPrice, item.discount),
          };
        } else {
          const newItem = createOrderItem(importedInfo.product);
          newItem.quantity = importedInfo.quantity || 1;
          if (importedInfo.unit_price !== undefined) {
            newItem.unit_price = importedInfo.unit_price;
          }
          newItem.total = calcItemTotal(
            newItem.quantity,
            newItem.unit_price,
            newItem.discount,
          );
          newItems.push(newItem);
        }
      });
      return newItems;
    });
  }, []);

  const removeItem = useCallback((_key) => {
    setItems((prev) => prev.filter((i) => i._key !== _key));
  }, []);

  const updateItem = useCallback((_key, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item._key !== _key) return item;
        const updated = { ...item, [field]: value };
        if (["quantity", "unit_price", "discount"].includes(field)) {
          updated.total = calcItemTotal(
            updated.quantity,
            updated.unit_price,
            updated.discount,
          );
        }
        return updated;
      }),
    );
  }, []);

  const openBatchEditor = useCallback((_key) => {
    setBatchEditItem(_key);
  }, []);

  const closeBatchEditor = useCallback(() => {
    setBatchEditItem(null);
  }, []);

  const updateItemBatches = useCallback((_key, batches) => {
    setItems((prev) =>
      prev.map((item) => (item._key === _key ? { ...item, batches } : item)),
    );
  }, []);

  const batchEditData = useMemo(() => {
    if (!batchEditItem) return null;
    return items.find((i) => i._key === batchEditItem) || null;
  }, [batchEditItem, items]);

  // ─── Cập nhật số lượng kiểm kê ────────────────────────────
  const updateReceiptItem = useCallback((itemId, field, value) => {
    setReceiptItems((prev) =>
      prev.map((ri) => (ri.itemId === itemId ? { ...ri, [field]: value } : ri)),
    );
  }, []);

  const saveDraft = useCallback(
    async (navigate) => {
      const validation = validateDraft(order, items);
      if (!validation.valid) {
        toast.warning(validation.errors.join(", "), { title: "Dữ liệu không hợp lệ", duration: 5000 });
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

        toast.success("Đã lưu phiếu tạm thành công!");
        if (navigate) navigate("/inventory/purchase-orders");
        return true;
      } catch (err) {
        console.error("Save draft error:", err);
        toast.error("Lỗi khi lưu phiếu tạm: " + err.message);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [order, items, financials],
  );

  const submitForApproval = useCallback(
    async (navigate) => {
      const validation = validateDraft(order, items);
      if (!validation.valid) {
        toast.warning(validation.errors.join(", "), { title: "Dữ liệu không hợp lệ", duration: 5000 });
        return false;
      }

      setSaving(true);
      try {
        const orderData = {
          ...order,
          status: PO_STATUS.PENDING,
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

        toast.success("Đã gửi yêu cầu duyệt thành công!");
        if (navigate) navigate("/inventory/purchase-orders");
        return true;
      } catch (err) {
        console.error("Submit for approval error:", err);
        toast.error("Lỗi khi gửi yêu cầu duyệt: " + err.message);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [initialId, order, items, financials],
  );

  // Quản lý duyệt (PENDING → CONFIRMED) — không cập nhật stock
  const confirmOrder = useCallback(
    async (navigate) => {
      if (!initialId) return false;

      if (
        !window.confirm(
          "Xác nhận duyệt phiếu nhập? Phiếu sẽ chuyển cho NV kho kiểm kê.",
        )
      ) {
        return false;
      }

      setSaving(true);
      try {
        await approvePurchaseOrder(initialId);

        toast.success("Đã duyệt phiếu nhập! Chuyển sang bước kiểm kê.");
        if (navigate) navigate("/inventory/purchase-orders");
        return true;
      } catch (err) {
        console.error("Confirm error:", err);
        toast.error("Lỗi khi duyệt phiếu: " + err.message);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [initialId],
  );

  // NV kho bắt đầu kiểm kê (CONFIRMED → CHECKING)
  const startChecking = useCallback(async () => {
    if (!initialId) return false;

    if (!window.confirm("Bắt đầu kiểm kê hàng hóa?")) {
      return false;
    }

    setSaving(true);
    try {
      const updatedOrder = await startCheckingOrder(initialId);
      // Cập nhật trạng thái trực tiếp → UI chuyển sang màn hình CHECKING
      setOrder((prev) => ({ ...prev, status: PO_STATUS.CHECKING }));
      toast.success("Đã bắt đầu kiểm kê. Vui lòng nhập số lượng thực nhận cho từng sản phẩm.");
      return true;
    } catch (err) {
      console.error("Start checking error:", err);
      toast.error("Lỗi khi bắt đầu kiểm kê: " + err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [initialId]);

  // NV kho xác nhận nhập kho (CHECKING → RECEIVED) — cập nhật stock
  const receiveGoods = useCallback(
    async (navigate) => {
      if (!initialId) return false;

      // Validate
      for (const ri of receiptItems) {
        if (
          ri.receivedQuantity === null ||
          ri.receivedQuantity === undefined ||
          ri.receivedQuantity < 0
        ) {
          toast.warning("Số lượng thực nhận không hợp lệ.");
          return false;
        }
      }

      if (
        !window.confirm(
          "Xác nhận nhập kho? Tồn kho sẽ được cập nhật và không thể hoàn tác.",
        )
      ) {
        return false;
      }

      setSaving(true);
      try {
        const receiptData = {
          notes: order.notes,
          items: receiptItems,
        };
        await receiveGoodsOrder(initialId, receiptData);

        toast.success("Đã xác nhận nhập kho và cập nhật tồn kho thành công!");
        if (navigate) navigate("/inventory/purchase-orders");
        return true;
      } catch (err) {
        console.error("Receive goods error:", err);
        toast.error("Lỗi khi xác nhận nhập kho: " + err.message);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [initialId, receiptItems, order.notes],
  );

  const rejectOrder = useCallback(
    async (navigate, rejectionReason) => {
      if (order.status !== PO_STATUS.PENDING) {
        toast.warning("Chỉ có thể từ chối phiếu đang chờ duyệt.");
        return false;
      }

      if (!rejectionReason || rejectionReason.trim() === "") {
        toast.warning("Bạn phải nhập lý do từ chối.");
        return false;
      }

      setSaving(true);
      try {
        await rejectPurchaseOrder(initialId, rejectionReason);

        toast.success("Đã từ chối phiếu nhập.");
        if (navigate) navigate("/inventory/purchase-orders");
        return true;
      } catch (err) {
        console.error("Reject order error", err);
        toast.error("Lỗi khi từ chối phiếu: " + err.message);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [initialId, order.status],
  );

  const deleteOrder = useCallback(
    async (navigate) => {
      if (!initialId) return false;
      if (order.status !== PO_STATUS.DRAFT) {
        toast.warning("Chỉ có thể xóa phiếu nháp.");
        return false;
      }
      if (
        !window.confirm("Bạn có chắc chắn muốn xóa phiếu nhập tạm này không?")
      ) {
        return false;
      }
      setSaving(true);
      try {
        await deletePurchaseOrder(initialId);
        toast.success("Xóa thành công!");
        if (navigate) navigate("/inventory/purchase-orders");
        return true;
      } catch (err) {
        console.error("Delete order error", err);
        toast.error("Lỗi khi xóa: " + err.message);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [initialId, order.status],
  );

  return {
    products,
    suppliers,
    locations,
    filteredSuppliers,
    loading,
    saving,
    error,
    order,
    items,
    financials,
    supplierQuery,
    setSupplierQuery,
    selectSupplier,
    clearSupplier,
    updateOrder,
    addProduct,
    importProducts,
    removeItem,
    updateItem,
    batchEditItem,
    batchEditData,
    openBatchEditor,
    closeBatchEditor,
    updateItemBatches,
    receiptItems,
    updateReceiptItem,
    saveDraft,
    submitForApproval,
    confirmOrder,
    startChecking,
    receiveGoods,
    rejectOrder,
    deleteOrder,
  };
}
