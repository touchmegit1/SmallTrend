import { useState, useRef, useEffect } from "react";
import CustomerSearch from "./CustomerSearch";

import api from "../../config/axiosConfig";
import customerTierService from "../../services/customerTierService";

const SEPAY_API_TOKEN = "6NBN1CXSYYMKUTRDQE94LCDYOHETW8PQF6OQX0GGOWRSPCJGBIVHL7SADPIWMMAN";

const QRTransferModal = ({ amount, onCancel, onSuccess }) => {
  const [paymentCode] = useState(() => "DH" + Date.now());
  const [status, setStatus] = useState("waiting"); // waiting | success | error
  const pollingRef = useRef(null);

  const qrUrl = `https://qr.sepay.vn/img?bank=MBBank&acc=0961390486&template=compact&amount=${amount}&des=${paymentCode}`;

  // Auto-poll SePay API to check for payment
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
        console.log("SePay API response:", JSON.stringify(data));

        if (data.transactions && data.transactions.length > 0) {
          // Double-check: verify at least one transaction content contains our exact payment code
          const matched = data.transactions.some(tx => {
            const content = (tx.transaction_content || tx.content || tx.description || "").toUpperCase();
            return content.includes(paymentCode.toUpperCase());
          });

          if (matched) {
            setStatus("success");
            clearInterval(pollingRef.current);
            // Auto-complete after showing success for 10s
            setTimeout(() => {
              onSuccess();
            }, 10000);
          }
        }

      } catch (err) {
        console.error("SePay polling error:", err);
      }
    };

    // Delay 5 seconds before first poll to let the user scan first
    const initialDelay = setTimeout(() => {
      checkPayment(); // first check
      pollingRef.current = setInterval(checkPayment, 3000);
    }, 5000);

    return () => {
      clearTimeout(initialDelay);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [amount, paymentCode, onSuccess]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      e.stopPropagation();
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (status === 'success' && e.key === 'Enter') {
        // Cho phép ấn Enter để đóng sớm nếu không muốn chờ 30s
        e.preventDefault();
        onSuccess();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onCancel, onSuccess, status]);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1001
    }}>
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "30px",
        width: "90%",
        maxWidth: "420px",
        textAlign: "center",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
      }}>
        {status === "success" ? (
          <>
            <div style={{ fontSize: "60px", marginBottom: "10px", color: "#007bff" }}>✓</div>
            <h2 style={{ marginTop: 0, marginBottom: "10px", fontSize: "22px", color: "#007bff" }}>
              Chuyển khoản thành công
            </h2>
            <h3 style={{ marginTop: 0, marginBottom: "15px", whiteSpace: "pre-line", fontSize: "16px", color: "#007bff" }}>
              {"Cảm ơn quý khách và hẹn gặp lại !"}
            </h3>
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}>Tự động in hóa đơn sau 10 giây...</p>
            <button
              onClick={onSuccess}
              style={{
                padding: "10px 20px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                cursor: "pointer",
                transition: "background 0.2s"
              }}
              onMouseOver={(e) => e.target.style.background = "#0056b3"}
              onMouseOut={(e) => e.target.style.background = "#007bff"}
            >
              Hoàn tất ngay (Enter)
            </button>
          </>
        ) : (
          <>
            <h2 style={{ marginTop: 0, marginBottom: "15px", fontSize: "22px", color: "#333" }}>
              Quét mã QR để thanh toán
            </h2>

            <div style={{
              border: "2px solid #007bff",
              borderRadius: "12px",
              padding: "10px",
              marginBottom: "15px",
              display: "inline-block",
              background: "#fff"
            }}>
              <img
                src={qrUrl}
                alt="Mã QR Chuyển khoản"
                style={{ width: "100%", maxWidth: "280px", height: "auto", display: "block" }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/300x300?text=L%E1%BB%97i+t%E1%BA%A3i+QR";
                }}
              />
            </div>

            <div style={{ fontSize: "14px", marginBottom: "6px", color: "#555" }}>
              Ngân hàng: <strong>MBBank</strong> — STK: <strong>0961390486</strong>
            </div>
            <div style={{ fontSize: "14px", marginBottom: "6px", color: "#555" }}>
              Nội dung CK: <strong style={{ color: "#007bff", fontSize: "16px", letterSpacing: "1px" }}>{paymentCode}</strong>
            </div>
            <div style={{ fontSize: "16px", marginBottom: "15px", color: "#555" }}>
              Số tiền: <strong style={{ color: "#d9534f", fontSize: "24px" }}>{amount.toLocaleString()}đ</strong>
            </div>


            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={onCancel}
                style={{
                  padding: "12px 20px",
                  background: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  cursor: "pointer",
                  flex: 1,
                  transition: "background 0.2s"
                }}
                onMouseOver={(e) => e.target.style.background = "#5a6268"}
                onMouseOut={(e) => e.target.style.background = "#6c757d"}
              >
                Hủy (ESC)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
// Helper: tìm hạng thành viên phù hợp dựa trên spentAmount
const getCustomerTier = (spentAmount, tiers) => {
  if (!tiers || tiers.length === 0) return null;
  return [...tiers]
    .sort((a, b) => Number(b.minSpending) - Number(a.minSpending))
    .find(tier => spentAmount >= Number(tier.minSpending)) || null;
};

export default function PaymentModal({ cart, customer, onClose, onComplete, shortcuts }) {
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(customer);
  const [usePoints, setUsePoints] = useState(false);
  const [voucher, setVoucher] = useState("");
  const [voucherError, setVoucherError] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null); // { type: 'PERCENT' | 'FIXED', value: number, max: number, code: string }
  const [discount, setDiscount] = useState(""); // Giảm giá thủ công (dạng chuỗi để trống ban đầu)
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashAmount, setCashAmount] = useState("");
  const [focusedField, setFocusedField] = useState("customerSearch");
  const [suggestedIndex, setSuggestedIndex] = useState(-1);
  const [tiers, setTiers] = useState([]); // Danh sách hạng thành viên

  const customerSearchRef = useRef(null);
  const voucherInputRef = useRef(null);
  const voucherButtonRef = useRef(null);
  const notesRef = useRef(null);
  const cashInputRef = useRef(null);
  const paymentButtonRef = useRef(null);
  const suggestedAmountsRef = useRef([]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const currentLoyaltyPoints = selectedCustomer?.loyaltyPoints || 0;
  const pointsDiscount =
    usePoints && selectedCustomer
      ? Math.min(currentLoyaltyPoints * 100, subtotal)
      : 0;

  let voucherDiscountAmt = 0;
  if (appliedVoucher) {
    if (appliedVoucher.type === 'PERCENTAGE') {
      voucherDiscountAmt = subtotal * (appliedVoucher.value / 100);
      if (appliedVoucher.max > 0 && voucherDiscountAmt > appliedVoucher.max) {
        voucherDiscountAmt = appliedVoucher.max;
      }
    } else {
      voucherDiscountAmt = appliedVoucher.value;
    }
  }

  const discountNum = parseFloat(discount) || 0;
  const totalDiscount = pointsDiscount + discountNum + voucherDiscountAmt;
  const finalTotal = Math.max(0, subtotal - totalDiscount);
  const change = cashAmount ? Math.max(0, parseFloat(cashAmount) - finalTotal) : 0;

  // Fetch danh sách hạng thành viên khi mở modal
  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const data = await customerTierService.getAllTiers();
        setTiers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching tiers in PaymentModal:', err);
      }
    };
    fetchTiers();
  }, []);

  useEffect(() => {
    if (focusedField === "customerSearch" && customerSearchRef.current) {
      customerSearchRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // ArrowDown navigation
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (focusedField === "customerSearch") {
          setFocusedField("voucher");
          voucherInputRef.current?.focus();
        } else if (focusedField === "voucher") {
          setFocusedField("notes");
          notesRef.current?.focus();
        } else if (focusedField === "notes") {
          setFocusedField("paymentMethod");
          if (!paymentMethod) setPaymentMethod("cash");
        } else if (focusedField === "paymentMethod") {
          if (paymentMethod === "cash") {
            setFocusedField("cashAmount");
            cashInputRef.current?.focus();
          } else if (paymentMethod === "transfer") {
            setFocusedField("paymentButton");
            paymentButtonRef.current?.focus();
          }
        } else if (focusedField === "cashAmount") {
          if (getSuggestedAmounts().length > 0) {
            setFocusedField("suggestedAmounts");
            setSuggestedIndex(0);
          } else {
            setFocusedField("paymentButton");
            paymentButtonRef.current?.focus();
          }
        } else if (focusedField === "suggestedAmounts") {
          setFocusedField("paymentButton");
          paymentButtonRef.current?.focus();
          setSuggestedIndex(-1);
        }
      }
      // ArrowUp navigation
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (focusedField === "voucher") {
          setFocusedField("customerSearch");
          customerSearchRef.current?.focus();
        } else if (focusedField === "notes") {
          setFocusedField("voucher");
          voucherInputRef.current?.focus();
        } else if (focusedField === "paymentMethod") {
          setFocusedField("notes");
          notesRef.current?.focus();
        } else if (focusedField === "cashAmount") {
          setFocusedField("paymentMethod");
        } else if (focusedField === "suggestedAmounts") {
          setFocusedField("cashAmount");
          cashInputRef.current?.focus();
          setSuggestedIndex(-1);
        } else if (focusedField === "paymentButton") {
          if (paymentMethod === "cash") {
            if (getSuggestedAmounts().length > 0) {
              setFocusedField("suggestedAmounts");
              setSuggestedIndex(0);
            } else {
              setFocusedField("cashAmount");
              cashInputRef.current?.focus();
            }
          } else {
            setFocusedField("paymentMethod");
          }
        }
      }
      // ArrowLeft/Right for payment method and suggested amounts
      else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (focusedField === "paymentMethod") {
          setPaymentMethod("cash");
        } else if (focusedField === "suggestedAmounts" && suggestedIndex > 0) {
          setSuggestedIndex(suggestedIndex - 1);
        } else if (focusedField === "cashAmount") {
          setFocusedField("paymentMethod");
        } else if (focusedField === "paymentButton") {
          setFocusedField("paymentMethod");
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (focusedField === "paymentMethod") {
          setPaymentMethod("transfer");
        } else if (focusedField === "notes") {
          setFocusedField("paymentMethod");
        } else if (focusedField === "suggestedAmounts" && suggestedIndex < getSuggestedAmounts().length - 1) {
          setSuggestedIndex(suggestedIndex + 1);
        } else if (focusedField === "cashAmount") {
          setFocusedField("paymentMethod");
        }
      }
      // Enter key actions
      else if (e.key === 'Enter') {
        if (focusedField === "voucher") {
          e.preventDefault();
          voucherButtonRef.current?.click();
        } else if (focusedField === "paymentMethod") {
          e.preventDefault();
          if (paymentMethod === "cash") {
            setFocusedField("cashAmount");
            cashInputRef.current?.focus();
          } else {
            setFocusedField("paymentButton");
            paymentButtonRef.current?.focus();
          }
        } else if (focusedField === "suggestedAmounts" && suggestedIndex >= 0) {
          e.preventDefault();
          const amounts = getSuggestedAmounts();
          setCashAmount(amounts[suggestedIndex].toString());
          setFocusedField("paymentButton");
          paymentButtonRef.current?.focus();
          setSuggestedIndex(-1);
        } else if (focusedField === "paymentButton") {
          e.preventDefault();
          paymentButtonRef.current?.click();
        }
      }
      // F10 shortcuts actions
      else if (shortcuts && e.key === shortcuts.payment1) {
        e.preventDefault();
        if (finalTotal === 0) {
          // Đơn 0đ: Hoàn tất ngay không cần nhập tiền
          completePaymentProcess("cash", 0, 0);
        } else {
          paymentButtonRef.current?.click();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedField, paymentMethod, cashAmount, finalTotal, suggestedIndex, shortcuts]);

  const getSuggestedAmounts = () => {
    if (!cashAmount) return [];
    const num = parseInt(cashAmount.replace(/[^0-9]/g, ''));
    if (isNaN(num)) return [];

    // Nếu người dùng nhập số có 1-3 chữ số, tự động gợi ý thêm các số lớn hơn (x1.000, x10.000, vv...)
    if (cashAmount.length <= 3) {
      return [
        num * 1000,
        num * 10000,
        num * 100000
      ];
    }

    return [];
  };

  const completePaymentProcess = async (method, receivedAmt, changeAmt) => {
    let customerToUpdate = selectedCustomer;

    // Cập nhật điểm trung thành trong bảng customers
    if (selectedCustomer && selectedCustomer.id) {
      try {
        const currentSpent = selectedCustomer.spentAmount || 0;
        const newSpent = currentSpent + finalTotal;

        // Tìm hạng hiện tại của khách (dựa trên spentAmount TRƯỚC giao dịch này)
        const customerTier = getCustomerTier(currentSpent, tiers);
        const multiplier = customerTier?.pointsMultiplier || 1;

        // Tích điểm: (finalTotal / 10,000) * hệ số nhân của hạng
        const basePoints = finalTotal / 10000;
        const earnedPoints = Math.floor(basePoints * multiplier);
        const pointsUsed = usePoints ? Math.floor(pointsDiscount / 100) : 0; // Điểm đã dùng
        const currentPoints = selectedCustomer.loyaltyPoints || 0;

        // Cộng dồn: điểm hiện tại - điểm dùng + điểm mới kiếm
        const newPoints = currentPoints - pointsUsed + earnedPoints;

        // Lưu vào cột loyalty_points và spent_amount trong bảng customers
        await api.put(`/crm/customers/${selectedCustomer.id}`, {
          name: selectedCustomer.name,
          phone: selectedCustomer.phone,
          loyaltyPoints: newPoints,
          spentAmount: newSpent,
        });

        customerToUpdate = {
          ...selectedCustomer,
          loyaltyPoints: newPoints,
          spentAmount: newSpent,
        };
      } catch (error) {
        console.error('Error updating customer loyalty points:', error);
        // Không hiện alert, chỉ log lỗi và tiếp tục thanh toán
      }
    }

    onComplete({
      cart,
      customer: customerToUpdate,
      total: finalTotal,
      customerMoney: receivedAmt,
      change: changeAmt,
      pointsDiscount,
      discount: discountNum + voucherDiscountAmt,
      notes,
      paymentMethod: method === "cash" ? "Tiền mặt" : "Chuyển khoản"
    });
  };

  const handleApplyVoucher = async () => {
    if (!voucher || !voucher.trim()) return;
    setVoucherError("");
    setAppliedVoucher(null);
    try {
      const response = await api.get('/crm/coupons');
      const coupons = response.data;
      const validCoupon = coupons.find(c => c.couponCode.toUpperCase() === voucher.trim().toUpperCase() && c.status === 'ACTIVE');

      if (!validCoupon) {
        setVoucherError("Mã voucher không hợp lệ hoặc đã hết hạn/chưa kích hoạt!");
        setDiscount(0);
        return;
      }

      if (validCoupon.minPurchaseAmount && subtotal < validCoupon.minPurchaseAmount) {
        setVoucherError(`Đơn hàng tối thiểu ${validCoupon.minPurchaseAmount.toLocaleString()}đ để áp mã này!`);
        setDiscount(0);
        return;
      }

      if (validCoupon.couponType === 'PERCENTAGE') {
        setAppliedVoucher({
          type: 'PERCENTAGE',
          value: validCoupon.discountPercent || 0,
          max: validCoupon.maxDiscountAmount || 0,
          code: validCoupon.couponCode
        });
      } else {
        setAppliedVoucher({
          type: 'FIXED_AMOUNT',
          value: validCoupon.discountAmount || 0,
          max: 0,
          code: validCoupon.couponCode
        });
      }

      setFocusedField("notes");
      notesRef.current?.focus();
    } catch (error) {
      console.error('Error applying voucher:', error);
      setVoucherError("Lỗi kết nối máy chủ để kiểm tra mã voucher.");
    }
  };

  const initiatePayment = () => {
    if (finalTotal === 0) {
      // Đơn 0đ: Hoàn tất ngay không cần nhập tiền
      completePaymentProcess("cash", 0, 0);
      return;
    }
    if (paymentMethod === "cash") {
      if (!cashAmount || parseFloat(cashAmount) < finalTotal) {
        alert("Số tiền không đủ!");
        return;
      }
      completePaymentProcess("cash", parseFloat(cashAmount), change);
    } else {
      // Chuyển khoản -> mở QR Modal
      setShowQRModal(true);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "1000px",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #e9ecef",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "20px" }}>Thanh toán</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#6c757d",
            }}
          >
            ×
          </button>
        </div>

        {/* Body - 2 columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            padding: "20px",
            overflow: "auto",
          }}
        >
          {/* Left: Tạm tính */}
          <div>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "16px" }}>Tạm tính tiền</h3>

            {/* Danh sách sản phẩm */}
            <div
              style={{
                maxHeight: "200px",
                overflow: "auto",
                marginBottom: "15px",
                padding: "10px",
                background: "#f8f9fa",
                borderRadius: "6px",
              }}
            >
              {cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    fontSize: "13px",
                  }}
                >
                  <span>
                    {item.name} x{item.qty}
                  </span>
                  <span style={{ fontWeight: "bold" }}>
                    {(item.price * item.qty).toLocaleString()}đ
                  </span>
                </div>
              ))}
            </div>

            {/* Tổng tạm tính */}
            <div
              style={{
                padding: "12px",
                background: "#d1ecf1",
                borderRadius: "6px",
                marginBottom: "15px",
                border: "1px solid #007bff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span>Tạm tính:</span>
                <span style={{ fontWeight: "bold" }}>
                  {subtotal.toLocaleString()}đ
                </span>
              </div>
              {pointsDiscount > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    color: "#17a2b8",
                  }}
                >
                  <span>Giảm điểm:</span>
                  <span>-{pointsDiscount.toLocaleString()}đ</span>
                </div>
              )}
              {appliedVoucher && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    color: "#17a2b8",
                  }}
                >
                  <span>
                    Voucher ({appliedVoucher.code}):
                  </span>
                  <span>-{voucherDiscountAmt.toLocaleString()}đ</span>
                </div>
              )}
              {discountNum > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    color: "#17a2b8",
                  }}
                >
                  <span>Giảm giá:</span>
                  <span>-{discountNum.toLocaleString()}đ</span>
                </div>
              )}
            </div>

            {/* Tìm kiếm khách hàng */}
            <CustomerSearch
              ref={customerSearchRef}
              onSelectCustomer={setSelectedCustomer}
              cart={cart}
              onNavigateDown={() => {
                setFocusedField("voucher");
                voucherInputRef.current?.focus();
              }}
            />

            {/* Thông tin khách hàng */}
            {selectedCustomer && (() => {
              const currentSpent = selectedCustomer.spentAmount || 0;
              const customerTier = getCustomerTier(currentSpent, tiers);
              const multiplier = customerTier?.pointsMultiplier || 1;
              const earnedPoints = Math.floor((finalTotal / 10000) * multiplier);
              return (
                <div
                  style={{
                    padding: "12px",
                    background: "#d1ecf1",
                    borderRadius: "6px",
                    marginBottom: "15px",
                    fontSize: "13px",
                    border: "1px solid #007bff",
                  }}
                >
                  <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                    {selectedCustomer.name} - {selectedCustomer.phone}
                    {customerTier ? (
                      <span style={{
                        display: "inline-block",
                        marginLeft: "8px",
                        padding: "1px 8px",
                        background: customerTier.color || "#d9534f",
                        color: "#fff",
                        borderRadius: "10px",
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}>
                        👑 {customerTier.tierName}
                      </span>
                    ) : selectedCustomer.tier ? (
                      <span style={{ color: "#d9534f", marginLeft: "5px" }}>(Hạng: {selectedCustomer.tier})</span>
                    ) : null}
                  </div>
                  <div>Điểm hiện tại: <strong>{currentLoyaltyPoints}</strong></div>
                  <div style={{ color: "#17a2b8", marginTop: "2px" }}>
                    Sẽ tích: <strong>+{earnedPoints} điểm</strong>
                    {multiplier !== 1 && (
                      <span style={{ fontSize: "11px", marginLeft: "4px", color: "#6c757d" }}>
                        (×{Number(multiplier).toFixed(1)} hệ số {customerTier?.tierName})
                      </span>
                    )}
                  </div>
                  {currentLoyaltyPoints > 0 && (
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={usePoints}
                        onChange={(e) => setUsePoints(e.target.checked)}
                      />
                      <span>
                        Sử dụng điểm (-
                        {Math.min(
                          currentLoyaltyPoints * 100,
                          subtotal,
                        ).toLocaleString()}
                        đ)
                      </span>
                    </label>
                  )}
                </div>
              );
            })()}

            {/* Voucher */}
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                Mã voucher:
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  ref={voucherInputRef}
                  type="text"
                  placeholder="Nhập mã voucher"
                  value={voucher}
                  onChange={(e) => {
                    setVoucher(e.target.value);
                    setVoucherError("");
                    setAppliedVoucher(null); // Xóa voucher cũ khi người dùng gõ thay đổi
                  }}
                  onFocus={() => setFocusedField("voucher")}
                  style={{
                    flex: 1,
                    padding: "8px",
                    border: focusedField === "voucher" ? "2px solid #007bff" : "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "13px",
                  }}
                />
                <button
                  ref={voucherButtonRef}
                  onClick={handleApplyVoucher}
                  style={{
                    padding: "8px 16px",
                    background: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  Áp dụng
                </button>
              </div>
              {voucherError && (
                <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "5px" }}>
                  {voucherError}
                </div>
              )}
            </div>

            {/* Giảm giá thủ công */}
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                Giảm giá thủ công (VNĐ):
              </label>
              <input
                type="number"
                placeholder="Nhập số tiền giảm"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                onFocus={(e) => e.target.select()}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "13px",
                }}
              />
            </div>

            {/* Ghi chú */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                Ghi chú:
              </label>
              <textarea
                ref={notesRef}
                placeholder="Thêm ghi chú..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onFocus={() => setFocusedField("notes")}
                rows={2}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: focusedField === "notes" ? "2px solid #007bff" : "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "13px",
                  resize: "none",
                }}
              />
            </div>
          </div>

          {/* Right: Khách cần trả */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "16px" }}>Khách cần trả</h3>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#007bff",
                }}
              >
                {finalTotal.toLocaleString()}đ
              </div>
            </div>

            {/* Hình thức thanh toán */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "10px",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                Hình thức thanh toán:
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                }}
              >
                <button
                  onClick={() => setPaymentMethod("cash")}
                  onFocus={() => setFocusedField("paymentMethod")}
                  style={{
                    padding: "15px",
                    background: paymentMethod === "cash" ? "#007bff" : "white",
                    color: paymentMethod === "cash" ? "white" : "#333",
                    border:
                      "2px solid " +
                      (paymentMethod === "cash" ? "#007bff" : "#ddd"),
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "500",
                    outline: focusedField === "paymentMethod" && paymentMethod === "cash" ? "3px solid #80bdff" : "none"
                  }}
                >
                  Tiền mặt
                  Tiền mặt
                </button>
                <button
                  onClick={() => setPaymentMethod("transfer")}
                  onFocus={() => setFocusedField("paymentMethod")}
                  style={{
                    padding: "15px",
                    background:
                      paymentMethod === "transfer" ? "#007bff" : "white",
                    color: paymentMethod === "transfer" ? "white" : "#333",
                    border:
                      "2px solid " +
                      (paymentMethod === "transfer" ? "#007bff" : "#ddd"),
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "500",
                    outline: focusedField === "paymentMethod" && paymentMethod === "transfer" ? "3px solid #80bdff" : "none"
                  }}
                >
                  Chuyển khoản
                  Chuyển khoản
                </button>
              </div>
            </div>

            {/* Tiền mặt */}
            {paymentMethod === "cash" && (
              <div
                style={{
                  padding: "15px",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                  marginBottom: "20px",
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "13px",
                    fontWeight: "500",
                  }}
                >
                  Tiền khách đưa:
                </label>
                <input
                  ref={cashInputRef}
                  type="number"
                  placeholder="Nhập số tiền"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  onFocus={() => setFocusedField("cashAmount")}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "16px",
                    marginBottom: "10px",
                  }}
                />


                {/* Gợi ý tiền */}
                {cashAmount && getSuggestedAmounts().length > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <div
                      style={{
                        fontSize: "12px",
                        marginBottom: "6px",
                        color: "#666",
                      }}
                    >
                      Gợi ý:
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {getSuggestedAmounts().map((amount, index) => {
                        suggestedAmountsRef.current[index] = amount;
                        return (
                          <button
                            key={amount}
                            onClick={() => setCashAmount(amount.toString())}
                            style={{
                              flex: 1,
                              padding: "8px",
                              background: focusedField === "suggestedAmounts" && suggestedIndex === index ? "#0056b3" : "#007bff",
                              color: "white",
                              border: focusedField === "suggestedAmounts" && suggestedIndex === index ? "2px solid #fff" : "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "500",
                              outline: focusedField === "suggestedAmounts" && suggestedIndex === index ? "3px solid #80bdff" : "none"
                            }}
                          >
                            {amount.toLocaleString()}đ
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {cashAmount && parseFloat(cashAmount) >= finalTotal && (
                  <div
                    style={{
                      padding: "12px",
                      background: "#d1ecf1",
                      borderRadius: "6px",
                      textAlign: "center",
                      border: "1px solid #007bff",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#0c5460",
                        marginBottom: "4px",
                      }}
                    >
                      Tiền thừa
                    </div>
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: "#007bff",
                      }}
                    >
                      {change.toLocaleString()}đ
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Chuyển khoản */}
            {paymentMethod === "transfer" && (
              <div style={{
                padding: "20px",
                background: "#f8f9fa",
                borderRadius: "8px",
                marginBottom: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: "2px dashed #007bff"
              }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#333", textAlign: "center", marginBottom: "5px" }}>
                  Phương thức: Chuyển khoản ngân hàng (VietQR)
                </div>
                <div style={{ fontSize: "12px", color: "#666", textAlign: "center" }}>
                  Bấm xác nhận bên dưới, hệ thống sẽ tự động tạo mã chờ thanh toán cho khách hàng quét.
                </div>
              </div>
            )}

            {/* Nút thanh toán */}
            <button
              ref={paymentButtonRef}
              onClick={initiatePayment}
              onFocus={() => setFocusedField("paymentButton")}
              disabled={finalTotal > 0 && (!paymentMethod || (paymentMethod === "cash" && (!cashAmount || parseFloat(cashAmount) < finalTotal)))}
              style={{
                width: "100%",
                padding: "18px",
                background:
                  finalTotal > 0 && (!paymentMethod ||
                    (paymentMethod === "cash" &&
                      (!cashAmount || parseFloat(cashAmount) < finalTotal)))
                    ? "#6c757d"
                    : "#007bff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "18px",
                fontWeight: "bold",
                cursor:
                  finalTotal > 0 && (!paymentMethod ||
                    (paymentMethod === "cash" &&
                      (!cashAmount || parseFloat(cashAmount) < finalTotal)))
                    ? "not-allowed"
                    : "pointer",
                boxShadow: "0 4px 12px rgba(0,123,255,0.3)",
              }}
            >
              {paymentMethod === 'cash' ? `Hoàn tất(${shortcuts?.payment1 || 'F9'})` : `Xác nhận chuyển khoản(${shortcuts?.payment2 || 'F10'})`}
            </button>
          </div>
        </div>
      </div>

      {showQRModal && (
        <QRTransferModal
          amount={finalTotal}
          onCancel={() => setShowQRModal(false)}
          onSuccess={() => {
            setShowQRModal(false);
            completePaymentProcess("transfer", finalTotal, 0);
          }}
        />
      )}
    </div>
  );
}
