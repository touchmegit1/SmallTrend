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
  calcOrderFinancials,
  validateDraft,
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

  const toNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

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
                unitCost: item.unit_price || item.unitCost || 0,
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

  const checkingFinancials = useMemo(() => {
    const subtotal = receiptItems.reduce((sum, ri) => {
      const qty = toNumber(ri.receivedQuantity);
      const unitCost = toNumber(ri.unitCost);
      return sum + qty * unitCost;
    }, 0);
    const taxPercent = toNumber(order.tax_percent);
    const shippingFee = toNumber(order.shipping_fee);
    const taxAmount = Math.round((subtotal * taxPercent) / 100);
    const total = subtotal + taxAmount + shippingFee;

    return {
      subtotal,
      taxPercent,
      shippingFee,
      taxAmount,
      total,
    };
  }, [receiptItems, order.tax_percent, order.shipping_fee]);

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
      const existing = prev.find((i) => i.variant_id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.variant_id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
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
          (i) => i.variant_id === importedInfo.product.id,
        );
        if (existingIndex >= 0) {
          const item = newItems[existingIndex];
          newItems[existingIndex] = {
            ...item,
            quantity: item.quantity + (importedInfo.quantity || 1),
          };
        } else {
          const newItem = createOrderItem(importedInfo.product);
          newItem.quantity = importedInfo.quantity || 1;
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
        if (field !== "quantity") return item;
        return { ...item, quantity: value };
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
          discount: 0,
          tax_percent: 0,
          shipping_fee: 0,
          paid_amount: 0,
          status: PO_STATUS.DRAFT,
          subtotal: 0,
          tax_amount: 0,
          total_amount: 0,
          remaining_amount: 0,
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
          discount: 0,
          tax_percent: 0,
          shipping_fee: 0,
          paid_amount: 0,
          status: PO_STATUS.PENDING,
          subtotal: 0,
          tax_amount: 0,
          total_amount: 0,
          remaining_amount: 0,
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
      await startCheckingOrder(initialId);
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

      // Validate item-level
      for (const ri of receiptItems) {
        if (
          ri.receivedQuantity === null ||
          ri.receivedQuantity === undefined ||
          ri.receivedQuantity < 0
        ) {
          toast.warning("Số lượng thực nhận không hợp lệ.");
          return false;
        }
        if (ri.unitCost === null || ri.unitCost === undefined || ri.unitCost <= 0) {
          toast.warning("Giá nhập của từng sản phẩm là bắt buộc và phải lớn hơn 0.");
          return false;
        }
      }

      // Validate required receipt metadata
      if (!order.supplier_id) {
        toast.warning("Vui lòng chọn nhà cung cấp trước khi nhập kho.");
        return false;
      }
      if (!order.location_id) {
        toast.warning("Vui lòng chọn vị trí nhập kho trước khi nhập kho.");
        return false;
      }
      if (String(order.tax_percent ?? "").trim() === "") {
        toast.warning("Vui lòng nhập thuế VAT (%).");
        return false;
      }
      if (String(order.shipping_fee ?? "").trim() === "") {
        toast.warning("Vui lòng nhập phí vận chuyển.");
        return false;
      }
      if (toNumber(order.tax_percent) < 0) {
        toast.warning("Thuế VAT không được âm.");
        return false;
      }
      if (toNumber(order.shipping_fee) < 0) {
        toast.warning("Phí vận chuyển không được âm.");
        return false;
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
          supplierId: order.supplier_id,
          locationId: order.location_id,
          taxPercent: toNumber(order.tax_percent),
          shippingFee: toNumber(order.shipping_fee),
          subtotal: checkingFinancials.subtotal,
          taxAmount: checkingFinancials.taxAmount,
          totalAmount: checkingFinancials.total,
          items: receiptItems.map((ri) => ({
            ...ri,
            receivedQuantity: toNumber(ri.receivedQuantity),
            unitCost: toNumber(ri.unitCost),
          })),
        };
        const response = await receiveGoodsOrder(initialId, receiptData);

        const syncedCount = Number(response?.syncedPurchasePriceCount) || 0;
        const successMessage =
          syncedCount > 0
            ? `Đã xác nhận nhập kho thành công! Đã đồng bộ giá nhập cho ${syncedCount} sản phẩm ở Thiết lập giá.`
            : "Đã xác nhận nhập kho thành công!";

        if (syncedCount > 0) {
          const previousItemById = new Map(items.map((item) => [item.id, item]));
          const changedItems = receiptItems
            .map((ri) => {
              const prev = previousItemById.get(ri.itemId);
              const previousCost = toNumber(prev?.unit_price ?? prev?.unitCost);
              const newCost = toNumber(ri.unitCost);

              if (!prev || newCost <= 0 || newCost === previousCost) {
                return null;
              }

              return {
                itemId: ri.itemId,
                variantId: ri.variantId ?? prev.variantId ?? prev.variant_id ?? null,
                sku: prev.sku || "",
                productName: prev.name || "Sản phẩm",
                purchasePrice: newCost,
                previousPurchasePrice: previousCost,
              };
            })
            .filter(Boolean);

          sessionStorage.setItem(
            "priceSyncNotice",
            JSON.stringify({
              syncedCount,
              orderNumber: response?.orderNumber || order?.po_number || null,
              syncedItems: changedItems,
              syncedAt: new Date().toISOString(),
            }),
          );
        }

        toast.success(successMessage);
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
    [
      initialId,
      receiptItems,
      items,
      order.notes,
      order.supplier_id,
      order.location_id,
      order.tax_percent,
      order.shipping_fee,
      order.po_number,
      checkingFinancials,
    ],
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
    checkingFinancials,
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
