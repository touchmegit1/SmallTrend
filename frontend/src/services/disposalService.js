const SPRING_API = "http://localhost:8081/api/inventory/disposal-vouchers";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Map camelCase from Spring Boot to snake_case for Frontend
function mapToFrontend(v) {
  if (!v) return v;
  return {
    ...v,
    location_id: v.locationId || v.location_id,
    reason_type: v.reasonType || v.reason_type,
    total_items: v.totalItems || v.total_items || 0,
    total_quantity: v.totalQuantity || v.total_quantity || 0,
    total_value: v.totalValue || v.total_value || 0,
    created_at: v.createdAt || v.created_at,
    confirmed_at: v.confirmedAt || v.confirmed_at,
    created_by: v.createdBy || v.created_by,
    confirmed_by: v.confirmedBy || v.confirmed_by,
    items: (v.items || []).map(item => ({
      ...item,
      batch_id: item.batchId || item.batch_id,
      product_id: item.productId || item.product_id,
      product_name: item.productName || item.product_name,
      batch_code: item.batchCode || item.batch_code,
      unit_cost: item.unitCost || item.unit_cost || 0,
      total_cost: item.totalCost || item.total_cost || 0,
      expiry_date: item.expiryDate || item.expiry_date,
    }))
  };
}

export const getDisposalVouchers = async () => {
  const response = await fetch(SPRING_API, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error("Failed to fetch disposal vouchers");
  const data = await response.json();
  return data.map(mapToFrontend);
};

export const getDisposalVoucherById = async (id) => {
  const response = await fetch(`${SPRING_API}/${id}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error("Failed to fetch disposal voucher detail");
  const data = await response.json();
  return mapToFrontend(data);
};

export const getNextDisposalCode = async () => {
  const response = await fetch(`${SPRING_API}/next-code`, { headers: getAuthHeaders() });
  if (!response.ok) {
    return "DSP-" + Date.now();
  }
  const data = await response.json();
  return data.code;
};

export const getExpiredBatches = async (locationId) => {
  const url = locationId ? `${SPRING_API}/expired-batches?locationId=${locationId}` : `${SPRING_API}/expired-batches`;
  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error("Failed to fetch expired batches");
  const data = await response.json();
  return data.map(b => ({
    ...b,
    product_id: b.productId,
    product_name: b.productName,
    batch_code: b.batchCode,
    expiry_date: b.expiryDate,
    received_date: b.receivedDate
  }));
};

export const saveDisposalDraft = async (voucherData, userId) => {
  // Map frontend state to Spring Boot request exact format
  const payload = {
    locationId: voucherData.location_id || voucherData.locationId,
    reasonType: voucherData.reason || voucherData.reason_type || voucherData.reasonType,
    notes: voucherData.notes,
    items: (voucherData.items || []).map((item) => ({
      productId: item.product_id || item.productId,
      batchId: item.batch_id || item.batchId,
      quantity: item.quantity,
    })),
  };

  const response = await fetch(`${SPRING_API}/draft?userId=${userId || 1}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to save draft");
  const data = await response.json();
  return mapToFrontend(data);
};

export const submitDisposalVoucher = async (id) => {
  const response = await fetch(`${SPRING_API}/${id}/submit`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to submit disposal voucher");
  const data = await response.json();
  return mapToFrontend(data);
};

export const approveDisposalVoucher = async (id, userId) => {
  const response = await fetch(`${SPRING_API}/${id}/approve?userId=${userId || 1}`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to approve disposal voucher");
  const data = await response.json();
  return mapToFrontend(data);
};

export const rejectDisposalVoucher = async (id, reason) => {
  const response = await fetch(`${SPRING_API}/${id}/reject?reason=${encodeURIComponent(reason)}`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to reject disposal voucher");
  const data = await response.json();
  return mapToFrontend(data);
};
