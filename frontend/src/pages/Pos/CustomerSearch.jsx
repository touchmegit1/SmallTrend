import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import customerService from "../../services/customerService";

const CustomerSearch = forwardRef(({ onSelectCustomer, cart, onNavigateDown }, ref) => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const phoneInputRef = useRef(null);
  const nameInputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => phoneInputRef.current?.focus()
  }));

  useEffect(() => {
    if (showRegister && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [showRegister]);

  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    } else if (e.key === 'ArrowDown' && !showRegister && onNavigateDown) {
      e.preventDefault();
      onNavigateDown();
    }
  };

  const handleSearch = async () => {
    if (!phone || phone.length < 10 || phone.length > 11) {
      alert("Số điện thoại phải có 10-11 số!");
      return;
    }
    
    setLoading(true);
    try {
      // Tìm trong localStorage trước
      const localCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
      const localCustomer = localCustomers.find(c => c.phone === phone);
      
      const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
      const loyaltyPoints = Math.floor(totalAmount / 10000);
      
      if (localCustomer) {
        // Tìm thấy trong localStorage
        onSelectCustomer({
          id: localCustomer.id,
          phone: localCustomer.phone,
          name: localCustomer.name,
          loyaltyPoints,
          existingPoints: localCustomer.points || localCustomer.existingPoints || 0,
          isNew: false
        });
        setPhone("");
        setShowRegister(false);
      } else {
        // Tìm trong backend
        try {
          const customer = await customerService.searchByPhone(phone);
          
          onSelectCustomer({
            id: customer.id,
            phone: customer.phone,
            name: customer.name,
            loyaltyPoints: customer.loyaltyPoints || 0,
            isNew: false
          });
          setPhone("");
          setShowRegister(false);
        } catch (error) {
          // Không tìm thấy -> hiện form đăng ký và focus vào name input
          setShowRegister(true);
          setTimeout(() => nameInputRef.current?.focus(), 100);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      // Nếu lỗi backend, vẫn kiểm tra localStorage
      const localCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
      const localCustomer = localCustomers.find(c => c.phone === phone);
      
      if (localCustomer) {
        const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        const loyaltyPoints = Math.floor(totalAmount / 10000);
        onSelectCustomer({
          id: localCustomer.id,
          phone: localCustomer.phone,
          name: localCustomer.name,
          loyaltyPoints,
          existingPoints: localCustomer.points || localCustomer.existingPoints || 0,
          isNew: false
        });
        setPhone("");
        setShowRegister(false);
      } else {
        setShowRegister(true);
        setTimeout(() => nameInputRef.current?.focus(), 100);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!phone || !name) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (phone.length < 10 || phone.length > 11) {
      alert("Số điện thoại phải có 10-11 số!");
      return;
    }
    
    setLoading(true);
    try {
      // Lưu vào backend CRM
      const savedCustomer = await customerService.createCustomer(name, phone);
      
      onSelectCustomer({
        id: savedCustomer.id,
        phone: savedCustomer.phone,
        name: savedCustomer.name,
        loyaltyPoints: savedCustomer.loyaltyPoints || 0,
        isNew: false
      });
      
      setPhone("");
      setName("");
      setShowRegister(false);
    } catch (error) {
      console.error('Error creating customer:', error);
      const errorMsg = error.response?.data?.message || error.message || "Không thể kết nối server";
      alert(`Lỗi: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: "15px" }}>
      <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
        <input
          ref={phoneInputRef}
          type="tel"
          placeholder="Tìm số điện thoại (10-11 số)"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
          onKeyDown={(e) => handleKeyDown(e, handleSearch)}
          maxLength={11}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: phone && (phone.length < 10 || phone.length > 11) ? "1px solid #dc3545" : "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "14px"
          }}
        />
        <button
          onClick={handleSearch}
          disabled={!phone || phone.length < 10 || phone.length > 11 || loading}
          style={{
            padding: "8px 16px",
            background: (phone && phone.length >= 10 && phone.length <= 11) ? "#007bff" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: (phone && phone.length >= 10 && phone.length <= 11) ? "pointer" : "not-allowed",
            fontSize: "14px"
          }}
        >
          {loading ? "..." : "Tìm"}
        </button>
        <button
          onClick={() => setShowRegister(!showRegister)}
          style={{
            padding: "8px 16px",
            background: "#007bff",
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
            placeholder="Số điện thoại (10-11 số)"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
            maxLength={11}
            style={{
              width: "100%",
              padding: "8px",
              border: phone && (phone.length < 10 || phone.length > 11) ? "1px solid #dc3545" : "1px solid #ddd",
              borderRadius: "4px",
              marginBottom: "8px",
              fontSize: "13px"
            }}
          />
          {phone && (phone.length < 10 || phone.length > 11) && (
            <div style={{ color: "#dc3545", fontSize: "11px", marginTop: "-6px", marginBottom: "6px" }}>
              Số điện thoại phải có 10-11 số
            </div>
          )}
          <input
            ref={nameInputRef}
            type="text"
            placeholder="Tên khách hàng"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, handleRegister)}
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
            disabled={!phone || !name || phone.length < 10 || phone.length > 11 || loading}
            style={{
              width: "100%",
              padding: "8px",
              background: (phone && name && phone.length >= 10 && phone.length <= 11 && !loading) ? "#17a2b8" : "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: (phone && name && phone.length >= 10 && phone.length <= 11 && !loading) ? "pointer" : "not-allowed",
              fontSize: "13px"
            }}
          >
            {loading ? "Đang lưu..." : "Lưu thông tin"}
          </button>
        </div>
      )}
    </div>
  );
});

export default CustomerSearch;
