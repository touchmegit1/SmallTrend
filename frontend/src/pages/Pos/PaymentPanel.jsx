import { useState } from "react";

export default function PaymentPanel({ cart, customer, usePoints }) {
  const [customerMoney, setCustomerMoney] = useState("");
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
  const pointsDiscount = usePoints && customer ? Math.min(customer.existingPoints * 100, subtotal) : 0;
  const total = subtotal - pointsDiscount;
  const itemCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  const change = customerMoney ? Math.max(0, parseFloat(customerMoney) - total) : 0;

  return (
    <div style={{
      background: "white",
      borderRadius: "0",
      padding: "15px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      height: "100%",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column"
    }}>
      <h3 style={{ margin: "0 0 15px 0", color: "#2c3e50" }}>Thanh toán</h3>

      {/* Tóm tắt đơn hàng */}
      <div style={{
        padding: "12px",
        background: "#f8f9fa",
        borderRadius: "6px",
        marginBottom: "15px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "14px" }}>
          <span>Tạm tính ({itemCount} sản phẩm):</span>
          <span style={{ fontWeight: "bold" }}>{subtotal.toLocaleString()}đ</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "14px" }}>
          <span>Giảm giá điểm:</span>
          <span style={{ color: "#28a745" }}>-{pointsDiscount.toLocaleString()}đ</span>
        </div>

        <hr style={{ margin: "8px 0", border: "none", borderTop: "1px solid #dee2e6" }} />

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: "bold" }}>
          <span>Tổng cộng:</span>
          <span style={{ color: "#e74c3c" }}>{total.toLocaleString()}đ</span>
        </div>
      </div>

      {/* Thông tin khách hàng */}
      {customer && (
        <div style={{
          padding: "12px",
          background: "#e8f5e8",
          borderRadius: "6px",
          marginBottom: "15px",
          border: "1px solid #c3e6c3"
        }}>
          <div style={{ fontWeight: "bold", marginBottom: "6px", color: "#155724", fontSize: "14px" }}>
            Khách hàng: {customer.phone}
          </div>
          <div style={{ fontSize: "13px", color: "#155724" }}>
            Điểm hiện tại: {customer.existingPoints} | Tích lũy: +{customer.loyaltyPoints}
            {usePoints && <div style={{ color: "#dc3545", fontWeight: "bold" }}>Sử dụng: -{Math.min(customer.existingPoints, Math.floor(subtotal/100))} điểm</div>}
          </div>
        </div>
      )}

      {/* Tiền khách đưa */}
      <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "13px" }}>
          Tiền khách đưa:
        </label>
        <input
          type="number"
          placeholder="Nhập số tiền"
          value={customerMoney}
          onChange={(e) => setCustomerMoney(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "5px",
            fontSize: "14px",
            boxSizing: "border-box"
          }}
        />
        {customerMoney && parseFloat(customerMoney) >= total && (
          <div style={{ 
            marginTop: "8px", 
            padding: "8px", 
            background: "#d4edda",
            border: "1px solid #c3e6cb",
            borderRadius: "5px",
            fontSize: "14px", 
            fontWeight: "bold",
            color: "#155724"
          }}>
            Tiền thừa: {(parseFloat(customerMoney) - total).toLocaleString()}đ
          </div>
        )}
      </div>

      {/* Phương thức thanh toán */}
      <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "13px" }}>
          Phương thức thanh toán:
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px" }}>
            <input type="radio" name="payment" defaultChecked />
            <span>Tiền mặt</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px" }}>
            <input type="radio" name="payment" />
            <span>Thẻ ngân hàng</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px" }}>
            <input type="radio" name="payment" />
            <span>Chuyển khoản</span>
          </label>
        </div>
      </div>

      {/* Ghi chú */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "13px" }}>
          Ghi chú:
        </label>
        <textarea
          placeholder="Thêm ghi chú cho đơn hàng..."
          rows={2}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "5px",
            fontSize: "12px",
            resize: "none",
            boxSizing: "border-box"
          }}
        />
      </div>

      {/* Nút thanh toán - Đặt dưới phần ghi chú */}
      <div style={{ marginTop: "auto" }}>
        <button
          disabled={cart.length === 0}
          style={{
            width: "100%",
            padding: "18px",
            background: cart.length > 0 ? "linear-gradient(135deg, #007bff, #0056b3)" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: cart.length > 0 ? "pointer" : "not-allowed",
            transition: "all 0.2s",
            boxShadow: "0 4px 12px rgba(0,123,255,0.3)"
          }}
        >
          {cart.length > 0
            ? `THANH TOÁN ${total.toLocaleString()}Đ`
            : "CHƯA CÓ SẢN PHẨM"}
        </button>
      </div>

    </div>
  );
}
