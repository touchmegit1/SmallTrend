export default function EmptyCart() {
  return (
    <div style={{
      textAlign: "center",
      padding: "60px 20px",
      color: "#6c757d"
    }}>
      <div style={{ 
        fontSize: "48px", 
        marginBottom: "20px",
        opacity: 0.5
      }}>🛒</div>
      <h3 style={{ 
        margin: "0 0 10px 0", 
        color: "#495057",
        fontWeight: "500"
      }}>Giỏ hàng trống</h3>
      <p style={{ margin: 0, fontSize: "14px" }}>Thêm sản phẩm vào giỏ hàng để bắt đầu</p>
    </div>
  );
}
