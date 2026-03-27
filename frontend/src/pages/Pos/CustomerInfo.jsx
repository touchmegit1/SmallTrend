import { useState } from "react";

// Hiển thị thành phần customer form.
export default function CustomerForm({ onSave }) {
  const [phone, setPhone] = useState("");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>Thông tin khách hàng</h3>
        <button style={{ padding: "6px", background: "#fbc02d" }}>
          💾 Lưu thông tin
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px", marginTop: "10px" }}>
        <input 
          placeholder="Số điện thoại (bắt buộc)" 
          value={phone} 
          onChange={e => setPhone(e.target.value)} 
          style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
        />
        <input 
          placeholder="Tên khách hàng (tùy chọn)" 
          style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
        />
      </div>
    </div>
  );
}
