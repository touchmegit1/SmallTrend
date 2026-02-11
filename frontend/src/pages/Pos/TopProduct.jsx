export default function TopProduct({
  rank,
  name,
  desc,
  amount,
  percent,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px",
        fontFamily: "Inter, Segoe UI, Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            width: "28px",
            height: "28px",
            background: "#2563EB",
            color: "white",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "10px",
            fontWeight: "bold",
          }}
        >
          {rank}
        </div>

        <div>
          <strong style={{ color: "#1F2937" }}>{name}</strong>
          <div style={{ color: "#6B7280", fontSize: "12px" }}>{desc}</div>
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <strong style={{ color: "#2563EB" }}>{amount} đ</strong>
        <div style={{ color: "#6B7280", fontSize: "12px" }}>
          {percent}% doanh thu
        </div>
      </div>
    </div>
  );
}
