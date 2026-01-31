import React from "react";

function BarChart({ data }) {
  const maxValue = Math.max(...data.map((d) => Math.max(d.import, d.export)));

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
        Nhập - Xuất kho
      </h3>

      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "flex-end",
          height: "200px",
        }}
      >
        {data.map((item) => {
          // Tính chiều cao theo %
          const importHeight = (item.import / maxValue) * 100;
          const exportHeight = (item.export / maxValue) * 100;

          return (
            <div key={item.label} style={{ textAlign: "center", flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  gap: "5px",
                  alignItems: "flex-end",
                  height: "180px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: importHeight + "%",
                    backgroundColor: "#3b82f6",
                    borderRadius: "4px",
                  }}
                ></div>

                <div
                  style={{
                    width: "100%",
                    height: exportHeight + "%",
                    backgroundColor: "#10b981",
                    borderRadius: "4px",
                  }}
                ></div>
              </div>

              <div style={{ fontSize: "12px", marginTop: "5px" }}>
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginTop: "15px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: "#3b82f6",
            }}
          ></div>
          <span style={{ fontSize: "12px" }}>Nhập kho</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: "#10b981",
            }}
          ></div>
          <span style={{ fontSize: "12px" }}>Xuất kho</span>
        </div>
      </div>
    </div>
  );
}

export default BarChart;
