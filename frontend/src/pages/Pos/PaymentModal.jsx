import { useState } from "react";
import CustomerSearch from "./CustomerSearch";

export default function PaymentModal({ cart, customer, onClose, onComplete }) {
  const [selectedCustomer, setSelectedCustomer] = useState(customer);
  const [usePoints, setUsePoints] = useState(false);
  const [voucher, setVoucher] = useState("");
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cashAmount, setCashAmount] = useState("");

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const pointsDiscount = usePoints && selectedCustomer ? Math.min(selectedCustomer.existingPoints * 100, subtotal) : 0;
  const totalDiscount = pointsDiscount + discount;
  const finalTotal = subtotal - totalDiscount;
  const change = cashAmount ? Math.max(0, parseFloat(cashAmount) - finalTotal) : 0;

  const getSuggestedAmounts = () => {
    if (!cashAmount) return [];
    const firstDigit = cashAmount[0];
    return [
      parseInt(firstDigit + "0000"),
      parseInt(firstDigit + "00000"),
      parseInt(firstDigit + "000000")
    ];
  };

  const handlePayment = () => {
    if (paymentMethod === "cash" && (!cashAmount || parseFloat(cashAmount) < finalTotal)) {
      alert("Số tiền không đủ!");
      return;
    }

    onComplete({
      cart,
      customer: selectedCustomer,
      total: finalTotal,
      customerMoney: paymentMethod === "cash" ? parseFloat(cashAmount) : finalTotal,
      change: paymentMethod === "cash" ? change : 0,
      pointsDiscount,
      discount,
      notes,
      paymentMethod: paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản"
    });
  };

  return (
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
      zIndex: 1000
    }}>
      <div style={{
        background: "white",
        borderRadius: "12px",
        width: "90%",
        maxWidth: "1000px",
        maxHeight: "90vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}>
        {/* Header */}
        <div style={{
          padding: "20px",
          borderBottom: "1px solid #e9ecef",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <h2 style={{ margin: 0, fontSize: "20px" }}>Thanh toán</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#6c757d"
            }}
          >
            ×
          </button>
        </div>

        {/* Body - 2 columns */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          padding: "20px",
          overflow: "auto"
        }}>
          {/* Left: Tạm tính */}
          <div>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "16px" }}>Tạm tính tiền</h3>
            
            {/* Danh sách sản phẩm */}
            <div style={{
              maxHeight: "200px",
              overflow: "auto",
              marginBottom: "15px",
              padding: "10px",
              background: "#f8f9fa",
              borderRadius: "6px"
            }}>
              {cart.map(item => (
                <div key={item.id} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  fontSize: "13px"
                }}>
                  <span>{item.name} x{item.qty}</span>
                  <span style={{ fontWeight: "bold" }}>{(item.price * item.qty).toLocaleString()}đ</span>
                </div>
              ))}
            </div>

            {/* Tổng tạm tính */}
            <div style={{
              padding: "12px",
              background: "#e7f3ff",
              borderRadius: "6px",
              marginBottom: "15px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span>Tạm tính:</span>
                <span style={{ fontWeight: "bold" }}>{subtotal.toLocaleString()}đ</span>
              </div>
              {pointsDiscount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", color: "#28a745" }}>
                  <span>Giảm điểm:</span>
                  <span>-{pointsDiscount.toLocaleString()}đ</span>
                </div>
              )}
              {discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", color: "#28a745" }}>
                  <span>Giảm giá:</span>
                  <span>-{discount.toLocaleString()}đ</span>
                </div>
              )}
            </div>

            {/* Tìm kiếm khách hàng */}
            <CustomerSearch
              onSelectCustomer={setSelectedCustomer}
              cart={cart}
            />

            {/* Thông tin khách hàng */}
            {selectedCustomer && (
              <div style={{
                padding: "12px",
                background: "#d4edda",
                borderRadius: "6px",
                marginBottom: "15px",
                fontSize: "13px"
              }}>
                <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                  {selectedCustomer.name} - {selectedCustomer.phone}
                </div>
                <div>Điểm hiện tại: {selectedCustomer.existingPoints}</div>
                {selectedCustomer.existingPoints > 0 && (
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={usePoints}
                      onChange={(e) => setUsePoints(e.target.checked)}
                    />
                    <span>Sử dụng điểm (-{Math.min(selectedCustomer.existingPoints * 100, subtotal).toLocaleString()}đ)</span>
                  </label>
                )}
              </div>
            )}

            {/* Voucher */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "500" }}>
                Mã voucher:
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="Nhập mã voucher"
                  value={voucher}
                  onChange={(e) => setVoucher(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "13px"
                  }}
                />
                <button
                  onClick={() => {
                    if (voucher === "GIAM10") setDiscount(subtotal * 0.1);
                    else alert("Mã không hợp lệ");
                  }}
                  style={{
                    padding: "8px 16px",
                    background: "#17a2b8",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "13px"
                  }}
                >
                  Áp dụng
                </button>
              </div>
            </div>

            {/* Giảm giá thủ công */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "500" }}>
                Giảm giá:
              </label>
              <input
                type="number"
                placeholder="Nhập số tiền giảm"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "13px"
                }}
              />
            </div>

            {/* Ghi chú */}
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "500" }}>
                Ghi chú:
              </label>
              <textarea
                placeholder="Thêm ghi chú..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "13px",
                  resize: "none"
                }}
              />
            </div>
          </div>

          {/* Right: Khách cần trả */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3 style={{ margin: 0, fontSize: "16px" }}>Khách cần trả</h3>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#17a2b8" }}>
                {finalTotal.toLocaleString()}đ
              </div>
            </div>

            {/* Hình thức thanh toán */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "10px", fontSize: "13px", fontWeight: "500" }}>
                Hình thức thanh toán:
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button
                  onClick={() => setPaymentMethod("cash")}
                  style={{
                    padding: "15px",
                    background: paymentMethod === "cash" ? "#17a2b8" : "white",
                    color: paymentMethod === "cash" ? "white" : "#333",
                    border: "2px solid " + (paymentMethod === "cash" ? "#17a2b8" : "#ddd"),
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "500"
                  }}
                >
                  💵 Tiền mặt
                </button>
                <button
                  onClick={() => setPaymentMethod("transfer")}
                  style={{
                    padding: "15px",
                    background: paymentMethod === "transfer" ? "#17a2b8" : "white",
                    color: paymentMethod === "transfer" ? "white" : "#333",
                    border: "2px solid " + (paymentMethod === "transfer" ? "#17a2b8" : "#ddd"),
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "500"
                  }}
                >
                  🏦 Chuyển khoản
                </button>
              </div>
            </div>

            {/* Tiền mặt */}
            {paymentMethod === "cash" && (
              <div style={{
                padding: "15px",
                background: "#f8f9fa",
                borderRadius: "8px",
                marginBottom: "20px"
              }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "500" }}>
                  Tiền khách đưa:
                </label>
                <input
                  type="number"
                  placeholder="Nhập số tiền"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "16px",
                    marginBottom: "10px"
                  }}
                />
                
                {/* Gợi ý tiền */}
                {cashAmount && getSuggestedAmounts().length > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <div style={{ fontSize: "12px", marginBottom: "6px", color: "#666" }}>Gợi ý:</div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {getSuggestedAmounts().map(amount => (
                        <button
                          key={amount}
                          onClick={() => setCashAmount(amount.toString())}
                          style={{
                            flex: 1,
                            padding: "8px",
                            background: "#17a2b8",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "500"
                          }}
                        >
                          {amount.toLocaleString()}đ
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {cashAmount && parseFloat(cashAmount) >= finalTotal && (
                  <div style={{
                    padding: "12px",
                    background: "#d4edda",
                    borderRadius: "6px",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "12px", color: "#155724", marginBottom: "4px" }}>
                      Tiền thừa
                    </div>
                    <div style={{ fontSize: "24px", fontWeight: "bold", color: "#28a745" }}>
                      {change.toLocaleString()}đ
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Nút thanh toán */}
            <button
              onClick={handlePayment}
              disabled={!paymentMethod || (paymentMethod === "cash" && (!cashAmount || parseFloat(cashAmount) < finalTotal))}
              style={{
                width: "100%",
                padding: "18px",
                background: (!paymentMethod || (paymentMethod === "cash" && (!cashAmount || parseFloat(cashAmount) < finalTotal)))
                  ? "#6c757d"
                  : "#17a2b8",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "18px",
                fontWeight: "bold",
                cursor: (!paymentMethod || (paymentMethod === "cash" && (!cashAmount || parseFloat(cashAmount) < finalTotal)))
                  ? "not-allowed"
                  : "pointer",
                boxShadow: "0 4px 12px rgba(23,162,184,0.3)"
              }}
            >
              {!paymentMethod
                ? "CHỌN HÌNH THỨC THANH TOÁN"
                : paymentMethod === "cash" && !cashAmount
                  ? "NHẬP TIỀN KHÁCH ĐƯA"
                  : paymentMethod === "cash" && parseFloat(cashAmount) < finalTotal
                    ? "TIỀN KHÔNG ĐỦ"
                    : "THANH TOÁN"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
