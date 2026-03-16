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

    const normalizePhone = (value) => (value || "").replace(/\s+/g, "");
    const cleanPhone = normalizePhone(phone);

    setLoading(true);
    try {
      const customer = await customerService.searchByPhone(cleanPhone);
      const selected = mapCustomerForSelect(customer);
      setFoundCustomer(selected);
      setSearched(true);
      setShowRegister(false);
      onSelectCustomer(selected);
    } catch (error) {
      try {
        // Fallback: đối chiếu từ danh sách customers (giống màn CRM) để tránh lệch do endpoint search trả lỗi không mong muốn
        const allCustomers = await customerService.getAllCustomers();
        const matched = (Array.isArray(allCustomers) ? allCustomers : []).find(
          (c) => normalizePhone(c.phone) === cleanPhone
        );

        if (matched) {
          const selected = mapCustomerForSelect(matched);
          setFoundCustomer(selected);
          setSearched(true);
          setShowRegister(false);
          onSelectCustomer(selected);
          return;
        }
      } catch (fallbackError) {
        console.error("Fallback customer search failed:", fallbackError);
      }

      // Chỉ mở đăng ký khi thật sự không tìm thấy; lỗi khác thì báo rõ
      if (error?.response?.status && error.response.status !== 404) {
        alert(error.response?.data?.message || "Không thể tìm khách hàng, vui lòng thử lại.");
        setSearched(false);
        setShowRegister(false);
        return;
      }

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

      await customerService.createCustomer(name.trim(), phone);
      const createdCustomer = await customerService.searchByPhone(phone);
      const selected = mapCustomerForSelect(createdCustomer);
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
