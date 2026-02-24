import { useState } from "react";
import EmptyCart from "./EmptyCart";

export default function Cart({ cart, setCart, customer, setCustomer, usePoints, setUsePoints }) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

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

  const handlePhoneSubmit = () => {
    if (phone.length >= 10) {
      const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
      const loyaltyPoints = Math.floor(totalAmount / 1000);
      
      // Mock check if customer exists
      const isExistingCustomer = Math.random() > 0.5;
      const existingPoints = isExistingCustomer ? Math.floor(Math.random() * 500) : 0;
      
      setCustomer({
        phone,
        name: name || (isExistingCustomer ? "Khách hàng thân thiết" : ""),
        loyaltyPoints,
        existingPoints,
        isNew: !isExistingCustomer
      });
    }
  };

  const saveCustomer = () => {
    if (customer && customer.isNew && name) {
      setCustomer({
        ...customer,
        name,
        isNew: false
      });
      alert("Đã lưu thông tin khách hàng mới!");
    }
  };

  return (
    <div style={{
      background: "white",
      borderRadius: "0",
      padding: "15px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "hidden"
    }}>
      <h3 style={{ margin: "0 0 20px 0", color: "#2c3e50" }}>Giỏ hàng</h3>
      
      {cart.length === 0 ? (
        <EmptyCart />
      ) : (
        <div style={{ flex: 1, overflowY: "auto", maxHeight: "calc(100vh - 350px)" }}>
          {cart.map(item => (
            <div key={item.id} style={{
              display: "flex",
              alignItems: "center",
              padding: "12px",
              border: "1px solid #e9ecef",
              borderRadius: "8px",
              marginBottom: "10px",
              background: "#f8f9fa"
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                  {item.name}
                </div>
                <div style={{ color: "#e74c3c", fontWeight: "bold" }}>
                  {item.price.toLocaleString()}đ
                </div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={() => updateQuantity(item.id, item.qty - 1)}
                  style={{
                    width: "30px",
                    height: "30px",
                    border: "1px solid #ddd",
                    background: "white",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  -
                </button>
                
                <span style={{ 
                  minWidth: "30px", 
                  textAlign: "center",
                  fontWeight: "bold"
                }}>
                  {item.qty}
                </span>
                
                <button
                  onClick={() => updateQuantity(item.id, item.qty + 1)}
                  style={{
                    width: "30px",
                    height: "30px",
                    border: "1px solid #ddd",
                    background: "white",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  +
                </button>
                
                <button
                  onClick={() => removeItem(item.id)}
                  style={{
                    width: "30px",
                    height: "30px",
                    border: "1px solid #dc3545",
                    background: "#dc3545",
                    color: "white",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginLeft: "8px"
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Thông tin khách hàng */}
      <div style={{
        marginTop: "20px",
        padding: "15px",
        background: "#f8f9fa",
        borderRadius: "8px",
        border: "1px solid #e9ecef"
      }}>
        <h4 style={{ margin: "0 0 15px 0", color: "#2c3e50" }}>Thông tin khách hàng</h4>
        
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <input
            type="tel"
            placeholder="Số điện thoại khách hàng"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px"
            }}
          />
          <button
            onClick={handlePhoneSubmit}
            disabled={phone.length < 10}
            style={{
              padding: "8px 16px",
              background: phone.length >= 10 ? "#28a745" : "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: phone.length >= 10 ? "pointer" : "not-allowed",
              fontSize: "14px"
            }}
          >
            Xác nhận
          </button>
        </div>

        {customer && customer.isNew && (
          <div style={{ marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Tên khách hàng (tùy chọn)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
                marginBottom: "8px"
              }}
            />
            <button
              onClick={saveCustomer}
              disabled={!name}
              style={{
                padding: "6px 12px",
                background: name ? "#17a2b8" : "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "12px",
                cursor: name ? "pointer" : "not-allowed"
              }}
            >
              Lưu thông tin
            </button>
          </div>
        )}

        {customer && (
          <div style={{ fontSize: "14px", color: "#495057" }}>
            <div>📱 {customer.phone}</div>
            {customer.name && <div>👤 {customer.name}</div>}
            <div style={{ color: "#28a745", fontWeight: "bold" }}>
              Điểm hiện tại: {customer.existingPoints} điểm
            </div>
            <div style={{ color: "#17a2b8" }}>
              Điểm tích lũy: +{customer.loyaltyPoints} điểm
            </div>
            {customer.existingPoints > 0 && (
              <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={usePoints}
                  onChange={(e) => setUsePoints(e.target.checked)}
                />
                <span>Sử dụng điểm (-{Math.min(customer.existingPoints * 100, cart.reduce((sum, item) => sum + item.price * item.qty, 0))}đ)</span>
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  );
}