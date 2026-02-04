export default function PaymentPanel({ cart, customer }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div>
      <h3>Thanh toán</h3>
      <p>Tổng tiền: {total.toLocaleString()} đ</p>
      {customer && <p>Điểm tích lũy: {customer.points}</p>}

      <button style={{ background: "green", color: "white", padding: "10px", width: "100%" }}>
        Thanh toán tiền mặt (F9)
      </button>

      <button style={{ marginTop: "10px", width: "100%" }}>
        Thanh toán QR
      </button>
    </div>
  );
}
