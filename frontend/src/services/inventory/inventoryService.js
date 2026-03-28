const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
const SPRING_API =
  import.meta.env.PROD ? "/api/inventory" : (import.meta.env.VITE_INVENTORY_API_BASE_URL || "http://localhost:8081/api/inventory");

// ─── Helper: get auth token ──────────────────────────────
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ═══════════════════════════════════════════════════════════
//  Purchase Orders (Spring Boot backend)
// ═══════════════════════════════════════════════════════════

export const getPurchaseOrders = async () => {
  const response = await fetch(`${SPRING_API}/purchase-orders`, {
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    throw new Error("Vui lòng đăng nhập lại");
  }
  if (!response.ok) {
    throw new Error(
      `Lỗi ${response.status}: Không thể tải danh sách phiếu nhập`,
    );
  }

  const data = await response.json();
  return data.map((order) => ({
    ...order,
    order_number: order.orderNumber || order.order_number,
    supplier_id: order.supplierId || order.supplier_id,
    supplier_name: order.supplierName || order.supplier_name,
    contract_id: order.contractId || order.contract_id,
    location_id: order.locationId || order.location_id,
    total_amount: order.totalAmount ?? order.total_amount,
    created_at: order.createdAt || order.created_at,
    tax_percent: order.taxPercent ?? order.tax_percent,
    shipping_fee: order.shippingFee ?? order.shipping_fee,
    paid_amount: order.paidAmount ?? order.paid_amount,
    tax_amount: order.taxAmount ?? order.tax_amount,
    shortage_reason: order.shortageReason || order.shortage_reason,
    manager_decision_note: order.managerDecisionNote || order.manager_decision_note,
    rejection_reason: order.rejectionReason || order.rejection_reason,
  }));
};

export const getPurchaseOrderById = async (id) => {
  const response = await fetch(`${SPRING_API}/purchase-orders/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Failed to fetch purchase order");
  }
  const order = await response.json();
  return {
    ...order,
    order_number: order.orderNumber || order.order_number,
    supplier_id: order.supplierId || order.supplier_id,
    supplier_name: order.supplierName || order.supplier_name,
    contract_id: order.contractId || order.contract_id,
    location_id: order.locationId || order.location_id,
    total_amount: order.totalAmount ?? order.total_amount,
    created_at: order.createdAt || order.created_at,
    tax_percent: order.taxPercent ?? order.tax_percent,
    shipping_fee: order.shippingFee ?? order.shipping_fee,
    paid_amount: order.paidAmount ?? order.paid_amount,
    tax_amount: order.taxAmount ?? order.tax_amount,
    shortage_reason: order.shortageReason || order.shortage_reason,
    manager_decision_note: order.managerDecisionNote || order.manager_decision_note,
    rejection_reason: order.rejectionReason || order.rejection_reason,
  };
};

export const getNextPOCode = async () => {
  const response = await fetch(`${SPRING_API}/purchase-orders/next-code`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    return "PO-" + Date.now();
  }
  const data = await response.json();
  return data.code;
};

export const createPurchaseOrder = async (orderData) => {
  const payload = mapOrderToBackend(orderData);
  const response = await fetch(`${SPRING_API}/purchase-orders/draft`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Failed to save draft");
  }
  return response.json();
};

export const deletePurchaseOrder = async (id) => {
  const response = await fetch(`${SPRING_API}/purchase-orders/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to delete purchase order");
  return true;
};

export const updatePurchaseOrder = async (id, orderData) => {
  const payload = mapOrderToBackend(orderData);
  const response = await fetch(`${SPRING_API}/purchase-orders/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Failed to update purchase order");
  }
  return response.json();
};

// ─── Helper: map frontend → backend request ──────────────
function mapOrderToBackend(orderData) {
  const discountAmount = Number(orderData.discountAmount ?? orderData.discount ?? 0);
  const taxPercent = Number(orderData.taxPercent ?? orderData.tax_percent ?? 0);
  const shippingFee = Number(orderData.shippingFee ?? orderData.shipping_fee ?? 0);
  const paidAmount = Number(orderData.paidAmount ?? orderData.paid_amount ?? 0);
  const subtotal = Number(orderData.subtotal ?? 0);
  const taxAmount = Number(orderData.taxAmount ?? orderData.tax_amount ?? 0);
  const totalAmount = Number(orderData.totalAmount ?? orderData.total_amount ?? 0);

  return {
    orderNumber:
      orderData.order_number ||
      orderData.orderNumber ||
      orderData.po_number ||
      orderData.poNumber,
    supplierId: orderData.supplier_id || orderData.supplierId,
    contractId: orderData.contract_id || orderData.contractId || null,
    locationId: orderData.location_id || orderData.locationId || null,
    status: orderData.status,
    discountAmount: Number.isFinite(discountAmount) ? discountAmount : 0,
    taxAmount: Number.isFinite(taxAmount) ? taxAmount : 0,
    taxPercent: Number.isFinite(taxPercent) ? taxPercent : 0,
    subtotal: Number.isFinite(subtotal) ? subtotal : 0,
    totalAmount: Number.isFinite(totalAmount) ? totalAmount : 0,
    shippingFee: Number.isFinite(shippingFee) ? shippingFee : 0,
    paidAmount: Number.isFinite(paidAmount) ? paidAmount : 0,
    expectedDeliveryDate:
      orderData.expected_delivery_date ||
      orderData.expectedDeliveryDate ||
      null,
    notes: orderData.notes || "",
    createdBy: orderData.created_by || orderData.createdBy || 1,
    items: (orderData.items || []).map((item) => {
      const quantity = Number(item.quantity ?? 0);
      const unitCost = Number(item.unitCost ?? item.unit_cost ?? item.unit_price ?? 0);
      const receivedQuantity = Number(
        item.receivedQuantity ?? item.received_quantity ?? quantity,
      );
      const totalCostRaw = Number(item.totalCost ?? item.total_cost ?? quantity * unitCost);
      return {
        productId: item.product_id || item.productId,
        variantId: item.variant_id || item.variantId,
        sku: item.sku || "",
        name: item.name || "",
        quantity: Number.isFinite(quantity) ? quantity : 0,
        unitCost: Number.isFinite(unitCost) ? unitCost : 0,
        totalCost: Number.isFinite(totalCostRaw) ? totalCostRaw : 0,
        receivedQuantity: Number.isFinite(receivedQuantity) ? receivedQuantity : 0,
        expiryDate: item.expiryDate || item.expiry_date || null,
        notes: item.notes || "",
      };
    }),
  };
}

// ─── New: Contract & Goods Receipt APIs ──────────────────

export const startCheckingOrder = async (id) => {
  const response = await fetch(`${SPRING_API}/purchase-orders/${id}/start-checking`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Lỗi khi bắt đầu kiểm kê");
  }
  return response.json();
};

export const receiveGoodsOrder = async (id, receiptData) => {
  const response = await fetch(`${SPRING_API}/purchase-orders/${id}/receive`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(receiptData),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Lỗi khi xác nhận nhập kho");
  }
  return response.json();
};

export const approvePurchaseOrder = async (id) => {
  const response = await fetch(`${SPRING_API}/purchase-orders/${id}/approve`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Lỗi khi duyệt phiếu nhập");
  }
  return response.json();
};

export const rejectPurchaseOrder = async (id, rejectionReason) => {
  const response = await fetch(`${SPRING_API}/purchase-orders/${id}/reject`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ rejectionReason }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Lỗi khi từ chối phiếu nhập");
  }
  return response.json();
};

export const closeShortageOrder = async (id, managerDecisionNote) => {
  const response = await fetch(`${SPRING_API}/purchase-orders/${id}/shortage/close`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ managerDecisionNote: managerDecisionNote || "" }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Lỗi khi chốt thiếu hàng");
  }
  return response.json();
};

export const requestSupplierSupplementOrder = async (id, managerDecisionNote) => {
  const response = await fetch(
    `${SPRING_API}/purchase-orders/${id}/shortage/request-supplement`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ managerDecisionNote: managerDecisionNote || "" }),
    },
  );
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Lỗi khi yêu cầu nhà cung cấp giao bù");
  }
  return response.json();
};

export const rejectShortageOrder = async (id, rejectionReason) => {
  const response = await fetch(`${SPRING_API}/purchase-orders/${id}/shortage/reject`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ rejectionReason }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Lỗi khi từ chối nhập hàng thiếu");
  }
  return response.json();
};

// ═══════════════════════════════════════════════════════════
//  Reference Data (Spring Boot backend)
// ═══════════════════════════════════════════════════════════

export const getSuppliers = async () => {
  const response = await fetch(`${SPRING_API}/suppliers`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch suppliers");
  return response.json();
};

export const getProducts = async () => {
  const response = await fetch(`${SPRING_API}/products`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch products");
  const data = await response.json();
  return data.map((p) => ({
    ...p,
    purchase_price: p.purchasePrice || p.purchase_price || 0,
    stock_quantity: p.stockQuantity ?? p.stock_quantity ?? 0,
    image_url: p.imageUrl || p.image_url,
    unit: p.unit || "",
    attributes: p.attributes || null,
  }));
};

// ═══════════════════════════════════════════════════════════
//  Dashboard Data (Spring Boot backend)
// ═══════════════════════════════════════════════════════════

export const getDashboardProducts = async () => {
  const response = await fetch(`${SPRING_API}/dashboard/products`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch dashboard products");
  const data = await response.json();
  return data.map((p) => ({
    ...p,
    stock_quantity: p.stockQuantity,
    min_stock: p.minStock,
    purchase_price: p.purchasePrice,
    retail_price: p.retailPrice,
    image_url: p.imageUrl,
    is_active: p.isActive,
    category_id: p.categoryId,
    category_name: p.categoryName,
    brand_id: p.brandId,
    brand_name: p.brandName,
    attributes: p.attributes || null,
    unit: p.unit || "",
  }));
};

export const getDashboardSummary = async () => {
  const response = await fetch(`${SPRING_API}/dashboard/summary`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch dashboard summary");
  return response.json();
};

export const getDashboardBatches = async () => {
  const response = await fetch(`${SPRING_API}/dashboard/batches`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch dashboard batches");
  const data = await response.json();
  return data.map((b) => ({
    ...b,
    id: b.batchId,
    batch_code: b.batchCode,
    product_name: b.productName,
    expiry_date: b.expiryDate,
    days_until_expiry: b.daysUntilExpiry,
    received_date: b.receivedDate,
  }));
};

export const getRecentActivities = async () => {
  const response = await fetch(`${SPRING_API}/dashboard/recent-activities`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch recent activities");
  const data = await response.json();
  return data.map((a) => ({
    ...a,
    created_at: a.createdAt,
    reference_type: a.referenceType,
    reference_code: a.referenceCode,
    product_name: a.productName,
  }));
};

export const reseedStock = async () => {
  const response = await fetch(`${SPRING_API}/debug/reseed-stock`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to reseed stock");
  return response.json();
};

export const getCategories = async () => {
  const response = await fetch(`${SPRING_API}/categories`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch categories");
  return response.json();
};

export const getBrands = async () => {
  const response = await fetch(`${SPRING_API}/brands`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch brands");
  return response.json();
};

// ═══════════════════════════════════════════════════════════
//  Stock & Batches (Spring Boot backend)
// ═══════════════════════════════════════════════════════════

export const getStockMovements = async () => {
  const response = await fetch(`${SPRING_API}/stock-movements`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch stock movements");
  const data = await response.json();
  return data.map((sm) => ({
    ...sm,
    variant_id: sm.variantId,
    from_bin_id: sm.fromBinId,
    to_bin_id: sm.toBinId,
    created_at: sm.createdAt,
  }));
};

export const getProductBatches = async () => {
  const response = await fetch(`${SPRING_API}/product-batches`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch product batches");
  const data = await response.json();
  return data.map((b) => ({
    ...b,
    batch_code: b.batchCode,
    product_id: b.productId,
    expiry_date: b.expiryDate,
    received_date: b.receivedDate,
    created_at: b.createdAt,
  }));
};

// ═══════════════════════════════════════════════════════════
//  Location CRUD (Spring Boot backend)
// ═══════════════════════════════════════════════════════════

const getApiErrorMessage = async (response, fallbackMessage) => {
  const err = await response.json().catch(() => null);
  return err?.message || fallbackMessage;
};

export const updateLocation = async (id, locationData) => {
  const response = await fetch(`${SPRING_API}/locations/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      locationName: locationData.location_name,
      locationCode: locationData.location_code,
      locationType: locationData.location_type,
      address: locationData.address,
      capacity: Number(locationData.capacity ?? 0),
      description: locationData.description,
    }),
  });
  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Không thể cập nhật vị trí"),
    );
  }
  const data = await response.json();
  return {
    ...data,
    location_name: data.locationName,
    location_code: data.locationCode,
    location_type: data.locationType,
    created_at: data.createdAt,
  };
};

export const deleteLocation = async (id) => {
  const response = await fetch(`${SPRING_API}/locations/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Không thể xóa vị trí"),
    );
  }
  return true;
};

export const toLocationTransferPayload = ({
  fromLocationId,
  toLocationId,
  variantId,
  batchId,
  quantity,
}) => ({
  fromLocationId: Number(fromLocationId),
  toLocationId: Number(toLocationId),
  variantId: Number(variantId),
  batchId: Number(batchId),
  quantity: Number(quantity),
});

const validateLocationTransferPayload = (payload) => {
  if (
    !payload.fromLocationId ||
    !payload.toLocationId ||
    !payload.variantId ||
    !payload.batchId
  ) {
    throw new Error("Thiếu thông tin chuyển hàng");
  }
  if (payload.fromLocationId === payload.toLocationId) {
    throw new Error("Vị trí nguồn và đích không được trùng nhau");
  }
  if (!Number.isInteger(payload.quantity) || payload.quantity <= 0) {
    throw new Error("Số lượng chuyển phải lớn hơn 0");
  }
};

export const transferStock = async (request) => {
  const payload = toLocationTransferPayload(request);
  validateLocationTransferPayload(payload);

  const response = await fetch(`${SPRING_API}/locations/transfer`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Lỗi khi chuyển hàng giữa vị trí"),
    );
  }
  return response.json();
};

export const getActiveLocations = async () => {
  const response = await fetch(`${SPRING_API}/locations/active`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Không thể tải vị trí đang hoạt động"),
    );
  }
  const data = await response.json();
  return data.map((loc) => ({
    ...loc,
    id: loc.id ?? loc.locationId ?? loc.location_id,
    location_name: loc.locationName || loc.location_name,
    location_code: loc.locationCode || loc.location_code,
    location_type: loc.locationType || loc.location_type,
    created_at: loc.createdAt || loc.created_at,
    total_products: loc.totalProducts || loc.total_products || 0,
    stock_items: (loc.stockItems || loc.stock_items || []).map((item) => ({
      ...item,
      variant_id: item.variantId || item.variant_id,
      product_name: item.productName || item.product_name,
      variant_unit: item.variantUnit || item.variant_unit,
      batch_code: item.batchCode || item.batch_code,
      batch_id: item.batchId || item.batch_id,
      expiry_date: item.expiryDate || item.expiry_date,
      days_until_expiry: item.daysUntilExpiry ?? item.days_until_expiry,
      warning_status: item.warningStatus || item.warning_status || null,
    })),
  }));
};

export const getLocationStocks = async (locationId) => {
  const response = await fetch(`${SPRING_API}/locations/${locationId}/stocks`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Không thể tải tồn kho vị trí"),
    );
  }
  const data = await response.json();
  return data.map((item) => ({
    ...item,
    variant_id: item.variantId || item.variant_id,
    product_name: item.productName || item.product_name,
    variant_unit: item.variantUnit || item.variant_unit,
    batch_code: item.batchCode || item.batch_code,
    batch_id: item.batchId || item.batch_id,
  }));
};

export const getLocations = async () => {
  const response = await fetch(`${SPRING_API}/locations`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, "Không thể tải vị trí"));
  }
  const data = await response.json();
  return data.map((loc) => ({
    ...loc,
    location_name: loc.locationName || loc.location_name,
    location_code: loc.locationCode || loc.location_code,
    location_type: loc.locationType || loc.location_type,
    created_at: loc.createdAt || loc.created_at,
    total_products: loc.totalProducts || loc.total_products || 0,
    stock_items: (loc.stockItems || loc.stock_items || []).map((item) => ({
      ...item,
      variant_id: item.variantId || item.variant_id,
      product_name: item.productName || item.product_name,
      variant_unit: item.variantUnit || item.variant_unit,
      batch_code: item.batchCode || item.batch_code,
      batch_id: item.batchId || item.batch_id,
      expiry_date: item.expiryDate || item.expiry_date,
      days_until_expiry: item.daysUntilExpiry ?? item.days_until_expiry,
      warning_status: item.warningStatus || item.warning_status || null,
    })),
  }));
};


export const deleteLocationById = deleteLocation;

export const locationApi = {
  getLocations,
  getActiveLocations,
  getLocationStocks,
  updateLocation,
  deleteLocation,
  transferStock,
  toLocationTransferPayload,
};

// ═══════════════════════════════════════════════════════════
//  Inventory Count (Spring Boot backend)
// ═══════════════════════════════════════════════════════════

export const getInventoryCounts = async () => {
  const response = await fetch(`${SPRING_API}/inventory-counts`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch inventory counts");
  const data = await response.json();
  return data.map((ic) => ({
    ...ic,
    location_id: ic.locationId || ic.location_id,
    location_name: ic.locationName || ic.location_name,
    total_shortage_value: ic.totalShortageValue ?? ic.total_shortage_value ?? 0,
    total_overage_value: ic.totalOverageValue ?? ic.total_overage_value ?? 0,
    total_difference_value:
      ic.totalDifferenceValue ?? ic.total_difference_value ?? 0,
    created_by: ic.createdBy || ic.created_by,
    confirmed_by: ic.confirmedBy || ic.confirmed_by,
    created_at: ic.createdAt || ic.created_at,
    confirmed_at: ic.confirmedAt || ic.confirmed_at,
    rejection_reason: ic.rejectionReason || ic.rejection_reason || "",
  }));
};

export const getInventoryCountById = async (id) => {
  const response = await fetch(`${SPRING_API}/inventory-counts/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Không tìm thấy phiếu kiểm kho.");
  const ic = await response.json();
  return {
    ...ic,
    location_id: ic.locationId || ic.location_id,
    location_name: ic.locationName || ic.location_name,
    total_shortage_value: ic.totalShortageValue ?? ic.total_shortage_value ?? 0,
    total_overage_value: ic.totalOverageValue ?? ic.total_overage_value ?? 0,
    total_difference_value:
      ic.totalDifferenceValue ?? ic.total_difference_value ?? 0,
    created_by: ic.createdBy || ic.created_by,
    confirmed_by: ic.confirmedBy || ic.confirmed_by,
    created_at: ic.createdAt || ic.created_at,
    confirmed_at: ic.confirmedAt || ic.confirmed_at,
    rejection_reason: ic.rejectionReason || ic.rejection_reason || "",
    items: (ic.items || []).map((item) => ({
      ...item,
      product_id: item.productId || item.product_id,
      variant_id: item.variantId || item.variant_id,
      system_quantity: item.systemQuantity ?? item.system_quantity,
      actual_quantity: item.actualQuantity ?? item.actual_quantity,
      difference_quantity: item.differenceQuantity ?? item.difference_quantity,
      difference_value: item.differenceValue ?? item.difference_value,
    })),
  };
};

export const getInventoryCountNextCode = async () => {
  const response = await fetch(`${SPRING_API}/inventory-counts/next-code`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to get next code");
  const data = await response.json();
  return data.code;
};

export const saveInventoryCountDraft = async (request) => {
  const body = mapCountRequestToBackend(request);
  const response = await fetch(`${SPRING_API}/inventory-counts/draft`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("Failed to save draft");
  return response.json();
};

export const updateInventoryCount = async (id, request) => {
  const body = mapCountRequestToBackend(request);
  const response = await fetch(`${SPRING_API}/inventory-counts/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("Failed to update inventory count");
  return response.json();
};

export const confirmInventoryCount = async (id, request) => {
  const body = mapCountRequestToBackend(request);
  const response = await fetch(`${SPRING_API}/inventory-counts/${id}/confirm`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("Failed to confirm inventory count");
  return response.json();
};

export const createAndConfirmInventoryCount = async (request) => {
  const body = mapCountRequestToBackend(request);
  const response = await fetch(`${SPRING_API}/inventory-counts/confirm`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok)
    throw new Error("Failed to create and confirm inventory count");
  return response.json();
};

export const submitInventoryCount = async (id, request) => {
  const body = mapCountRequestToBackend(request);
  const response = await fetch(`${SPRING_API}/inventory-counts/${id}/submit`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("Lỗi khi gửi duyệt phiếu kiểm kho");
  return response.json();
};

export const createAndSubmitInventoryCount = async (request) => {
  const body = mapCountRequestToBackend(request);
  const response = await fetch(`${SPRING_API}/inventory-counts/submit`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("Lỗi khi tạo và gửi duyệt phiếu kiểm kho");
  return response.json();
};

export const approveInventoryCount = async (id) => {
  const response = await fetch(`${SPRING_API}/inventory-counts/${id}/approve`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Lỗi khi duyệt phiếu kiểm kho");
  }
  return response.json();
};

export const rejectInventoryCount = async (id, rejectionReason) => {
  const response = await fetch(`${SPRING_API}/inventory-counts/${id}/reject`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ rejectionReason }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || "Lỗi khi từ chối phiếu kiểm kho");
  }
  return response.json();
};

export const cancelInventoryCount = async (id) => {
  const response = await fetch(`${SPRING_API}/inventory-counts/${id}/cancel`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to cancel inventory count");
  return response.json();
};

export const deleteInventoryCount = async (id) => {
  const response = await fetch(`${SPRING_API}/inventory-counts/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to delete inventory count");
  return true;
};

function mapCountRequestToBackend(request) {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = currentUser.id || 1;

  return {
    locationId: request.location_id || request.locationId,
    notes: request.notes,
    status: request.status,
    items: (request.items || [])
      .filter(
        (item) =>
          item.actual_quantity !== null &&
          item.actual_quantity !== undefined &&
          (item.variant_id || item.variantId),
      )
      .map((item) => ({
        productId: item.product_id || item.productId,
        variantId: item.variant_id || item.variantId,
        systemQuantity: item.system_quantity ?? item.systemQuantity,
        actualQuantity: item.actual_quantity ?? item.actualQuantity,
        differenceQuantity: item.difference_quantity ?? item.differenceQuantity,
        differenceValue: item.difference_value ?? item.differenceValue,
        reason: item.reason || "",
      })),
  };
}
