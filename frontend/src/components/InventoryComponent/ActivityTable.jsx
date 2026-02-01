import React from "react";

function ActivityTable({ activities }) {
  return (
    <div
      style={{
        backgroundColor: "white",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "20px",
      }}
    >
      <h3
        style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}
      >
        Hoạt động gần đây
      </h3>
      <p style={{ fontSize: "12px", color: "#999", marginBottom: "15px" }}>
        Các giao dịch mới nhất trong hệ thống
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #ddd" }}>
            <th style={{ padding: "10px", textAlign: "left" }}>Mã phiếu</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Loại</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Sản phẩm</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Số lượng</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Thời gian</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr key={activity.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "10px", fontWeight: "bold" }}>
                {activity.code}
              </td>
              <td style={{ padding: "10px" }}>
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    backgroundColor:
                      activity.type === "Nhập" ? "#dbeafe" : "#d1fae5",
                    color: activity.type === "Nhập" ? "#1e40af" : "#065f46",
                  }}
                >
                  {activity.type}
                </span>
              </td>
              <td style={{ padding: "10px" }}>{activity.product}</td>
              <td style={{ padding: "10px" }}>{activity.quantity}</td>
              <td style={{ padding: "10px", color: "#999" }}>
                {activity.time}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ActivityTable;
