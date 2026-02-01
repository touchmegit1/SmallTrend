import React from "react";

function StatCard({ title, value, subtitle }) {
  return (
    <div
      style={{
        backgroundColor: "white",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "10px",
      }}
    >
      <div style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>
        {title}
      </div>

      <div
        style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "5px" }}
      >
        {value}
      </div>

      <div style={{ fontSize: "12px", color: "#999" }}>{subtitle}</div>
    </div>
  );
}

export default StatCard;
