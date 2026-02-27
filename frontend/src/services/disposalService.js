const JSON_API = "http://localhost:3001";
const SPRING_API = `${JSON_API}/disposal_vouchers`;

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const getDisposalVouchers = async () => {
  const response = await fetch(SPRING_API, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error("Failed to fetch disposal vouchers");
  return response.json();
};

export const getDisposalVoucherById = async (id) => {
  const response = await fetch(`${SPRING_API}/${id}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error("Failed to fetch disposal voucher");
  return response.json();
};

export const getNextDisposalCode = async () => {
  return "DSP-" + Date.now();
};

export const getExpiredBatches = async (locationId) => {
  return []; // Mock
};

export const saveDisposalDraft = async (voucherData, userId) => {
  const response = await fetch(SPRING_API, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({...voucherData, status: "DRAFT", _userId: userId, created_at: new Date().toISOString()}),
  });
  if (!response.ok) throw new Error("Failed to save draft");
  return response.json();
};

export const confirmDisposalVoucher = async (id, userId) => {
  const response = await fetch(`${SPRING_API}/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status: "CONFIRMED", confirmed_at: new Date().toISOString() }),
  });
  if (!response.ok) throw new Error("Failed to confirm disposal voucher");
  return response.json();
};

export const cancelDisposalVoucher = async (id) => {
  const response = await fetch(`${SPRING_API}/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status: "CANCELLED" }),
  });
  if (!response.ok) throw new Error("Failed to cancel disposal voucher");
  return response.json();
};
