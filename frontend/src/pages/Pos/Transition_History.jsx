import { useState, useEffect } from "react";
import Invoice from "./Invoice";

function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedDate, setSelectedDate] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);

  useEffect(() => {
    // Load transactions from localStorage
    const savedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    setTransactions(savedTransactions);
  }, []);

  const deleteTransaction = (transactionId) => {
    const updatedTransactions = transactions.filter(t => t.id !== transactionId);
    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    setShowActionMenu(null);
  };

  // Lọc và sắp xếp transactions
  const filteredTransactions = transactions
    .filter(t => {
      // Tìm kiếm theo mã đơn (chỉ tìm trong phần số của mã)
      const matchSearch = searchTerm === "" ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.replace('#HD', '').includes(searchTerm);

      // Lọc theo ngày - chuyển đổi format để so sánh
      let matchDate = true;
      if (selectedDate) {
        const timeParts = t.time.includes(',')
          ? t.time.split(', ')
          : t.time.split(' ');

        const datePart = timeParts.length > 1 ? timeParts[1] : timeParts[0];

        if (datePart && datePart.includes('/')) {
          // Format: MM/DD/YYYY
          const [month, day, year] = datePart.split('/');

          const transactionDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

          matchDate = transactionDate === selectedDate;
        }
      }

      return matchSearch && matchDate;
    })
    .sort((a, b) => {
      // Sắp xếp theo giá tiền
      const amountA = parseInt(a.total.replace(/[^0-9]/g, ''));
      const amountB = parseInt(b.total.replace(/[^0-9]/g, ''));
      return sortOrder === "desc" ? amountB - amountA : amountA - amountB;
    });

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
        }}
      >
        <input
          placeholder="Tìm kiếm theo mã đơn hàng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "70%",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            outline: "none",
          }}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
            }}
          >
            <option value="desc">Giá: Cao → Thấp</option>
            <option value="asc">Giá: Thấp → Cao</option>
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
            }}
          />

          {(searchTerm || selectedDate || sortOrder !== "desc") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedDate("");
                setSortOrder("desc");
              }}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid #dc3545",
                background: "#dc3545",
                color: "white",
                cursor: "pointer",
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
                <td style={{ padding: "12px" }}>💵 {item.payment}</td>
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
                          onClick={() => deleteTransaction(item.id)}
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
