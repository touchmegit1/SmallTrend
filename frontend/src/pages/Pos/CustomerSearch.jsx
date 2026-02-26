import { useState } from "react";
import customerService from "../../services/customerService";

export default function CustomerSearch({ onSelectCustomer, cart }) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!phone || phone.length < 10) return;
    
    setLoading(true);
    try {
      const customers = await customerService.searchByPhone(phone);
      const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
      const loyaltyPoints = Math.floor(totalAmount / 10000);
      
      if (customers && customers.length > 0) {
        const customer = customers[0];
        onSelectCustomer({
          id: customer.id,
          phone: customer.phone,
          name: customer.name,
          loyaltyPoints,
          existingPoints: customer.loyaltyPoints || 0,
          isNew: false
        });
        setPhone("");
      } else {
        setShowRegister(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setShowRegister(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    if (!phone || !name) return;
    
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const loyaltyPoints = Math.floor(totalAmount / 10000);
    
    onSelectCustomer({
      phone,
      name,
      loyaltyPoints,
      existingPoints: 0,
      isNew: true
    });
    
    setPhone("");
    setName("");
    setShowRegister(false);
  };

  return (
    <div style={{ marginBottom: "15px" }}>
      <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
        <input
          type="tel"
          placeholder="Tìm số điện thoại"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
          maxLength={11}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "14px"
          }}
        />
        <button
          onClick={handleSearch}
          disabled={!phone || loading}
          style={{
            padding: "8px 16px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: phone ? "pointer" : "not-allowed",
            fontSize: "14px"
          }}
        >
          {loading ? "..." : "Tìm"}
        </button>
        <button
          onClick={() => setShowRegister(!showRegister)}
          style={{
            padding: "8px 16px",
            background: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          + Đăng ký
        </button>
      </div>

      {showRegister && (
        <div style={{
          padding: "12px",
          background: "#f8f9fa",
          borderRadius: "6px",
          border: "1px solid #ddd"
        }}>
          <h4 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>Đăng ký thành viên mới</h4>
          <input
            type="tel"
            placeholder="Số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
            maxLength={11}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              marginBottom: "8px",
              fontSize: "13px"
            }}
          />
          <input
            type="text"
            placeholder="Tên khách hàng"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              marginBottom: "8px",
              fontSize: "13px"
            }}
          />
          <button
            onClick={handleRegister}
            disabled={!phone || !name}
            style={{
              width: "100%",
              padding: "8px",
              background: phone && name ? "#28a745" : "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: phone && name ? "pointer" : "not-allowed",
              fontSize: "13px"
            }}
          >
            Lưu thông tin
          </button>
        </div>
      )}
    </div>
  );
}
