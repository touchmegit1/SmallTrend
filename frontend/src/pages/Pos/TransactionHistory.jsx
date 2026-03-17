import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Invoice from "./Invoice";
import api from "../../config/axiosConfig";

function TransactionHistory() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("time_desc");
  const [selectedDate, setSelectedDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [refundModal, setRefundModal] = useState(null);
  const [refundQtys, setRefundQtys] = useState({});
  const [editCustomerModal, setEditCustomerModal] = useState(null); // transaction đang sửa
  const [editCustomerData, setEditCustomerData] = useState({ name: '', phone: '' });

  useEffect(() => {
    const loadAndSaveTransactions = async () => {
      const savedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      setTransactions(savedTransactions);

      // Lưu tất cả transactions hoàn thành vào database
      for (const transaction of savedTransactions) {
        if (!transaction.savedToDb && !transaction.purchaseHistorySyncFailed && transaction.status === "Hoàn thành") {
          await savePurchaseHistory(transaction);
        }
      }
    };

    loadAndSaveTransactions();
  }, []);

  const savePurchaseHistory = async (transaction) => {
    const items = transaction.cart || transaction.items || [];
    if (items.length === 0) return;

    const updateTransactionSyncState = (patch) => {
      const updatedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      const index = updatedTransactions.findIndex(t => t.id === transaction.id);
      if (index !== -1) {
        updatedTransactions[index] = { ...updatedTransactions[index], ...patch };
        localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
        setTransactions(updatedTransactions);
      }
    };

    const markTransactionAsSaved = () => {
      updateTransactionSyncState({ savedToDb: true, purchaseHistorySyncFailed: false });
    };

    const markTransactionAsSyncFailed = () => {
      updateTransactionSyncState({ purchaseHistorySyncFailed: true });
    };

    try {
      const validItems = items
        .map(item => {
          const productId = item.productId || item.id;
          const numericProductId = Number(productId);
          if (!Number.isInteger(numericProductId) || numericProductId <= 0) {
            return null;
          }

          const quantity = Number(item.qty || item.quantity || 1);
          const price = Number(item.price);
          const subtotal = quantity * price;

          if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price) || price < 0 || !Number.isFinite(subtotal) || subtotal < 0) {
            return null;
          }

          return {
            productId: numericProductId,
            productName: item.name,
            quantity,
            price,
            subtotal
          };
        })
        .filter(Boolean);

      if (validItems.length === 0) {
        markTransactionAsSyncFailed();
        return;
      }

      const customerId = Number(transaction.customer?.id);
      const request = {
        customerId: Number.isInteger(customerId) && customerId > 0 ? customerId : null,
        customerName: transaction.customer?.name || "Khách lẻ",
        paymentMethod: transaction.payment,
        items: validItems
      };

      await api.post('/pos/purchase-history', request);
      markTransactionAsSaved();
    } catch (error) {
      if (error?.response?.status === 409) {
        markTransactionAsSaved();
        return;
      }
      if (error?.response?.status === 400) {
        markTransactionAsSyncFailed();
      }
      console.error('Error saving purchase history:', error);
    }
  };

  const restorePendingOrder = (transaction) => {
    let pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
    let orders = JSON.parse(localStorage.getItem('posOrders') || '[{ "id": 1, "cart": [], "customer": null, "usePoints": false }]');
    let activeId = parseInt(localStorage.getItem('activeOrderId') || '1');

    // Chuẩn bị dữ liệu giỏ hàng và khách hàng từ transaction
    const cartToRestore = transaction.cart || transaction.items || [];
    const customerToRestore = transaction.customer || null;
    const usePointsToRestore = transaction.usePoints || false;

    // Xem tab gốc của đơn treo còn tồn tại không
    const transactionOrderId = transaction.orderId ? parseInt(transaction.orderId.replace('ORDER_', '')) : null;
    const targetOrderIndex = transactionOrderId ? orders.findIndex(o => o.id === transactionOrderId) : -1;

    // Xem đơn hàng hiện tại có đang trống không
    const activeOrderIndex = orders.findIndex(o => o.id === activeId);
    const isActiveEmpty = activeOrderIndex !== -1 && (!orders[activeOrderIndex].cart || orders[activeOrderIndex].cart.length === 0);

    if (targetOrderIndex !== -1) {
      // Tab gốc vẫn còn, update vào tab đó
      orders[targetOrderIndex].cart = cartToRestore;
      orders[targetOrderIndex].customer = customerToRestore;
      orders[targetOrderIndex].usePoints = usePointsToRestore;
      activeId = transactionOrderId;
    } else if (isActiveEmpty) {
      // Ghi đè lên đơn hiện tại đang trống
      orders[activeOrderIndex].cart = cartToRestore;
      orders[activeOrderIndex].customer = customerToRestore;
      orders[activeOrderIndex].usePoints = usePointsToRestore;
    } else {
      // Tạo một tab đơn hàng mới
      const newId = Math.max(...orders.map(o => o.id), 0) + 1;
      orders.push({
        id: newId,
        cart: cartToRestore,
        customer: customerToRestore,
        usePoints: usePointsToRestore
      });
      activeId = newId;
    }

    // Cập nhật lại orders và activeId cho màn hình POS
    localStorage.setItem('posOrders', JSON.stringify(orders));
    localStorage.setItem('activeOrderId', activeId.toString());

    // Nếu muốn duy trì order này trong danh sách pendingOrders (cho đến khi thanh toán xong)
    const existingOrderIndex = pendingOrders.findIndex(order => order.id === transaction.id);
    if (existingOrderIndex === -1) {
      // Nếu không tìm thấy, tạo một đơn mới dựa trên transaction cũ
      const newOrder = {
        ...transaction,
        id: `HD${Math.floor(Math.random() * 10000)}`, // Tạo id mới để tránh trùng lặp
        time: new Date().toLocaleString('vi-VN'),
        status: "Chờ thanh toán"
      };
      pendingOrders.push(newOrder);
      localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
    }

    navigate('/pos');
  };

  const deleteTransaction = (transactionId) => {
    const updatedTransactions = transactions.filter(t => t.id !== transactionId);
    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));

    // Đồng thời xoá khỏi danh sách pendingOrders nếu có
    const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
    const updatedPendingOrders = pendingOrders.filter(o => o.id !== transactionId);
    if (pendingOrders.length !== updatedPendingOrders.length) {
      localStorage.setItem('pendingOrders', JSON.stringify(updatedPendingOrders));
    }

    setShowActionMenu(null);
    setDeleteConfirm(null);
    setSelectedIds(prev => prev.filter(id => id !== transactionId));
  };

  const bulkDeleteTransactions = () => {
    const updatedTransactions = transactions.filter(t => !selectedIds.includes(t.id));
    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));

    const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
    const updatedPendingOrders = pendingOrders.filter(o => !selectedIds.includes(o.id));
    localStorage.setItem('pendingOrders', JSON.stringify(updatedPendingOrders));

    setSelectedIds([]);
    setBulkDeleteConfirm(false);
  };

  const openRefundModal = (transaction) => {
    const items = transaction.cart || transaction.items || [];
    const initQtys = {};
    items.forEach((_, i) => { initQtys[i] = 0; });
    setRefundQtys(initQtys);
    setRefundModal(transaction);
    setShowActionMenu(null);
  };

  const confirmRefund = () => {
    if (!refundModal) return;
    const items = refundModal.cart || refundModal.items || [];
    const hasRefund = items.some((_, i) => (refundQtys[i] || 0) > 0);
    if (!hasRefund) { alert('Vui lòng chọn ít nhất 1 sản phẩm để hoàn trả!'); return; }

    const newItems = items.map((item, i) => {
      const returnQty = refundQtys[i] || 0;
      const newQty = (item.qty || item.quantity || 1) - returnQty;
      return newQty > 0 ? { ...item, qty: newQty } : null;
    }).filter(Boolean);

    let refundAmount = 0;
    items.forEach((item, i) => { refundAmount += (refundQtys[i] || 0) * (item.price || 0); });

    const oldTotal = parseInt((refundModal.total || '').toString().replace(/[^0-9]/g, '')) || 0;
    const newTotal = Math.max(0, oldTotal - refundAmount);

    const updatedTransaction = {
      ...refundModal,
      cart: newItems,
      items: newItems,
      total: `${newTotal.toLocaleString()} đ`,
      quantity: `${newItems.reduce((s, it) => s + (it.qty || it.quantity || 1), 0)} món`,
      status: newItems.length === 0 ? 'Đã hoàn trả' : 'Hoàn thành',
      refundNote: `Hoàn trả ${refundAmount.toLocaleString()}đ lúc ${new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}`,
    };

    const updatedTransactions = transactions.map(t => t.id === refundModal.id ? updatedTransaction : t);
    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    setRefundModal(null);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map(t => t.id));
    }
  };

  const parseDateTime = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(/[\s,]+/);
    if (parts.length >= 2) {
      let dateString = parts[0];
      let timeString = parts[1];
      if (parts[1] && parts[1].includes('/')) {
        dateString = parts[1];
        timeString = parts[0];
      }
      const dateParts = dateString.split('/');
      if (dateParts.length === 3) {
        const [day, month, year] = dateParts;
        const timeParts = timeString.split(':');
        const hour = timeParts[0] || '0';
        const min = timeParts[1] || '0';
        const sec = timeParts[2] || '0';
        return new Date(year, month - 1, day, hour, min, sec).getTime();
      }
    }
    return new Date(timeStr).getTime() || 0;
  };

  // Lọc và sắp xếp transactions
  const filteredTransactions = transactions
    .filter(t => {
      // Tìm kiếm theo mã đơn
      const matchSearch = searchTerm === "" ||
        (t.id && t.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.id && t.id.replace('#HD', '').includes(searchTerm));

      // Lọc theo ngày
      let matchDate = true;
      if (selectedDate) {
        const dateObj = new Date(selectedDate);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;
        matchDate = t.time && t.time.includes(formattedDate);
      }

      // Lọc theo trạng thái
      const matchStatus = statusFilter === "all" || t.status === statusFilter;

      // Lọc theo thanh toán
      const matchPayment = paymentFilter === "all" || t.payment === paymentFilter;

      return matchSearch && matchDate && matchStatus && matchPayment;
    })
    .sort((a, b) => {
      if (sortBy.startsWith("time")) {
        const timeA = parseDateTime(a.time);
        const timeB = parseDateTime(b.time);
        return sortBy === "time_desc" ? timeB - timeA : timeA - timeB;
      } else {
        const amountA = parseInt((a.total || "").toString().replace(/[^0-9]/g, '')) || 0;
        const amountB = parseInt((b.total || "").toString().replace(/[^0-9]/g, '')) || 0;
        return sortBy === "price_desc" ? amountB - amountA : amountA - amountB;
      }
    });

  const uniquePayments = [...new Set(transactions.map(t => t.payment).filter(Boolean))];

  // Logic phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset trang về 1 khi có thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDate, statusFilter, paymentFilter, sortBy]);

  // Tính toán thống kê
  const totalTransactions = filteredTransactions.length;
  const totalRevenue = filteredTransactions.reduce((sum, t) => {
    const amount = parseInt(t.total.replace(/[^0-9]/g, ''));
    return sum + amount;
  }, 0);
  const averagePerOrder = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  return (
    <div style={{ padding: "20px 40px", fontFamily: "Arial, sans-serif" }}>
      {/* HEADER */}
      <h2>Lịch sử giao dịch</h2>
      <p style={{ color: "gray", marginTop: "5px" }}>
        Xem và quản lý lịch sử các giao dịch đã hoàn thành
      </p>

      {/* THỐNG KÊ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          margin: "20px 0",
        }}
      >
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: "12px",
            padding: "15px 20px",
            background: "white",
          }}
        >
          <span style={{ color: "gray", fontSize: "14px" }}>
            Tổng giao dịch
          </span>
          <h3 style={{ color: "#0d6efd", margin: "8px 0 0 0" }}>{totalTransactions}</h3>
        </div>

        <div
          style={{
            border: "1px solid #eee",
            borderRadius: "12px",
            padding: "15px 20px",
            background: "white",
          }}
        >
          <span style={{ color: "gray", fontSize: "14px" }}>
            Tổng doanh thu
          </span>
          <h3 style={{ color: "#198754", margin: "8px 0 0 0" }}>
            {totalRevenue.toLocaleString()} đ
          </h3>
        </div>

        <div
          style={{
            border: "1px solid #eee",
            borderRadius: "12px",
            padding: "15px 20px",
            background: "white",
          }}
        >
          <span style={{ color: "gray", fontSize: "14px" }}>
            Trung bình/đơn
          </span>
          <h3 style={{ color: "#fd7e14", margin: "8px 0 0 0" }}>
            {averagePerOrder.toLocaleString()} đ
          </h3>
        </div>
      </div>

      {/* SEARCH + BUTTON */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <input
          placeholder="Tìm kiếm theo mã đơn hàng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "300px",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            outline: "none",
          }}
        />

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flex: 1, justifyContent: "flex-end" }}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              background: "white",
              outline: "none",
              color: selectedDate ? "#000" : "#757575",
            }}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Chờ thanh toán">Chờ thanh toán (Đơn treo)</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
            }}
          >
            <option value="all">Tất cả thanh toán</option>
            {uniquePayments.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
            }}
          >
            <option value="time_desc">Mới nhất</option>
            <option value="time_asc">Cũ nhất</option>
            <option value="price_desc">Giá: Cao → Thấp</option>
            <option value="price_asc">Giá: Thấp → Cao</option>
          </select>




          {selectedIds.length > 0 && (
            <button
              onClick={() => setBulkDeleteConfirm(true)}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "none",
                background: "#dc3545",
                color: "white",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              🗑 Xóa ({selectedIds.length}) đơn
            </button>
          )}
        </div>
      </div>

      {/* BẢNG */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "white",
        }}
      >
        <thead>
          <tr style={{ background: "#f8f9fa" }}>
            <th style={{ padding: "12px", textAlign: "center", width: "40px" }}>
              <input
                type="checkbox"
                checked={paginatedTransactions.length > 0 && paginatedTransactions.every(t => selectedIds.includes(t.id))}
                onChange={() => {
                  const currentIds = paginatedTransactions.map(t => t.id);
                  const allSelected = currentIds.every(id => selectedIds.includes(id));
                  if (allSelected) {
                    setSelectedIds(prev => prev.filter(id => !currentIds.includes(id)));
                  } else {
                    const newIds = currentIds.filter(id => !selectedIds.includes(id));
                    setSelectedIds(prev => [...prev, ...newIds]);
                  }
                }}
                style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#0d6efd" }}
              />
            </th>
            <th style={{ padding: "12px", textAlign: "left" }}>Mã đơn</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Thời gian</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Số lượng</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Thanh toán</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Tổng tiền</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Trạng thái</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {paginatedTransactions.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ padding: "20px", textAlign: "center", color: "gray" }}>
                {transactions.length === 0 ? "Chưa có giao dịch nào" : "Không tìm thấy giao dịch phù hợp"}
              </td>
            </tr>
          ) : (
            paginatedTransactions.map((item, index) => (
              <tr
                key={index}
                style={{
                  borderBottom: "1px solid #eee",
                  background: selectedIds.includes(item.id) ? "#e8f0fe" : "transparent",
                }}
              >
                <td style={{ padding: "12px", textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#0d6efd" }}
                  />
                </td>
                <td
                  style={{
                    padding: "12px",
                    color: "#0d6efd",
                    fontWeight: "600",
                  }}
                >
                  {item.id}
                </td>
                <td style={{ padding: "12px" }}>{item.time}</td>
                <td style={{ padding: "12px" }}>{item.quantity}</td>
                <td style={{ padding: "12px" }}>{item.payment}</td>
                <td style={{ padding: "12px" }}>{item.total}</td>
                <td style={{ padding: "12px" }}>
                  <span
                    style={{
                      padding: "6px 10px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      background: item.status === "Chờ thanh toán" ? "#fff3cd" : "#e6f4ea",
                      color: item.status === "Chờ thanh toán" ? "#856404" : "#0f5132",
                    }}
                  >
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: "12px" }}>
                  <button
                    onClick={() => {
                      setSelectedTransaction(item);
                      setShowInvoice(true);
                    }}
                    style={{
                      border: "none",
                      background: "#f3f3f3",
                      marginRight: "6px",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    👁
                  </button>
                  <div style={{ position: "relative", display: "inline-block" }}>
                    <button
                      onClick={() => setShowActionMenu(showActionMenu === index ? null : index)}
                      style={{
                        border: "none",
                        background: "#f3f3f3",
                        padding: "6px 8px",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      ⋮
                    </button>
                    {showActionMenu === index && (
                      <div style={{
                        position: "absolute",
                        right: 0,
                        top: "100%",
                        background: "white",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        zIndex: 1000,
                        minWidth: "120px",
                        marginTop: "4px"
                      }}>
                        {item.status === "Hoàn thành" && (
                          <button
                            onClick={() => openRefundModal(item)}
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              border: "none",
                              background: "white",
                              textAlign: "left",
                              cursor: "pointer",
                              fontSize: "13px",
                              borderBottom: "1px solid #f0f0f0",
                              color: "#e67e22"
                            }}
                            onMouseEnter={(e) => e.target.style.background = "#f8f9fa"}
                            onMouseLeave={(e) => e.target.style.background = "white"}
                          >
                            🔄 Hoàn trả sản phẩm
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditCustomerData({
                              name: item.customer?.name || '',
                              phone: item.customer?.phone || ''
                            });
                            setEditCustomerModal(item);
                            setShowActionMenu(null);
                          }}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "none",
                            background: "white",
                            textAlign: "left",
                            cursor: "pointer",
                            fontSize: "13px",
                            borderBottom: "1px solid #f0f0f0",
                            color: "#6c757d"
                          }}
                          onMouseEnter={(e) => e.target.style.background = "#f8f9fa"}
                          onMouseLeave={(e) => e.target.style.background = "white"}
                        >
                          ✏️ Sửa thông tin KH
                        </button>
                        {item.status === "Chờ thanh toán" && (
                          <button
                            onClick={() => restorePendingOrder(item)}
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              border: "none",
                              background: "white",
                              textAlign: "left",
                              cursor: "pointer",
                              fontSize: "13px",
                              borderBottom: "1px solid #f0f0f0",
                              color: "#0d6efd"
                            }}
                            onMouseEnter={(e) => e.target.style.background = "#f8f9fa"}
                            onMouseLeave={(e) => e.target.style.background = "white"}
                          >
                            💳 Tiếp tục thanh toán
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedTransaction(item);
                            setShowInvoice(true);
                            setShowActionMenu(null);
                          }}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "none",
                            background: "white",
                            textAlign: "left",
                            cursor: "pointer",
                            fontSize: "13px",
                            borderBottom: "1px solid #f0f0f0"
                          }}
                          onMouseEnter={(e) => e.target.style.background = "#f8f9fa"}
                          onMouseLeave={(e) => e.target.style.background = "white"}
                        >
                          🖨 In hóa đơn
                        </button>
                        <button
                          onClick={() => {
                            setDeleteConfirm(item);
                            setShowActionMenu(null);
                          }}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "none",
                            background: "white",
                            textAlign: "left",
                            cursor: "pointer",
                            fontSize: "13px",
                            color: "#dc3545"
                          }}
                          onMouseEnter={(e) => e.target.style.background = "#f8f9fa"}
                          onMouseLeave={(e) => e.target.style.background = "white"}
                        >
                          🗑 Xóa
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "20px",
          padding: "10px 0",
          borderTop: "1px solid #eee"
        }}>
          <div style={{ color: "gray", fontSize: "14px" }}>
            Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} trong tổng số {filteredTransactions.length} giao dịch
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                background: currentPage === 1 ? "#f5f5f5" : "white",
                color: currentPage === 1 ? "#aaa" : "#333",
                borderRadius: "6px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer"
              }}
            >
              &laquo; Trước
            </button>
            <div style={{ display: "flex", gap: "5px" }}>
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                // Chỉ hiển thị vài trang xung quanh trang hiện tại
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        padding: "8px 12px",
                        border: "1px solid",
                        borderColor: currentPage === pageNum ? "#0d6efd" : "#ddd",
                        background: currentPage === pageNum ? "#0d6efd" : "white",
                        color: currentPage === pageNum ? "white" : "#333",
                        borderRadius: "6px",
                        cursor: "pointer"
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 2 ||
                  pageNum === currentPage + 2
                ) {
                  return <span key={pageNum} style={{ padding: "8px 4px", color: "gray" }}>...</span>;
                }
                return null;
              })}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                background: currentPage === totalPages ? "#f5f5f5" : "white",
                color: currentPage === totalPages ? "#aaa" : "#333",
                borderRadius: "6px",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer"
              }}
            >
              Sau &raquo;
            </button>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {deleteConfirm && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000
        }}>
          <div style={{
            background: "white",
            borderRadius: "12px",
            padding: "30px",
            width: "400px",
            maxWidth: "90%",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            textAlign: "center"
          }}>
            <div style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: "#fff3f3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 15px",
              fontSize: "24px"
            }}>
              ⚠️
            </div>
            <h3 style={{ margin: "0 0 10px", fontSize: "18px", color: "#333" }}>
              Xác nhận xóa giao dịch
            </h3>
            <p style={{ color: "#666", fontSize: "14px", margin: "0 0 20px" }}>
              Bạn có chắc chắn muốn xóa giao dịch <strong style={{ color: "#0d6efd" }}>{deleteConfirm.id}</strong> không?<br />
              Hành động này không thể hoàn tác.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  padding: "10px 25px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  background: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500"
                }}
              >
                Không
              </button>
              <button
                onClick={() => deleteTransaction(deleteConfirm.id)}
                style={{
                  padding: "10px 25px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#dc3545",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500"
                }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa hàng loạt */}
      {bulkDeleteConfirm && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000
        }}>
          <div style={{
            background: "white",
            borderRadius: "12px",
            padding: "30px",
            width: "400px",
            maxWidth: "90%",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            textAlign: "center"
          }}>
            <div style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: "#fff3f3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 15px",
              fontSize: "24px"
            }}>
              ⚠️
            </div>
            <h3 style={{ margin: "0 0 10px", fontSize: "18px", color: "#333" }}>
              Xác nhận xóa {selectedIds.length} giao dịch
            </h3>
            <p style={{ color: "#666", fontSize: "14px", margin: "0 0 20px" }}>
              Bạn có chắc chắn muốn xóa <strong style={{ color: "#dc3545" }}>{selectedIds.length} đơn hàng</strong> đã chọn không?<br />
              Hành động này không thể hoàn tác.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => setBulkDeleteConfirm(false)}
                style={{
                  padding: "10px 25px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  background: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500"
                }}
              >
                Không
              </button>
              <button
                onClick={bulkDeleteTransactions}
                style={{
                  padding: "10px 25px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#dc3545",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500"
                }}
              >
                Xóa tất cả
              </button>
            </div>
          </div>
        </div>
      )}

      {showInvoice && (
        <Invoice
          transaction={selectedTransaction}
          onClose={() => setShowInvoice(false)}
        />
      )}

      {/* Modal hoàn trả sản phẩm */}
      {refundModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2000
        }}>
          <div style={{
            background: "white", borderRadius: "12px", padding: "30px",
            width: "540px", maxWidth: "95%",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "18px", color: "#333" }}>
              🔄 Hoàn trả sản phẩm
            </h3>
            <p style={{ color: "#666", fontSize: "13px", margin: "0 0 18px" }}>
              Đơn <strong style={{ color: "#0d6efd" }}>{refundModal.id}</strong> — Chọn số lượng muốn hoàn trả:
            </p>
            <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "18px" }}>
              {(refundModal.cart || refundModal.items || []).map((item, i) => {
                const maxQty = item.qty || item.quantity || 1;
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 12px", marginBottom: "8px",
                    border: "1px solid #e9ecef", borderRadius: "8px",
                    background: (refundQtys[i] || 0) > 0 ? "#fff3cd" : "#f8f9fa"
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "600", fontSize: "13px" }}>{item.name}</div>
                      <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                        {(item.price || 0).toLocaleString()}đ × {maxQty} = {((item.price || 0) * maxQty).toLocaleString()}đ
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "14px" }}>
                      <span style={{ fontSize: "12px", color: "#555", whiteSpace: "nowrap" }}>Trả lại:</span>
                      <button
                        onClick={() => setRefundQtys(q => ({ ...q, [i]: Math.max(0, (q[i] || 0) - 1) }))}
                        style={{ width: "26px", height: "26px", border: "1px solid #ddd", background: "white", borderRadius: "4px", cursor: "pointer", fontSize: "14px" }}
                      >-</button>
                      <input
                        type="number" min={0} max={maxQty}
                        value={refundQtys[i] || 0}
                        onChange={(e) => {
                          const v = Math.min(maxQty, Math.max(0, parseInt(e.target.value) || 0));
                          setRefundQtys(q => ({ ...q, [i]: v }));
                        }}
                        style={{
                          width: "42px", textAlign: "center", fontSize: "13px",
                          fontWeight: "bold", border: "1px solid #ddd",
                          borderRadius: "4px", padding: "2px 4px", height: "26px"
                        }}
                      />
                      <button
                        onClick={() => setRefundQtys(q => ({ ...q, [i]: Math.min(maxQty, (q[i] || 0) + 1) }))}
                        style={{ width: "26px", height: "26px", border: "1px solid #ddd", background: "white", borderRadius: "4px", cursor: "pointer", fontSize: "14px" }}
                      >+</button>
                      <span style={{ fontSize: "12px", color: "#888" }}>/ {maxQty}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Tóm tắt số tiền hoàn trả */}
            {(() => {
              const items = refundModal.cart || refundModal.items || [];
              const amt = items.reduce((s, item, i) => s + (refundQtys[i] || 0) * (item.price || 0), 0);
              return amt > 0 ? (
                <div style={{
                  padding: "10px 14px", marginBottom: "16px",
                  background: "#fff3cd", borderRadius: "8px", border: "1px solid #ffc107",
                  fontSize: "14px", display: "flex", justifyContent: "space-between"
                }}>
                  <span>Số tiền cần hoàn lại cho khách:</span>
                  <strong style={{ color: "#e67e22" }}>{amt.toLocaleString()}đ</strong>
                </div>
              ) : null;
            })()}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setRefundModal(null)}
                style={{
                  padding: "10px 22px", borderRadius: "8px",
                  border: "1px solid #ddd", background: "white",
                  cursor: "pointer", fontSize: "14px", fontWeight: "500"
                }}
              >
                Hủy
              </button>
              <button
                onClick={confirmRefund}
                style={{
                  padding: "10px 22px", borderRadius: "8px",
                  border: "none", background: "#e67e22",
                  color: "white", cursor: "pointer",
                  fontSize: "14px", fontWeight: "600"
                }}
              >
                Xác nhận Hoàn trả
              </button>
            </div>
          </div>
        </div>
      )}\r\n\r\n      {/* Modal sửa thông tin khách hàng */}
      {editCustomerModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2000
        }}>
          <div style={{
            background: "white", borderRadius: "12px", padding: "30px",
            width: "420px", maxWidth: "95%",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}>
            <h3 style={{ margin: "0 0 6px", fontSize: "18px", color: "#333" }}>
              ✏️ Sửa thông tin khách hàng
            </h3>
            <p style={{ color: "#888", fontSize: "13px", margin: "0 0 20px" }}>
              Đơn <strong style={{ color: "#0d6efd" }}>{editCustomerModal.id}</strong>
            </p>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "5px", color: "#555" }}>
                Tên khách hàng:
              </label>
              <input
                type="text"
                placeholder="Nhập tên khách hàng"
                value={editCustomerData.name}
                onChange={(e) => setEditCustomerData(d => ({ ...d, name: e.target.value }))}
                autoFocus
                style={{
                  width: "100%", padding: "10px 12px", fontSize: "14px",
                  border: "1px solid #ddd", borderRadius: "8px", outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#0d6efd"}
                onBlur={(e) => e.target.style.borderColor = "#ddd"}
              />
            </div>

            <div style={{ marginBottom: "22px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "5px", color: "#555" }}>
                Số điện thoại:
              </label>
              <input
                type="tel"
                placeholder="Nhập số điện thoại"
                value={editCustomerData.phone}
                onChange={(e) => setEditCustomerData(d => ({ ...d, phone: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    // trigger save
                    const updatedTransactions = transactions.map(t =>
                      t.id === editCustomerModal.id
                        ? { ...t, customer: { ...(t.customer || {}), name: editCustomerData.name, phone: editCustomerData.phone } }
                        : t
                    );
                    setTransactions(updatedTransactions);
                    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
                    setEditCustomerModal(null);
                  }
                }}
                style={{
                  width: "100%", padding: "10px 12px", fontSize: "14px",
                  border: "1px solid #ddd", borderRadius: "8px", outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#0d6efd"}
                onBlur={(e) => e.target.style.borderColor = "#ddd"}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setEditCustomerModal(null)}
                style={{
                  padding: "10px 22px", borderRadius: "8px",
                  border: "1px solid #ddd", background: "white",
                  cursor: "pointer", fontSize: "14px", fontWeight: "500"
                }}
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  const updatedTransactions = transactions.map(t =>
                    t.id === editCustomerModal.id
                      ? { ...t, customer: { ...(t.customer || {}), name: editCustomerData.name, phone: editCustomerData.phone } }
                      : t
                  );
                  setTransactions(updatedTransactions);
                  localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
                  setEditCustomerModal(null);
                }}
                style={{
                  padding: "10px 22px", borderRadius: "8px",
                  border: "none", background: "#0d6efd",
                  color: "white", cursor: "pointer",
                  fontSize: "14px", fontWeight: "600"
                }}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionHistory;
