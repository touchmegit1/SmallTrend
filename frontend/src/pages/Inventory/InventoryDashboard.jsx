import React, { useState, useEffect } from "react";
import {
  getProducts,
  getStockMovements,
  getPurchaseOrders,
  getSuppliers,
} from "../../services/inventoryService";

// CSS styles
const styles = {
  container: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f5f7fa 0%, #e8ecef 50%, #f0f2f5 100%)",
    padding: "24px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    background:
      "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    margin: 0,
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    marginTop: "4px",
  },
  dateTag: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#fff",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
    padding: "10px 20px",
    borderRadius: "50px",
    color: "#475569",
    fontSize: "13px",
    border: "1px solid #e2e8f0",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginBottom: "28px",
  },
  statCard: {
    background: "#fff",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid #e2e8f0",
    position: "relative",
    overflow: "hidden",
    transition: "all 0.3s ease",
  },
  statCardHover: {
    transform: "translateY(-5px)",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.12)",
  },
  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
    fontSize: "22px",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "4px",
  },
  statTitle: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "8px",
  },
  statChange: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "28px",
  },
  chartCard: {
    background: "#fff",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid #e2e8f0",
  },
  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  chartTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
  },
  chartLegend: {
    display: "flex",
    gap: "16px",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    color: "#64748b",
  },
  legendDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
  },
  barChartArea: {
    display: "flex",
    alignItems: "flex-end",
    gap: "16px",
    height: "180px",
    paddingTop: "20px",
  },
  barGroup: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  barContainer: {
    display: "flex",
    gap: "4px",
    height: "140px",
    alignItems: "flex-end",
  },
  bar: {
    width: "18px",
    borderRadius: "8px 8px 0 0",
    transition: "height 0.5s ease",
  },
  barLabel: {
    fontSize: "11px",
    color: "#94a3b8",
  },
  lineChartArea: {
    height: "180px",
    position: "relative",
    paddingTop: "20px",
  },
  activityCard: {
    background: "#fff",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid #e2e8f0",
  },
  activityHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  activityTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
  },
  viewAllBtn: {
    background: "rgba(102, 126, 234, 0.2)",
    border: "1px solid rgba(102, 126, 234, 0.3)",
    color: "#667eea",
    padding: "8px 16px",
    borderRadius: "10px",
    fontSize: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0 8px",
  },
  tableHeader: {
    fontSize: "12px",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    padding: "12px 16px",
    textAlign: "left",
  },
  tableRow: {
    background: "#f8fafc",
    borderRadius: "12px",
    transition: "all 0.2s ease",
  },
  tableCell: {
    padding: "16px",
    color: "#475569",
    fontSize: "13px",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "3px solid rgba(102, 126, 234, 0.2)",
    borderTopColor: "#667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

// Icon components
const Icons = {
  Package: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  TrendingUp: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" />
      <polyline points="17,6 23,6 23,12" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  DollarSign: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Calendar: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  ArrowUp: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="18,15 12,9 6,15" />
    </svg>
  ),
  ArrowDown: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="6,9 12,15 18,9" />
    </svg>
  ),
};

function InventoryDashboard() {
  const [products, setProducts] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, movementsData, ordersData, suppliersData] =
          await Promise.all([
            getProducts(),
            getStockMovements(),
            getPurchaseOrders(),
            getSuppliers(),
          ]);
        setProducts(productsData);
        setStockMovements(movementsData);
        setPurchaseOrders(ordersData);
        setSuppliers(suppliersData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate statistics from real data
  const totalValue = products.reduce(
    (sum, p) => sum + p.stock_quantity * p.purchase_price,
    0,
  );
  const totalProducts = products.reduce((sum, p) => sum + p.stock_quantity, 0);
  const lowStockCount = products.filter((p) => p.stock_quantity < 100).length;
  const avgValue =
    totalProducts > 0 ? Math.round(totalValue / totalProducts) : 0;

  // Stats configuration
  const stats = [
    {
      title: "Tổng giá trị tồn kho",
      value: totalValue.toLocaleString("vi-VN") + "đ",
      change: "+12.5%",
      isPositive: true,
      icon: <Icons.DollarSign />,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      subtitle: `${products.length} loại sản phẩm`,
    },
    {
      title: "Tổng số lượng",
      value: totalProducts.toLocaleString("vi-VN"),
      change: "+8.2%",
      isPositive: true,
      icon: <Icons.Package />,
      gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      subtitle: "Sản phẩm trong kho",
    },
    {
      title: "Sản phẩm sắp hết",
      value: lowStockCount,
      change: "-2",
      isPositive: false,
      icon: <Icons.AlertTriangle />,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      subtitle: "Dưới 100 sản phẩm",
    },
    {
      title: "Giá trị trung bình",
      value: avgValue.toLocaleString("vi-VN") + "đ",
      change: "+5.1%",
      isPositive: true,
      icon: <Icons.TrendingUp />,
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      subtitle: "Mỗi sản phẩm",
    },
  ];

  // Chart data - Import/Export by month
  const chartData = [
    { label: "T1", import: 1000, export: 800 },
    { label: "T2", import: 600, export: 500 },
    { label: "T3", import: 200, export: 180 },
    { label: "T4", import: 160, export: 140 },
    { label: "T5", import: 80, export: 60 },
    { label: "T6", import: 40, export: 30 },
  ];
  const maxChartValue = Math.max(
    ...chartData.flatMap((d) => [d.import, d.export]),
  );

  // Trend data for line chart
  const trendData = [
    { date: "01/01", value: Math.round(totalValue / 1000000) },
    { date: "05/01", value: Math.round((totalValue * 1.1) / 1000000) },
    { date: "10/01", value: Math.round((totalValue * 1.15) / 1000000) },
    { date: "15/01", value: Math.round((totalValue * 1.12) / 1000000) },
    { date: "20/01", value: Math.round((totalValue * 1.2) / 1000000) },
  ];

  // Activity data from movements
  const activities = stockMovements.map((movement, index) => {
    const product = products.find((p) => p.id === movement.variant_id) || {};
    return {
      id: movement.id,
      code:
        movement.type === "IN"
          ? `IN-${String(index + 1).padStart(3, "0")}`
          : movement.type === "OUT"
            ? `OUT-${String(index + 1).padStart(3, "0")}`
            : `TRANSFER-${String(index + 1).padStart(3, "0")}`,
      type:
        movement.type === "IN"
          ? "Nhập"
          : movement.type === "OUT"
            ? "Xuất"
            : "Chuyển",
      product: product.name || "Sản phẩm",
      quantity: movement.quantity,
      time: new Date(movement.created_at).toLocaleDateString("vi-VN"),
    };
  });

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
        }
        .table-row:hover {
          background: #f1f5f9 !important;
        }
        .view-all-btn:hover {
          background: rgba(102, 126, 234, 0.3) !important;
        }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📦 Tổng quan kho hàng</h1>
          <p style={styles.subtitle}>
            Theo dõi và quản lý hàng tồn kho của bạn
          </p>
        </div>
        <div style={styles.dateTag}>
          <Icons.Calendar />
          <span>Cập nhật: {new Date().toLocaleDateString("vi-VN")}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div
            key={index}
            className="stat-card"
            style={{
              ...styles.statCard,
              animation: `fadeIn 0.5s ease ${index * 0.1}s both`,
              ...(hoveredCard === index ? styles.statCardHover : {}),
            }}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div
              style={{
                ...styles.statIcon,
                background: stat.gradient,
                color: "#fff",
              }}
            >
              {stat.icon}
            </div>
            <div style={styles.statTitle}>{stat.title}</div>
            <div style={styles.statValue}>{stat.value}</div>
            <div
              style={{
                ...styles.statChange,
                color: stat.isPositive ? "#10b981" : "#ef4444",
              }}
            >
              {stat.isPositive ? <Icons.ArrowUp /> : <Icons.ArrowDown />}
              <span>{stat.change} so với tháng trước</span>
            </div>
            <div
              style={{
                marginTop: "8px",
                fontSize: "12px",
                color: "#94a3b8",
              }}
            >
              {stat.subtitle}
            </div>
            {/* Decorative gradient circle */}
            <div
              style={{
                position: "absolute",
                top: "-20px",
                right: "-20px",
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                background: stat.gradient,
                opacity: 0.1,
                filter: "blur(20px)",
              }}
            />
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={styles.chartsGrid}>
        {/* Bar Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>📊 Nhập/Xuất theo tháng</h3>
            <div style={styles.chartLegend}>
              <div style={styles.legendItem}>
                <div style={{ ...styles.legendDot, background: "#667eea" }} />
                <span>Nhập kho</span>
              </div>
              <div style={styles.legendItem}>
                <div style={{ ...styles.legendDot, background: "#f093fb" }} />
                <span>Xuất kho</span>
              </div>
            </div>
          </div>
          <div style={styles.barChartArea}>
            {chartData.map((data, index) => (
              <div key={index} style={styles.barGroup}>
                <div style={styles.barContainer}>
                  <div
                    style={{
                      ...styles.bar,
                      background:
                        "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
                      height: `${(data.import / maxChartValue) * 140}px`,
                      boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                    }}
                  />
                  <div
                    style={{
                      ...styles.bar,
                      background:
                        "linear-gradient(180deg, #f093fb 0%, #f5576c 100%)",
                      height: `${(data.export / maxChartValue) * 140}px`,
                      boxShadow: "0 4px 15px rgba(240, 147, 251, 0.4)",
                    }}
                  />
                </div>
                <span style={styles.barLabel}>{data.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Line Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>📈 Xu hướng giá trị tồn kho</h3>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              Đơn vị: Triệu VNĐ
            </div>
          </div>
          <div style={styles.lineChartArea}>
            <svg width="100%" height="160" viewBox="0 0 400 160">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="40"
                  y1={30 + i * 30}
                  x2="380"
                  y2={30 + i * 30}
                  stroke="#e2e8f0"
                  strokeDasharray="4"
                />
              ))}
              {/* Line path */}
              <defs>
                <linearGradient
                  id="lineGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#f093fb" />
                </linearGradient>
                <linearGradient
                  id="areaGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#667eea" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#667eea" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Area fill */}
              <path
                d={`M 40 ${150 - trendData[0].value * 3} ${trendData.map((d, i) => `L ${40 + i * 85} ${150 - d.value * 3}`).join(" ")} L 380 150 L 40 150 Z`}
                fill="url(#areaGradient)"
              />
              {/* Line */}
              <path
                d={`M 40 ${150 - trendData[0].value * 3} ${trendData.map((d, i) => `L ${40 + i * 85} ${150 - d.value * 3}`).join(" ")}`}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Points */}
              {trendData.map((d, i) => (
                <g key={i}>
                  <circle
                    cx={40 + i * 85}
                    cy={150 - d.value * 3}
                    r="5"
                    fill="#667eea"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <text
                    x={40 + i * 85}
                    y={165}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="10"
                  >
                    {d.date}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* Activity Table */}
      <div style={styles.activityCard}>
        <div style={styles.activityHeader}>
          <h3 style={styles.activityTitle}>🔄 Hoạt động gần đây</h3>
          <button className="view-all-btn" style={styles.viewAllBtn}>
            Xem tất cả →
          </button>
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Mã giao dịch</th>
              <th style={styles.tableHeader}>Loại</th>
              <th style={styles.tableHeader}>Sản phẩm</th>
              <th style={styles.tableHeader}>Số lượng</th>
              <th style={styles.tableHeader}>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {activities.slice(0, 5).map((activity) => (
              <tr
                key={activity.id}
                className="table-row"
                style={styles.tableRow}
              >
                <td
                  style={{
                    ...styles.tableCell,
                    fontFamily: "monospace",
                    fontWeight: "600",
                  }}
                >
                  {activity.code}
                </td>
                <td style={styles.tableCell}>
                  <span
                    style={{
                      ...styles.badge,
                      background:
                        activity.type === "Nhập"
                          ? "rgba(16, 185, 129, 0.1)"
                          : activity.type === "Xuất"
                            ? "rgba(239, 68, 68, 0.1)"
                            : "rgba(102, 126, 234, 0.1)",
                      color:
                        activity.type === "Nhập"
                          ? "#10b981"
                          : activity.type === "Xuất"
                            ? "#ef4444"
                            : "#667eea",
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background:
                          activity.type === "Nhập"
                            ? "#10b981"
                            : activity.type === "Xuất"
                              ? "#ef4444"
                              : "#667eea",
                      }}
                    />
                    {activity.type}
                  </span>
                </td>
                <td style={styles.tableCell}>{activity.product}</td>
                <td style={{ ...styles.tableCell, fontWeight: "600" }}>
                  {activity.type === "Nhập"
                    ? "+"
                    : activity.type === "Xuất"
                      ? "-"
                      : "↔"}
                  {activity.quantity.toLocaleString()}
                </td>
                <td
                  style={{
                    ...styles.tableCell,
                    color: "#94a3b8",
                  }}
                >
                  {activity.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventoryDashboard;
