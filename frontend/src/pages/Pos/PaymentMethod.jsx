export default function PaymentMethod({
  name,
  amount,
  percent,
  transactions,
  color = "#2563EB",
  bg = "#EFF6FF",
}) {
  return (
    <div
      style={{
        marginBottom: "12px",
        background: bg,
        padding: "12px",
        borderRadius: "10px",
        fontFamily: "Inter, Segoe UI, Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <strong style={{ color: "#1F2937" }}>{name}</strong>
          <div style={{ color: "#6B7280", fontSize: "12px" }}>
            {transactions} giao dịch
          </div>
        </div>
        <strong style={{ color }}>{amount} đ</strong>
      </div>

      <div
        style={{
          height: "6px",
          background: "#E5E7EB",
          borderRadius: "4px",
          marginTop: "6px",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percent}%`,
            background: color,
            borderRadius: "4px",
            transition: "width 0.3s ease",
          }}
        ></div>
      </div>
    </div>
  );
}
