export default function CartArea({ cart }) {
  return (
    <div>
      <h3>Danh sách sản phẩm</h3>
      {cart.map((item, index) => (
        <div key={index} style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "8px",
          borderBottom: "1px solid #ddd"
        }}>
          <span>{item.name}</span>
          <span>x {item.qty}</span>
        </div>
      ))}
    </div>
  );
}
