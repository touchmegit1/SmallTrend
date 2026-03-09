package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiSettings {

    @Id
    private Integer id;

    // --- Model Configuration ---
    @Column(length = 50)
    @Builder.Default
    private String geminiModel = "gemini-2.5-flash-lite";

    @Builder.Default
    private Double temperature = 1.0;

    @Builder.Default
    private Integer maxOutputTokens = 1024;

    @Builder.Default
    private Boolean aiEnabled = true;

    // --- System Prompt & Behavior ---
    @Column(columnDefinition = "TEXT")
    @Builder.Default
    private String systemPrompt = "Bạn là trợ lý AI nội bộ của hệ thống POS SmallTrend, chỉ dành cho nhân viên.\n\n"
            + "QUY TẮC BẮT BUỘC:\n"
            + "1. Chỉ trả lời các câu hỏi liên quan đến hệ thống SmallTrend (doanh thu, sản phẩm, đơn hàng, kho hàng, khách hàng, mã giảm giá).\n"
            + "2. Nếu câu hỏi KHÔNG liên quan đến hệ thống (ví dụ: thời tiết, tin tức, lập trình, câu đố...) hãy từ chối lịch sự: \"Tôi chỉ hỗ trợ các câu hỏi liên quan đến hệ thống SmallTrend.\"\n"
            + "3. Chỉ trả lời dựa trên DỮ LIỆU BÊN DƯỚI. Không được bịa đặt thông tin.\n"
            + "4. Nếu dữ liệu trống hoặc bằng 0, hãy nói thẳng \"Hiện chưa có dữ liệu\" — KHÔNG hướng dẫn người dùng xem trang khác hay báo cáo khác.\n"
            + "5. Trả lời ngắn gọn, rõ ràng bằng tiếng Việt. Dùng dấu '-' cho danh sách. Có thể dùng **in đậm** cho tiêu đề.";

    @Column(length = 100)
    @Builder.Default
    private String aiName = "SmallTrend AI";

    @Column(length = 20)
    @Builder.Default
    private String responseLanguage = "vi";

    @Column(columnDefinition = "TEXT")
    @Builder.Default
    private String welcomeMessage = "Xin chào! Tôi là trợ lý AI của SmallTrend. Hỏi tôi về doanh thu, kho hàng, khách hàng hoặc bất kỳ điều gì liên quan đến hệ thống.";

    // --- Context Control ---
    @Builder.Default
    private Boolean includeSalesData = true;

    @Builder.Default
    private Boolean includeInventoryData = true;

    @Builder.Default
    private Boolean includeCustomerData = true;

    @Builder.Default
    private Boolean includeCouponData = true;

    @Builder.Default
    private Integer lowStockThreshold = 5;

    // --- Quick Prompts ---
    @Column(length = 255)
    @Builder.Default
    private String quickPrompt1 = "Doanh thu hôm nay thế nào?";

    @Column(length = 255)
    @Builder.Default
    private String quickPrompt2 = "Sản phẩm nào bán chạy nhất?";

    @Column(length = 255)
    @Builder.Default
    private String quickPrompt3 = "Có đơn hàng nào đang chờ xử lý không?";

    @Column(length = 255)
    private String quickPrompt4;

    @Column(length = 255)
    private String quickPrompt5;

    // --- Metadata ---
    private LocalDateTime updatedAt;

    @PreUpdate
    @PrePersist
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
