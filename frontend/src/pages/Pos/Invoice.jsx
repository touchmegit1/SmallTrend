import { useEffect } from "react";

export default function Invoice({ transaction, onClose, shortcuts }) {
  const handlePrint = () => {
    window.print();
  };

  const printKey = shortcuts?.printInvoice || "F9";
  const closeKey = shortcuts?.closePaymentModal || "F4";

  if (!transaction) return null;

  const invoiceItems = transaction.items || transaction.cart || [];
  const parseMoney = (value) => parseInt((value || 0).toString().replace(/[^0-9]/g, ""), 10) || 0;
  const totalAmount = parseMoney(transaction.total);
  const pointsDiscount = Number(transaction.pointsDiscount || 0);
  const refundedAmount = Number(transaction.refundedAmount || 0);
  const subTotal = totalAmount + pointsDiscount + refundedAmount;
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === printKey) {
        e.preventDefault();
        handlePrint();
      } else if (e.key === closeKey || e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [printKey, closeKey, onClose]);


  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999
    }}>
      <div style={{
        background: "white",
        width: "400px",
        maxHeight: "90vh",
        overflowY: "auto",
        borderRadius: "8px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}>
        {/* Header buttons */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 15px",
          borderBottom: "1px solid #eee",
          background: "#f8f9fa"
        }} className="no-print">
          <button onClick={handlePrint} style={{
            padding: "6px 12px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}>
            🖨 In hóa đơn ({printKey})
          </button>
          <button onClick={onClose} style={{
            padding: "6px 12px",
            background: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}>
            ✕ Đóng ({closeKey})
          </button>
        </div>

        {/* Invoice content */}
        <div style={{ padding: "20px", fontFamily: "monospace" }}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <h2 style={{ margin: "0 0 5px 0" }}>SMALLTREND</h2>
            <div style={{ fontSize: "12px", color: "#666" }}>Cửa hàng tạp hóa tiện lợi</div>
            <div style={{ fontSize: "12px", color: "#666" }}>ĐT: 0123-456-789</div>
            <div style={{ fontSize: "14px", fontWeight: "bold", marginTop: "10px" }}>HÓA ĐƠN BÁN HÀNG</div>
            <div style={{ fontSize: "12px" }}>{transaction.id}</div>
          </div>

          <div style={{ borderTop: "1px dashed #000", paddingTop: "10px", marginBottom: "10px" }}>
            <div style={{ fontSize: "12px" }}>Thời gian: {transaction.time}</div>
            {transaction.customer && (
              <>
                <div style={{ fontSize: "12px" }}>Khách hàng: {transaction.customer.name}</div>
                <div style={{ fontSize: "12px" }}>SĐT: {transaction.customer.phone}</div>
              </>
            )}
          </div>

          <table style={{ width: "100%", fontSize: "12px", marginBottom: "10px" }}>
            <thead>
              <tr style={{ borderBottom: "1px dashed #000" }}>
                <th style={{ textAlign: "left", padding: "5px 0" }}>Sản phẩm</th>
                <th style={{ textAlign: "center" }}>SL</th>
                <th style={{ textAlign: "right" }}>Giá</th>
                <th style={{ textAlign: "right" }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((item, index) => {
                const quantity = item.qty || item.quantity || 0;
                const price = Number(item.price || 0);
                return (
                  <tr key={index}>
                    <td style={{ padding: "5px 0" }}>{item.name}</td>
                    <td style={{ textAlign: "center" }}>{quantity}</td>
                    <td style={{ textAlign: "right" }}>{price.toLocaleString()}</td>
                    <td style={{ textAlign: "right" }}>{(price * quantity).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ borderTop: "1px dashed #000", paddingTop: "10px", fontSize: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <span>Tạm tính:</span>
              <span>{subTotal.toLocaleString()} đ</span>
            </div>
            {pointsDiscount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", color: "#dc3545" }}>
                <span>Giảm giá (điểm):</span>
                <span>-{pointsDiscount.toLocaleString()} đ</span>
              </div>
            )}
            {refundedAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", color: "#e67e22" }}>
                <span>Tiền hoàn trả khách:</span>
                <span>-{refundedAmount.toLocaleString()} đ</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontWeight: "bold", fontSize: "14px" }}>
              <span>TỔNG CỘNG:</span>
              <span>{totalAmount.toLocaleString()} đ</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <span>Tiền khách đưa:</span>
              <span>{Number(transaction.customerMoney || 0).toLocaleString()} đ</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
              <span>Tiền thừa:</span>
              <span>{Number(transaction.change || 0).toLocaleString()} đ</span>
            </div>
          </div>

          {transaction.notes && (
            <div style={{ marginTop: "10px", fontSize: "11px", color: "#666" }}>
              Ghi chú: {transaction.notes}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", borderTop: "1px dashed #000", paddingTop: "10px" }}>
            <div>Cảm ơn quý khách!</div>
            <div>Hẹn gặp lại!</div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body * { visibility: hidden; }
          div[style*="position: fixed"] * { visibility: visible; }
          div[style*="position: fixed"] {
            position: static;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
