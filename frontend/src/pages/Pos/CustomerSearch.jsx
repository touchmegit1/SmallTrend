import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import customerService from "../../services/customerService";
import customerTierService from "../../services/customerTierService";

const CustomerSearch = forwardRef(({ onSelectCustomer, onNavigateDown }, ref) => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tiers, setTiers] = useState([]);
  const [foundCustomer, setFoundCustomer] = useState(null);
  const [searched, setSearched] = useState(false);

  const phoneInputRef = useRef(null);
  const nameInputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => phoneInputRef.current?.focus(),
  }));

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const data = await customerTierService.getAllTiers();
        setTiers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching tiers:", err);
      }
    };
    fetchTiers();
  }, []);

  useEffect(() => {
    if (showRegister) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [showRegister]);

  const isPhoneValid = phone.length >= 10 && phone.length <= 11;
  const canRegister = searched && !foundCustomer && isPhoneValid;

  const getCustomerTier = (spentAmount) => {
    if (!tiers || tiers.length === 0) return null;
    return [...tiers]
      .sort((a, b) => Number(b.minSpending) - Number(a.minSpending))
      .find((tier) => spentAmount >= Number(tier.minSpending)) || null;
  };

  const mapCustomerForSelect = (customer) => {
    const spentAmount = Number(customer?.spentAmount) || 0;
    const tier = getCustomerTier(spentAmount);

    return {
      id: customer.id,
      phone: customer.phone,
      name: customer.name,
      loyaltyPoints: Number(customer.loyaltyPoints) || 0,
      spentAmount,
      tier: tier?.tierName || "Đồng",
      isNew: false,
    };
  };

  const handleKeyDown = (e, action) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    } else if (e.key === "ArrowDown" && !showRegister && onNavigateDown) {
      e.preventDefault();
      onNavigateDown();
    }
  };

  const handleSearch = async () => {
    if (!isPhoneValid) {
      alert("Số điện thoại phải có 10-11 số!");
      return;
    }

    setLoading(true);
    try {
      const customer = await customerService.searchByPhone(phone);
      const selected = mapCustomerForSelect(customer);
      setFoundCustomer(selected);
      setSearched(true);
      setShowRegister(false);
      onSelectCustomer(selected);
    } catch (error) {
      setFoundCustomer(null);
      setSearched(true);
      setShowRegister(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRegister = () => {
    if (!canRegister) {
      alert("Chỉ được đăng ký khi đã tìm và không thấy khách trong hệ thống.");
      return;
    }
    setShowRegister(true);
  };

  const handleRegister = async () => {
    if (!name.trim() || !isPhoneValid) {
      alert("Vui lòng nhập đầy đủ thông tin hợp lệ!");
      return;
    }

    setLoading(true);
    try {
      try {
        const existingCustomer = await customerService.searchByPhone(phone);
        const selected = mapCustomerForSelect(existingCustomer);
        setFoundCustomer(selected);
        setShowRegister(false);
        onSelectCustomer(selected);
        alert("Số điện thoại đã tồn tại, đã chọn khách hàng có sẵn.");
        return;
      } catch (_) {
        // Not found -> continue create
      }

      const savedCustomer = await customerService.createCustomer(name.trim(), phone);
      const selected = mapCustomerForSelect(savedCustomer);
      setFoundCustomer(selected);
      setShowRegister(false);
      setSearched(true);
      setName("");
      onSelectCustomer(selected);
    } catch (error) {
      console.error("Error creating customer:", error);
      const errorMsg = error.response?.data?.message || error.message || "Không thể kết nối server";
      alert(`Lỗi: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const getTierStyle = (tierName) => {
    if (tierName === "Bạch Kim") return { bg: "#E5E4E2", color: "#333" };
    if (tierName === "Vàng") return { bg: "#FFD700", color: "#333" };
    if (tierName === "Bạc") return { bg: "#C0C0C0", color: "#333" };
    return { bg: "#CD7F32", color: "#fff" };
  };

  return (
    <div style={{ marginBottom: "15px" }}>
      <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
        <input
          ref={phoneInputRef}
          type="tel"
          placeholder="Tìm số điện thoại (10-11 số)"
          value={phone}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, "");
            setPhone(value);
            setFoundCustomer(null);
            setShowRegister(false);
            setSearched(false);
          }}
          onKeyDown={(e) => handleKeyDown(e, handleSearch)}
          maxLength={11}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: phone && !isPhoneValid ? "1px solid #dc3545" : "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        />

        <button
          onClick={handleSearch}
          disabled={!isPhoneValid || loading}
          style={{
            padding: "8px 16px",
            background: isPhoneValid ? "#007bff" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: isPhoneValid ? "pointer" : "not-allowed",
            fontSize: "14px",
          }}
        >
          {loading ? "..." : "Tìm"}
        </button>

        <button
          onClick={handleOpenRegister}
          disabled={!canRegister || loading}
          style={{
            padding: "8px 16px",
            background: canRegister ? "#17a2b8" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: canRegister ? "pointer" : "not-allowed",
            fontSize: "14px",
          }}
        >
          + Đăng ký
        </button>
      </div>

      {foundCustomer && (() => {
        const tierStyle = getTierStyle(foundCustomer.tier);
        return (
          <div
            style={{
              marginTop: "8px",
              padding: "10px 12px",
              background: "#e8f5e9",
              border: "1px solid #a5d6a7",
              borderRadius: "6px",
              fontSize: "13px",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: "4px", color: "#1b5e20" }}>
              Đã tìm thấy khách hàng trong bảng customers
            </div>
            <div><strong>Tên:</strong> {foundCustomer.name}</div>
            <div><strong>SĐT:</strong> {foundCustomer.phone}</div>
            <div><strong>Điểm loyalty:</strong> {Number(foundCustomer.loyaltyPoints).toLocaleString("vi-VN")}</div>
            <div><strong>Chi tiêu:</strong> {Number(foundCustomer.spentAmount).toLocaleString("vi-VN")}đ</div>
            <div>
              <strong>Hạng:</strong>{" "}
              <span
                style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  background: tierStyle.bg,
                  color: tierStyle.color,
                  fontWeight: 600,
                  fontSize: "12px",
                }}
              >
                {foundCustomer.tier}
              </span>
            </div>
          </div>
        );
      })()}

      {showRegister && canRegister && (
        <div
          style={{
            marginTop: "10px",
            padding: "12px",
            background: "#f8f9fa",
            borderRadius: "6px",
            border: "1px solid #ddd",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>Đăng ký thành viên mới</h4>
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
              fontSize: "13px",
            }}
          />
          <button
            onClick={handleRegister}
            disabled={!name.trim() || loading}
            style={{
              width: "100%",
              padding: "8px",
              background: !name.trim() || loading ? "#6c757d" : "#17a2b8",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: !name.trim() || loading ? "not-allowed" : "pointer",
              fontSize: "13px",
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
