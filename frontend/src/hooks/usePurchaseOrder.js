import { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "../components/ui/Toast";
import {
  getProducts,
  getSuppliers,
  getActiveLocations,
  getNextPOCode,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  startCheckingOrder,
  receiveGoodsOrder,
  approvePurchaseOrder,
  rejectPurchaseOrder,
  closeShortageOrder,
  requestSupplierSupplementOrder,
} from "../services/inventoryService";
import {
  PO_STATUS,
  createDefaultOrder,
  createOrderItem,
  calcOrderFinancials,
  validateDraft,
} from "../utils/purchaseOrder";

const mapExistingOrderItem = (item, products) => {
  const unitPrice = Number(item.unitCost ?? item.unit_cost ?? item.unit_price ?? 0);
  const quantity = Number(item.quantity ?? 0);
  const checkingQuantityRaw = item.checkingQuantity ?? item.checking_quantity;
  const checkingQuantity = Number(
    checkingQuantityRaw ?? item.quantity ?? 0,
  );
  const receivedQuantityRaw = item.receivedQuantity ?? item.received_quantity;
  const receivedQuantity = Number(
    receivedQuantityRaw ?? checkingQuantityRaw ?? item.quantity ?? 0,
  );

  const matchedProduct = products.find(
    (p) => p.id === (item.variantId || item.variant_id),
  ) || products.find(
    (p) => p.productId === (item.productId || item.product_id),
  );

  return {
    ...item,
    id: item.id ?? item.itemId ?? item.item_id,
    _key: Math.random().toString(36).slice(2, 11),
    product_id: item.productId || item.product_id,
    variant_id: item.variantId || item.variant_id,
    unit_price: Number.isFinite(unitPrice) ? unitPrice : 0,
    total: item.totalCost || item.total_cost,
    quantity: Number.isFinite(quantity) ? quantity : 0,
    checking_quantity: Number.isFinite(checkingQuantity) ? checkingQuantity : 0,
    received_quantity: Number.isFinite(receivedQuantity) ? receivedQuantity : 0,
    conversion_factor: Number(item.conversionFactor ?? item.conversion_factor ?? 1) || 1,
    expiry_date: item.expiryDate || item.expiry_date || "",
    unit: item.unit || matchedProduct?.unit || "",
    checking_unit: item.checkingUnit || item.checking_unit || item.unit || matchedProduct?.unit || "",
    name: item.name || matchedProduct?.name || "Sản phẩm",
  };
};

const toReceiptItem = (item, orderStatus) => {
  const isCompletedReceiptStatus =
    orderStatus === PO_STATUS.RECEIVED ||
    orderStatus === PO_STATUS.SHORTAGE_PENDING_APPROVAL ||
    orderStatus === PO_STATUS.SUPPLIER_SUPPLEMENT_PENDING;
  const receivedQuantity = Number(
    item.received_quantity ?? item.receivedQuantity,
  );
  const checkingQuantity = Number(
    item.checking_quantity ?? item.checkingQuantity ?? item.quantity ?? 0,
  );
  const sourceUnitCost = Number(item.unit_price ?? item.unitCost ?? 0);
  const conversionFactor = Number(item.conversion_factor ?? item.conversionFactor ?? 1);
  const normalizedFactor = Number.isFinite(conversionFactor) && conversionFactor > 0
    ? conversionFactor
    : 1;
  let checkingUnitCost = sourceUnitCost;
  if (!isCompletedReceiptStatus && normalizedFactor > 1) {
    checkingUnitCost = sourceUnitCost / normalizedFactor;
  }

  return {
    itemId: item.id ?? item._key,
    variantId: item.variantId || item.variant_id,
    receivedQuantity:
      Number.isFinite(receivedQuantity) && receivedQuantity > 0
        ? receivedQuantity
        : checkingQuantity,
    unitCost: Number.isFinite(checkingUnitCost) ? checkingUnitCost : 0,
    expiryDate: item.expiryDate || item.expiry_date || "",
    notes: item.notes || "",
  };
};

const mapReceiptItemToBaseQuantity = (ri) => Number(ri.receivedQuantity) || 0;

const mapReceiptItemToBaseCost = (ri) => Number(ri.unitCost) || 0;

const buildReceiptPayloadItems = (receiptItems) =>
  receiptItems.map((ri) => ({
    ...ri,
    receivedQuantity: mapReceiptItemToBaseQuantity(ri),
    unitCost: mapReceiptItemToBaseCost(ri),
    expiryDate: ri.expiryDate || ri.expiry_date || null,
  }));

const mapOrderResponseToFrontend = (existingOrder) => ({
  ...existingOrder,
  po_number: existingOrder.orderNumber || existingOrder.po_number,
  supplier_id: existingOrder.supplierId || existingOrder.supplier_id,
  supplier_name: existingOrder.supplierName || existingOrder.supplier_name,
  shortage_reason:
    existingOrder.shortageReason || existingOrder.shortage_reason || "",
  shortage_submitted_at:
    existingOrder.shortageSubmittedAt || existingOrder.shortage_submitted_at || null,
  manager_decision: existingOrder.managerDecision || existingOrder.manager_decision || null,
  manager_decision_note:
    existingOrder.managerDecisionNote || existingOrder.manager_decision_note || "",
  manager_decided_at:
    existingOrder.managerDecidedAt || existingOrder.manager_decided_at || null,
  discount: Number(existingOrder.discountAmount || existingOrder.discount || 0),
  tax_percent: Number(existingOrder.taxPercent || existingOrder.tax_percent || 0),
  shipping_fee: Number(existingOrder.shippingFee || existingOrder.shipping_fee || 0),
  paid_amount: Number(existingOrder.paidAmount || existingOrder.paid_amount || 0),
  subtotal: Number(existingOrder.subtotal || 0),
  tax_amount: Number(existingOrder.taxAmount || existingOrder.tax_amount || 0),
  total_amount: Number(existingOrder.totalAmount || existingOrder.total_amount || 0),
  location_id: existingOrder.locationId || existingOrder.location_id || null,
});

const mapOrderStateFromResponse = (existingOrder, products) => {
  const mappedOrder = mapOrderResponseToFrontend(existingOrder);
  const mappedItems = (existingOrder.items || []).map((item) =>
    mapExistingOrderItem(item, products),
  );

  return {
    mappedOrder,
    mappedItems,
    mappedReceiptItems: mappedItems.map((item) =>
      toReceiptItem(item, mappedOrder.status),
    ),
  };
};

const mergeImportedItems = (prevItems, importedList) => {
  const newItems = [...prevItems];
  importedList.forEach((importedInfo) => {
    const existingIndex = newItems.findIndex(
      (i) => i.variant_id === importedInfo.product.id,
    );
    const importQty = Number(importedInfo.quantity) || 1;
    const importUnitPrice = Number(importedInfo.unit_price);
    const hasImportUnitPrice =
      Number.isFinite(importUnitPrice) && importUnitPrice >= 0;

    if (existingIndex >= 0) {
      const item = newItems[existingIndex];
      newItems[existingIndex] = {
        ...item,
        quantity: item.quantity + importQty,
        ...(hasImportUnitPrice ? { unit_price: importUnitPrice } : {}),
      };
      return;
    }

    const newItem = createOrderItem(importedInfo.product);
    newItem.quantity = importQty;
    if (hasImportUnitPrice) {
      newItem.unit_price = importUnitPrice;
    }
    newItems.push(newItem);
  });

  return newItems;
};

const addOrIncreaseProduct = (prevItems, product) => {
  const existing = prevItems.find((i) => i.variant_id === product.id);
  if (existing) {
    return prevItems.map((i) =>
      i.variant_id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
    );
  }
  return [...prevItems, createOrderItem(product)];
};

const removeItemByKey = (prevItems, key) => prevItems.filter((i) => i._key !== key);

const updateItemQuantity = (prevItems, key, field, value) => {
  if (field !== "quantity") return prevItems;
  return prevItems.map((item) =>
    item._key === key ? { ...item, quantity: value } : item,
  );
};

const updateItemBatchesByKey = (prevItems, key, batches) =>
  prevItems.map((item) => (item._key === key ? { ...item, batches } : item));

const upsertReceiptItem = (prevReceiptItems, itemId, field, value) => {
  const exists = prevReceiptItems.some((ri) => ri.itemId === itemId);
  if (!exists) {
    return [
      ...prevReceiptItems,
      {
        itemId,
        receivedQuantity: 0,
        unitCost: 0,
        expiryDate: "",
        notes: "",
        [field]: value,
      },
    ];
  }

  return prevReceiptItems.map((ri) =>
    ri.itemId === itemId ? { ...ri, [field]: value } : ri,
  );
};

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
          const { mappedOrder, mappedItems, mappedReceiptItems } =
            mapOrderStateFromResponse(existingOrder, results[0]);

          setOrder(mappedOrder);
          setItems(mappedItems);
          setReceiptItems(mappedReceiptItems);

          const initialSupplierName =
            mappedOrder.supplier_name || existingOrder.supplierName || "";
          if (initialSupplierName) {
            setSupplierQuery(initialSupplierName);
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
    const discount = Math.max(0, toNumber(order.discount));
    const afterDiscount = Math.max(0, subtotal - discount);
    const taxPercent = toNumber(order.tax_percent);
    const shippingFee = toNumber(order.shipping_fee);
    const taxAmount = Math.round((afterDiscount * taxPercent) / 100);
    const total = afterDiscount + taxAmount + shippingFee;

    return {
      subtotal,
      discount,
      afterDiscount,
      taxPercent,
      shippingFee,
      taxAmount,
      total,
    };
  }, [receiptItems, order.discount, order.tax_percent, order.shipping_fee]);

  const filteredSuppliers = useMemo(() => {
    if (!supplierQuery.trim()) return suppliers;
    const q = supplierQuery.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.phone?.includes(q) ||
        s.contactInfo?.toLowerCase().includes(q),
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

  useEffect(() => {
    if (!order.location_id) return;
    const hasLocation = locations.some(
      (loc) => String(loc.id) === String(order.location_id),
    );
    if (!hasLocation) {
      setOrder((prev) => ({ ...prev, location_id: null }));
    }
  }, [locations, order.location_id]);

  useEffect(() => {
    if (!supplierQuery.trim()) {
      setOrder((prev) => ({
        ...prev,
        supplier_id: null,
        supplier_name: "",
      }));
      return;
    }

    const matchedSupplier = suppliers.find(
      (s) => s.name?.trim().toLowerCase() === supplierQuery.trim().toLowerCase(),
    );

    if (matchedSupplier) {
      setOrder((prev) => ({
        ...prev,
        supplier_id: matchedSupplier.id,
        supplier_name: matchedSupplier.name,
      }));
      return;
    }

    setOrder((prev) => ({
      ...prev,
      supplier_id: null,
      supplier_name: supplierQuery,
    }));
  }, [supplierQuery, suppliers]);

  useEffect(() => {
    if (!order.supplier_id) return;
    const matchedSupplier = suppliers.find(
      (s) => String(s.id) === String(order.supplier_id),
    );
    if (matchedSupplier && supplierQuery !== matchedSupplier.name) {
      setSupplierQuery(matchedSupplier.name);
    }
  }, [order.supplier_id, suppliers, supplierQuery]);

  const addProduct = useCallback((product) => {
    setItems((prev) => addOrIncreaseProduct(prev, product));
  }, []);

  const importProducts = useCallback((importedList) => {
    setItems((prev) => mergeImportedItems(prev, importedList));
  }, []);

  const removeItem = useCallback((_key) => {
    setItems((prev) => removeItemByKey(prev, _key));
  }, []);

  const updateItem = useCallback((_key, field, value) => {
    setItems((prev) => updateItemQuantity(prev, _key, field, value));
  }, []);

  const openBatchEditor = useCallback((_key) => {
    setBatchEditItem(_key);
  }, []);

  const closeBatchEditor = useCallback(() => {
    setBatchEditItem(null);
  }, []);

  const updateItemBatches = useCallback((_key, batches) => {
    setItems((prev) => updateItemBatchesByKey(prev, _key, batches));
  }, []);

  const batchEditData = useMemo(() => {
    if (!batchEditItem) return null;
    return items.find((i) => i._key === batchEditItem) || null;
  }, [batchEditItem, items]);

  // ─── Cập nhật số lượng kiểm kê ────────────────────────────
  const updateReceiptItem = useCallback((itemId, field, value) => {
    setReceiptItems((prev) => upsertReceiptItem(prev, itemId, field, value));
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
          discount: toNumber(order.discount),
          tax_percent: toNumber(order.tax_percent),
          shipping_fee: toNumber(order.shipping_fee),
          paid_amount: toNumber(order.paid_amount),
          subtotal: financials.subtotal,
          tax_amount: financials.taxAmount,
          total_amount: financials.total,
          remaining_amount: financials.remaining,
          items,
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
          discount: toNumber(order.discount),
          tax_percent: toNumber(order.tax_percent),
          shipping_fee: toNumber(order.shipping_fee),
          paid_amount: toNumber(order.paid_amount),
          subtotal: financials.subtotal,
          tax_amount: financials.taxAmount,
          total_amount: financials.total,
          remaining_amount: financials.remaining,
          items,
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
    async () => {
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

      const hasShortage = items.some((item) => {
        const identity = item.id ?? item._key;
        const receiptItem = receiptItems.find((ri) => ri.itemId === identity);
        const expectedQty = Number(item.checking_quantity ?? item.checkingQuantity ?? item.quantity ?? 0);
        const receivedQty = Number(receiptItem?.receivedQuantity ?? expectedQty);
        return receivedQty < expectedQty;
      });

      if (hasShortage && String(order.notes ?? "").trim() === "") {
        toast.warning("Vui lòng nhập lý do thiếu hàng ở mục Ghi chú trước khi gửi quản lý.");
        return false;
      }

      setSaving(true);
      try {
        const receiptData = {
          notes: order.notes,
          shortageReason: hasShortage ? String(order.notes ?? "").trim() : null,
          supplierId: order.supplier_id,
          locationId: order.location_id,
          taxPercent: toNumber(order.tax_percent),
          shippingFee: toNumber(order.shipping_fee),
          subtotal: checkingFinancials.subtotal,
          taxAmount: checkingFinancials.taxAmount,
          totalAmount: checkingFinancials.total,
          items: buildReceiptPayloadItems(receiptItems).map((ri) => ({
            ...ri,
            receivedQuantity: toNumber(ri.receivedQuantity),
            unitCost: toNumber(ri.unitCost),
          })),
        };
        const response = await receiveGoodsOrder(initialId, receiptData);

        const syncedCount = Number(response?.syncedPurchasePriceCount) || 0;
        if (syncedCount > 0) {
          const syncedItems = Array.isArray(response?.syncedPurchasePriceItems)
            ? response.syncedPurchasePriceItems
            : [];
          const noticePayload = {
            syncedCount,
            orderNumber: response?.orderNumber || order.po_number || null,
            syncedItems,
            createdAt: response?.syncedPurchasePriceAt || new Date().toISOString(),
          };
          try {
            sessionStorage.setItem("priceSyncNotice", JSON.stringify(noticePayload));
          } catch (storageError) {
            console.error("Không thể lưu thông báo đồng bộ giá:", storageError);
          }
        }

        if (response) {
          const { mappedOrder, mappedItems, mappedReceiptItems } =
            mapOrderStateFromResponse(response, products);
          setOrder(mappedOrder);
          setItems(mappedItems);
          setReceiptItems(mappedReceiptItems);
        }

        if (response?.status === PO_STATUS.SHORTAGE_PENDING_APPROVAL) {
          toast.success("Đã nhập kho phần hàng nhận được và chuyển sang chờ quản lý xử lý thiếu.");
        } else {
          toast.success("Đã xác nhận nhập kho và cập nhật tồn kho thành công!");
        }
        if (syncedCount > 0) {
          toast.info(`Đã đồng bộ giá nhập cho ${syncedCount} sản phẩm từ phiếu nhập này.`);
        }
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
      products,
      order.notes,
      order.supplier_id,
      order.location_id,
      order.tax_percent,
      order.shipping_fee,
      order.po_number,
      checkingFinancials,
    ],
  );

  const closeShortage = useCallback(async () => {
    if (!initialId) return false;
    if (order.status !== PO_STATUS.SHORTAGE_PENDING_APPROVAL) {
      toast.warning("Chỉ có thể chốt thiếu khi phiếu đang chờ quản lý xử lý.");
      return false;
    }

    setSaving(true);
    try {
      const managerDecisionNote =
        order.manager_decision_note ?? order.managerDecisionNote ?? "";
      const response = await closeShortageOrder(initialId, managerDecisionNote);
      if (response) {
        const { mappedOrder, mappedItems, mappedReceiptItems } =
          mapOrderStateFromResponse(response, products);
        setOrder(mappedOrder);
        setItems(mappedItems);
        setReceiptItems(mappedReceiptItems);
      }
      toast.success("Đã chốt thiếu và cập nhật tồn kho theo số thực nhận.");
      return true;
    } catch (err) {
      console.error("Close shortage error", err);
      toast.error("Lỗi khi chốt thiếu: " + err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [
    initialId,
    order.status,
    order.manager_decision_note,
    order.managerDecisionNote,
    products,
  ]);

  const requestSupplierSupplement = useCallback(async () => {
    if (!initialId) return false;
    if (order.status !== PO_STATUS.SHORTAGE_PENDING_APPROVAL) {
      toast.warning("Chỉ có thể yêu cầu giao bù khi phiếu đang chờ quản lý xử lý.");
      return false;
    }

    setSaving(true);
    try {
      const managerDecisionNote =
        order.manager_decision_note ?? order.managerDecisionNote ?? "";
      const response = await requestSupplierSupplementOrder(initialId, managerDecisionNote);
      if (response) {
        const { mappedOrder, mappedItems, mappedReceiptItems } =
          mapOrderStateFromResponse(response, products);
        setOrder(mappedOrder);
        setItems(mappedItems);
        setReceiptItems(mappedReceiptItems);
      }
      toast.success("Đã gửi yêu cầu NCC giao bù.");
      return true;
    } catch (err) {
      console.error("Request supplement error", err);
      toast.error("Lỗi khi yêu cầu NCC giao bù: " + err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [
    initialId,
    order.status,
    order.manager_decision_note,
    order.managerDecisionNote,
    products,
  ]);

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
    closeShortage,
    requestSupplierSupplement,
    rejectOrder,
    deleteOrder,
  };
}
