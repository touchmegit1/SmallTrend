// Hiển thị thành phần payment panel.
export default function PaymentPanel({ cart, customer, usePoints, onOpenPayment }) {
  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
  const pointsDiscount = usePoints && customer ? Math.min(customer.existingPoints * 100, subtotal) : 0;
  const total = subtotal - pointsDiscount;
  const itemCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

  return (
    <div style={{
      background: "white",
      borderRadius: "0",
      padding: "12px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      height: "100%",
      display: "flex",
      flexDirection: "column"
    }}>
      <h3 style={{ margin: "0 0 12px 0", color: "#2c3e50", fontSize: "15px" }}>Thanh toán</h3>

      {/* Thông tin khách hàng */}
      {customer && (
        <div style={{
          padding: "10px",
          background: "#e8f5e8",
          borderRadius: "6px",
          marginBottom: "12px",
          border: "1px solid #c3e6c3"
        }}>
          <div style={{ fontWeight: "bold", marginBottom: "4px", color: "#155724", fontSize: "13px" }}>
            👤 {customer.name || customer.phone}
          </div>
          <div style={{ fontSize: "12px", color: "#155724" }}>
            📱 {customer.phone}
          </div>
          <div style={{ fontSize: "12px", color: "#155724", marginTop: "3px" }}>
            💎 Điểm hiện tại: {customer.existingPoints} | Tích lũy: +{customer.loyaltyPoints}
          </div>
          {usePoints && (
            <div style={{ color: "#dc3545", fontWeight: "bold", fontSize: "12px", marginTop: "3px" }}>
              Sử dụng: -{Math.min(customer.existingPoints, Math.floor(subtotal/100))} điểm
            </div>
          )}
        </div>
      )}

      <div style={{
        flex: 1,
        padding: "10px",
        background: "#f8f9fa",
        borderRadius: "6px",
        marginBottom: "72px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "13px" }}>
          <span>Tạm tính ({itemCount} sản phẩm):</span>
          <span style={{ fontWeight: "bold" }}>{subtotal.toLocaleString()}đ</span>
        </div>

        {pointsDiscount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "13px" }}>
            <span>Giảm giá điểm:</span>
            <span style={{ color: "#28a745" }}>-{pointsDiscount.toLocaleString()}đ</span>
          </div>
        )}

        <hr style={{ margin: "6px 0", border: "none", borderTop: "1px solid #dee2e6" }} />

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: "bold" }}>
          <span>Tổng cộng:</span>
          <span style={{ color: "#e74c3c" }}>{total.toLocaleString()}đ</span>
        </div>
      </div>

      {/* Nút thanh toán */}
      <button
        disabled={cart.length === 0}
        onClick={onOpenPayment}
        style={{
          width: "100%",
          padding: "16px",
          background: cart.length > 0 ? "linear-gradient(135deg, #007bff, #0056b3)" : "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: cart.length > 0 ? "pointer" : "not-allowed",
          transition: "all 0.2s",
          boxShadow: cart.length > 0 ? "0 4px 12px rgba(0,123,255,0.3)" : "none",
         
        }}
      >
        {cart.length > 0
          ? `THANH TOÁN `
          : "CHƯA CÓ SẢN PHẨM"}
      </button>
    </div>
  );
}
