export default function Cart({ cart, onUpdateQty }) {
  return (
    <div>
      <h3>Giỏ hàng</h3>
      {cart.map(item => (
        <div key={item.id} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #ddd", padding: "5px" }}>
          <span>{item.name}</span>
          <div>
            <button onClick={() => onUpdateQty(item.id, item.qty - 1)}>-</button>
            <span style={{ margin: "0 10px" }}>{item.qty}</span>
            <button onClick={() => onUpdateQty(item.id, item.qty + 1)}>+</button>
          </div>
        </div>
      ))}
    </div>
  );
}
