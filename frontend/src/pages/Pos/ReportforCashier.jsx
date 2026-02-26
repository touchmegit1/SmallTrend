import { useState, useEffect } from "react";
import StatCard from "./StatCard";
import PaymentMethod from "./PaymentMethod";
import TopProduct from "./TopProduct";

const COLORS = {
  bg: "#F5F6FA",
  card: "#FFFFFF",
  text: "#1F2937",
  textMuted: "#6B7280",
  primary: "#2563EB",
  success: "#16A34A",
  purple: "#7C3AED",
  orange: "#FB923C",
  gray: "#E5E7EB",
};

const SHADOW = "0 1px 4px rgba(0,0,0,0.06)";
const RADIUS = "12px";

export default function ReportforCashier() {
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    const savedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const savedPendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
    setTransactions(savedTransactions);
  }, []);

  const totalOrders = transactions.length;
  const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]').length;
  const completedOrders = totalOrders;
  const totalRevenue = transactions.reduce((sum, t) => sum + parseInt(t.total.replace(/[^0-9]/g, '')), 0);
  const averagePerOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalProducts = transactions.reduce((sum, t) => sum + parseInt(t.quantity), 0);
  const totalDiscount = transactions.reduce((sum, t) => sum + (t.pointsDiscount || 0), 0);

  const cashTransactions = transactions.filter(t => t.payment === "Tiền mặt");
  const cashAmount = cashTransactions.reduce((sum, t) => sum + parseInt(t.total.replace(/[^0-9]/g, '')), 0);
  const cashPercent = totalRevenue > 0 ? (cashAmount / totalRevenue) * 100 : 0;

  const productStats = {};
  transactions.forEach(t => {
    if (t.items) {
      t.items.forEach(item => {
        if (!productStats[item.name]) productStats[item.name] = { revenue: 0, quantity: 0, price: item.price, code: item.code || item.barcode || 'N/A' };
        productStats[item.name].revenue += item.price * item.quantity;
        productStats[item.name].quantity += item.quantity;
      });
    }
  });
  const topProducts = Object.entries(productStats).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 3);

  const hourStats = {};
  transactions.forEach(t => {
    const hour = t.time.split(' ')[0].split(':')[0];
    hourStats[hour] = (hourStats[hour] || 0) + 1;
  });
  const peakHour = Object.entries(hourStats).sort((a, b) => b[1] - a[1])[0];
  const peakHourText = peakHour ? `${peakHour[0]}:00 - ${parseInt(peakHour[0]) + 1}:00` : "--";

  const showRevenueDetails = () => {
    const totalRevenueSum = transactions.reduce((sum, t) => sum + parseInt(t.total.replace(/[^0-9]/g, '')), 0);
    setModalContent({
      title: "Chi tiết Tổng doanh thu",
      data: transactions.map((t, i) => ({
        stt: i + 1,
        time: t.time,
        total: parseInt(t.total.replace(/[^0-9]/g, '')),
        payment: t.payment
      })),
      summary: { totalRevenue: totalRevenueSum }
    });
    setShowModal(true);
  };

  const showOrderDetails = () => {
    // Lấy tất cả transactions từ localStorage (giống TransactionHistory)
    const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    // Phân loại theo trạng thái
    const completedTransactions = allTransactions.filter(t => t.status !== 'Chờ thanh toán');
    const pendingTransactions = allTransactions.filter(t => t.status === 'Chờ thanh toán');
    
    const completedData = completedTransactions.map((t, i) => ({
      stt: i + 1,
      time: t.time,
      quantity: t.quantity,
      total: parseInt(t.total.replace(/[^0-9]/g, '')),
      status: 'Đã hoàn thành'
    }));
    
    const pendingData = pendingTransactions.map((t, i) => ({
      stt: completedTransactions.length + i + 1,
      time: t.time,
      quantity: t.quantity,
      total: parseInt(t.total.replace(/[^0-9]/g, '')),
      status: 'Đơn treo'
    }));
    
    setModalContent({
      title: "Chi tiết Đơn hàng",
      data: [...completedData, ...pendingData],
      summary: {
        completed: completedTransactions.length,
        pending: pendingTransactions.length
      }
    });
    setShowModal(true);
  };

  const showProductDetails = () => {
    const productMap = {};
    let totalQuantity = 0;
    let grandTotal = 0;
    
    transactions.forEach(t => {
      if (t.items) {
        t.items.forEach(item => {
          if (!productMap[item.name]) {
            productMap[item.name] = {
              name: item.name,
              quantity: 0,
              price: item.price,
              total: 0
            };
          }
          productMap[item.name].quantity += item.quantity;
          productMap[item.name].total += item.price * item.quantity;
          totalQuantity += item.quantity;
          grandTotal += item.price * item.quantity;
        });
      }
    });
    
    setModalContent({
      title: "Chi tiết Sản phẩm bán",
      data: Object.values(productMap),
      summary: { totalQuantity, grandTotal }
    });
    setShowModal(true);
  };
  
  return (
    <div
      style={{
        background: COLORS.bg,
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "Inter, Segoe UI, Arial, sans-serif",
      }}
    >
      <h2 style={{ marginBottom: "16px", color: COLORS.text }}>Tổng quan</h2>

      {/* ROW 1 - 4 thẻ thống kê */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <StatCard
          title="Tổng doanh thu"
          value={`${totalRevenue.toLocaleString()} đ`}
          sub={`${totalOrders} đơn hàng`}
          iconBg="#EFF6FF"
          iconColor={COLORS.primary}
          onClick={showRevenueDetails}
        />

        <StatCard
          title="Số đơn hàng"
          value={totalOrders }
          iconBg="#ECFEFF"
          iconColor={COLORS.success}
          onClick={showOrderDetails}
        />

        <StatCard
          title="Giá trị TB/đơn"
          value={`${Math.round(averagePerOrder).toLocaleString()} đ`}
          iconBg="#FFF7ED"
          iconColor={COLORS.orange}
        />

        <StatCard
          title="Sản phẩm bán"
          value={totalProducts}
          sub="Tổng số lượng"
          iconBg="#F3E8FF"
          iconColor={COLORS.purple}
          onClick={showProductDetails}
        />
      </div>

      {/* ROW 2 - Thanh toán & Top sản phẩm */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        {/* Phương thức thanh toán */}
        <div
          style={{
            background: COLORS.card,
            padding: "16px",
            borderRadius: RADIUS,
            boxShadow: SHADOW,
          }}
        >
          <h3 style={{ marginBottom: "12px", color: COLORS.text }}>
            Phương thức thanh toán
          </h3>

          <PaymentMethod
            name="Tiền mặt"
            amount={cashAmount.toLocaleString()}
            percent={Math.round(cashPercent)}
            transactions={cashTransactions.length}
            color={COLORS.primary}
            bg="#EFF6FF"
          />

          <PaymentMethod
            name="Chuyển khoản"
            amount="0"
            percent={0}
            transactions={0}
            color={COLORS.purple}
            bg="#F3E8FF"
          />
        </div>

        {/* Top sản phẩm */}
        <div
          style={{
            background: COLORS.card,
            padding: "16px",
            borderRadius: RADIUS,
            boxShadow: SHADOW,
          }}
        >
          <h3 style={{ marginBottom: "12px", color: COLORS.text }}>
            Top sản phẩm
          </h3>

          {topProducts.length > 0 ? topProducts.map(([name, stats], index) => (
            <TopProduct
              key={index}
              rank={index + 1}
              name={name}
              price={stats.price}
              code={stats.code}
            />
          )) : <div style={{ color: COLORS.textMuted, textAlign: "center", padding: "20px" }}>Chưa có dữ liệu</div>}
        </div>
      </div>

      {/* ROW 3 - Thống kê dưới */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
        }}
      >
        <div
          style={{
            background: COLORS.card,
            padding: "16px",
            borderRadius: RADIUS,
            boxShadow: SHADOW,
          }}
        >
          <div style={{ color: COLORS.textMuted }}>Tổng giảm giá</div>
          <h4 style={{ color: "#DC2626" }}>{totalDiscount.toLocaleString()} đ</h4>
        </div>

        <div
          style={{
            background: COLORS.card,
            padding: "16px",
            borderRadius: RADIUS,
            boxShadow: SHADOW,
          }}
        >
          <div style={{ color: COLORS.textMuted }}>Doanh thu thực</div>
          <h4 style={{ color: COLORS.success }}>{(totalRevenue - totalDiscount).toLocaleString()} đ</h4>
        </div>

        <div
          style={{
            background: COLORS.card,
            padding: "16px",
            borderRadius: RADIUS,
            boxShadow: SHADOW,
          }}
        >
          <div style={{ color: COLORS.textMuted }}>Giờ cao điểm</div>
          <h4 style={{ color: COLORS.primary }}>{peakHourText}</h4>
        </div>

        <div
          style={{
            background: COLORS.card,
            padding: "16px",
            borderRadius: RADIUS,
            boxShadow: SHADOW,
          }}
        >
          <div style={{ color: COLORS.textMuted }}>Tỷ lệ hoàn thành</div>
          <h4 style={{ color: COLORS.purple }}>100%</h4>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
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
            onClick={(e) => e.stopPropagation()}
            style={{
              background: COLORS.card,
              borderRadius: RADIUS,
              padding: "24px",
              maxWidth: "800px",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ color: COLORS.text }}>{modalContent?.title}</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: COLORS.textMuted,
                }}
              >
                ×
              </button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${COLORS.gray}` }}>
                    {modalContent?.title.includes("doanh thu") && (
                      <>
                        <th style={{ padding: "12px", textAlign: "left" }}>STT</th>
                        <th style={{ padding: "12px", textAlign: "left" }}>Thời gian</th>
                        <th style={{ padding: "12px", textAlign: "right" }}>Tổng tiền</th>
                        <th style={{ padding: "12px", textAlign: "left" }}>Thanh toán</th>
                      </>
                    )}
                    {modalContent?.title.includes("Đơn hàng") && (
                      <>
                        <th style={{ padding: "12px", textAlign: "left" }}>STT</th>
                        <th style={{ padding: "12px", textAlign: "left" }}>Thời gian</th>
                        <th style={{ padding: "12px", textAlign: "center" }}>Số lượng</th>
                        <th style={{ padding: "12px", textAlign: "right" }}>Tổng tiền</th>
                        <th style={{ padding: "12px", textAlign: "center" }}>Trạng thái</th>
                      </>
                    )}
                    {modalContent?.title.includes("Sản phẩm") && (
                      <>
                        <th style={{ padding: "12px", textAlign: "left" }}>Tên sản phẩm</th>
                        <th style={{ padding: "12px", textAlign: "center" }}>Số lượng</th>
                        <th style={{ padding: "12px", textAlign: "right" }}>Đơn giá</th>
                        <th style={{ padding: "12px", textAlign: "right" }}>Tổng tiền</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {modalContent?.data.map((item, index) => (
                    <tr key={index} style={{ borderBottom: `1px solid ${COLORS.gray}` }}>
                      {modalContent?.title.includes("doanh thu") && (
                        <>
                          <td style={{ padding: "12px" }}>{item.stt}</td>
                          <td style={{ padding: "12px" }}>{item.time}</td>
                          <td style={{ padding: "12px", textAlign: "right", color: COLORS.primary, fontWeight: "500" }}>
                            {item.total.toLocaleString()} đ
                          </td>
                          <td style={{ padding: "12px" }}>{item.payment}</td>
                        </>
                      )}
                      {modalContent?.title.includes("Đơn hàng") && (
                        <>
                          <td style={{ padding: "12px" }}>{item.stt}</td>
                          <td style={{ padding: "12px" }}>{item.time}</td>
                          <td style={{ padding: "12px", textAlign: "center" }}>{item.quantity}</td>
                          <td style={{ padding: "12px", textAlign: "right", color: COLORS.primary, fontWeight: "500" }}>
                            {item.total.toLocaleString()} đ
                          </td>
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <span style={{ 
                              padding: "4px 8px", 
                              borderRadius: "4px", 
                              background: item.status === 'Đã hoàn thành' ? "#ECFDF5" : "#FEF3C7", 
                              color: item.status === 'Đã hoàn thành' ? COLORS.success : COLORS.orange,
                              fontSize: "12px"
                            }}>
                              {item.status}
                            </span>
                          </td>
                        </>
                      )}
                      {modalContent?.title.includes("Sản phẩm") && (
                        <>
                          <td style={{ padding: "12px" }}>{item.name}</td>
                          <td style={{ padding: "12px", textAlign: "center" }}>{item.quantity}</td>
                          <td style={{ padding: "12px", textAlign: "right" }}>{item.price.toLocaleString()} đ</td>
                          <td style={{ padding: "12px", textAlign: "right", color: COLORS.primary, fontWeight: "500" }}>
                            {item.total.toLocaleString()} đ
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
                {modalContent?.title.includes("doanh thu") && modalContent?.summary && (
                  <tfoot>
                    <tr style={{ borderTop: `2px solid ${COLORS.gray}`, fontWeight: "bold" }}>
                      <td colSpan="2" style={{ padding: "12px" }}>Tổng doanh thu</td>
                      <td style={{ padding: "12px", textAlign: "right", color: COLORS.primary }}>
                        {modalContent.summary.totalRevenue.toLocaleString()} đ
                      </td>
                      <td style={{ padding: "12px" }}></td>
                    </tr>
                  </tfoot>
                )}
                {modalContent?.title.includes("Đơn hàng") && modalContent?.summary && (
                  <tfoot>
                    <tr style={{ borderTop: `2px solid ${COLORS.gray}`, fontWeight: "bold" }}>
                      <td colSpan="5" style={{ padding: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-around" }}>
                          <span style={{ color: COLORS.success }}>
                            Hoàn thành: {modalContent.summary.completed}
                          </span>
                          <span style={{ color: COLORS.orange }}>
                            Đơn treo: {modalContent.summary.pending}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                )}
                {modalContent?.title.includes("Sản phẩm") && modalContent?.summary && (
                  <tfoot>
                    <tr style={{ borderTop: `2px solid ${COLORS.gray}`, fontWeight: "bold" }}>
                      <td style={{ padding: "12px" }}>Tổng cộng</td>
                      <td style={{ padding: "12px", textAlign: "center", color: COLORS.primary }}>
                        {modalContent.summary.totalQuantity}
                      </td>
                      <td style={{ padding: "12px" }}></td>
                      <td style={{ padding: "12px", textAlign: "right", color: COLORS.primary }}>
                        {modalContent.summary.grandTotal.toLocaleString()} đ
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
