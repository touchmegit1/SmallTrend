function TransactionHistory() {
  const transactions = [
    {
      id: "#HD318649",
      time: "21:25 02/02/2026",
      quantity: "3 món",
      payment: "Tiền mặt",
      total: "20.500 đ",
      status: "Hoàn thành",
    },
  ];

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
          <h3 style={{ color: "#0d6efd", margin: "8px 0 0 0" }}>1</h3>
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
            20.500 đ
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
            20.500 đ
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
          placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm..."
          style={{
            width: "70%",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            outline: "none",
          }}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
            }}
          >
            Lọc
          </button>

          <button
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
            }}
          >
            Chọn ngày
          </button>
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
          {transactions.map((item, index) => (
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
                    background: "#e6f4ea",
                    color: "#0f5132",
                  }}
                >
                  {item.status}
                </span>
              </td>
              <td style={{ padding: "12px" }}>
                <button
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
                <button
                  style={{
                    border: "none",
                    background: "#f3f3f3",
                    padding: "6px 8px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  🖨
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionHistory;
