const SPRING_API = "http://localhost:8081/api/inventory/disposal-vouchers";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Get all disposal vouchers
export const getDisposalVouchers = async () => {
  const response = await fetch(SPRING_API, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch disposal vouchers");
  return response.json();
};

// Get disposal voucher by ID
export const getDisposalVoucherById = async (id) => {
  const response = await fetch(`${SPRING_API}/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch disposal voucher");
  return response.json();
};

// Get next disposal code
export const getNextDisposalCode = async () => {
  const response = await fetch(`${SPRING_API}/next-code`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to get next code");
  const data = await response.json();
  return data.code;
};

// Get expired batches
export const getExpiredBatches = async (locationId) => {
  const url = locationId 
    ? `${SPRING_API}/expired-batches?locationId=${locationId}`
    : `${SPRING_API}/expired-batches`;
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch expired batches");
  return response.json();
};

// Save draft
export const saveDisposalDraft = async (voucherData, userId) => {
  const response = await fetch(`${SPRING_API}/draft?userId=${userId}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(voucherData),
  });
  if (!response.ok) throw new Error("Failed to save draft");
  return response.json();
};

// Confirm disposal voucher
export const confirmDisposalVoucher = async (id, userId) => {
  const response = await fetch(`${SPRING_API}/${id}/confirm?userId=${userId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to confirm disposal voucher");
  return response.json();
};

// Cancel disposal voucher
export const cancelDisposalVoucher = async (id) => {
  const response = await fetch(`${SPRING_API}/${id}/cancel`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to cancel disposal voucher");
  return response.json();
};
