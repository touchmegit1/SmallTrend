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

  useEffect(() => {
    const savedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    setTransactions(savedTransactions);
  }, []);

  const totalOrders = transactions.length;
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
        if (!productStats[item.name]) productStats[item.name] = { revenue: 0, quantity: 0 };
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
        />

        <StatCard
          title="Số đơn hàng"
          value={totalOrders}
          sub="Đơn hoàn thành"
          iconBg="#ECFEFF"
          iconColor={COLORS.success}
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
            name="Thẻ"
            amount="0"
            percent={0}
            transactions={0}
            color={COLORS.success}
            bg="#ECFEFF"
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
              desc={`${stats.quantity} sản phẩm`}
              amount={stats.revenue.toLocaleString()}
              percent={Math.round((stats.revenue / totalRevenue) * 100)}
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
    </div>
  );
}
