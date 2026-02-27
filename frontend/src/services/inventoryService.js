const JSON_API = "http://localhost:3001";
const SPRING_API = "http://localhost:8081/api/inventory";

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

// List all purchase orders
export const getPurchaseOrders = async () => {
  try {
    const response = await fetch(`${JSON_API}/purchase_orders`, {
      headers: getAuthHeaders(),
    });
    
    if (response.status === 401) {
      throw new Error("Vui lòng đăng nhập lại");
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lỗi ${response.status}: Không thể tải danh sách phiếu nhập`);
    }
    
    const data = await response.json();
    
    return data.map((order) => ({
      ...order,
      po_number: order.poNumber || order.po_number,
      supplier_id: order.supplierId || order.supplier_id,
      supplier_name: order.supplierName || order.supplier_name,
      location_id: order.locationId || order.location_id,
      total_amount: order.totalAmount || order.total_amount,
      created_at: order.createdAt || order.created_at,
      confirmed_at: order.confirmedAt || order.confirmed_at,
      tax_percent: order.taxPercent || order.tax_percent,
      shipping_fee: order.shippingFee || order.shipping_fee,
      paid_amount: order.paidAmount || order.paid_amount,
      remaining_amount: order.remainingAmount || order.remaining_amount,
      tax_amount: order.taxAmount || order.tax_amount,
    }));
  } catch (error) {
    throw error;
  }
};

// Get single purchase order detail
export const getPurchaseOrderById = async (id) => {
  const response = await fetch(`${JSON_API}/purchase_orders/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch purchase order");
  const order = await response.json();
  return {
    ...order,
    po_number: order.poNumber || order.po_number,
    supplier_id: order.supplierId || order.supplier_id,
    supplier_name: order.supplierName || order.supplier_name,
    location_id: order.locationId || order.location_id,
    total_amount: order.totalAmount || order.total_amount,
    created_at: order.createdAt || order.created_at,
    confirmed_at: order.confirmedAt || order.confirmed_at,
    tax_percent: order.taxPercent || order.tax_percent,
    shipping_fee: order.shippingFee || order.shipping_fee,
    paid_amount: order.paidAmount || order.paid_amount,
    remaining_amount: order.remainingAmount || order.remaining_amount,
    tax_amount: order.taxAmount || order.tax_amount,
  };
};

// Get next PO code
export const getNextPOCode = async () => {
  return "PO-" + Date.now();
};

// Save draft
export const createPurchaseOrder = async (orderData) => {
  const payload = mapOrderToBackend(orderData);
  const response = await fetch(`${JSON_API}/purchase_orders`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({...payload, status: "DRAFT"}),
  });
  if (!response.ok) throw new Error("Failed to save draft");
  return response.json();
};

// Confirm order (new)
export const confirmPurchaseOrder = async (orderData) => {
  const payload = mapOrderToBackend(orderData);
  const response = await fetch(`${JSON_API}/purchase_orders`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({...payload, status: "CONFIRMED"}),
  });
  if (!response.ok) throw new Error("Failed to confirm order");
  return response.json();
};

// Confirm existing draft
export const confirmExistingOrder = async (id) => {
  const response = await fetch(`${JSON_API}/purchase_orders/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status: "CONFIRMED" }),
  });
  if (!response.ok) throw new Error("Failed to confirm order");
  return response.json();
};

// Cancel order
export const cancelPurchaseOrder = async (id) => {
  const response = await fetch(`${JSON_API}/purchase_orders/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status: "CANCELLED" }),
  });
  if (!response.ok) throw new Error("Failed to cancel order");
  return response.json();
};

// Update purchase order (legacy compatibility)
export const updatePurchaseOrder = async (id, orderData) => {
  const payload = mapOrderToBackend(orderData);
  const response = await fetch(`${JSON_API}/purchase_orders/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to update purchase order");
  return response.json();
};

// ─── Helper: map frontend order shape to backend request ──
function mapOrderToBackend(orderData) {
  return {
    poNumber: orderData.po_number || orderData.poNumber,
    supplierId: orderData.supplier_id || orderData.supplierId,
    supplierName: orderData.supplier_name || orderData.supplierName,
    locationId: orderData.location_id || orderData.locationId,
    status: orderData.status,
    discount: orderData.discount || 0,
    taxPercent: orderData.tax_percent || orderData.taxPercent || 0,
    shippingFee: orderData.shipping_fee || orderData.shippingFee || 0,
    paidAmount: orderData.paid_amount || orderData.paidAmount || 0,
    subtotal: orderData.subtotal || 0,
    taxAmount: orderData.tax_amount || orderData.taxAmount || 0,
    totalAmount: orderData.total_amount || orderData.totalAmount || 0,
    remainingAmount: orderData.remaining_amount || orderData.remainingAmount || 0,
    notes: orderData.notes || "",
    createdBy: orderData.created_by || orderData.createdBy || 1,
    items: (orderData.items || []).map((item) => ({
      productId: item.product_id || item.productId,
      variantId: item.variant_id || item.variantId,
      sku: item.sku || "",
      name: item.name || "",
      quantity: item.quantity || 0,
      unitPrice: item.unit_price || item.unitPrice || 0,
      discount: item.discount || 0,
      total: item.total || 0,
      expiryDate: item.expiry_date || item.expiryDate || null,
      batches: (item.batches || []).map((b) => ({
        batchCode: b.batch_code || b.batchCode || "",
        quantity: b.quantity || 0,
        expiryDate: b.expiry_date || b.expiryDate || null,
      })),
    })),
  };
}

// ═══════════════════════════════════════════════════════════
//  Purchase Order Items (kept for backward compatibility)
// ═══════════════════════════════════════════════════════════

export const getPurchaseOrderItems = async () => {
  const response = await fetch(`${JSON_API}/purchase_order_items`);
  if (!response.ok) throw new Error("Failed to fetch purchase order items");
  return response.json();
};

export const createPurchaseOrderItem = async (itemData) => {
  // This is now handled by the order creation endpoint
  // Kept for backward compatibility
  console.warn("createPurchaseOrderItem is deprecated. Items are now included in order creation.");
  return itemData;
};

// ═══════════════════════════════════════════════════════════
//  Reference Data (Spring Boot backend)
// ═══════════════════════════════════════════════════════════

// Suppliers
export const getSuppliers = async () => {
  const response = await fetch(`${JSON_API}/suppliers`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch suppliers");
  return response.json();
};

// Products
export const getProducts = async () => {
  const response = await fetch(`${JSON_API}/products`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch products");
  const data = await response.json();
  return data.map((p) => ({
    ...p,
    purchase_price: p.purchasePrice || p.purchase_price || 0,
    image_url: p.imageUrl || p.image_url,
  }));
};

// Locations
export const getLocations = async () => {
  const response = await fetch(`${SPRING_API}/locations`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch locations");
  const data = await response.json();
  return data.map((loc) => ({
    ...loc,
    location_name: loc.locationName || loc.location_name,
    location_code: loc.locationCode || loc.location_code,
    location_type: loc.locationType || loc.location_type,
    created_at: loc.createdAt || loc.created_at,
  }));
};

// ═══════════════════════════════════════════════════════════
//  Dashboard Data (Spring Boot backend)
// ═══════════════════════════════════════════════════════════

// Dashboard Products (full shape with stock, pricing, category, brand)
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
  }));
};

// Dashboard Summary
export const getDashboardSummary = async () => {
  const response = await fetch(`${SPRING_API}/dashboard/summary`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch dashboard summary");
  return response.json();
};

// Dashboard Batches (batch status list from BatchStatusResponse DTO)
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

// Recent Activities
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

// Debug: Reseed stock data
export const reseedStock = async () => {
  const response = await fetch(`${SPRING_API}/debug/reseed-stock`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to reseed stock");
  return response.json();
};

// Categories
export const getCategories = async () => {
  const response = await fetch(`${SPRING_API}/categories`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch categories");
  return response.json();
};

// Brands
export const getBrands = async () => {
  const response = await fetch(`${SPRING_API}/brands`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch brands");
  return response.json();
};

// Stock Movements
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

// Product Batches
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

export const createProductBatch = async (batchData) => {
  // Now handled by the confirm order endpoint
  console.warn("createProductBatch is deprecated. Batches are now created during order confirmation.");
  return batchData;
};

// Location CRUD (Spring Boot)
export const createLocation = async (locationData) => {
  const response = await fetch(`${SPRING_API}/locations`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      locationName: locationData.location_name,
      locationCode: locationData.location_code,
      locationType: locationData.location_type,
      address: locationData.address,
      capacity: locationData.capacity,
      description: locationData.description,
    }),
  });
  if (!response.ok) throw new Error("Failed to create location");
  const data = await response.json();
  return {
    ...data,
    location_name: data.locationName,
    location_code: data.locationCode,
    location_type: data.locationType,
    created_at: data.createdAt,
  };
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
      capacity: locationData.capacity,
      description: locationData.description,
    }),
  });
  if (!response.ok) throw new Error("Failed to update location");
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
  if (!response.ok) throw new Error("Failed to delete location");
  return true;
};

// Inventory Stock
export const getInventoryStock = async () => {
  const response = await fetch(`${JSON_API}/inventory_stock`);
  if (!response.ok) throw new Error("Failed to fetch inventory stock");
  return response.json();
};

// Update product stock (deprecated - now handled by confirm)
export const updateProductStock = async (productId, newQuantity) => {
  console.warn("updateProductStock is deprecated. Stock is now updated during order confirmation.");
  return { id: productId, stock_quantity: newQuantity };
};

// ═══════════════════════════════════════════════════════════
//  Inventory Count (Spring Boot backend)
// ═══════════════════════════════════════════════════════════

export const getInventoryCounts = async () => {
  const response = await fetch(`${JSON_API}/inventory_counts`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch inventory counts");
  const data = await response.json();
  return data.map((ic) => ({
    ...ic,
    location_id: ic.locationId || ic.location_id,
    location_name: ic.locationName || ic.location_name,
    total_shortage_value: ic.totalShortageValue || ic.total_shortage_value,
    total_overage_value: ic.totalOverageValue || ic.total_overage_value,
    total_difference_value: ic.totalDifferenceValue || ic.total_difference_value,
    created_by: ic.createdBy || ic.created_by,
    confirmed_by: ic.confirmedBy || ic.confirmed_by,
    created_at: ic.createdAt || ic.created_at,
    confirmed_at: ic.confirmedAt || ic.confirmed_at,
  }));
};

export const getInventoryCountById = async (id) => {
  const response = await fetch(`${JSON_API}/inventory_counts/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Khong tim thay phieu kiem kho.");
  const ic = await response.json();
  return {
    ...ic,
    location_id: ic.locationId || ic.location_id,
    location_name: ic.locationName || ic.location_name,
    total_shortage_value: ic.totalShortageValue || ic.total_shortage_value,
    total_overage_value: ic.totalOverageValue || ic.total_overage_value,
    total_difference_value: ic.totalDifferenceValue || ic.total_difference_value,
    created_by: ic.createdBy || ic.created_by,
    confirmed_by: ic.confirmedBy || ic.confirmed_by,
    created_at: ic.createdAt || ic.created_at,
    confirmed_at: ic.confirmedAt || ic.confirmed_at,
    items: (ic.items || []).map((item) => ({
      ...item,
      product_id: item.productId || item.product_id,
      system_quantity: item.systemQuantity || item.system_quantity,
      actual_quantity: item.actualQuantity || item.actual_quantity,
      difference_quantity: item.differenceQuantity || item.difference_quantity,
      difference_value: item.differenceValue || item.difference_value,
    })),
  };
};

export const getInventoryCountNextCode = async () => {
  try {
    const counts = await getInventoryCounts();
    return generateICCode(counts);
  } catch {
    return "IC-001";
  }
};

function generateICCode(existingCounts = []) {
  const prefix = "IC-";
  let maxNum = 0;
  
  for (const count of existingCounts) {
    const code = count.code || "";
    if (code.startsWith(prefix)) {
      const num = parseInt(code.slice(prefix.length), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  }
  
  return `${prefix}${String(maxNum + 1).padStart(3, "0")}`;
}

export const saveInventoryCountDraft = async (request) => {
  const body = mapCountRequestToBackend(request);
  const response = await fetch(`${JSON_API}/inventory_counts`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({...body, status: "DRAFT"}),
  });
  if (!response.ok) throw new Error("Failed to save draft");
  return response.json();
};

export const updateInventoryCount = async (id, request) => {
  const body = mapCountRequestToBackend(request);
  const response = await fetch(`${JSON_API}/inventory_counts/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("Failed to update inventory count");
  return response.json();
};

export const confirmInventoryCount = async (id, request) => {
  const body = mapCountRequestToBackend(request);
  const response = await fetch(`${JSON_API}/inventory_counts/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({...body, status: "CONFIRMED"}),
  });
  if (!response.ok) throw new Error("Failed to confirm inventory count");
  return response.json();
};

export const createAndConfirmInventoryCount = async (request) => {
  const body = mapCountRequestToBackend(request);
  const response = await fetch(`${JSON_API}/inventory_counts`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({...body, status: "CONFIRMED"}),
  });
  if (!response.ok) throw new Error("Failed to create and confirm inventory count");
  return response.json();
};

export const cancelInventoryCount = async (id) => {
  const response = await fetch(`${JSON_API}/inventory_counts/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status: "CANCELLED" }),
  });
  if (!response.ok) throw new Error("Failed to cancel inventory count");
  return response.json();
};

export const deleteInventoryCount = async (id) => {
  const response = await fetch(`${JSON_API}/inventory_counts/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to delete inventory count");
  return true;
};

// Map frontend snake_case to backend camelCase
function mapCountRequestToBackend(request) {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = currentUser.id || 1;
  
  return {
    code: request.code,
    locationId: request.location_id || request.locationId,
    notes: request.notes,
    status: request.status,
    createdBy: userId,
    createdAt: new Date().toISOString(),
    items: (request.items || [])
      .filter((item) => item.actual_quantity !== null && item.actual_quantity !== undefined)
      .map((item) => ({
        productId: item.product_id || item.productId,
        systemQuantity: item.system_quantity ?? item.systemQuantity,
        actualQuantity: item.actual_quantity ?? item.actualQuantity,
        differenceQuantity: item.difference_quantity ?? item.differenceQuantity,
        differenceValue: item.difference_value ?? item.differenceValue,
        reason: item.reason || "",
      })),
  };
}
