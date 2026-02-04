import { useState } from "react";

export default function CustomerInfo({ onSave }) {
  const [phone, setPhone] = useState("");

  const saveCustomer = () => {
    onSave({ phone, points: 100 }); // giả lập có 100 điểm
  };

  return (
    <div>
      <h3>Thông tin khách hàng</h3>
      <input placeholder="Số điện thoại" value={phone} onChange={e => setPhone(e.target.value)} />
      <button onClick={saveCustomer}>Lưu</button>
    </div>
  );
}
