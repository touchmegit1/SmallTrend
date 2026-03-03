import { useState, useEffect } from "react";

export default function ShiftHandover() {
  const [shiftData, setShiftData] = useState(() => {
    const saved = localStorage.getItem('currentShift');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      shiftNumber: 1,
      startTime: "",
      endTime: "",
      cashier: "Nguyễn Văn A",
      status: "Đang mở"
    };
  });

  const [revenue, setRevenue] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    cashRevenue: 0,
    transferRevenue: 0
  });

  const [cashCount, setCashCount] = useState(() => {
    const saved = localStorage.getItem('currentShiftCash');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      cash500k: 0,
      cash200k: 0,
      cash100k: 0,
      cash50k: 0,
      cash20k: 0,
      cash10k: 0,
      cash5k: 0,
      cash2k: 0,
      cash1k: 0
    };
  });

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('currentShiftNotes');
    return saved || "";
  });
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // Load shift data
    const now = new Date();
    const savedShift = localStorage.getItem('currentShift');
    
    if (!savedShift) {
      const initialShift = {
        shiftNumber: 1,
        startTime: "08:00",
        endTime: now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        cashier: "Nguyễn Văn A",
        status: "Đang mở"
      };
      setShiftData(initialShift);
      localStorage.setItem('currentShift', JSON.stringify(initialShift));
    } else {
      const shift = JSON.parse(savedShift);
      setShiftData({
        ...shift,
        endTime: now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      });
    }

    // Load transactions
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const completedTransactions = transactions.filter(t => t.status === "Hoàn thành");
    
    const totalRevenue = completedTransactions.reduce((sum, t) => {
      return sum + parseInt(t.total.replace(/[^0-9]/g, ''));
    }, 0);

    const cashRevenue = completedTransactions
      .filter(t => t.payment === "Tiền mặt")
      .reduce((sum, t) => sum + parseInt(t.total.replace(/[^0-9]/g, '')), 0);

    const transferRevenue = completedTransactions
      .filter(t => t.payment === "Chuyển khoản")
      .reduce((sum, t) => sum + parseInt(t.total.replace(/[^0-9]/g, '')), 0);

    setRevenue({
      totalOrders: completedTransactions.length,
      totalRevenue,
      cashRevenue,
      transferRevenue
    });
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (shiftData.status !== "Đã chốt") {
      localStorage.setItem('currentShift', JSON.stringify(shiftData));
    }
  }, [shiftData]);

  useEffect(() => {
    if (shiftData.status !== "Đã chốt") {
      localStorage.setItem('currentShiftCash', JSON.stringify(cashCount));
    }
  }, [cashCount, shiftData.status]);

  useEffect(() => {
    if (shiftData.status !== "Đã chốt") {
      localStorage.setItem('currentShiftNotes', notes);
    }
  }, [notes, shiftData.status]);

  const denominations = [
    { key: 'cash500k', label: '500,000đ', value: 500000 },
    { key: 'cash200k', label: '200,000đ', value: 200000 },
    { key: 'cash100k', label: '100,000đ', value: 100000 },
    { key: 'cash50k', label: '50,000đ', value: 50000 },
    { key: 'cash20k', label: '20,000đ', value: 20000 },
    { key: 'cash10k', label: '10,000đ', value: 10000 },
    { key: 'cash5k', label: '5,000đ', value: 5000 },
    { key: 'cash2k', label: '2,000đ', value: 2000 },
    { key: 'cash1k', label: '1,000đ', value: 1000 }
  ];

  const totalCashCounted = denominations.reduce((sum, denom) => {
    return sum + (cashCount[denom.key] * denom.value);
  }, 0);

  const difference = totalCashCounted - revenue.cashRevenue;

  const handleCloseShift = () => {
    const shiftReport = {
      ...shiftData,
      ...revenue,
      cashCount,
      totalCashCounted,
      difference,
      notes,
      closedAt: new Date().toISOString(),
      status: "Đã chốt"
    };

    const shiftReports = JSON.parse(localStorage.getItem('shiftReports') || '[]');
    shiftReports.unshift(shiftReport);
    localStorage.setItem('shiftReports', JSON.stringify(shiftReports));

    // Clear current shift data
    localStorage.removeItem('currentShift');
    localStorage.removeItem('currentShiftCash');
    localStorage.removeItem('currentShiftNotes');

    alert("Chốt ca thành công!");
    setShowConfirm(false);
    setShiftData(prev => ({ ...prev, status: "Đã chốt" }));
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8f9fa",
      padding: "30px 40px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      {/* Header */}
      <div style={{
        background: "white",
        borderRadius: "8px",
        padding: "20px 25px",
        marginBottom: "20px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "24px", color: "#2c3e50", fontWeight: "600" }}>
              Chốt Ca #{shiftData.shiftNumber}
            </h1>
            <p style={{ margin: "5px 0 0 0", color: "#6c757d", fontSize: "14px" }}>
              {shiftData.startTime} - {shiftData.endTime} | Thu ngân: {shiftData.cashier}
            </p>
          </div>
          <span style={{
            padding: "8px 20px",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: "600",
            background: shiftData.status === "Đã chốt" ? "#e6f4ea" : "#fff3cd",
            color: shiftData.status === "Đã chốt" ? "#0f5132" : "#856404"
          }}>
            {shiftData.status}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
        marginBottom: "25px"
      }}>
        <div style={{
          background: "white",
          borderRadius: "8px",
          padding: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "13px", color: "#6c757d", marginBottom: "8px" }}>Tổng đơn hàng</div>
          <div style={{ fontSize: "32px", fontWeight: "700", color: "#007bff" }}>
            {revenue.totalOrders}
          </div>
        </div>

        <div style={{
          background: "white",
          borderRadius: "8px",
          padding: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "13px", color: "#6c757d", marginBottom: "8px" }}>Tổng doanh thu</div>
          <div style={{ fontSize: "32px", fontWeight: "700", color: "#28a745" }}>
            {revenue.totalRevenue.toLocaleString()}đ
          </div>
        </div>

        <div style={{
          background: "white",
          borderRadius: "8px",
          padding: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "13px", color: "#6c757d", marginBottom: "8px" }}>Tiền mặt</div>
          <div style={{ fontSize: "32px", fontWeight: "700", color: "#007bff" }}>
            {revenue.cashRevenue.toLocaleString()}đ
          </div>
        </div>

        <div style={{
          background: "white",
          borderRadius: "8px",
          padding: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "13px", color: "#6c757d", marginBottom: "8px" }}>Chuyển khoản</div>
          <div style={{ fontSize: "32px", fontWeight: "700", color: "#17a2b8" }}>
            {revenue.transferRevenue.toLocaleString()}đ
          </div>
        </div>
      </div>

      {/* Main Content - 2 Columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" }}>
        {/* Left Column - Cash Count */}
        <div style={{
          background: "white",
          borderRadius: "8px",
          padding: "25px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "600", color: "#2c3e50" }}>
            Kiểm kê tiền mặt
          </h3>

          <div style={{ marginBottom: "20px" }}>
            {denominations.map(denom => (
              <div key={denom.key} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
                padding: "12px",
                background: "#f7fafc",
                borderRadius: "10px"
              }}>
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#2d3748" }}>
                  {denom.label}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    onClick={() => setCashCount(prev => ({
                      ...prev,
                      [denom.key]: Math.max(0, prev[denom.key] - 1)
                    }))}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#e2e8f0",
                      color: "#2d3748",
                      cursor: "pointer",
                      fontSize: "18px",
                      fontWeight: "600"
                    }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={cashCount[denom.key]}
                    onChange={(e) => setCashCount(prev => ({
                      ...prev,
                      [denom.key]: parseInt(e.target.value) || 0
                    }))}
                    style={{
                      width: "60px",
                      padding: "6px",
                      textAlign: "center",
                      border: "2px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600"
                    }}
                  />
                  <button
                    onClick={() => setCashCount(prev => ({
                      ...prev,
                      [denom.key]: prev[denom.key] + 1
                    }))}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#007bff",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "18px",
                      fontWeight: "600"
                    }}
                  >
                    +
                  </button>
                  <span style={{
                    minWidth: "100px",
                    textAlign: "right",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#4a5568"
                  }}>
                    {(cashCount[denom.key] * denom.value).toLocaleString()}đ
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            padding: "20px",
            background: "#007bff",
            borderRadius: "12px",
            marginBottom: "15px"
          }}>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.9)", marginBottom: "5px" }}>
              Tổng tiền đếm được
            </div>
            <div style={{ fontSize: "36px", fontWeight: "700", color: "white" }}>
              {totalCashCounted.toLocaleString()}đ
            </div>
          </div>

          {difference !== 0 && (
            <div style={{
              padding: "15px",
              background: difference > 0 ? "#e6f4ea" : "#fee",
              border: `2px solid ${difference > 0 ? "#48bb78" : "#f56565"}`,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <span style={{ fontSize: "20px" }}>{difference > 0 ? "⚠️" : "❌"}</span>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: difference > 0 ? "#22543d" : "#742a2a" }}>
                  {difference > 0 ? "Thừa tiền" : "Thiếu tiền"}
                </div>
                <div style={{ fontSize: "18px", fontWeight: "700", color: difference > 0 ? "#22543d" : "#742a2a" }}>
                  {Math.abs(difference).toLocaleString()}đ
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Notes & Actions */}
        <div style={{
          background: "white",
          borderRadius: "8px",
          padding: "25px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column"
        }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "600", color: "#2c3e50" }}>
            Ghi chú & Xác nhận
          </h3>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#4a5568" }}>
              Ghi chú ca làm việc
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú về ca làm việc (nếu có)..."
              rows={6}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #e2e8f0",
                borderRadius: "12px",
                fontSize: "14px",
                resize: "none",
                fontFamily: "inherit"
              }}
            />
          </div>

          <div style={{
            padding: "20px",
            background: "#f7fafc",
            borderRadius: "12px",
            marginBottom: "20px"
          }}>
            <div style={{ fontSize: "13px", color: "#718096", marginBottom: "12px" }}>Tóm tắt ca làm việc</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "14px", color: "#4a5568" }}>Doanh thu tiền mặt:</span>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#2d3748" }}>
                {revenue.cashRevenue.toLocaleString()}đ
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "14px", color: "#4a5568" }}>Tiền đếm được:</span>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#2d3748" }}>
                {totalCashCounted.toLocaleString()}đ
              </span>
            </div>
            <div style={{
              height: "1px",
              background: "#e2e8f0",
              margin: "12px 0"
            }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#4a5568" }}>Chênh lệch:</span>
              <span style={{
                fontSize: "16px",
                fontWeight: "700",
                color: difference === 0 ? "#48bb78" : difference > 0 ? "#ed8936" : "#f56565"
              }}>
                {difference === 0 ? "Khớp" : `${difference > 0 ? "+" : ""}${difference.toLocaleString()}đ`}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            disabled={shiftData.status === "Đã chốt"}
            style={{
              marginTop: "auto",
              padding: "16px",
              background: shiftData.status === "Đã chốt" 
                ? "#cbd5e0" 
                : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: shiftData.status === "Đã chốt" ? "not-allowed" : "pointer",
              boxShadow: shiftData.status === "Đã chốt" ? "none" : "0 4px 12px rgba(0,123,255,0.3)",
              transition: "all 0.3s"
            }}
          >
            {shiftData.status === "Đã chốt" ? "Đã chốt ca" : "Xác nhận chốt ca"}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "30px",
            maxWidth: "450px",
            width: "90%",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
          }}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "22px", fontWeight: "700", color: "#1a202c" }}>
              Xác nhận chốt ca
            </h3>
            <p style={{ margin: "0 0 20px 0", fontSize: "14px", color: "#718096", lineHeight: "1.6" }}>
              Bạn có chắc chắn muốn chốt ca làm việc này không? Sau khi chốt ca, bạn sẽ không thể chỉnh sửa thông tin.
            </p>

            {difference !== 0 && (
              <div style={{
                padding: "12px",
                background: "#fff3cd",
                border: "1px solid #ffc107",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "13px",
                color: "#856404"
              }}>
                ⚠️ Lưu ý: Có chênh lệch tiền {Math.abs(difference).toLocaleString()}đ
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#e2e8f0",
                  color: "#2d3748",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleCloseShift}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0,123,255,0.4)"
                }}
              >
                Xác nhận chốt ca
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
