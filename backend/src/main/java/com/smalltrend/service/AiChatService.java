package com.smalltrend.service;

import com.smalltrend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiChatService {

    private final GeminiService geminiService;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final InventoryStockRepository inventoryStockRepository;
    private final CustomerRepository customerRepository;
    private final CouponRepository couponRepository;

    private static final NumberFormat VND = NumberFormat.getInstance(new Locale("vi", "VN"));

    public String chat(String userMessage) {
        String context = buildContext();

        String systemPrompt = """
                Bạn là trợ lý AI nội bộ của hệ thống POS SmallTrend, chỉ dành cho nhân viên.

                QUY TẮC BẮT BUỘC:
                1. Chỉ trả lời các câu hỏi liên quan đến hệ thống SmallTrend (doanh thu, sản phẩm, đơn hàng, kho hàng, khách hàng, mã giảm giá).
                2. Nếu câu hỏi KHÔNG liên quan đến hệ thống (ví dụ: thời tiết, tin tức, lập trình, câu đố...) hãy từ chối lịch sự: "Tôi chỉ hỗ trợ các câu hỏi liên quan đến hệ thống SmallTrend."
                3. Chỉ trả lời dựa trên DỮ LIỆU BÊN DƯỚI. Không được bịa đặt thông tin.
                4. Nếu dữ liệu trống hoặc bằng 0, hãy nói thẳng "Hiện chưa có dữ liệu" — KHÔNG hướng dẫn người dùng xem trang khác hay báo cáo khác.
                5. Trả lời ngắn gọn, rõ ràng bằng tiếng Việt. Dùng dấu '-' cho danh sách. Có thể dùng **in đậm** cho tiêu đề.
                """;

        String fullPrompt = systemPrompt
                + "\n\n=== DỮ LIỆU HỆ THỐNG HIỆN TẠI ===\n"
                + context
                + "\n\n=== CÂU HỎI CỦA NHÂN VIÊN ===\n"
                + userMessage
                + "\n\nTRỢ LÝ:";

        return geminiService.generateContent(fullPrompt);
    }

    private String buildContext() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).toLocalDate().atStartOfDay();
        LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);
        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        StringBuilder sb = new StringBuilder();

        // --- 1. SALES SUMMARY ---
        sb.append("== DOANH THU ==\n");
        BigDecimal todayRevenue = safe(orderRepository.sumTotalRevenue(startOfDay, now));
        Long todayOrders = orderRepository.countOrders(startOfDay, now);
        BigDecimal monthRevenue = safe(orderRepository.sumTotalRevenue(startOfMonth, now));
        Long monthOrders = orderRepository.countOrders(startOfMonth, now);
        BigDecimal lastMonthRevenue = safe(orderRepository.sumTotalRevenue(startOfLastMonth, startOfMonth));
        sb.append("Hôm nay: ").append(formatVnd(todayRevenue)).append(" | Số đơn: ").append(todayOrders).append("\n");
        sb.append("Tháng này: ").append(formatVnd(monthRevenue)).append(" | Số đơn: ").append(monthOrders).append("\n");
        sb.append("Tháng trước: ").append(formatVnd(lastMonthRevenue)).append("\n");

        // Payment method breakdown today
        List<Object[]> paymentBreakdown = orderRepository.revenueByPaymentMethod(startOfDay, now);
        if (!paymentBreakdown.isEmpty()) {
            sb.append("Phương thức thanh toán hôm nay: ");
            for (Object[] row : paymentBreakdown) {
                BigDecimal rev = row[2] != null ? (row[2] instanceof BigDecimal ? (BigDecimal) row[2] : BigDecimal.valueOf(((Number) row[2]).doubleValue())) : BigDecimal.ZERO;
                sb.append(row[0]).append("=").append(formatVnd(rev)).append(" ");
            }
            sb.append("\n");
        }

        // --- 2. ORDER STATUS ---
        sb.append("\n== TRẠNG THÁI ĐƠN HÀNG ==\n");
        Long pending = safe0(orderRepository.countByStatus("PENDING"));
        Long completed = safe0(orderRepository.countByStatus("COMPLETED"));
        Long cancelled = safe0(orderRepository.countByStatus("CANCELLED"));
        Long refunded = safe0(orderRepository.countByStatus("REFUNDED"));
        sb.append("Chờ xử lý: ").append(pending)
          .append(" | Hoàn thành: ").append(completed)
          .append(" | Đã huỷ: ").append(cancelled)
          .append(" | Hoàn trả: ").append(refunded).append("\n");

        // --- 3. TOP/BOTTOM PRODUCTS THIS MONTH ---
        sb.append("\n== TOP 5 SẢN PHẨM BÁN CHẠY (tháng này) ==\n");
        List<Object[]> topProducts = orderItemRepository.findTopSellingProducts(startOfMonth, now, 5);
        if (topProducts.isEmpty()) {
            sb.append("Chưa có dữ liệu bán hàng tháng này.\n");
        } else {
            int rank = 1;
            for (Object[] row : topProducts) {
                long qty = row[1] != null ? ((Number) row[1]).longValue() : 0L;
                BigDecimal rev = row[2] != null ? (row[2] instanceof BigDecimal ? (BigDecimal) row[2] : BigDecimal.valueOf(((Number) row[2]).doubleValue())) : BigDecimal.ZERO;
                sb.append(rank++).append(". ").append(row[0])
                  .append(" – Số lượng: ").append(qty)
                  .append(" – Doanh thu: ").append(formatVnd(rev)).append("\n");
            }
        }

        sb.append("\n== TOP 3 SẢN PHẨM BÁN KÉM (tháng này) ==\n");
        List<Object[]> bottomProducts = orderItemRepository.findBottomSellingProducts(startOfMonth, now, 3);
        if (bottomProducts.isEmpty()) {
            sb.append("Chưa có dữ liệu bán hàng tháng này.\n");
        } else {
            for (Object[] row : bottomProducts) {
                sb.append("- ").append(row[0])
                  .append(" – Số lượng: ").append(row[1]).append("\n");
            }
        }

        // --- 4. LOW STOCK ---
        sb.append("\n== HÀNG SẮP HẾT KHO (≤ 5 cái) ==\n");
        List<Object[]> lowStock = inventoryStockRepository.findLowStockSummary(5);
        if (lowStock.isEmpty()) {
            sb.append("Không có sản phẩm nào dưới ngưỡng tồn kho.\n");
        } else {
            for (Object[] row : lowStock) {
                sb.append("- ").append(row[0])
                  .append(" (SKU: ").append(row[1]).append(")")
                  .append(" – Còn: ").append(row[2]).append(" cái\n");
            }
        }

        // --- 5. CUSTOMERS ---
        sb.append("\n== KHÁCH HÀNG ==\n");
        Long totalCustomers = safe0(customerRepository.countTotalCustomers());
        sb.append("Tổng số khách hàng: ").append(totalCustomers).append("\n");
        List<Object[]> topCustomers = customerRepository.findTopCustomers(3);
        if (!topCustomers.isEmpty()) {
            sb.append("Top 3 khách chi tiêu nhiều:\n");
            for (Object[] row : topCustomers) {
                long spent = row[1] != null ? ((Number) row[1]).longValue() : 0L;
                int points = row[2] != null ? ((Number) row[2]).intValue() : 0;
                sb.append("- ").append(row[0])
                  .append(" – Đã chi: ").append(formatVnd(BigDecimal.valueOf(spent)))
                  .append(" – Điểm: ").append(points).append("\n");
            }
        }

        // --- 6. ACTIVE COUPONS ---
        sb.append("\n== MÃ GIẢM GIÁ ĐANG HOẠT ĐỘNG ==\n");
        List<Object[]> coupons = couponRepository.findActiveCoupons();
        if (coupons.isEmpty()) {
            sb.append("Không có mã giảm giá nào đang hoạt động.\n");
        } else {
            for (Object[] row : coupons) {
                sb.append("- [").append(row[0]).append("] ").append(row[1]);
                if (row[3] != null) sb.append(" – Giảm ").append(row[3]).append("%");
                if (row[4] != null) {
                    BigDecimal amt = row[4] instanceof BigDecimal
                        ? (BigDecimal) row[4]
                        : BigDecimal.valueOf(((Number) row[4]).longValue());
                    sb.append(" – Giảm ").append(formatVnd(amt));
                }
                sb.append(" – HSD: ").append(row[2]).append("\n");
            }
        }

        sb.append("\nNgày hiện tại: ").append(now.format(dateFmt));
        return sb.toString();
    }

    private BigDecimal safe(BigDecimal val) {
        return val == null ? BigDecimal.ZERO : val;
    }

    private Long safe0(Long val) {
        return val == null ? 0L : val;
    }

    private String formatVnd(BigDecimal amount) {
        return VND.format(amount) + " VND";
    }

    public Map<String, Object> getStatistics() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        Long dailyOrderCount = safe0(orderRepository.countOrders(startOfDay, now));

        Map<String, Object> stats = new HashMap<>();
        stats.put("dailyQueryCount", dailyOrderCount);
        stats.put("avgResponseTime", null);
        stats.put("accuracyPercentage", null);
        return stats;
    }

    public Map<String, Object> getHealthStatus() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "AI_CHAT");
        health.put("timestamp", java.time.Instant.now().toString());
        return health;
    }
}
