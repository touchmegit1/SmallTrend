import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useToast } from "../../../components/ui/Toast";
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
  rejectShortageOrder,
} from "../../../services/inventory/inventoryService";
import {
  PO_STATUS,
  createDefaultOrder,
  createOrderItem,
  calcOrderFinancials,
  validateDraft,
} from "../../../utils/purchaseOrder";

const mapExistingOrderItem = (item, products) => {
  const unitPrice = Number(item.unitCost ?? item.unit_cost ?? item.unit_price ?? 0);
  const quantity = Number(item.quantity ?? 0);
  const checkingQuantityRaw = item.checkingQuantity ?? item.checking_quantity;
  const conversionFactor = Number(item.conversionFactor ?? item.conversion_factor ?? 1) || 1;
  const derivedCheckingQuantity =
    conversionFactor > 1 && Number.isFinite(quantity) && quantity > 0
      ? quantity * conversionFactor
      : quantity;
  const checkingQuantity = Number(
    derivedCheckingQuantity ?? checkingQuantityRaw ?? item.quantity ?? 0,
  );
  const receivedQuantityRaw = item.receivedQuantity ?? item.received_quantity;
  const receivedQuantity = Number(
    receivedQuantityRaw ?? derivedCheckingQuantity ?? checkingQuantityRaw ?? item.quantity ?? 0,
  );

  const normalizedCheckingQuantity = Number.isFinite(checkingQuantity)
    ? checkingQuantity
    : Number(derivedCheckingQuantity ?? item.quantity ?? 0);
  const normalizedReceivedQuantity = Number.isFinite(receivedQuantity)
    ? receivedQuantity
    : normalizedCheckingQuantity;

  const normalizedConversionFactor = Number(item.conversionFactor ?? item.conversion_factor ?? 1) || 1;

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
    checking_quantity: normalizedCheckingQuantity,
    received_quantity: normalizedReceivedQuantity,
    conversion_factor: normalizedConversionFactor,
    expiry_date: item.expiryDate || item.expiry_date || "",
    unit: item.unit || matchedProduct?.unit || "",
    checking_unit: item.checkingUnit || item.checking_unit || item.unit || matchedProduct?.unit || "",
    name: item.name || matchedProduct?.name || "Sản phẩm",
    image_url: item.imageUrl || item.image_url || matchedProduct?.image_url || matchedProduct?.imageUrl || null,
    attributes: item.attributes || matchedProduct?.attributes || null,
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
    checkingUnitCost = sourceUnitCost;
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

const mapReceiptItemToBaseCost = (ri) => {
  return Number(ri.unitCost) || 0;
};

const normalizeExpiryDate = (value) => {
  if (!value) return null;
  const str = String(value).trim();
  if (!str) return null;
  return str.includes("T") ? str.split("T")[0] : str;
};

const buildReceiptPayloadItems = (receiptItems, items) => {
  const receiptById = new Map((receiptItems || []).map((ri) => [ri.itemId, ri]));

  return (items || []).map((item) => {
    const identity = item.id ?? item._key;
    const ri = receiptById.get(identity) || {};

    return {
      itemId: identity,
      variantId: ri.variantId ?? item.variantId ?? item.variant_id,
      receivedQuantity: mapReceiptItemToBaseQuantity({
        receivedQuantity:
          ri.receivedQuantity ??
          item.received_quantity ??
          item.receivedQuantity ??
          item.checking_quantity ??
          item.checkingQuantity ??
          item.quantity ??
          0,
      }),
      unitCost: mapReceiptItemToBaseCost({
        unitCost: ri.unitCost ?? item.unit_price ?? item.unitCost ?? 0,
      }),
      expiryDate: normalizeExpiryDate(
        ri.expiryDate ?? ri.expiry_date ?? item.expiry_date ?? item.expiryDate,
      ),
      notes: ri.notes ?? item.notes ?? "",
    };
  });
};

const normalizeFinancialInput = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(value);
  if (!Number.isFinite(num)) return "";
  return num === 0 ? "" : num;
};

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
  rejection_reason:
    existingOrder.rejectionReason || existingOrder.rejection_reason || "",
  discount: Number(existingOrder.discountAmount || existingOrder.discount || 0),
  tax_percent: normalizeFinancialInput(existingOrder.taxPercent ?? existingOrder.tax_percent),
  shipping_fee: normalizeFinancialInput(existingOrder.shippingFee ?? existingOrder.shipping_fee),
  paid_amount: normalizeFinancialInput(existingOrder.paidAmount ?? existingOrder.paid_amount),
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

const updateItemField = (prevItems, key, field, value) => {
  return prevItems.map((item) => {
    if (item._key !== key) return item;
    if (field === "quantity") {
      return { ...item, quantity: value };
    }
    return { ...item, [field]: value };
  });
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

const normalizeText = (value) => {
  if (value == null) return null;
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeNumber = (value) => {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
};

const buildResubmissionSnapshot = (order, items) => {
  const normalizedItems = (items || [])
    .map((item) => ({
      variant_id: item.variant_id ?? item.variantId ?? null,
      product_id: item.product_id ?? item.productId ?? null,
      quantity: normalizeNumber(item.quantity),
      unit_price: normalizeNumber(item.unit_price ?? item.unitCost),
      expiry_date: item.expiry_date ?? item.expiryDate ?? null,
      notes: normalizeText(item.notes),
    }))
    .sort((a, b) => {
      const aKey = `${a.variant_id ?? ""}-${a.product_id ?? ""}`;
      const bKey = `${b.variant_id ?? ""}-${b.product_id ?? ""}`;
      return aKey.localeCompare(bKey);
    });

  return {
    supplier_id: order?.supplier_id ?? null,
    location_id: order?.location_id ?? null,
    contract_id: order?.contract_id ?? null,
    expected_delivery_date: order?.expected_delivery_date ?? order?.expectedDeliveryDate ?? null,
    discount: normalizeNumber(order?.discount),
    tax_percent: normalizeNumber(order?.tax_percent),
    shipping_fee: normalizeNumber(order?.shipping_fee),
    paid_amount: normalizeNumber(order?.paid_amount),
    notes: normalizeText(order?.notes),
    items: normalizedItems,
  };
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
  const rejectedResubmissionSnapshotRef = useRef(null);

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
            import("../../../services/inventory/inventoryService").then((m) =>
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

          if (mappedOrder.status === PO_STATUS.REJECTED) {
            rejectedResubmissionSnapshotRef.current = buildResubmissionSnapshot(
              mappedOrder,
              mappedItems,
            );
          } else {
            rejectedResubmissionSnapshotRef.current = null;
          }

          const initialSupplierName =
            mappedOrder.supplier_name || existingOrder.supplierName || "";

          if (initialSupplierName) {
            setSupplierQuery(initialSupplierName);
          }
        } else {
          rejectedResubmissionSnapshotRef.current = null;
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
    const itemByIdentity = new Map(
      (items || []).map((item) => [item.id ?? item._key, item]),
    );

    const subtotal = receiptItems.reduce((sum, ri) => {
      const receivedQty = toNumber(ri.receivedQuantity);
      const unitCost = toNumber(ri.unitCost);
      const sourceItem = itemByIdentity.get(ri.itemId);
      const conversionFactor = Number(
        sourceItem?.conversion_factor ?? sourceItem?.conversionFactor ?? 1,
      );
      const normalizedFactor = Number.isFinite(conversionFactor) && conversionFactor > 0
        ? conversionFactor
        : 1;
      const orderedEquivalentQty = normalizedFactor > 1
        ? receivedQty / normalizedFactor
        : receivedQty;
      const lineTotal = orderedEquivalentQty * unitCost;
      return sum + lineTotal;
    }, 0);
    const discount = Math.max(0, toNumber(order.discount));
    const afterDiscount = Math.max(0, subtotal - discount);
    const taxPercent = toNumber(order.tax_percent);
    const shippingFee = toNumber(order.shipping_fee);
    const taxAmount = Math.round((afterDiscount * taxPercent) / 100);
    const total = Math.round(afterDiscount + taxAmount + shippingFee);

    return {
      subtotal,
      discount,
      afterDiscount,
      taxPercent,
      shippingFee,
      taxAmount,
      total,
    };
  }, [receiptItems, items, order.discount, order.tax_percent, order.shipping_fee]);

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

  const lowStockSuggestions = useMemo(() => {
    const selectedVariantIds = new Set(items.map((item) => item.variant_id));

    return products
      .map((product) => {
        const stockQty = Number(product.stock_quantity ?? 0);
        return { ...product, stockQty };
      })
      .filter(
        (product) =>
          product.stockQty <= 1 &&
          !selectedVariantIds.has(product.id),
      )
      .sort((a, b) => a.stockQty - b.stockQty);
  }, [products, items]);

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
    setItems((prev) => updateItemField(prev, _key, field, value));
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
          tax_percent: order.tax_percent,
          shipping_fee: order.shipping_fee,
          paid_amount: order.paid_amount,
          subtotal: financials.subtotal,
          tax_amount: financials.taxAmount,
          total_amount: financials.total,
          remaining_amount: financials.remaining,
          items,
        };

        if (initialId) {
          await updatePurchaseOrder(initialId, orderData);
          if (order.status === PO_STATUS.REJECTED) {
            setOrder((prev) => ({ ...prev, status: PO_STATUS.DRAFT }));
            rejectedResubmissionSnapshotRef.current = null;
          }
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

      if (initialId && order.status === PO_STATUS.REJECTED) {
        const baseSnapshot = rejectedResubmissionSnapshotRef.current;
        const currentSnapshot = buildResubmissionSnapshot(order, items);
        if (baseSnapshot && JSON.stringify(baseSnapshot) === JSON.stringify(currentSnapshot)) {
          toast.warning("Phiếu bị từ chối phải được chỉnh sửa trước khi gửi duyệt lại.");
          return false;
        }
      }

      setSaving(true);
      try {
        const orderData = {
          ...order,
          status: PO_STATUS.PENDING,
          discount: toNumber(order.discount),
          tax_percent: order.tax_percent,
          shipping_fee: order.shipping_fee,
          paid_amount: order.paid_amount,
          subtotal: financials.subtotal,
          tax_amount: financials.taxAmount,
          total_amount: financials.total,
          remaining_amount: financials.remaining,
          items,
        };

        if (initialId) {
          await updatePurchaseOrder(initialId, orderData);
          if (order.status === PO_STATUS.REJECTED) {
            setOrder((prev) => ({ ...prev, status: PO_STATUS.PENDING }));
            rejectedResubmissionSnapshotRef.current = null;
          }
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
      if (toNumber(order.paid_amount) < 0) {
        toast.warning("Số tiền đã thanh toán không được âm.");
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
          paidAmount: toNumber(order.paid_amount),
          subtotal: checkingFinancials.subtotal,
          taxAmount: checkingFinancials.taxAmount,
          totalAmount: checkingFinancials.total,
          items: buildReceiptPayloadItems(receiptItems, items).map((ri) => ({
            ...ri,
            receivedQuantity: toNumber(ri.receivedQuantity),
            unitCost: toNumber(ri.unitCost),
          })),
        };
        const response = await receiveGoodsOrder(initialId, receiptData);

        const syncedCount = Number(
          response?.syncedPurchasePriceCount
          ?? response?.synced_purchase_price_count
          ?? 0,
        ) || 0;
        if (syncedCount > 0) {
          const syncedItemsRaw =
            response?.syncedPurchasePriceItems
            ?? response?.synced_purchase_price_items;
          const syncedItems = Array.isArray(syncedItemsRaw) ? syncedItemsRaw : [];
          const noticePayload = {
            syncedCount,
            orderNumber: response?.orderNumber || response?.order_number || order.po_number || null,
            syncedItems,
            createdAt:
              response?.syncedPurchasePriceAt
              || response?.synced_purchase_price_at
              || new Date().toISOString(),
          };
          try {
            sessionStorage.setItem("priceSyncNotice", JSON.stringify(noticePayload));
            localStorage.setItem(
              "priceSyncNoticeBroadcast",
              JSON.stringify({ ...noticePayload, _broadcastAt: Date.now() }),
            );
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("price-sync-notice", { detail: noticePayload }));
            }
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
          toast.success("Đã ghi nhận kiểm kê thiếu và chuyển phiếu sang chờ quản lý xử lý.");
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
      order.paid_amount,
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

  const rejectShortage = useCallback(async (rejectionReason) => {
    if (!initialId) return false;
    if (order.status !== PO_STATUS.SHORTAGE_PENDING_APPROVAL) {
      toast.warning("Chỉ có thể từ chối khi phiếu đang chờ quản lý xử lý thiếu hàng.");
      return false;
    }
    if (!rejectionReason || rejectionReason.trim() === "") {
      toast.warning("Bạn phải nhập lý do từ chối nhập hàng.");
      return false;
    }

    setSaving(true);
    try {
      const response = await rejectShortageOrder(initialId, rejectionReason.trim());
      if (response) {
        const { mappedOrder, mappedItems, mappedReceiptItems } =
          mapOrderStateFromResponse(response, products);
        setOrder(mappedOrder);
        setItems(mappedItems);
        setReceiptItems(mappedReceiptItems);
      }
      toast.success("Đã từ chối nhập hàng thiếu và chuyển phiếu về trạng thái từ chối.");
      return true;
    } catch (err) {
      console.error("Reject shortage error", err);
      toast.error("Lỗi khi từ chối nhập hàng thiếu: " + err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [initialId, order.status, products]);

  const rejectOrderUnified = useCallback(
    async (navigate, rejectionReason) => {
      if (order.status === PO_STATUS.SHORTAGE_PENDING_APPROVAL) {
        return rejectShortage(rejectionReason);
      }
      return rejectOrder(navigate, rejectionReason);
    },
    [order.status, rejectOrder, rejectShortage],
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
    lowStockSuggestions,
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
    rejectOrder: rejectOrderUnified,
    deleteOrder,
  };
}
