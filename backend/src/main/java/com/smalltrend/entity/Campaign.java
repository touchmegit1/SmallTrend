package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

/**
 * Chiến dịch khuyến mãi / Sự kiện marketing
 */
@Entity
@Table(name = "campaigns")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String campaignCode; // CAMP-BLACKFRIDAY-2024

    @Column(nullable = false, length = 200)
    private String campaignName; // Black Friday Sale 2024

    @Column(length = 50)
    private String campaignType; // PROMOTION, EVENT, FLASH_SALE, SEASONAL

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 255)
    private String bannerImageUrl; // Banner chính

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column
    private LocalDateTime startTime; // Thời gian bắt đầu cụ thể (cho flash sale)

    @Column
    private LocalDateTime endTime;

    @Column(length = 20)
    private String status; // DRAFT, ACTIVE, COMPLETED, CANCELLED

    // Ngân sách
    @Column(precision = 15, scale = 2)
    private BigDecimal budget; // Ngân sách chiến dịch

    @Column(precision = 15, scale = 2)
    private BigDecimal actualSpent; // Đã chi

    // Mục tiêu & Kết quả
    @Column(precision = 15, scale = 2)
    private BigDecimal targetRevenue; // Doanh thu mục tiêu

    @Column(precision = 15, scale = 2)
    private BigDecimal actualRevenue; // Doanh thu thực tế

    @Column
    private Integer totalOrders; // Tổng đơn hàng

    @Column(precision = 15, scale = 2)
    private BigDecimal totalDiscount; // Tổng giảm giá

    // Điều kiện áp dụng
    @Column(precision = 15, scale = 2)
    private BigDecimal minPurchaseAmount; // Giá trị đơn hàng tối thiểu

    @Column(columnDefinition = "JSON")
    private String targetCategories; // [1, 2, 3] - Category IDs áp dụng

    @Column
    private Boolean isPublic; // Hiển thị công khai

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column
    private LocalDateTime approvedAt;

    @Column(columnDefinition = "TEXT")
    private String internalNotes; // Ghi chú nội bộ

    @Column
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "DRAFT";
        }
        if (totalOrders == null) {
            totalOrders = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
