export default function StatCard({
  title,
  value,
  sub,
  iconBg = "#EFF6FF",
  iconColor = "#2563EB",
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#FFFFFF",
        padding: "16px",
        borderRadius: "12px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: "Inter, Segoe UI, Arial, sans-serif",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.12)";
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
        }
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
