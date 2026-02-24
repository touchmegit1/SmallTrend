export default function StatCard({
  title,
  value,
  sub,
  iconBg = "#EFF6FF",
  iconColor = "#2563EB",
}) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        padding: "16px",
        borderRadius: "12px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: "Inter, Segoe UI, Arial, sans-serif",
      }}
    >
      <div>
        <div style={{ color: "#6B7280", fontSize: "14px" }}>{title}</div>
        <h2 style={{ margin: "6px 0", color: "#2563EB" }}>{value}</h2>
        {sub && <small style={{ color: "#16A34A" }}>{sub}</small>}
      </div>

      <div
        style={{
          background: iconBg,
          padding: "10px",
          borderRadius: "50%",
          color: iconColor,
        }}
      >
        💲
      </div>
    </div>
  );
}
