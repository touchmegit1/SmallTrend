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

  useEffect(() => {
    const loadAndSaveTransactions = async () => {
      const savedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      setTransactions(savedTransactions);

      // Lưu tất cả transactions có customer vào database
      for (const transaction of savedTransactions) {
        if (!transaction.savedToDb && transaction.customer && transaction.status === "Hoàn thành") {
          await savePurchaseHistory(transaction);
        }
      }
    };

    loadAndSaveTransactions();
  }, []);

  const savePurchaseHistory = async (transaction) => {
    if (!transaction.customer) return;

    const items = transaction.cart || transaction.items || [];
    if (items.length === 0) return;

    try {
      const request = {
        customerId: transaction.customer.id,
        customerName: transaction.customer.name,
        paymentMethod: transaction.payment,
        items: items.map(item => ({
          productId: item.productId || item.id || 0,
          productName: item.name,
          quantity: item.qty || item.quantity || 1,
          price: item.price,
          subtotal: item.price * (item.qty || item.quantity || 1)
        }))
      };

      await api.post('/pos/purchase-history', request);

      // Đánh dấu đã lưu
      const updatedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      const index = updatedTransactions.findIndex(t => t.id === transaction.id);
      if (index !== -1) {
        updatedTransactions[index].savedToDb = true;
        localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
        setTransactions(updatedTransactions);
      }
    } catch (error) {
      console.error('Error saving purchase history:', error);
    }
  };

  const restorePendingOrder = (transaction) => {
    let pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
    let orders = JSON.parse(localStorage.getItem('posOrders') || '[{ "id": 1, "cart": [], "customer": null, "usePoints": false }]');
    let activeId = parseInt(localStorage.getItem('activeOrderId') || '1');

    // Xem đơn hàng hiện tại có đang trống không
    const activeOrderIndex = orders.findIndex(o => o.id === activeId);
    const isActiveEmpty = activeOrderIndex !== -1 && (!orders[activeOrderIndex].cart || orders[activeOrderIndex].cart.length === 0);

    // Chuẩn bị dữ liệu giỏ hàng và khách hàng từ transaction
    const cartToRestore = transaction.cart || transaction.items || [];
    const customerToRestore = transaction.customer || null;
    const usePointsToRestore = transaction.usePoints || false;

    if (isActiveEmpty) {
      // Ghi đè lên đơn hiện tại đang trống
      orders[activeOrderIndex].cart = cartToRestore;
      orders[activeOrderIndex].customer = customerToRestore;
      orders[activeOrderIndex].usePoints = usePointsToRestore;

      // Không thay đổi activeId vì đang dùng đơn hiện tại
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
  };

  const parseDateTime = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(/[\s,]+/);
    if (parts.length >= 2) {
      const dateParts = parts[0].split('/');
      if (dateParts.length === 3) {
        const [day, month, year] = dateParts;
        const timeParts = parts[1].split(':');
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

          {(searchTerm || selectedDate || statusFilter !== "all" || paymentFilter !== "all" || sortBy !== "time_desc") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedDate("");
                setStatusFilter("all");
                setPaymentFilter("all");
                setSortBy("time_desc");
              }}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid #dc3545",
                background: "#dc3545",
                color: "white",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Xóa lọc
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
          {filteredTransactions.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ padding: "20px", textAlign: "center", color: "gray" }}>
                {transactions.length === 0 ? "Chưa có giao dịch nào" : "Không tìm thấy giao dịch phù hợp"}
              </td>
            </tr>
          ) : (
            filteredTransactions.map((item, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
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
                            ↩ Quay lại POS
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

      {showInvoice && (
        <Invoice
          transaction={selectedTransaction}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </div>
  );
}

export default TransactionHistory;
