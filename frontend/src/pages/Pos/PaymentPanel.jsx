import { useState } from "react";

export default function PaymentPanel({ cart, customer, usePoints, onCompleteOrder }) {
  const [customerMoney, setCustomerMoney] = useState("");
  const [notes, setNotes] = useState("");
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
  const pointsDiscount = usePoints && customer ? Math.min(customer.existingPoints * 100, subtotal) : 0;
  const total = subtotal - pointsDiscount;
  const itemCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  const change = customerMoney ? Math.max(0, parseFloat(customerMoney) - total) : 0;

  const handlePaymentKeyPress = (e) => {
    if (e.key === 'Enter' && customerMoney && parseFloat(customerMoney) >= total && cart.length > 0) {
      if (onCompleteOrder) {
        onCompleteOrder({
          cart,
          customer,
          total,
          customerMoney: parseFloat(customerMoney),
          change: parseFloat(customerMoney) - total,
          pointsDiscount,
          notes
        });
      }
    }
  };

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
          onKeyPress={handlePaymentKeyPress}
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

      {/* Ghi chú */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "500", fontSize: "13px" }}>
          Ghi chú:
        </label>
        <textarea
          placeholder="Thêm ghi chú cho đơn hàng..."
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
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

      {/* Nút thanh toán và hoàn tất */}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
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
        
        <button
          disabled={cart.length === 0 || !customerMoney || parseFloat(customerMoney) < total}
          onClick={() => {
            if (onCompleteOrder) {
              onCompleteOrder({
                cart,
                customer,
                total,
                customerMoney: parseFloat(customerMoney),
                change: parseFloat(customerMoney) - total,
                pointsDiscount,
                notes
              });
            }
          }}
          style={{
            width: "100%",
            padding: "18px",
            background: (cart.length > 0 && customerMoney && parseFloat(customerMoney) >= total) 
              ? "linear-gradient(135deg, #28a745, #20c997)" 
              : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: (cart.length > 0 && customerMoney && parseFloat(customerMoney) >= total) ? "pointer" : "not-allowed",
            transition: "all 0.2s",
            boxShadow: "0 4px 12px rgba(40,167,69,0.3)"
          }}
        >
          {cart.length === 0 
            ? "CHƯA CÓ SẢN PHẨM" 
            : !customerMoney 
              ? "NHẬP TIỀN KHÁCH ĐƯA"
              : parseFloat(customerMoney) < total
                ? "TIỀN KHÔNG ĐỦ"
                : `HOÀN TẤT`}
        </button>
      </div>

    </div>
  );
}
