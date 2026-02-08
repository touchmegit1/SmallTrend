import React, { useState, useEffect } from "react";
import {
  getProducts,
  getSuppliers,
  getPurchaseOrders,
  createPurchaseOrder,
  createPurchaseOrderItem,
} from "../../services/inventoryService";

// CSS styles
const styles = {
  container: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f5f7fa 0%, #e8ecef 50%, #f0f2f5 100%)",
    padding: "24px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    background:
      "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    margin: 0,
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    marginTop: "4px",
  },
  card: {
    background: "#fff",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    borderRadius: "20px",
    padding: "28px",
    border: "1px solid #e2e8f0",
    marginBottom: "24px",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "6px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  cardSubtitle: {
    fontSize: "13px",
    color: "#94a3b8",
    marginBottom: "24px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    marginBottom: "24px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  required: {
    color: "#f5576c",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    color: "#1e293b",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.3s ease",
  },
  inputFocus: {
    borderColor: "#667eea",
    boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
  },
  inputDisabled: {
    background: "#f1f5f9",
    color: "#94a3b8",
    cursor: "not-allowed",
  },
  select: {
    width: "100%",
    padding: "14px 16px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    color: "#1e293b",
    fontSize: "14px",
    outline: "none",
    cursor: "pointer",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2.5 4.5L6 8L9.5 4.5' stroke='%23475569' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 16px center",
    transition: "all 0.3s ease",
  },
  addProductSection: {
    background: "#f1f5f9",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "24px",
    border: "1px dashed #cbd5e1",
  },
  addProductGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
    gap: "16px",
    alignItems: "end",
  },
  addButton: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    borderRadius: "12px",
    color: "#fff",
    padding: "14px 24px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0 8px",
  },
  tableHeader: {
    fontSize: "12px",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    padding: "12px 16px",
    textAlign: "left",
  },
  tableRow: {
    background: "#f8fafc",
    transition: "all 0.2s ease",
  },
  tableCell: {
    padding: "16px",
    color: "#475569",
    fontSize: "13px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#94a3b8",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
    opacity: "0.5",
  },
  deleteButton: {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    borderRadius: "8px",
    color: "#f43f5e",
    padding: "8px 14px",
    fontSize: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #e2e8f0",
    paddingTop: "24px",
    marginTop: "16px",
  },
  totalSection: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  totalLabel: {
    fontSize: "16px",
    color: "#64748b",
  },
  totalValue: {
    fontSize: "28px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
  },
  cancelButton: {
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    color: "#475569",
    padding: "14px 28px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  saveButton: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    borderRadius: "12px",
    color: "#fff",
    padding: "14px 28px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
  },
  recordsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  searchInput: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "12px 16px 12px 44px",
    color: "#1e293b",
    fontSize: "14px",
    width: "280px",
    outline: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='11' cy='11' r='8' stroke='%2394a3b8' stroke-width='2'/%3E%3Cpath d='M21 21L16.65 16.65' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "16px center",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  loadingOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(5px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "3px solid #f1f5f9",
    borderTopColor: "#667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  toast: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    background: "#fff",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
    color: "#1e293b",
    padding: "16px 24px",
    borderRadius: "12px",
    fontWeight: "600",
    borderLeft: "4px solid #10b981",
    animation: "slideIn 0.3s ease",
    zIndex: 1001,
  },
};

// Icon components
const Icons = {
  Plus: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Save: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17,21 17,13 7,13 7,21" />
      <polyline points="7,3 7,8 15,8" />
    </svg>
  ),
  Package: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  FileText: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10,9 9,9 8,9" />
    </svg>
  ),
  Trash: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="3,6 5,6 21,6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Box: () => (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
};

function ImportInventory() {
  // State for data from API
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [importRecords, setImportRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // State cho form phiếu nhập
  const [importForm, setImportForm] = useState({
    po_number: "",
    supplier_id: "",
    creator_id: 4,
    status: "PENDING",
    created_at: new Date().toISOString().split("T")[0],
  });

  // State cho danh sách sản phẩm trong phiếu nhập hiện tại
  const [currentProducts, setCurrentProducts] = useState([]);

  // State cho form thêm sản phẩm
  const [productForm, setProductForm] = useState({
    product_id: "",
    quantity: "",
    batch_code: "",
    expiry_date: "",
  });

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersData, productsData, ordersData] = await Promise.all([
          getSuppliers(),
          getProducts(),
          getPurchaseOrders(),
        ]);
        setSuppliers(suppliersData);
        setProducts(productsData);

        // Generate next PO number
        const lastPO = ordersData[ordersData.length - 1];
        const nextNumber = lastPO
          ? parseInt(lastPO.po_number.split("-")[2]) + 1
          : 1;
        setImportForm((prev) => ({
          ...prev,
          po_number: `PO-2024-${String(nextNumber).padStart(3, "0")}`,
        }));

        // Transform orders for display
        const records = await Promise.all(
          ordersData.map(async (order) => {
            const supplier = suppliersData.find(
              (s) => s.id === order.supplier_id,
            );
            return {
              id: order.id,
              po_number: order.po_number,
              supplier_name: supplier?.name || "Unknown",
              product_count: 1,
              total_amount: order.total_amount,
              status: order.status,
              created_at: order.created_at,
            };
          }),
        );
        setImportRecords(records.reverse());
      } catch (error) {
        console.error("Error fetching data:", error);
        showToast("Không thể tải dữ liệu. Vui lòng thử lại!", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Hàm thêm sản phẩm vào phiếu nhập
  const handleAddProduct = () => {
    if (!productForm.product_id || !productForm.quantity) {
      showToast("Vui lòng chọn sản phẩm và nhập số lượng!", "error");
      return;
    }

    const selectedProduct = products.find(
      (p) => p.id === parseInt(productForm.product_id),
    );

    const newProduct = {
      id: Date.now(),
      product_id: selectedProduct.id,
      sku: selectedProduct.sku,
      name: selectedProduct.name,
      quantity: parseInt(productForm.quantity),
      unit_cost: selectedProduct.purchase_price,
      unit: selectedProduct.unit,
      batch_code: productForm.batch_code || `BATCH-${Date.now()}`,
      expiry_date: productForm.expiry_date || "N/A",
      total_cost:
        parseInt(productForm.quantity) * selectedProduct.purchase_price,
    };

    setCurrentProducts([...currentProducts, newProduct]);
    setProductForm({
      product_id: "",
      quantity: "",
      batch_code: "",
      expiry_date: "",
    });
    showToast(`Đã thêm ${selectedProduct.name}`);
  };

  // Hàm xóa sản phẩm
  const handleRemoveProduct = (id) => {
    setCurrentProducts(currentProducts.filter((p) => p.id !== id));
  };

  // Hàm lưu phiếu nhập
  const handleSaveImport = async () => {
    if (!importForm.supplier_id) {
      showToast("Vui lòng chọn nhà cung cấp!", "error");
      return;
    }

    if (currentProducts.length === 0) {
      showToast("Vui lòng thêm ít nhất 1 sản phẩm!", "error");
      return;
    }

    setSaving(true);
    try {
      const totalAmount = currentProducts.reduce(
        (sum, p) => sum + p.total_cost,
        0,
      );
      const supplierName = suppliers.find(
        (s) => s.id === parseInt(importForm.supplier_id),
      ).name;

      // Create purchase order
      const orderData = {
        po_number: importForm.po_number,
        supplier_id: parseInt(importForm.supplier_id),
        creator_id: importForm.creator_id,
        total_amount: totalAmount,
        status: importForm.status,
        created_at: new Date().toISOString(),
      };

      const newOrder = await createPurchaseOrder(orderData);

      // Create order items
      for (const product of currentProducts) {
        await createPurchaseOrderItem({
          purchase_order_id: newOrder.id,
          product_id: product.product_id,
          quantity: product.quantity,
          unit_cost: product.unit_cost,
          total_cost: product.total_cost,
        });
      }

      // Update local state
      const newRecord = {
        id: newOrder.id,
        po_number: importForm.po_number,
        supplier_name: supplierName,
        product_count: currentProducts.length,
        total_amount: totalAmount,
        status: importForm.status,
        created_at: importForm.created_at,
      };

      setImportRecords([newRecord, ...importRecords]);

      // Reset form
      const nextNumber = parseInt(importForm.po_number.split("-")[2]) + 1;
      setImportForm({
        po_number: `PO-2024-${String(nextNumber).padStart(3, "0")}`,
        supplier_id: "",
        creator_id: 4,
        status: "PENDING",
        created_at: new Date().toISOString().split("T")[0],
      });
      setCurrentProducts([]);

      showToast("Đã lưu phiếu nhập thành công! 🎉");
    } catch (error) {
      console.error("Error saving import:", error);
      showToast("Có lỗi xảy ra. Vui lòng thử lại!", "error");
    } finally {
      setSaving(false);
    }
  };

  // Filter records by search term
  const filteredRecords = importRecords.filter(
    (record) =>
      record.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div style={styles.container}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <div style={styles.spinner} />
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .input-field:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
        }
        .table-row:hover {
          background: #f1f5f9 !important;
        }
        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
        }
        .save-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(17, 153, 142, 0.3);
        }
        .cancel-btn:hover {
          background: #e2e8f0 !important;
        }
        .delete-btn:hover {
          background: #fecdd3 !important;
        }
        select option {
          background: #ffffff;
          color: #1e293b;
        }
      `}</style>

      {/* Loading Overlay */}
      {saving && (
        <div style={styles.loadingOverlay}>
          <div style={styles.spinner} />
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            ...styles.toast,
            borderLeftColor: toast.type === "error" ? "#ef4444" : "#10b981",
          }}
        >
          {toast.type === "error" ? "❌ " : "✅ "}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📥 Nhập kho</h1>
          <p style={styles.subtitle}>
            Tạo và quản lý các phiếu nhập hàng từ nhà cung cấp
          </p>
        </div>
      </div>

      {/* PHẦN 1: Form tạo phiếu nhập */}
      <div style={{ ...styles.card, animation: "fadeIn 0.5s ease" }}>
        <h2 style={styles.cardTitle}>
          <Icons.Package /> Tạo phiếu nhập kho mới
        </h2>
        <p style={styles.cardSubtitle}>
          Nhập thông tin phiếu nhập hàng từ nhà cung cấp
        </p>

        {/* Form fields */}
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Mã phiếu nhập</label>
            <input
              type="text"
              value={importForm.po_number}
              disabled
              style={{ ...styles.input, ...styles.inputDisabled }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Ngày nhập</label>
            <input
              type="date"
              className="input-field"
              value={importForm.created_at}
              onChange={(e) =>
                setImportForm({ ...importForm, created_at: e.target.value })
              }
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Nhà cung cấp <span style={styles.required}>*</span>
            </label>
            <select
              className="input-field"
              value={importForm.supplier_id}
              onChange={(e) =>
                setImportForm({ ...importForm, supplier_id: e.target.value })
              }
              style={styles.select}
            >
              <option value="">Chọn nhà cung cấp</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Add product section */}
        <div style={styles.addProductSection}>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#475569",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Icons.Plus /> Thêm sản phẩm vào phiếu
          </h3>
          <div style={styles.addProductGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Sản phẩm <span style={styles.required}>*</span>
              </label>
              <select
                className="input-field"
                value={productForm.product_id}
                onChange={(e) =>
                  setProductForm({ ...productForm, product_id: e.target.value })
                }
                style={styles.select}
              >
                <option value="">Chọn sản phẩm</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.sku} - {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Số lượng <span style={styles.required}>*</span>
              </label>
              <input
                type="number"
                className="input-field"
                value={productForm.quantity}
                onChange={(e) =>
                  setProductForm({ ...productForm, quantity: e.target.value })
                }
                min="1"
                placeholder="0"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Mã lô</label>
              <input
                type="text"
                className="input-field"
                value={productForm.batch_code}
                onChange={(e) =>
                  setProductForm({ ...productForm, batch_code: e.target.value })
                }
                placeholder="BATCH-XXX"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Hạn sử dụng</label>
              <input
                type="date"
                className="input-field"
                value={productForm.expiry_date}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    expiry_date: e.target.value,
                  })
                }
                style={styles.input}
              />
            </div>

            <button
              className="add-btn"
              onClick={handleAddProduct}
              style={styles.addButton}
            >
              <Icons.Plus /> Thêm
            </button>
          </div>
        </div>

        {/* Products table */}
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>SKU</th>
              <th style={styles.tableHeader}>Tên sản phẩm</th>
              <th style={{ ...styles.tableHeader, textAlign: "center" }}>
                Số lượng
              </th>
              <th style={{ ...styles.tableHeader, textAlign: "right" }}>
                Đơn giá
              </th>
              <th style={styles.tableHeader}>Mã lô</th>
              <th style={styles.tableHeader}>HSD</th>
              <th style={{ ...styles.tableHeader, textAlign: "right" }}>
                Thành tiền
              </th>
              <th style={{ ...styles.tableHeader, textAlign: "center" }}>
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.length === 0 ? (
              <tr>
                <td colSpan="8" style={styles.emptyState}>
                  <div style={styles.emptyIcon}>
                    <Icons.Box />
                  </div>
                  <p style={{ margin: 0, fontSize: "14px" }}>
                    Chưa có sản phẩm nào
                  </p>
                  <p style={{ margin: "8px 0 0", fontSize: "12px" }}>
                    Chọn sản phẩm và nhấn "Thêm" để bắt đầu
                  </p>
                </td>
              </tr>
            ) : (
              currentProducts.map((product, index) => (
                <tr
                  key={product.id}
                  className="table-row"
                  style={{
                    ...styles.tableRow,
                    animation: `fadeIn 0.3s ease ${index * 0.05}s both`,
                  }}
                >
                  <td
                    style={{
                      ...styles.tableCell,
                      fontFamily: "monospace",
                      color: "#667eea",
                    }}
                  >
                    {product.sku}
                  </td>
                  <td style={styles.tableCell}>{product.name}</td>
                  <td style={{ ...styles.tableCell, textAlign: "center" }}>
                    <span
                      style={{
                        background: "rgba(102, 126, 234, 0.2)",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {product.quantity} {product.unit}
                    </span>
                  </td>
                  <td
                    style={{
                      ...styles.tableCell,
                      textAlign: "right",
                      fontFamily: "monospace",
                    }}
                  >
                    {product.unit_cost.toLocaleString()}đ
                  </td>
                  <td
                    style={{
                      ...styles.tableCell,
                      fontFamily: "monospace",
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    {product.batch_code}
                  </td>
                  <td
                    style={{
                      ...styles.tableCell,
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    {product.expiry_date}
                  </td>
                  <td
                    style={{
                      ...styles.tableCell,
                      textAlign: "right",
                      fontWeight: "700",
                      color: "#38ef7d",
                    }}
                  >
                    {product.total_cost.toLocaleString()}đ
                  </td>
                  <td style={{ ...styles.tableCell, textAlign: "center" }}>
                    <button
                      className="delete-btn"
                      onClick={() => handleRemoveProduct(product.id)}
                      style={styles.deleteButton}
                    >
                      <Icons.Trash /> Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.totalSection}>
            <span style={styles.totalLabel}>Tổng tiền:</span>
            <span style={styles.totalValue}>
              {currentProducts
                .reduce((sum, p) => sum + p.total_cost, 0)
                .toLocaleString()}
              đ
            </span>
          </div>
          <div style={styles.buttonGroup}>
            <button
              className="cancel-btn"
              onClick={() => {
                setCurrentProducts([]);
                setImportForm({ ...importForm, supplier_id: "" });
              }}
              style={styles.cancelButton}
            >
              Hủy
            </button>
            <button
              className="save-btn"
              onClick={handleSaveImport}
              style={styles.saveButton}
            >
              <Icons.Save /> Lưu phiếu nhập
            </button>
          </div>
        </div>
      </div>

      {/* PHẦN 2: Danh sách phiếu nhập */}
      <div style={{ ...styles.card, animation: "fadeIn 0.5s ease 0.2s both" }}>
        <div style={styles.recordsHeader}>
          <div>
            <h2 style={styles.cardTitle}>
              <Icons.FileText /> Phiếu nhập gần đây
            </h2>
            <p style={styles.cardSubtitle}>
              Danh sách các phiếu nhập kho đã tạo
            </p>
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm phiếu nhập..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
            className="input-field"
          />
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Mã phiếu</th>
              <th style={styles.tableHeader}>Ngày nhập</th>
              <th style={styles.tableHeader}>Nhà cung cấp</th>
              <th style={{ ...styles.tableHeader, textAlign: "center" }}>
                Số SP
              </th>
              <th style={{ ...styles.tableHeader, textAlign: "right" }}>
                Tổng tiền
              </th>
              <th style={{ ...styles.tableHeader, textAlign: "center" }}>
                Trạng thái
              </th>
              <th style={{ ...styles.tableHeader, textAlign: "center" }}>
                Chi tiết
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record, index) => (
              <tr
                key={record.id}
                className="table-row"
                style={{
                  ...styles.tableRow,
                  animation: `fadeIn 0.3s ease ${index * 0.05}s both`,
                }}
              >
                <td
                  style={{
                    ...styles.tableCell,
                    fontFamily: "monospace",
                    fontWeight: "600",
                    color: "#667eea",
                  }}
                >
                  {record.po_number}
                </td>
                <td style={styles.tableCell}>
                  {new Date(record.created_at).toLocaleDateString("vi-VN")}
                </td>
                <td style={styles.tableCell}>{record.supplier_name}</td>
                <td style={{ ...styles.tableCell, textAlign: "center" }}>
                  <span
                    style={{
                      background: "#f1f5f9",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "12px",
                    }}
                  >
                    {record.product_count} SP
                  </span>
                </td>
                <td
                  style={{
                    ...styles.tableCell,
                    textAlign: "right",
                    fontWeight: "600",
                    fontFamily: "monospace",
                  }}
                >
                  {record.total_amount.toLocaleString()}đ
                </td>
                <td style={{ ...styles.tableCell, textAlign: "center" }}>
                  <span
                    style={{
                      ...styles.badge,
                      background:
                        record.status === "COMPLETED"
                          ? "rgba(16, 185, 129, 0.1)"
                          : record.status === "APPROVED"
                            ? "rgba(99, 102, 241, 0.1)"
                            : "rgba(245, 158, 11, 0.1)",
                      color:
                        record.status === "COMPLETED"
                          ? "#10b981"
                          : record.status === "APPROVED"
                            ? "#6366f1"
                            : "#d97706",
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background:
                          record.status === "COMPLETED"
                            ? "#10b981"
                            : record.status === "APPROVED"
                              ? "#6366f1"
                              : "#d97706",
                      }}
                    />
                    {record.status === "COMPLETED"
                      ? "Hoàn thành"
                      : record.status === "APPROVED"
                        ? "Đã duyệt"
                        : "Chờ xử lý"}
                  </span>
                </td>
                <td style={{ ...styles.tableCell, textAlign: "center" }}>
                  <button
                    style={{
                      background: "transparent",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      color: "#667eea",
                      padding: "6px 12px",
                      fontSize: "12px",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Xem →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ImportInventory;
