import { useState, useRef, useEffect } from "react";
import CustomerSearch from "./CustomerSearch";

import api from "../../config/axiosConfig";
import customerTierService from "../../services/customerTierService";
import customerService from "../../services/customerService";
import eventService from "../../services/eventService";

const SEPAY_API_TOKEN = "6NBN1CXSYYMKUTRDQE94LCDYOHETW8PQF6OQX0GGOWRSPCJGBIVHL7SADPIWMMAN";

// Hiển thị thành phần qrtransfer modal.
const QRTransferModal = ({ amount, onCancel, onSuccess }) => {
  const [paymentCode] = useState(() => "DH" + Date.now());
  const [status, setStatus] = useState("waiting"); // waiting | success | error
  const pollingRef = useRef(null);

  const qrUrl = `https://qr.sepay.vn/img?bank=MBBank&acc=0961390486&template=compact&amount=${amount}&des=${paymentCode}`;

  // Tự động gọi SePay API định kỳ để kiểm tra thanh toán.
  useEffect(() => {
    // Xử lý checkPayment.
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
          // Kiểm tra lại: xác thực có ít nhất một giao dịch chứa đúng mã thanh toán.
          const matched = data.transactions.some(tx => {
            const content = (tx.transaction_content || tx.content || tx.description || "").toUpperCase();
            return content.includes(paymentCode.toUpperCase());
          });

          if (matched) {
            setStatus("success");
            clearInterval(pollingRef.current);
            // Tự động hoàn tất sau khi hiển thị thành công 10 giây.
            setTimeout(() => {
              onSuccess();
            }, 10000);
          }
        }

      } catch (err) {
        console.error("SePay polling error:", err);
      }
    };

    // Trì hoãn 5 giây trước lần kiểm tra đầu để người dùng kịp quét.
    const initialDelay = setTimeout(() => {
      checkPayment(); // first check
      pollingRef.current = setInterval(checkPayment, 3000);
    }, 5000);

    return () => {
      clearTimeout(initialDelay);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [amount, paymentCode, onSuccess]);

  // Phím tắt bàn phím.
  useEffect(() => {
    // Xử lý key down.
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
// Hàm hỗ trợ tìm hạng thành viên phù hợp theo tổng chi tiêu.
const getCustomerTier = (spentAmount, tiers) => {
  if (!tiers || tiers.length === 0) return null;
  return [...tiers]
    .sort((a, b) => Number(b.minSpending) - Number(a.minSpending))
    .find(tier => spentAmount >= Number(tier.minSpending)) || null;
};

// Thực hiện build updated customer after payment.
const buildUpdatedCustomerAfterPayment = (selectedCustomer, finalTotal, tiers, usePoints, pointsDiscount) => {
  if (!selectedCustomer || !selectedCustomer.id) return selectedCustomer;

  const currentSpent = Math.max(0, Math.round(Number(selectedCustomer.spentAmount) || 0));
  const paidAmount = Math.max(0, Math.round(Number(finalTotal) || 0));
  const newSpent = currentSpent + paidAmount;

  const customerTier = getCustomerTier(currentSpent, tiers);
  const multiplier = Number(customerTier?.pointsMultiplier) || 1;

  const basePoints = paidAmount / 10000;
  const earnedPoints = Math.floor(basePoints * multiplier);
  const pointsUsed = usePoints ? Math.floor(Number(pointsDiscount || 0) / 100) : 0;
  const currentPoints = Math.max(0, Math.floor(Number(selectedCustomer.loyaltyPoints) || 0));
  const newPoints = Math.max(0, currentPoints - pointsUsed + earnedPoints);

  return {
    ...selectedCustomer,
    loyaltyPoints: newPoints,
    spentAmount: newSpent,
  };
};

// Hiển thị thành phần payment modal.
export default function PaymentModal({ cart, customer, onClose, onComplete, onStartQRPayment, shortcuts }) {
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(customer);
  const [usePoints, setUsePoints] = useState(false);
  const [notes, setNotes] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);
  const [voucherSelectionError, setVoucherSelectionError] = useState("");
  const [loadingPromotions, setLoadingPromotions] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashAmount, setCashAmount] = useState("");
  const [focusedField, setFocusedField] = useState("customerSearch");
  const [suggestedIndex, setSuggestedIndex] = useState(-1);
  const [tiers, setTiers] = useState([]); // Danh sách hạng thành viên

  const customerSearchRef = useRef(null);
  const notesRef = useRef(null);
  const cashInputRef = useRef(null);
  const paymentButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const suggestedAmountsRef = useRef([]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const currentLoyaltyPoints = selectedCustomer?.loyaltyPoints || 0;
  const pointsDiscount =
    usePoints && selectedCustomer
      ? Math.min(currentLoyaltyPoints * 100, subtotal)
      : 0;

  const today = new Date().toISOString().slice(0, 10);
  const activeCampaigns = campaigns.filter(c => c?.status === 'ACTIVE');

  const campaignBudgetById = activeCampaigns.reduce((acc, campaign) => {
    const totalBudget = Number(campaign.budget);
    const usedBudget = Number(campaign.usedBudget ?? campaign.spentBudget ?? campaign.consumedBudget ?? 0);
    acc[campaign.id] = Number.isFinite(totalBudget) && totalBudget > 0
      ? Math.max(0, totalBudget - (Number.isFinite(usedBudget) ? usedBudget : 0))
      : Infinity;
    return acc;
  }, {});

  // Lấy voucher discount amount.
  const getVoucherDiscountAmount = (voucherItem) => {
    if (!voucherItem) return 0;
    if (voucherItem.couponType === 'PERCENTAGE') {
      let value = subtotal * (Number(voucherItem.discountPercent || 0) / 100);
      const max = Number(voucherItem.maxDiscountAmount || 0);
      if (max > 0 && value > max) value = max;
      return Math.max(0, value);
    }
    return Math.max(0, Number(voucherItem.discountAmount || 0));
  };

  // Lấy voucher campaign id.
  const getVoucherCampaignId = (voucherItem) => {
    const rawId = voucherItem?.campaignId ?? voucherItem?.campaign?.id;
    const parsed = Number(rawId);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const availableVouchers = vouchers.filter(v => {
    if (v?.status !== 'ACTIVE') return false;
    if (v?.startDate && v.startDate > today) return false;
    if (v?.endDate && v.endDate < today) return false;
    if (v?.totalUsageLimit && Number(v.currentUsageCount || 0) >= Number(v.totalUsageLimit)) return false;

    const voucherCampaignId = getVoucherCampaignId(v);
    const campaignBudgetLeft = voucherCampaignId != null ? campaignBudgetById[voucherCampaignId] : Infinity;
    return getVoucherDiscountAmount(v) <= (campaignBudgetLeft ?? Infinity);
  });

  const selectedVoucher = availableVouchers.find(v => v.id === selectedVoucherId) || null;
  const vouchersDiscountTotal = selectedVoucher ? getVoucherDiscountAmount(selectedVoucher) : 0;

  useEffect(() => {
    if (selectedVoucherId != null && !availableVouchers.some(v => v.id === selectedVoucherId)) {
      setSelectedVoucherId(null);
    }
  }, [availableVouchers, selectedVoucherId]);

  // Chọn hoặc bỏ chọn voucher sau khi kiểm tra điều kiện áp dụng.
  const selectVoucher = (voucherItem) => {
    if (!voucherItem) return;

    // Không cho dùng voucher khi đang bật dùng điểm.
    if (usePoints) {
      setVoucherSelectionError("Không thể dùng voucher khi đang chọn sử dụng điểm.");
      return;
    }

    // Chặn voucher nếu chưa đạt giá trị đơn tối thiểu.
    const minPurchaseAmount = Number(voucherItem.minPurchaseAmount || 0);
    if (minPurchaseAmount > 0 && subtotal < minPurchaseAmount) {
      setVoucherSelectionError(`Đơn hàng chưa đủ điều kiện áp dụng voucher này (tối thiểu ${minPurchaseAmount.toLocaleString()}đ).`);
      return;
    }

    // Xóa lỗi và toggle voucher đang chọn.
    setVoucherSelectionError("");
    setSelectedVoucherId(prev => (prev === voucherItem.id ? null : voucherItem.id));
  };

  // Hỗ trợ chọn voucher bằng phím Enter.
  const handleVoucherKeyDown = (e, voucherItem) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      selectVoucher(voucherItem);
    }
  };

  // Bật/tắt dùng điểm và kiểm tra xung đột với voucher.
  const handleToggleUsePoints = (checked) => {
    // Chỉ cho phép một hình thức giảm giá tại cùng thời điểm.
    if (checked && selectedVoucherId != null) {
      setVoucherSelectionError("Chỉ được chọn một hình thức giảm giá: điểm hoặc voucher.");
      return;
    }

    if (checked) {
      setVoucherSelectionError("");
    }

    setUsePoints(checked);
  };

  // Kiểm tra voucher có đạt điều kiện tối thiểu theo giá trị đơn hàng hay không.
  const isVoucherApplicable = (voucherItem) => {
    const minPurchaseAmount = Number(voucherItem?.minPurchaseAmount || 0);
    return minPurchaseAmount <= 0 || subtotal >= minPurchaseAmount;
  };

  // Trả về thông báo validate cho voucher chưa đủ điều kiện.
  const getVoucherValidationMessage = (voucherItem) => {
    if (!isVoucherApplicable(voucherItem)) {
      return `Chưa đủ điều kiện: Đơn tối thiểu ${Number(voucherItem.minPurchaseAmount || 0).toLocaleString()}đ`;
    }
    return "";
  };

  // Kiểm tra voucher selected.
  const isVoucherSelected = (voucherId) => selectedVoucherId === voucherId;


  const groupedVouchers = activeCampaigns.map(campaign => ({
    campaign,
    vouchers: availableVouchers.filter(v => getVoucherCampaignId(v) === campaign.id),
  })).filter(group => group.vouchers.length > 0);

  const standaloneVouchers = availableVouchers.filter(v => getVoucherCampaignId(v) == null);

  // Thực hiện format voucher discount.
  const formatVoucherDiscount = (voucherItem) => {
    if (voucherItem.couponType === 'PERCENTAGE') {
      return `${Number(voucherItem.discountPercent || 0)}%`;
    }
    return `${Number(voucherItem.discountAmount || 0).toLocaleString()}đ`;
  };

  const totalDiscount = pointsDiscount + vouchersDiscountTotal;
  const finalTotal = Math.max(0, subtotal - totalDiscount);
  const change = cashAmount ? Math.max(0, parseFloat(cashAmount) - finalTotal) : 0;

  // Fetch danh sách hạng thành viên khi mở modal
  useEffect(() => {
    // Xử lý fetchTiers.
    const fetchTiers = async () => {
      try {
        const response = await customerTierService.getAllTiers();
        setTiers(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Error fetching tiers:", error);
      }
    };
    fetchTiers();
  }, []);

  useEffect(() => {
    // Xử lý fetchPromotions.
    const fetchPromotions = async () => {
      setLoadingPromotions(true);
      try {
        const [campaignData, voucherData] = await Promise.all([
          eventService.getAllCampaigns(),
          eventService.getAllVouchers(),
        ]);
        setCampaigns(Array.isArray(campaignData) ? campaignData : []);
        setVouchers(Array.isArray(voucherData) ? voucherData : []);
      } catch (error) {
        console.error("Error fetching promotions:", error);
        setCampaigns([]);
        setVouchers([]);
      } finally {
        setLoadingPromotions(false);
      }
    };

    fetchPromotions();
  }, []);

  useEffect(() => {
    if (focusedField === "customerSearch" && customerSearchRef.current) {
      customerSearchRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Xử lý key down.
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (focusedField === "customerSearch") {
          setFocusedField("notes");
          notesRef.current?.focus();
        } else if (focusedField === "notes") {
          setFocusedField("paymentMethod");
          if (!paymentMethod) setPaymentMethod("cash");
        } else if (focusedField === "paymentMethod") {
          if (paymentMethod === "cash") {
            setFocusedField("cashAmount");
            cashInputRef.current?.focus();
          } else {
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
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (focusedField === "notes") {
          setFocusedField("customerSearch");
          customerSearchRef.current?.focus();
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
      } else if (e.key === 'ArrowLeft') {
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
      } else if (e.key === 'Enter') {
        if (focusedField === "paymentMethod") {
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
      } else if (shortcuts && e.key === shortcuts.payment1) {
        e.preventDefault();
        if (finalTotal === 0) {
          completePaymentProcess("cash", 0, 0);
        } else {
          paymentButtonRef.current?.click();
        }
      } else if (shortcuts && e.key === shortcuts.closePaymentModal) {
        e.preventDefault();
        closeButtonRef.current?.focus();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedField, paymentMethod, cashAmount, finalTotal, suggestedIndex, shortcuts, onClose]);

  // Lấy suggested amounts.
  const getSuggestedAmounts = () => {
    if (!cashAmount) return [];

    const cleanCashAmount = cashAmount.replace(/[^0-9]/g, '');
    const num = parseInt(cleanCashAmount, 10);
    if (isNaN(num) || num <= 0) return [];

    const digitCount = cleanCashAmount.length;
    const startPower = Math.max(0, 4 - digitCount);

    return [
      num * Math.pow(10, startPower),
      num * Math.pow(10, startPower + 1),
      num * Math.pow(10, startPower + 2)
    ];
  };

  // Xử lý completePaymentProcess.
  const completePaymentProcess = async (method, receivedAmt, changeAmt) => {
    let customerToUpdate = selectedCustomer;

    // Cập nhật điểm trung thành trong bảng customers
    if (selectedCustomer && selectedCustomer.id) {
      let latestCustomer = selectedCustomer;

      try {
        latestCustomer = await customerService.getCustomerById(selectedCustomer.id);
      } catch (error) {
        console.error('Error fetching latest customer before payment:', error);
      }

      customerToUpdate = buildUpdatedCustomerAfterPayment(
        latestCustomer,
        finalTotal,
        tiers,
        usePoints,
        pointsDiscount,
      );

      try {
        await api.put(`/crm/customers/${selectedCustomer.id}`, {
          name: customerToUpdate.name,
          phone: customerToUpdate.phone,
          loyaltyPoints: customerToUpdate.loyaltyPoints,
          spentAmount: customerToUpdate.spentAmount,
        });
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
      discount: vouchersDiscountTotal,
      selectedVoucherId,
      notes,
      paymentMethod: method === "cash" ? "Tiền mặt" : "Chuyển khoản"
    });
  };

  // Xử lý initiatePayment.
  const initiatePayment = async () => {
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
      // Chuyển khoản
      if (onStartQRPayment) {
         let latestCustomer = selectedCustomer;

         if (selectedCustomer?.id) {
           try {
             latestCustomer = await customerService.getCustomerById(selectedCustomer.id);
           } catch (error) {
             console.error('Error fetching latest customer before QR payment:', error);
           }
         }

         const customerToUpdate = buildUpdatedCustomerAfterPayment(
           latestCustomer,
           finalTotal,
           tiers,
           usePoints,
           pointsDiscount,
         );

         const orderData = {
            cart,
            customer: customerToUpdate,
            total: finalTotal,
            customerMoney: finalTotal,
            change: 0,
            pointsDiscount,
            discount: vouchersDiscountTotal,
            selectedVoucherId,
            notes,
            paymentMethod: "Chuyển khoản"
         };
         const paymentCode = "DH" + Date.now().toString().slice(-6);
         onStartQRPayment(orderData, finalTotal, paymentCode);
      } else {
         setShowQRModal(true);
      }
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
            ref={closeButtonRef}
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
              {vouchersDiscountTotal > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    color: "#17a2b8",
                  }}
                >
                  <span>Giảm voucher:</span>
                  <span>-{vouchersDiscountTotal.toLocaleString()}đ</span>
                </div>
              )}
            </div>

            {/* Tìm kiếm khách hàng */}
            <CustomerSearch
              ref={customerSearchRef}
              onSelectCustomer={setSelectedCustomer}
              cart={cart}
              onNavigateDown={() => {
                setFocusedField("notes");
                notesRef.current?.focus();
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
                        onChange={(e) => handleToggleUsePoints(e.target.checked)}
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

            {/* Event đang diễn ra + voucher */}
            <div style={{ marginBottom: "15px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "500",
                  }}
                >
                  Event & Voucher áp dụng:
                </label>
                {loadingPromotions && (
                  <span style={{ fontSize: "12px", color: "#6c757d" }}>Đang tải...</span>
                )}
              </div>

              <div
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  padding: "10px",
                  maxHeight: "220px",
                  overflowY: "auto",
                  background: "#fafafa",
                }}
              >
                {activeCampaigns.length > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "600", color: "#0d6efd", marginBottom: "6px" }}>
                      Sự kiện đang diễn ra
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {activeCampaigns.map((campaign) => (
                        <span
                          key={campaign.id}
                          style={{
                            fontSize: "11px",
                            background: "#e7f1ff",
                            color: "#0d6efd",
                            border: "1px solid #b6d4fe",
                            borderRadius: "999px",
                            padding: "3px 8px",
                          }}
                        >
                          {campaign.campaignName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {groupedVouchers.length === 0 && standaloneVouchers.length === 0 ? (
                  <div style={{ fontSize: "12px", color: "#6c757d" }}>
                    Không có voucher khả dụng cho đơn hàng hiện tại.
                  </div>
                ) : (
                  <>
                    {voucherSelectionError && (
                      <div style={{ fontSize: "12px", color: "#dc3545", marginBottom: "8px" }}>
                        {voucherSelectionError}
                      </div>
                    )}
                    {groupedVouchers.map(({ campaign, vouchers: campaignVouchers }) => (
                      <div key={campaign.id} style={{ marginBottom: "10px" }}>
                        <div style={{ fontSize: "12px", fontWeight: "600", color: "#0d6efd", marginBottom: "6px" }}>
                          {campaign.campaignName}
                        </div>
                        {campaignVouchers.map((voucherItem) => {
                          const checked = isVoucherSelected(voucherItem.id);
                          const isApplicable = isVoucherApplicable(voucherItem);
                          const validationMessage = getVoucherValidationMessage(voucherItem);
                          return (
                            <label
                              key={voucherItem.id}
                              tabIndex={0}
                              onKeyDown={(e) => handleVoucherKeyDown(e, voucherItem)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "8px",
                                padding: "6px 8px",
                                borderRadius: "4px",
                                background: checked ? "#e7f1ff" : "white",
                                border: checked ? "1px solid #0d6efd" : "1px solid #eee",
                                marginBottom: "6px",
                                cursor: "pointer",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => selectVoucher(voucherItem)}
                                />
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontSize: "12px", fontWeight: "500" }}>
                                    {voucherItem.couponCode || voucherItem.name || `Voucher #${voucherItem.id}`}
                                  </div>
                                  <div style={{ fontSize: "11px", color: !isApplicable ? "#dc3545" : "#6c757d" }}>
                                    Giảm {formatVoucherDiscount(voucherItem)}
                                    {voucherItem.minPurchaseAmount
                                      ? ` • ĐH tối thiểu ${Number(voucherItem.minPurchaseAmount).toLocaleString()}đ`
                                      : ""}
                                    {voucherItem.totalUsageLimit
                                      ? ` • Còn ${Math.max(0, Number(voucherItem.totalUsageLimit) - Number(voucherItem.currentUsageCount || 0))}/${Number(voucherItem.totalUsageLimit)} lượt`
                                      : ""}
                                    {voucherItem.endDate ? ` • HSD ${voucherItem.endDate}` : ""}
                                  </div>
                                  {!isApplicable && (
                                    <div style={{ fontSize: "11px", color: "#dc3545", marginTop: "2px" }}>
                                      {validationMessage}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <span style={{ fontSize: "12px", fontWeight: 600, color: "#198754" }}>
                                -{getVoucherDiscountAmount(voucherItem).toLocaleString()}đ
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    ))}

                    {standaloneVouchers.length > 0 && (
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: "600", color: "#6c757d", marginBottom: "6px" }}>
                          Voucher khác
                        </div>
                        {standaloneVouchers.map((voucherItem) => {
                          const checked = isVoucherSelected(voucherItem.id);
                          const isApplicable = isVoucherApplicable(voucherItem);
                          const validationMessage = getVoucherValidationMessage(voucherItem);
                          return (
                            <label
                              key={voucherItem.id}
                              tabIndex={0}
                              onKeyDown={(e) => handleVoucherKeyDown(e, voucherItem)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "8px",
                                padding: "6px 8px",
                                borderRadius: "4px",
                                background: checked ? "#e7f1ff" : "white",
                                border: checked ? "1px solid #0d6efd" : "1px solid #eee",
                                marginBottom: "6px",
                                cursor: "pointer",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => selectVoucher(voucherItem)}
                                />
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontSize: "12px", fontWeight: "500" }}>
                                    {voucherItem.couponCode || voucherItem.name || `Voucher #${voucherItem.id}`}
                                  </div>
                                  <div style={{ fontSize: "11px", color: !isApplicable ? "#dc3545" : "#6c757d" }}>
                                    Giảm {formatVoucherDiscount(voucherItem)}
                                    {voucherItem.minPurchaseAmount
                                      ? ` • ĐH tối thiểu ${Number(voucherItem.minPurchaseAmount).toLocaleString()}đ`
                                      : ""}
                                  </div>
                                  {!isApplicable && (
                                    <div style={{ fontSize: "11px", color: "#dc3545", marginTop: "2px" }}>
                                      {validationMessage}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <span style={{ fontSize: "12px", fontWeight: 600, color: "#198754" }}>
                                -{getVoucherDiscountAmount(voucherItem).toLocaleString()}đ
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>

            </div>

            {/* Ghi chú */}
            {/* <div>
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
            </div>*/}
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
