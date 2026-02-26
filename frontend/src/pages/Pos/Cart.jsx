import EmptyCart from "./EmptyCart";

export default function Cart({ cart, setCart }) {
  const updateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item => 
        item.id === id ? { ...item, qty: newQty } : item
      ));
    }
  };

  const removeItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  return (
    <div style={{
      background: "white",
      borderRadius: "0",
      padding: "12px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "hidden"
    }}>
      <h3 style={{ margin: "0 0 12px 0", color: "#2c3e50", fontSize: "15px" }}>Giỏ hàng</h3>
      
      {cart.length === 0 ? (
        <EmptyCart />
      ) : (
        <div style={{ 
          flex: 1, 
          overflowY: "auto"
        }}>
          {cart.map(item => (
            <div key={item.id} style={{
              display: "flex",
              alignItems: "center",
              padding: "6px",
              border: "1px solid #e9ecef",
              borderRadius: "4px",
              marginBottom: "6px",
              background: "#f8f9fa"
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "600", marginBottom: "2px", fontSize: "12px" }}>
                  {item.name}
                </div>
                <div style={{ color: "#e74c3c", fontWeight: "bold", fontSize: "12px" }}>
                  {item.price.toLocaleString()}đ
                </div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <button
                  onClick={() => updateQuantity(item.id, item.qty - 1)}
                  style={{
                    width: "24px",
                    height: "24px",
                    border: "1px solid #ddd",
                    background: "white",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "13px"
                  }}
                >
                  -
                </button>
                
                <span style={{ 
                  minWidth: "22px", 
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "12px"
                }}>
                  {item.qty}
                </span>
                
                <button
                  onClick={() => updateQuantity(item.id, item.qty + 1)}
                  style={{
                    width: "24px",
                    height: "24px",
                    border: "1px solid #ddd",
                    background: "white",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "13px"
                  }}
                >
                  +
                </button>
                
                <button
                  onClick={() => removeItem(item.id)}
                  style={{
                    width: "24px",
                    height: "24px",
                    border: "1px solid #dc3545",
                    background: "#dc3545",
                    color: "white",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginLeft: "3px",
                    fontSize: "13px"
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
