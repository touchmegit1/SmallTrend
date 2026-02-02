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
          value="20.500 đ"
          sub="+12.5% so với hôm qua"
          iconBg="#EFF6FF"
          iconColor={COLORS.primary}
        />

        <StatCard
          title="Số đơn hàng"
          value="1"
          sub="Đơn hoàn thành"
          iconBg="#ECFEFF"
          iconColor={COLORS.success}
        />

        <StatCard
          title="Giá trị TB/đơn"
          value="20.500 đ"
          iconBg="#FFF7ED"
          iconColor={COLORS.orange}
        />

        <StatCard
          title="Sản phẩm bán"
          value="3"
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
            amount="20.500"
            percent={100}
            transactions={1}
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

          <TopProduct
            rank={1}
            name="Bánh mì tươi"
            desc="Bánh mì & Ngũ cốc"
            amount="20.500"
            percent={100}
          />

          <TopProduct
            rank={2}
            name="Nước cam"
            desc="Đồ uống"
            amount="0"
            percent={0}
          />

          <TopProduct
            rank={3}
            name="Sữa tươi"
            desc="Sữa & Sản phẩm sữa"
            amount="0"
            percent={0}
          />
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
          <h4 style={{ color: "#DC2626" }}>0 đ</h4>
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
          <h4 style={{ color: COLORS.success }}>20.500 đ</h4>
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
          <h4 style={{ color: COLORS.primary }}>14:00 - 15:00</h4>
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
          <h4 style={{ color: COLORS.purple }}>98.5%</h4>
        </div>
      </div>
    </div>
  );
}
