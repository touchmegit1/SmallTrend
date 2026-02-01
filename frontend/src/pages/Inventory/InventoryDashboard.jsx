import React from "react";
import StatCard from "../../components/InventoryComponent/StatCard";
import BarChart from "../../components/InventoryComponent/BarChart";
import LineChart from "../../components/InventoryComponent/LineChart";
import ActivityTable from "../../components/InventoryComponent/ActivityTable";

function InventoryDashboard() {
  // Dữ liệu cho 4 thẻ thống kê
  const stats = [
    {
      title: "Tổng giá trị tồn kho",
      value: "2,456,780,000đ",
      subtitle: "+2.5%",
    },
    {
      title: "Số lượng mặt hàng",
      value: "1,234",
      subtitle: "15 mặt hàng",
    },
    {
      title: "Sắp hết hạn",
      value: "45",
      subtitle: "Trong 30 ngày",
    },
    {
      title: "Hàng bán chạy",
      value: "89",
      subtitle: "+2.5%",
    },
  ];

  // Dữ liệu cho biểu đồ cột
  const chartData = [
    { label: "T1", import: 120, export: 100 },
    { label: "T2", import: 140, export: 115 },
    { label: "T3", import: 145, export: 130 },
    { label: "T4", import: 160, export: 140 },
    { label: "T5", import: 155, export: 145 },
    { label: "T6", import: 175, export: 160 },
  ];

  // Dữ liệu cho bảng xu hướng
  const trendData = [
    { date: "01/01", value: 1800 },
    { date: "05/01", value: 2100 },
    { date: "10/01", value: 2300 },
    { date: "15/01", value: 2250 },
    { date: "20/01", value: 2500 },
  ];

  // Dữ liệu cho bảng hoạt động
  const activities = [
    {
      id: 1,
      code: "NK-001",
      type: "Nhập",
      product: "Áo thun nam",
      quantity: 50,
      time: "10:30 AM",
    },
    {
      id: 2,
      code: "XK-045",
      type: "Xuất",
      product: "Quần jean nữ",
      quantity: 20,
      time: "09:15 AM",
    },
    {
      id: 3,
      code: "NK-002",
      type: "Nhập",
      product: "Giày thể thao",
      quantity: 30,
      time: "08:45 AM",
    },
    {
      id: 4,
      code: "XK-046",
      type: "Xuất",
      product: "Túi xách",
      quantity: 15,
      time: "08:00 AM",
    },
    {
      id: 5,
      code: "NK-003",
      type: "Nhập",
      product: "Áo khoác",
      quantity: 40,
      time: "07:30 AM",
    },
  ];

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>
          Tổng quan kho hàng
        </h1>
        <p style={{ fontSize: "14px", color: "#999" }}>
          Thứ Bảy, 31 tháng 1, 2026
        </p>
      </div>

      {/* 4 Thẻ thống kê */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
          />
        ))}
      </div>

      {/* 2 Biểu đồ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <BarChart data={chartData} />
        <LineChart data={trendData} />
      </div>

      {/* Bảng hoạt động */}
      <ActivityTable activities={activities} />
    </div>
  );
}

export default InventoryDashboard;
