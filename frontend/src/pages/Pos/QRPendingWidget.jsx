import { useState, useRef, useEffect } from "react";
import api from "../../config/axiosConfig";

const SEPAY_API_TOKEN = "6NBN1CXSYYMKUTRDQE94LCDYOHETW8PQF6OQX0GGOWRSPCJGBIVHL7SADPIWMMAN";

export default function QRPendingWidget({ pendingOrder, onComplete, onCancel }) {
  const { amount, paymentCode, orderData, id } = pendingOrder;
  const [status, setStatus] = useState("waiting"); // waiting | success
  const [countdown, setCountdown] = useState(10);
  const [isMinimized, setIsMinimized] = useState(false);
  const pollingRef = useRef(null);

  const qrUrl = `https://qr.sepay.vn/img?bank=MBBank&acc=0961390486&template=compact&amount=${amount}&des=${paymentCode}`;

  useEffect(() => {
    const checkPayment = async () => {
      try {
        const response = await fetch(
          `/sepay-api/userapi/transactions/list?amount_in=${amount}&content=${paymentCode}`,
          {
            headers: {
              "Authorization": `Bearer ${SEPAY_API_TOKEN}`,
              "Content-Type": "application/json"
            }
          }
        );
        const data = await response.json();

        if (data.transactions && data.transactions.length > 0) {
          const matched = data.transactions.some(tx => {
            const content = (tx.transaction_content || tx.content || tx.description || "").toUpperCase();
            return content.includes(paymentCode.toUpperCase());
          });

          if (matched) {
            setStatus("success");
            clearInterval(pollingRef.current);
          }
        }
      } catch (err) {
        console.error("SePay polling error:", err);
      }
    };

    const initialDelay = setTimeout(() => {
      checkPayment();
      pollingRef.current = setInterval(checkPayment, 3000);
    }, 5000);

    return () => {
      clearTimeout(initialDelay);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [amount, paymentCode]);

  useEffect(() => {
    if (status === "success") {
      setIsMinimized(false); // force open to show success
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onComplete(id, orderData);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, id, orderData, onComplete]);

  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      background: "white",
      borderRadius: "12px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
      border: status === "success" ? "2px solid #28a745" : "1px solid #ddd",
      overflow: "hidden",
      zIndex: 1005,
      width: isMinimized ? "250px" : "320px",
      transition: "all 0.3s ease"
    }}>
      {/* HEADER */}
      <div style={{
        background: status === "success" ? "#d4edda" : "#f8f9fa",
        padding: "10px 15px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #ddd",
        cursor: "pointer"
      }} onClick={() => setIsMinimized(!isMinimized)}>
        <strong style={{ color: status === "success" ? "#155724" : "#333", fontSize: "14px" }}>
          {status === "success" ? "✓ Đã thanh toán" : `⏳ Đang chờ QR: ${paymentCode}`}
        </strong>
        <div>
          <button style={{
            background: "none", border: "none", cursor: "pointer", fontSize: "16px", padding: 0, marginRight: "10px", color: "#666"
          }} onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}>
            {isMinimized ? "▲" : "▼"}
          </button>
          <button style={{
            background: "none", border: "none", cursor: "pointer", fontSize: "18px", padding: 0, color: "#dc3545", lineHeight: 1
          }} onClick={(e) => { e.stopPropagation(); onCancel(id); }}>
            ×
          </button>
        </div>
      </div>

      {/* BODY */}
      {!isMinimized && (
        <div style={{ padding: "15px", textAlign: "center" }}>
          {status === "success" ? (
            <div>
              <div style={{ fontSize: "50px", color: "#28a745", lineHeight: 1, marginBottom: "10px" }}>✓</div>
              <h3 style={{ margin: "0 0 10px 0", color: "#28a745" }}>Chuyển khoản thành công</h3>
              <p style={{ color: "#666", fontSize: "14px", marginBottom: "15px" }}>
                Tự động hoàn tất sau <strong>{countdown}s</strong>...
              </p>
              <button
                onClick={() => onComplete(id, orderData)}
                style={{
                  padding: "8px 16px",
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  width: "100%"
                }}
              >
                Hoàn tất ngay
              </button>
            </div>
          ) : (
            <div>
              <div style={{
                border: "2px solid #007bff",
                borderRadius: "8px",
                padding: "5px",
                marginBottom: "10px",
                display: "inline-block"
              }}>
                <img src={qrUrl} alt="QR" style={{ width: "200px", height: "auto", display: "block" }} />
              </div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#d9534f", marginBottom: "10px" }}>
                {amount.toLocaleString()}đ
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                Đang chờ khách quét mã...
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
