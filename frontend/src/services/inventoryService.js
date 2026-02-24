const API_URL = "http://localhost:3001";

// Products
export const getProducts = async () => {
  const response = await fetch(`${API_URL}/products`);
  if (!response.ok) throw new Error("Failed to fetch products");
  return response.json();
};

// Suppliers
export const getSuppliers = async () => {
  const response = await fetch(`${API_URL}/suppliers`);
  if (!response.ok) throw new Error("Failed to fetch suppliers");
  return response.json();
};

// Categories
export const getCategories = async () => {
  const response = await fetch(`${API_URL}/categories`);
  if (!response.ok) throw new Error("Failed to fetch categories");
  return response.json();
};

// Brands
export const getBrands = async () => {
  const response = await fetch(`${API_URL}/brands`);
  if (!response.ok) throw new Error("Failed to fetch brands");
  return response.json();
};

// Purchase Orders
export const getPurchaseOrders = async () => {
  const response = await fetch(`${API_URL}/purchase_orders`);
  if (!response.ok) throw new Error("Failed to fetch purchase orders");
  return response.json();
};

export const createPurchaseOrder = async (orderData) => {
  const response = await fetch(`${API_URL}/purchase_orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  if (!response.ok) throw new Error("Failed to create purchase order");
  return response.json();
};

// Purchase Order Items
export const getPurchaseOrderItems = async () => {
  const response = await fetch(`${API_URL}/purchase_order_items`);
  if (!response.ok) throw new Error("Failed to fetch purchase order items");
  return response.json();
};

export const createPurchaseOrderItem = async (itemData) => {
  const response = await fetch(`${API_URL}/purchase_order_items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(itemData),
  });
  if (!response.ok) throw new Error("Failed to create purchase order item");
  return response.json();
};

// Stock Movements
export const getStockMovements = async () => {
  const response = await fetch(`${API_URL}/stock_movements`);
  if (!response.ok) throw new Error("Failed to fetch stock movements");
  return response.json();
};

// Product Batches
export const getProductBatches = async () => {
  const response = await fetch(`${API_URL}/product_batches`);
  if (!response.ok) throw new Error("Failed to fetch product batches");
  return response.json();
};

export const createProductBatch = async (batchData) => {
  const response = await fetch(`${API_URL}/product_batches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(batchData),
  });
  if (!response.ok) throw new Error("Failed to create product batch");
  return response.json();
};

// Locations
export const getLocations = async () => {
  const response = await fetch(`${API_URL}/locations`);
  if (!response.ok) throw new Error("Failed to fetch locations");
  return response.json();
};

export const createLocation = async (locationData) => {
  const response = await fetch(`${API_URL}/locations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...locationData,
      created_at: new Date().toISOString(),
      status: "ACTIVE",
    }),
  });
  if (!response.ok) throw new Error("Failed to create location");
  return response.json();
};

export const updateLocation = async (id, locationData) => {
  const response = await fetch(`${API_URL}/locations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(locationData),
  });
  if (!response.ok) throw new Error("Failed to update location");
  return response.json();
};

export const deleteLocation = async (id) => {
  const response = await fetch(`${API_URL}/locations/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete location");
  return true;
};

// Inventory Stock
export const getInventoryStock = async () => {
  const response = await fetch(`${API_URL}/inventory_stock`);
  if (!response.ok) throw new Error("Failed to fetch inventory stock");
  return response.json();
};

// Update product stock
export const updateProductStock = async (productId, newQuantity) => {
  const response = await fetch(`${API_URL}/products/${productId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stock_quantity: newQuantity }),
  });
  if (!response.ok) throw new Error("Failed to update product stock");
  return response.json();
};
